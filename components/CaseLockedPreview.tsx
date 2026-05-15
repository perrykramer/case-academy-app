import Link from 'next/link';
import type { CaseSection } from '@/lib/cases';

type Props = {
  sections: CaseSection[];
};

export default function CaseLockedPreview({ sections }: Props) {
  return (
    <div className="case-locked-stack">
      {sections.map((section) => (
        <div key={section.heading} className="case-locked-section">
          <span className="case-locked-icon">🔒</span>
          <span className="case-locked-heading">{section.heading}</span>
        </div>
      ))}

      <div className="case-paywall-cta">
        <h2 className="case-paywall-title">Unlock the full case</h2>
        <p className="case-paywall-body">
          Subscribe to Case Academy to unlock the framework, exhibits, math walkthrough, and
          recommendation for this case — plus the full library of practice cases.
        </p>
        <Link href="/subscribe" className="case-paywall-button">
          Subscribe — $29/month
        </Link>
      </div>
    </div>
  );
}
