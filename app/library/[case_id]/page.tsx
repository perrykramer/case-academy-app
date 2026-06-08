import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { getCaseById, getAllCaseIds, parseCaseContent } from '@/lib/cases';
import { hasAccess } from '@/lib/access';
import CaseSectionReveal from '@/components/CaseSectionReveal';
import CaseLockedPreview from '@/components/CaseLockedPreview';
import { C } from '@/lib/tokens';

export async function generateStaticParams() {
  return getAllCaseIds().map((case_id) => ({ case_id }));
}

type Props = {
  params: Promise<{ case_id: string }>;
};

export default async function CaseDetailPage({ params }: Props) {
  const { case_id } = await params;
  const caseData = getCaseById(case_id);

  if (!caseData) {
    notFound();
  }

  const { frontmatter, content } = caseData;
  const { intro, prompt, sections } = parseCaseContent(content);

  const { sessionClaims } = await auth();
  const email = sessionClaims?.email as string | undefined;
  const userHasAccess = await hasAccess(email);
  const isLocked = !frontmatter.free_preview && !userHasAccess;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.canvas }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px 60px' }}>

        <div style={{ marginBottom: '24px' }}>
          <Link
            href="/library"
            style={{ color: C.muted, textDecoration: 'none', fontSize: '14px' }}
          >
            ← Back to Case Library
          </Link>
        </div>

        <article
          className="case-content prose prose-slate max-w-none"
          style={{
            background: '#ffffff',
            padding: '40px',
            borderRadius: '12px',
            border: `1px solid ${C.hairline}`,
          }}
        >
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{intro}</ReactMarkdown>

        <h2>Prompt</h2>
        <div className="case-section-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{prompt}</ReactMarkdown>
        </div>

        {isLocked ? (
          <CaseLockedPreview sections={sections} />
        ) : (
          <>
            <div className="case-guide-box">
              <p>Work through each section by thinking it through first, then clicking to reveal the answer.</p>
            </div>
            <CaseSectionReveal sections={sections} />
          </>
        )}
        </article>

      </div>
    </div>
  );
}
