import Link from 'next/link';
import { getAllCases } from '@/lib/cases';

export const metadata = {
  title: 'Case Library | Case Academy',
  description: 'Practice consulting case interviews with structured, curated cases from top sources.',
};

export default function LibraryPage() {
  const cases = getAllCases();

  return (
    <div className="main">
      <div className="welcome">
        <h1>Case Library</h1>
        <p>
          Practice consulting case interviews with structured, curated cases. Each case includes a prompt,
          framework guide, exhibits, math walkthrough, and recommendation.
        </p>
      </div>

      {cases.length === 0 ? (
        <div className="card">
          <p>No cases available yet. Check back soon!</p>
        </div>
      ) : (
        <div className="courses-grid">
          {cases.map((c) => (
            <Link
              key={c.case_id}
              href={`/library/${c.case_id}`}
              className="card hoverable"
              style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
            >
              <div className="course-header">
                <span className="course-icon">📋</span>
                {c.free_preview ? (
                  <span className="badge badge-live">Free Preview</span>
                ) : (
                  <span className="badge badge-locked">🔒 Members</span>
                )}
              </div>
              <h3 className="course-title">{c.title}</h3>
              <p className="course-desc">
                {c.case_type} case · {c.industry}
              </p>
              <div className="course-tags">
                <span className="course-tag">{c.case_type}</span>
                <span className="course-tag">Difficulty {c.difficulty}/5</span>
                <span className="course-tag">{c.estimated_time}</span>
              </div>
              <div className="course-meta">
                <span>{c.source}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
