import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const { userId } = await auth();

  // Redirect to dashboard if user is already signed in
  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="landing">
      <div className="landing-grid"></div>
      <div className="landing-glow"></div>
      <div className="landing-content">
        <div className="landing-logo">
          <svg width="200" height="32" viewBox="0 0 280 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="34" style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 34, letterSpacing: '-0.01em' }} fill="#ffffff">Case Academy</text>
            <path d="M255 17L265 7M265 7H257M265 7V15" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h1>Land your dream<br /><span className="accent">consulting offer</span></h1>
        <p className="subtitle">Video courses, practice problems, and a community of ambitious people preparing for consulting interviews — all in one place.</p>
        <p className="tagline">Built by consultants. Designed for results.</p>
        <div className="btn-row">
          <SignInButton mode="modal">
            <button className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '16px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.99 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.05-3.71 1.05-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09A6.68 6.68 0 015.5 12c0-.72.13-1.43.34-2.09V7.07H2.18A11 11 0 001 12c0 1.77.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="btn btn-secondary" style={{ padding: '16px 36px', fontSize: '16px' }}>Create Account</button>
          </SignUpButton>
        </div>
        <div className="stats">
          <div style={{ textAlign: 'center' }}>
            <div className="stat-num">2</div>
            <div className="stat-label">Video Courses</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="stat-num">∞</div>
            <div className="stat-label">Practice Problems</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="stat-num">24/7</div>
            <div className="stat-label">Community Access</div>
          </div>
        </div>
      </div>
    </div>
  );
}
