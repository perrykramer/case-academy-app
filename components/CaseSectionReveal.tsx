'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import type { CaseSection } from '@/lib/cases';
import FrameworkTimer from './FrameworkTimer';

type Props = {
  sections: CaseSection[];
};

export default function CaseSectionReveal({ sections }: Props) {
  const [revealedCount, setRevealedCount] = useState(0);

  if (sections.length === 0) return null;

  const nextSection: CaseSection | null = sections[revealedCount] ?? null;
  const allRevealed = revealedCount === sections.length;
  const isFrameworkNext = nextSection?.heading === 'Framework';

  return (
    <div className="case-reveal-stack">
      <FrameworkTimer isVisible={isFrameworkNext} />

      {sections.map((section, index) => {
        const isRevealed = index < revealedCount;
        const isNext = index === revealedCount;

        if (isRevealed) {
          return (
            <section key={section.heading} className="case-revealed-section">
              <h2>{section.heading}</h2>
              <div className="case-section-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{section.content}</ReactMarkdown>
              </div>
            </section>
          );
        }

        if (isNext) {
          return (
            <button
              key={section.heading}
              onClick={() => setRevealedCount(revealedCount + 1)}
              className="case-reveal-button"
            >
              <span className="case-reveal-button-label">Reveal: {section.heading}</span>
              <span className="case-reveal-button-arrow">→</span>
            </button>
          );
        }

        return null;
      })}

      {allRevealed && (
        <div className="case-completion-message">
          ✓ You&apos;ve worked through every section of this case. Nice work.
        </div>
      )}
    </div>
  );
}
