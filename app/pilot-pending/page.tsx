export default function PilotPendingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ maxWidth: '400px', padding: '32px', backgroundColor: 'white', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
        <h1 style={{ color: '#0f172a', fontSize: '24px', fontWeight: 600, marginBottom: '12px' }}>Case Academy is in private pilot</h1>
        <p style={{ color: '#475569', marginBottom: '24px', lineHeight: '1.6' }}>We are testing the platform with a small group of students right now. Reach out to Perry if you would like to join the next cohort.</p>
        <a href="mailto:perry@perrykramer.com" style={{ color: '#0f172a', fontWeight: 500 }}>
          Get in touch
        </a>
      </div>
    </div>
  );
}