import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export type CaseFrontmatter = {
  case_id: string;
  title: string;
  source: string;
  source_page?: string;
  case_type: string;
  industry: string;
  difficulty: number;
  estimated_time: string;
  format: string;
  has_exhibits: boolean;
  exhibit_count: number;
  exhibit_complexity: string;
  math_intensity: string;
  framework_fit: string;
  recommended_for_video: string;
  free_preview: boolean;
  tags: string[];
  section_questions?: Record<string, string>;
  attribution: string;
  date_added: string;
};

export type Case = {
  frontmatter: CaseFrontmatter;
  content: string;
};

const CASES_DIR = path.join(process.cwd(), 'case-library');

export function getAllCases(): CaseFrontmatter[] {
  if (!fs.existsSync(CASES_DIR)) {
    return [];
  }

  const files = fs.readdirSync(CASES_DIR).filter(
    (f) => f.endsWith('.md') && !f.startsWith('_')
  );

  const cases = files.map((filename) => {
    const filePath = path.join(CASES_DIR, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data } = matter(fileContents);
    return data as CaseFrontmatter;
  });

  return cases
    .filter((c) => Boolean(c.case_id))
    .sort((a, b) => a.case_id.localeCompare(b.case_id));
}

export function getCaseById(caseId: string): Case | null {
  const filename = `${caseId}.md`;
  const filePath = path.join(CASES_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    frontmatter: data as CaseFrontmatter,
    content,
  };
}

export function getAllCaseIds(): string[] {
  return getAllCases().map((c) => c.case_id);
}

export type CaseSection = {
  heading: string;
  content: string;
};

export type ParsedCase = {
  intro: string;
  prompt: string;
  sections: CaseSection[];
};

export function parseCaseContent(content: string): ParsedCase {
  const lines = content.split('\n');
  const blocks: { heading: string | null; body: string[] }[] = [];
  let currentHeading: string | null = null;
  let currentBody: string[] = [];

  for (const line of lines) {
    const match = line.match(/^## (.+)$/);
    if (match) {
      blocks.push({ heading: currentHeading, body: currentBody });
      currentHeading = match[1].trim();
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }
  blocks.push({ heading: currentHeading, body: currentBody });

  const introBlock = blocks[0];
  const intro = introBlock.body.join('\n').trim();

  const promptBlock = blocks.find((b) => b.heading === 'Prompt');
  const prompt = promptBlock ? promptBlock.body.join('\n').trim() : '';

  const sections: CaseSection[] = blocks
    .filter((b) => b.heading && b.heading !== 'Prompt')
    .map((b) => ({
      heading: b.heading!,
      content: b.body.join('\n').trim(),
    }));

  return { intro, prompt, sections };
}
