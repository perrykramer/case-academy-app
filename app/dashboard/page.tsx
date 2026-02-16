"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useState } from "react";

type Tab = "courses" | "practice" | "resources" | "community";

export default function DashboardPage() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<Tab>("courses");
  const [showProblemDetail, setShowProblemDetail] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [answerText, setAnswerText] = useState("");

  const switchTab = (tab: Tab) => {
    setActiveTab(tab);
  };

  const handleShowProblemDetail = () => {
    setShowProblemDetail(true);
    setActiveTab("practice");
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  const submitAnswer = () => {
    setAnswerSubmitted(true);
  };

  const resetProblem = () => {
    setAnswerSubmitted(false);
    setAnswerText("");
    setShowHint(false);
  };

  const firstName = user?.firstName || "Member";

  return (
    <div>
      <nav className="topnav">
        <div className="topnav-brand">
          <svg width="160" height="24" viewBox="0 0 280 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="34" style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 34, letterSpacing: '-0.01em' }} fill="#ffffff">Case Academy</text>
            <path d="M255 17L265 7M265 7H257M265 7V15" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="topnav-right">
          <span className="user-name">{firstName}</span>
          <UserButton />
        </div>
      </nav>

      <div className="main">
        <div className="welcome">
          <h1>Welcome back, {firstName}</h1>
          <p>Your consulting prep journey starts here. Explore what&apos;s available and stay tuned — more content launching soon.</p>
        </div>

        <div className="card banner">
          <div className="banner-inner">
            <span className="banner-icon">🚀</span>
            <div className="banner-text">
              <h3>First Practice Problem is Live!</h3>
              <p>Try our first market sizing problem and share your approach. Courses and more resources launching soon.</p>
            </div>
            <button className="btn btn-primary" onClick={handleShowProblemDetail} style={{ whiteSpace: 'nowrap' }}>Try it now →</button>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${activeTab === "courses" ? "active" : ""}`} onClick={() => switchTab("courses")}>
            <span className="tab-icon">📊</span> Courses
          </button>
          <button className={`tab ${activeTab === "practice" ? "active" : ""}`} onClick={() => switchTab("practice")}>
            <span className="tab-icon">🧩</span> Practice
          </button>
          <button className={`tab ${activeTab === "resources" ? "active" : ""}`} onClick={() => switchTab("resources")}>
            <span className="tab-icon">📚</span> Resources
          </button>
          <button className={`tab ${activeTab === "community" ? "active" : ""}`} onClick={() => switchTab("community")}>
            <span className="tab-icon">💬</span> Community
          </button>
        </div>

        <div className={`tab-content ${activeTab === "courses" ? "active" : ""}`}>
          <div className="courses-grid">
            <div className="card hoverable">
              <div className="course-header">
                <span className="course-icon">📊</span>
                <span className="badge badge-locked">Coming Soon</span>
              </div>
              <h3 className="course-title">The Case Course</h3>
              <p className="course-desc">Master case interview frameworks, mental math, and delivery from the ground up.</p>
              <div className="course-tags">
                <span className="course-tag">Frameworks</span>
                <span className="course-tag">Market Sizing</span>
                <span className="course-tag">Profitability</span>
                <span className="course-tag">M&amp;A</span>
              </div>
              <div className="course-meta">
                <span>8 modules</span>
                <span>·</span>
                <span>6 hours</span>
              </div>
            </div>
            <div className="card hoverable">
              <div className="course-header">
                <span className="course-icon">🎯</span>
                <span className="badge badge-locked">Coming Soon</span>
              </div>
              <h3 className="course-title">Behaviorals Course</h3>
              <p className="course-desc">Craft compelling stories and confidently ace the fit portion of your interview.</p>
              <div className="course-tags">
                <span className="course-tag">STAR Method</span>
                <span className="course-tag">Leadership</span>
                <span className="course-tag">Teamwork</span>
                <span className="course-tag">Why Consulting</span>
              </div>
              <div className="course-meta">
                <span>5 modules</span>
                <span>·</span>
                <span>3 hours</span>
              </div>
            </div>
          </div>
        </div>

        <div className={`tab-content ${activeTab === "practice" ? "active" : ""}`}>
          {!showProblemDetail ? (
            <div className="card">
              <div className="problem-list-item">
                <div>
                  <div className="problem-title-row">
                    <h3>Wine Market Sizing</h3>
                    <span className="badge badge-live">Live</span>
                  </div>
                  <div className="problem-meta">
                    <span>Market Sizing</span>
                    <span>·</span>
                    <span>Intermediate</span>
                  </div>
                </div>
                <button className="btn btn-primary" onClick={() => setShowProblemDetail(true)}>Start Problem →</button>
              </div>
            </div>
          ) : (
            <div className="card problem-card">
              <div style={{ marginBottom: '8px' }}>
                <span className="badge badge-live">Live Problem</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-brand)', fontSize: '24px', marginBottom: '8px', fontWeight: 700 }}>Wine Market Sizing</h3>
              <p className="problem-meta" style={{ marginBottom: '24px' }}>Market Sizing · Intermediate</p>
              <div className="problem-question">
                <p>&quot;How many bottles of wine are sold in New Zealand each year?&quot;</p>
              </div>

              {!answerSubmitted ? (
                <div>
                  <label className="answer-label">Walk through your approach and estimate:</label>
                  <textarea
                    className="answer-box"
                    rows={6}
                    placeholder="Start by segmenting the population of New Zealand..."
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                  />
                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                    <button className="btn btn-primary" onClick={submitAnswer}>Submit Answer</button>
                    <button className="btn btn-secondary" onClick={toggleHint}>Show Hint</button>
                  </div>
                  <div className={`hint-box ${showHint ? "visible" : ""}`}>
                    💡 Think about population, drinking age demographics, consumption patterns, and channels (retail vs. hospitality).
                  </div>
                </div>
              ) : (
                <div className="success-box visible">
                  <h4>Answer Submitted! ✓</h4>
                  <p>A detailed walkthrough will be posted soon. In the meantime, discuss your approach with others in the community Slack!</p>
                  <button className="btn btn-secondary" onClick={resetProblem} style={{ marginTop: '12px' }}>Try Again</button>
                </div>
              )}
            </div>
          )}
          <p className="problem-note">New practice problems released weekly. Stay tuned for detailed walkthroughs.</p>
        </div>

        <div className={`tab-content ${activeTab === "resources" ? "active" : ""}`}>
          <div className="resources-grid">
            <div className="card hoverable">
              <div className="resource-header">
                <span className="resource-icon">📄</span>
                <span className="badge badge-locked">Coming Soon</span>
              </div>
              <h4 className="resource-title">Resume Guide</h4>
              <p className="resource-desc">Consulting resume best practices &amp; templates</p>
            </div>
            <div className="card hoverable">
              <div className="resource-header">
                <span className="resource-icon">📚</span>
                <span className="badge badge-locked">Coming Soon</span>
              </div>
              <h4 className="resource-title">Practice Problem Archive</h4>
              <p className="resource-desc">Past problems with detailed walkthroughs</p>
            </div>
            <div className="card hoverable">
              <div className="resource-header">
                <span className="resource-icon">🤖</span>
                <span className="badge badge-locked">Coming Soon</span>
              </div>
              <h4 className="resource-title">AI Resume Coach</h4>
              <p className="resource-desc">Get AI-powered feedback on your resume</p>
            </div>
            <div className="card hoverable">
              <div className="resource-header">
                <span className="resource-icon">💡</span>
                <span className="badge badge-locked">Coming Soon</span>
              </div>
              <h4 className="resource-title">Interview Question Bank</h4>
              <p className="resource-desc">Common behavioral &amp; case questions</p>
            </div>
          </div>
        </div>

        <div className={`tab-content ${activeTab === "community" ? "active" : ""}`}>
          <div className="card community-card">
            <span className="community-icon">💬</span>
            <h3>Join the Community</h3>
            <p>Connect with fellow aspiring consultants. Ask questions, find practice partners, share tips, and get direct access to Perry and the Case Academy team.</p>
            <p className="small">We use Slack to keep things fast and familiar.</p>
            <button
              className="btn btn-primary"
              onClick={() => window.open('https://join.slack.com/t/caseacademy/', '_blank')}
              style={{ padding: '14px 28px', fontSize: '15px' }}
            >
              Join Slack Community →
            </button>
          </div>
        </div>

        <div className="footer">© 2026 Case Academy · Built by Perry Kramer</div>
      </div>
    </div>
  );
}
