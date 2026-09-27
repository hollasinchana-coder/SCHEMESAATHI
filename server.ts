import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to locate schemes_clean.csv
function getCsvPath(): string {
  const possiblePaths = [
    path.resolve(process.cwd(), 'schemes_clean.csv'),
    path.resolve(process.cwd(), 'src/data/schemes_clean.csv'),
    '/schemes_clean.csv',
    path.resolve(__dirname, 'schemes_clean.csv'),
    path.resolve(__dirname, 'src/data/schemes_clean.csv'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return path.resolve(process.cwd(), 'schemes_clean.csv');
}

// Parse CSV lines safely
function parseCsv(content: string): Array<Record<string, string>> {
  const lines = content.split('\n').filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  // Parse header
  const parseRow = (rowStr: string): string[] => {
    const fields: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < rowStr.length; i++) {
      const char = rowStr[i];
      if (char === '"') {
        if (inQuotes && rowStr[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        fields.push(cur.trim());
        cur = '';
      } else {
        cur += char;
      }
    }
    fields.push(cur.trim());
    return fields;
  };

  const headers = parseRow(lines[0]).map((h) => h.replace(/^["']|["']$/g, '').trim());
  const rows: Array<Record<string, string>> = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseRow(lines[i]);
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      let val = values[idx] || '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.slice(1, -1).replace(/""/g, '"');
      }
      obj[h] = val.trim();
    });
    rows.push(obj);
  }
  return rows;
}

// Initialize Gemini client (Server-side only)
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Cache for Gemini File Upload URI
let uploadedFileUri: string | null = null;
let uploadedFileTimestamp = 0;

async function getOrUploadFileToGemini(ai: GoogleGenAI, filePath: string): Promise<string | null> {
  const now = Date.now();
  // Reuse URI if uploaded within last 24 hours
  if (uploadedFileUri && now - uploadedFileTimestamp < 24 * 60 * 60 * 1000) {
    return uploadedFileUri;
  }

  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const uploadRes = await ai.files.upload({
      file: filePath,
      config: {
        mimeType: 'text/csv',
      },
    });
    if (uploadRes && uploadRes.uri) {
      uploadedFileUri = uploadRes.uri;
      uploadedFileTimestamp = now;
      return uploadedFileUri;
    }
  } catch (err) {
    console.warn('Gemini Files API upload error, falling back to direct context RAG:', err);
  }
  return null;
}

// Deterministic grounding fallback if Gemini is not reachable
function searchSchemesDeterministic(
  profile: any,
  csvRows: Array<Record<string, string>>,
  clarificationAnswer?: string
) {
  const age = Number(profile.age) || 0;
  const gender = (profile.gender || 'All').toLowerCase();
  const state = (profile.state || 'All').toLowerCase();
  const income = Number(profile.income) || 0;
  const occupation = (profile.occupation || '').toLowerCase();
  const isStudent = (profile.studentStatus || '').toLowerCase().includes('enrolled');
  const category = (profile.category || 'General').toLowerCase();

  // Check if clarification is needed:
  // E.g., if occupation is Student but studentStatus was unselected or unclear
  if (!profile.age && !clarificationAnswer) {
    return {
      clarificationQuestion: 'Could you please confirm your exact age? Several student and youth scholarships have specific age brackets (e.g. 15-35 vs 18-40).',
      missingField: 'age',
      officialDisclaimer: 'Scheme information retrieved strictly from schemes_clean.csv dataset. Always verify on official portals.',
      schemes: [],
      retrievalMethod: 'Deterministic Grounded Matcher',
      totalEvaluated: csvRows.length,
    };
  }

  const eligibleSchemes: any[] = [];

  for (const row of csvRows) {
    const minAge = Number(row.min_age) || 0;
    const maxAge = Number(row.max_age) || 120;
    const rowGender = (row.gender || 'All').toLowerCase();
    const rowState = (row.state || 'All India').toLowerCase();
    const incomeLimit = Number(row.income_limit) || 99999999;
    const rowOcc = (row.occupation || 'Any').toLowerCase();
    const rowStudent = (row.student_status || 'Any').toLowerCase();

    // 1. Age check
    if (profile.age && (age < minAge || age > maxAge)) {
      continue;
    }

    // 2. Gender check
    if (rowGender !== 'all' && gender !== 'all') {
      const allowedGenders = rowGender.toLowerCase().split(/[\/,\s;]+/).filter(Boolean);
      if (!allowedGenders.includes(gender)) {
        continue;
      }
    }

    // 3. State check
    if (rowState !== 'all india' && rowState !== 'all' && state !== 'all') {
      if (!rowState.includes(state)) {
        continue;
      }
    }

    // 4. Income check
    if (profile.income && income > incomeLimit) {
      continue;
    }

    // 5. Occupation & Student check
    if (rowStudent === 'enrolled student' && !isStudent && !occupation.includes('student')) {
      continue;
    }

    if (rowOcc !== 'any') {
      let occMatch = false;
      if (occupation.includes('farmer') && rowOcc.includes('farmer')) occMatch = true;
      else if (occupation.includes('student') && (rowOcc.includes('student') || rowStudent === 'enrolled student')) occMatch = true;
      else if (occupation.includes('worker') && rowOcc.includes('worker')) occMatch = true;
      else if (occupation.includes('artisan') && rowOcc.includes('artisan')) occMatch = true;
      else if (occupation.includes('business') || occupation.includes('msme') || occupation.includes('entrepreneur')) {
        if (rowOcc.includes('business') || rowOcc.includes('msme') || rowOcc.includes('entrepreneur') || rowOcc.includes('self-employed')) occMatch = true;
      } else if (occupation.includes('self-employed') && (rowOcc.includes('self-employed') || rowOcc.includes('msme'))) occMatch = true;
      else if (rowOcc.includes(occupation) || occupation.includes(rowOcc)) occMatch = true;

      // Allow general schemes even if occupation is unspecified
      if (!occMatch && !['rural', 'healthcare', 'women'].includes(row.category?.toLowerCase() || '')) {
        continue;
      }
    }

    // Parse required documents list
    const docs = (row.required_documents || '')
      .split(';')
      .map((d) => d.replace(/^\s*\d+\.\s*/, '').trim())
      .filter((d) => d.length > 0);

    eligibleSchemes.push({
      schemeName: row.scheme_name || 'Government Welfare Scheme',
      category: row.category || 'General Welfare',
      whoIsEligible: row.who_is_eligible || 'Citizen meeting specified income and criteria.',
      benefits: row.benefits || 'Direct benefits as per official guidelines.',
      requiredDocuments: docs.length > 0 ? docs : ['Aadhaar Card', 'Bank Account Passbook'],
      howToApply: row.how_to_apply || 'Apply online at official portal.',
      officialPortal: row.official_portal || 'https://india.gov.in',
      eligibilityMatchReason: `Matches profile: Age ${age || 'N/A'}, State: ${profile.state || 'All India'}, Income <= ₹${incomeLimit.toLocaleString('en-IN')}`,
    });
  }

  return {
    clarificationQuestion: null,
    missingField: null,
    officialDisclaimer: 'Official Government Portal Notice: Scheme criteria, eligibility thresholds, and fund disbursement guidelines may be updated periodically by respective Central and State ministries. Always verify details on the official government portal before submitting applications.',
    schemes: eligibleSchemes,
    retrievalMethod: 'Verified Grounded Matcher from schemes_clean.csv',
    totalEvaluated: csvRows.length,
  };
}

let activeDatasetName = 'schemes_clean.csv';

// API Routes
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    knowledgeBase: fs.existsSync(getCsvPath()) ? `${activeDatasetName} loaded` : 'not found',
    activeDatasetName,
    geminiConfigured: !!getGeminiClient(),
  });
});

// GET /api/rag/dataset: Return parsed CSV contents for transparent viewing
app.get('/api/rag/dataset', (_req: Request, res: Response) => {
  try {
    const csvPath = getCsvPath();
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({ error: 'Dataset file not found' });
    }
    const content = fs.readFileSync(csvPath, 'utf8');
    const rows = parseCsv(content);
    return res.json({
      filePath: activeDatasetName,
      count: rows.length,
      schemes: rows,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/rag/upload-dataset: Allow uploading custom schemes CSV for evaluation
app.post('/api/rag/upload-dataset', (req: Request, res: Response) => {
  try {
    const { csvContent, filename } = req.body;
    if (!csvContent || typeof csvContent !== 'string') {
      return res.status(400).json({ error: 'csvContent string required' });
    }
    const targetPath = path.resolve(process.cwd(), 'schemes_clean.csv');
    fs.writeFileSync(targetPath, csvContent, 'utf8');
    uploadedFileUri = null; // Invalidate cached Gemini upload
    activeDatasetName = filename && typeof filename === 'string' ? filename.trim() : 'uploaded_schemes.csv';
    const rows = parseCsv(csvContent);
    return res.json({
      success: true,
      message: `Successfully uploaded ${activeDatasetName} with ${rows.length} schemes`,
      count: rows.length,
      filename: activeDatasetName,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/rag/reset-dataset: Revert to default schemes_clean.csv
app.post('/api/rag/reset-dataset', (_req: Request, res: Response) => {
  try {
    const backupPath = path.resolve(process.cwd(), 'src/data/schemes_clean.csv');
    const targetPath = path.resolve(process.cwd(), 'schemes_clean.csv');
    if (fs.existsSync(backupPath)) {
      const backupContent = fs.readFileSync(backupPath, 'utf8');
      fs.writeFileSync(targetPath, backupContent, 'utf8');
    }
    uploadedFileUri = null;
    activeDatasetName = 'schemes_clean.csv';
    const content = fs.readFileSync(targetPath, 'utf8');
    const rows = parseCsv(content);
    return res.json({
      success: true,
      message: 'Reset to default schemes_clean.csv',
      count: rows.length,
      filename: activeDatasetName,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/rag/search: RAG-based search with Gemini File Search / Grounding
app.post('/api/rag/search', async (req: Request, res: Response) => {
  try {
    const { profile, clarificationAnswer } = req.body;
    if (!profile) {
      return res.status(400).json({ error: 'Citizen profile required' });
    }

    const csvPath = getCsvPath();
    const csvContent = fs.existsSync(csvPath) ? fs.readFileSync(csvPath, 'utf8') : '';
    const csvRows = parseCsv(csvContent);

    const ai = getGeminiClient();

    // Check for critical missing information that would prevent honest evaluation
    const ageVal = profile.age !== undefined && profile.age !== null && profile.age !== '' ? Number(profile.age) : null;
    const occVal = (profile.occupation || '').trim();

    if ((ageVal === null || isNaN(ageVal)) && !clarificationAnswer) {
      return res.json({
        clarificationQuestion: 'Could you please confirm your exact age? Government schemes like youth scholarships, farmer support, and senior pensions require an exact age bracket.',
        missingField: 'age',
        officialDisclaimer: `Strictly grounded in uploaded file (${activeDatasetName}). Always verify scheme eligibility criteria on the official government portal before applying.`,
        schemes: [],
        retrievalMethod: 'Gemini RAG Clarification Gate',
        totalEvaluated: csvRows.length,
      });
    }

    if (!occVal && !profile.studentStatus && !clarificationAnswer) {
      return res.json({
        clarificationQuestion: 'What is your current occupation or student status? (e.g. Farmer, Enrolled Student, Unorganized Worker, Small Business, Homemaker)',
        missingField: 'occupation',
        officialDisclaimer: `Strictly grounded in uploaded file (${activeDatasetName}). Always verify scheme eligibility criteria on the official government portal before applying.`,
        schemes: [],
        retrievalMethod: 'Gemini RAG Clarification Gate',
        totalEvaluated: csvRows.length,
      });
    }

    // Map of verified schemes from the uploaded file for strict zero-hallucination enforcement
    const validSchemesMap = new Map<string, Record<string, string>>();
    for (const row of csvRows) {
      if (row.scheme_name) {
        validSchemesMap.set(row.scheme_name.toLowerCase().trim(), row);
      }
    }

    // If Gemini is available, use Gemini File Search / RAG
    if (ai) {
      try {
        const fileUri = await getOrUploadFileToGemini(ai, csvPath);

        const promptText = `
You are the SchemeSeva RAG Government Scheme Finder Engine.
Your task is to retrieve relevant schemes and evaluate eligibility for the following citizen profile using ONLY information from the attached uploaded dataset (${activeDatasetName}).

CITIZEN PROFILE:
- Full Name: ${profile.fullName || 'Citizen'}
- Age: ${profile.age || 'Not provided'}
- Gender: ${profile.gender || 'All'}
- State: ${profile.state || 'All India'}
- Annual Family Income (INR): ₹${Number(profile.income || profile.annualIncome || 0).toLocaleString('en-IN')}
- Occupation: ${profile.occupation || 'Not specified'}
- Student Status: ${profile.studentStatus || (profile.isStudentEnrolled ? 'Enrolled Student' : 'Not Enrolled')}
- Social Category: ${profile.category || profile.casteCategory || 'General'}
- Additional Details / Clarification Provided: ${clarificationAnswer || profile.additionalDetails || 'None'}

STRICT ZERO-HALLUCINATION RULES:
1. ONLY evaluate and retrieve schemes that are explicitly present in the uploaded dataset (${activeDatasetName}).
2. UNDER NO CIRCUMSTANCES hallucinate, invent, or output any scheme not found in the dataset.
3. If no schemes in the dataset match the citizen profile, return an empty array for schemes: [].
4. Check eligibility strictly against the dataset's columns:
   - min_age and max_age
   - gender eligibility
   - state domicile (National / All India applies to all states, state-specific only to that state)
   - income_limit ceiling
   - occupation and student_status
5. If an essential piece of eligibility information is missing (e.g., student status required for scholarships), and you cannot determine eligibility without it, set "clarificationQuestion" to a polite, short clarification question instead of guessing.
6. For every matching scheme, output the EXACT scheme name, category, eligibility, benefits, required documents, how to apply, and official portal from the uploaded dataset.
7. Always include the official portal disclaimer: "Scheme information should be verified on the official government portal before applying."

Return your response in clean JSON matching this exact structure:
{
  "clarificationQuestion": null,
  "missingField": null,
  "officialDisclaimer": "Scheme information must be verified on the official government portal before applying.",
  "schemes": [
    {
      "schemeName": "string",
      "category": "string",
      "whoIsEligible": "string",
      "benefits": "string",
      "requiredDocuments": ["string"],
      "howToApply": "string",
      "officialPortal": "string",
      "eligibilityMatchReason": "string"
    }
  ],
  "retrievalMethod": "Gemini File Search RAG (${activeDatasetName})",
  "totalEvaluated": ${csvRows.length}
}
`;

        const contents: any[] = [];
        if (fileUri) {
          contents.push({
            fileData: {
              fileUri: fileUri,
              mimeType: 'text/csv',
            },
          });
        } else {
          // If File API upload is unavailable, provide CSV context directly
          contents.push({
            text: `KNOWLEDGE BASE DATASET (${activeDatasetName}):\n${csvContent}`,
          });
        }
        contents.push({ text: promptText });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            temperature: 0,
            systemInstruction:
              `You are SchemeSeva, a strict civic-AI RAG system. The uploaded file (${activeDatasetName}) should ONLY be used. Do not hallucinate or invent any government schemes, eligibility criteria, benefits, or documents. Clearly state that scheme information should be verified on the official government portal before applying.`,
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '{}';
        const parsed = JSON.parse(rawText);
        parsed.totalEvaluated = csvRows.length;
        parsed.retrievalMethod = fileUri
          ? `Gemini File Search RAG (${activeDatasetName})`
          : `Gemini Context RAG (${activeDatasetName})`;

        // STRICT ANTI-HALLUCINATION ENFORCEMENT:
        // Even if the model generates any external scheme, cross-validate against the uploaded file!
        if (Array.isArray(parsed.schemes)) {
          const strictlyVerified: any[] = [];
          for (const s of parsed.schemes) {
            const rawName = (s.schemeName || '').toLowerCase().trim();
            let matchedRow = validSchemesMap.get(rawName);
            if (!matchedRow) {
              for (const [key, row] of validSchemesMap.entries()) {
                if (key.includes(rawName) || rawName.includes(key)) {
                  matchedRow = row;
                  break;
                }
              }
            }

            if (matchedRow) {
              strictlyVerified.push({
                schemeName: matchedRow.scheme_name,
                category: matchedRow.category || s.category,
                whoIsEligible: matchedRow.who_is_eligible || s.whoIsEligible,
                benefits: matchedRow.benefits || s.benefits,
                requiredDocuments: matchedRow.required_documents
                  ? matchedRow.required_documents.split(';').map((d: string) => d.replace(/^\s*\d+\.\s*/, '').trim()).filter(Boolean)
                  : (s.requiredDocuments || ['Aadhaar Card', 'Bank Passbook']),
                howToApply: matchedRow.how_to_apply || s.howToApply,
                officialPortal: matchedRow.official_portal || s.officialPortal,
                eligibilityMatchReason: s.eligibilityMatchReason || `Matches profile based on verified criteria from uploaded file ${activeDatasetName}.`,
              });
            }
          }
          parsed.schemes = strictlyVerified;
        }

        return res.json(parsed);
      } catch (geminiError: any) {
        console.error('Gemini RAG call error, falling back to deterministic dataset matcher:', geminiError);
        // Seamless fallback to deterministic matching over the uploaded file
        const fallbackResult = searchSchemesDeterministic(profile, csvRows, clarificationAnswer);
        fallbackResult.retrievalMethod = `Deterministic Grounded Engine (${activeDatasetName})`;
        return res.json(fallbackResult);
      }
    }

    // If Gemini API is not configured, execute deterministic grounded match over the uploaded file
    const result = searchSchemesDeterministic(profile, csvRows, clarificationAnswer);
    result.retrievalMethod = `Deterministic Grounded Engine (${activeDatasetName})`;
    return res.json(result);
  } catch (err: any) {
    console.error('Search endpoint error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Setup Vite development middleware or static production serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SchemeSeva full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
