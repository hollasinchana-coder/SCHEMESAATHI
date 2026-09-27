export type SchemeCategoryId = 'farmer' | 'student' | 'worker' | 'women' | 'rural' | 'msme';

export interface CategoryMappingItem {
  id: SchemeCategoryId;
  emoji: string;
  title: string;
  subtitle: string;
  filterLabel: string;
  fullFilterTitle: string;
  ctaText: string;
  count: string;
  description: string;
  occupationPreset: string;
  defaultLand: number;
}

export const SCHEME_CATEGORIES: CategoryMappingItem[] = [
  {
    id: 'farmer',
    emoji: '🌾',
    title: 'Farmer',
    subtitle: 'Agriculture & Livelihood',
    filterLabel: '🌾 Farmers & Agriculture',
    fullFilterTitle: 'Farmers & Agriculture',
    ctaText: 'View Farmer Entitlements →',
    count: '38 Schemes',
    description: 'PM-KISAN installment alerts, Krishi Sinchayee, seed subsidies & micro-irrigation support.',
    occupationPreset: 'Small / Marginal Farmer',
    defaultLand: 2.0,
  },
  {
    id: 'student',
    emoji: '🎓',
    title: 'Student',
    subtitle: 'Education & Higher Studies',
    filterLabel: '🎓 Students & Higher Education',
    fullFilterTitle: 'Students & Higher Education',
    ctaText: 'Explore Scholarships →',
    count: '52 Scholarships',
    description: 'National Merit cum Means, Post-Matric SC/ST/OBC assistance, girl child higher education fellowships.',
    occupationPreset: 'Student',
    defaultLand: 0,
  },
  {
    id: 'worker',
    emoji: '👷',
    title: 'Worker',
    subtitle: 'Unorganized & Daily Wage',
    filterLabel: '👷 Unorganized Workers / Daily Wage',
    fullFilterTitle: 'Unorganized Workers / Daily Wage Workers',
    ctaText: 'Explore Worker Benefits →',
    count: '29 Subsidies',
    description: 'e-Shram card benefits, Atal Pension Yojana, construction welfare board stipend & accidental insurance.',
    occupationPreset: 'Daily Wage / Construction Worker',
    defaultLand: 0,
  },
  {
    id: 'women',
    emoji: '👩',
    title: 'Women Empowerment',
    subtitle: 'Self-Help Groups & Enterprise',
    filterLabel: '👩 Women & SHGs',
    fullFilterTitle: 'Women & SHGs',
    ctaText: 'Explore Women Benefits →',
    count: '41 Programs',
    description: 'Lakhpati Didi SHG loans, Pradhan Mantri Matru Vandana Yojana, Sukanya Samriddhi & free stitching toolkits.',
    occupationPreset: 'Homemaker / Women',
    defaultLand: 0,
  },
  {
    id: 'rural',
    emoji: '🏠',
    title: 'Rural Family',
    subtitle: 'Housing & Food Security',
    filterLabel: '🏠 Rural Housing & Food Security',
    fullFilterTitle: 'Rural Housing & Food Security',
    ctaText: 'Explore Rural Family Benefits →',
    count: '34 Housing & Food',
    description: 'PM Awas Yojana (Gramin), PM Ujjwala free LPG connection, Antyodaya Anna ration entitlements.',
    occupationPreset: 'Farmer / Agriculture',
    defaultLand: 1.0,
  },
  {
    id: 'msme',
    emoji: '💼',
    title: 'Micro Enterprise',
    subtitle: 'Small Business & Artisans',
    filterLabel: '💼 MSME / Micro Business',
    fullFilterTitle: 'MSME / Micro Business / Small Business',
    ctaText: 'Explore Micro Enterprise Benefits →',
    count: '19 Credit Subsidies',
    description: 'PMEGP 35% capital subsidy, PM Mudra Yojana collateral-free loans, Stand-Up India support.',
    occupationPreset: 'Self-employed / Artisan',
    defaultLand: 0,
  },
];

export const ALL_SCHEMES_FILTER = {
  id: 'all' as const,
  filterLabel: 'All Schemes (1,420+)',
  fullFilterTitle: 'All Schemes',
};

export function getCategoryById(id: string): CategoryMappingItem | undefined {
  return SCHEME_CATEGORIES.find((cat) => cat.id === id);
}

export function getCategoryFullTitle(id: string): string {
  if (id === 'all') return ALL_SCHEMES_FILTER.fullFilterTitle;
  const match = getCategoryById(id);
  return match ? match.fullFilterTitle : 'All Schemes';
}
