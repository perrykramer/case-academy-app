// MBA consulting club casebooks (free PDFs). The files live in the private
// Supabase Storage bucket `casebooks` as `<slug>.pdf` and are served only to
// signed-in users via app/library/casebooks/[slug]/route.ts.

export const CASEBOOK_BUCKET = 'casebooks';

export type Casebook = {
  slug: string;
  school: string;
  /** University or full school name, shown as a subtitle */
  detail?: string;
  year: number;
};

const CASEBOOKS: Casebook[] = [
  { slug: 'anderson-2020', school: 'Anderson', detail: 'UCLA', year: 2020 },
  { slug: 'agsm-2002', school: 'Australian Graduate School of Management', detail: 'UNSW', year: 2002 },
  { slug: 'bauer-2025', school: 'Bauer', detail: 'University of Houston', year: 2025 },
  { slug: 'booth-2025', school: 'Booth', detail: 'University of Chicago', year: 2025 },
  { slug: 'columbia-2021', school: 'Columbia', detail: 'Columbia Business School', year: 2021 },
  { slug: 'darden-2025', school: 'Darden', detail: 'University of Virginia', year: 2025 },
  { slug: 'esade-2025', school: 'ESADE', detail: 'ESADE Business School', year: 2025 },
  { slug: 'fuqua-2024', school: 'Fuqua', detail: 'Duke', year: 2024 },
  { slug: 'goizueta-2006', school: 'Goizueta', detail: 'Emory', year: 2006 },
  { slug: 'haas-2019', school: 'Haas', detail: 'UC Berkeley', year: 2019 },
  { slug: 'hbs-2012', school: 'Harvard Business School', detail: 'Harvard', year: 2012 },
  { slug: 'hkust-2024', school: 'HKUST', detail: 'Hong Kong University of Science and Technology', year: 2024 },
  { slug: 'illinois-2015', school: 'Illinois', detail: 'Gies College of Business', year: 2015 },
  { slug: 'insead-2021', school: 'INSEAD', year: 2021 },
  { slug: 'johnson-2021', school: 'Johnson', detail: 'Cornell', year: 2021 },
  { slug: 'kellogg-2020', school: 'Kellogg', detail: 'Northwestern', year: 2020 },
  { slug: 'lbs-2013', school: 'London Business School', year: 2013 },
  { slug: 'mccombs-2018', school: 'McCombs', detail: 'UT Austin', year: 2018 },
  { slug: 'notre-dame-2018', school: 'Notre Dame', detail: 'Mendoza College of Business', year: 2018 },
  { slug: 'queens-2019', school: "Queen's", detail: 'Smith School of Business', year: 2019 },
  { slug: 'ross-2019', school: 'Ross', detail: 'University of Michigan', year: 2019 },
  { slug: 'sloan-2020', school: 'Sloan', detail: 'MIT', year: 2020 },
  { slug: 'stern-2024', school: 'Stern', detail: 'NYU', year: 2024 },
  { slug: 'tuck-2024', school: 'Tuck', detail: 'Dartmouth', year: 2024 },
  { slug: 'wharton-2025', school: 'Wharton', detail: 'University of Pennsylvania', year: 2025 },
  { slug: 'yale-2013', school: 'Yale', detail: 'Yale School of Management', year: 2013 },
];

/** All casebooks, sorted alphabetically by school name. */
export function getAllCasebooks(): Casebook[] {
  return [...CASEBOOKS].sort((a, b) =>
    a.school.localeCompare(b.school, 'en', { sensitivity: 'base' }) || b.year - a.year,
  );
}

export function getCasebook(slug: string): Casebook | undefined {
  return CASEBOOKS.find((c) => c.slug === slug);
}
