export type Lesson = {
  slug: string;
  order: number;
  title: string;
  youtubeId: string;
  description?: string;
};

export const lessons: Lesson[] = [
  {
    slug: 'welcome',
    order: 1,
    title: 'Welcome to Case Academy',
    youtubeId: 'evWZvnO3jzo',
    description: 'Course overview and what to expect.',
  },
  {
    slug: 'what-do-consulting-companies-do',
    order: 2,
    title: 'What Do Consulting Companies Actually Do?',
    youtubeId: 'Tc2Iiqz2kyM',
  },
  {
    slug: 'what-is-a-case-interview',
    order: 3,
    title: 'What Is a Case Interview & Why Do Firms Use Them?',
    youtubeId: 'FsiTgHTtAZA',
  },
  {
    slug: 'common-case-types',
    order: 4,
    title: 'Common Case Types',
    youtubeId: 'LYKjgkEJZXA',
  },
  {
    slug: 'the-4-steps-of-a-case-interview',
    order: 5,
    title: 'The 4 Steps of a Case Interview',
    youtubeId: '_RHP_FogqSI',
  },
  {
    slug: 'step-1-understand-the-situation',
    order: 6,
    title: 'Step 1: Understand the Situation',
    youtubeId: '6BvYyTC8Qx8',
  },
  {
    slug: 'step-2-orient-with-a-framework',
    order: 7,
    title: 'Step 2: Orient with a Framework',
    youtubeId: 'M_giRk8-ya0',
  },
  {
    slug: 'step-3-navigate-the-terrain',
    order: 8,
    title: 'Step 3: Navigate the Terrain',
    youtubeId: 'sygqay6Wqmo',
  },
  {
    slug: 'exhibits',
    order: 9,
    title: 'Exhibits',
    youtubeId: 'N0LYurSIRps',
  },
  {
    slug: 'case-math-intro-and-tips',
    order: 10,
    title: 'Case Math: Intro + Tips',
    youtubeId: 'EjN9osNec5M',
  },
  {
    slug: 'case-math-market-sizing-example',
    order: 11,
    title: 'Case Math: Market Sizing Example',
    youtubeId: 'hfYK_gsZSu0',
  },
  {
    slug: 'brainstorming',
    order: 12,
    title: 'Brainstorming',
    youtubeId: '5Yed54buxmk',
  },
  {
    slug: 'step-4-point-toward-the-solution',
    order: 13,
    title: 'Step 4: Point Toward the Solution',
    youtubeId: 'XgZGQAhUhNg',
  },
];

// Helper: get a lesson by its slug (for the lesson page route)
export function getLessonBySlug(slug: string): Lesson | undefined {
  return lessons.find((l) => l.slug === slug);
}

// Helper: get next lesson in order (for "Next Lesson" button)
export function getNextLesson(currentSlug: string): Lesson | undefined {
  const current = getLessonBySlug(currentSlug);
  if (!current) return undefined;
  return lessons.find((l) => l.order === current.order + 1);
}

// Helper: get previous lesson in order (for "Previous Lesson" button)
export function getPreviousLesson(currentSlug: string): Lesson | undefined {
  const current = getLessonBySlug(currentSlug);
  if (!current) return undefined;
  return lessons.find((l) => l.order === current.order - 1);
}