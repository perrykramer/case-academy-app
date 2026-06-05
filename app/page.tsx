"use client";

import { useAuth, SignedIn, SignedOut } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { C } from "@/lib/tokens";
import { Wordmark } from "@/components/Wordmark";
import Link from 'next/link';

const FAQS = [
  {
    q: "What do I get access to right now?",
    a: "The Case Crash Course is fully available today. The case library is live and growing every week, and video walkthroughs are on the way. As a founding member you get everything the moment it ships — plus weekly office hours during the build.",
  },
  {
    q: "I'm a rising sophomore and don't know what a case is. Is this for me?",
    a: "Yes! The Crash Course starts with 'what is consulting' before it ever touches a framework. The earlier you start, the more ready you'll be by recruiting season.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Anytime, no questions asked. But if you cancel, you lose the founding rate — re-joining later means paying full price.",
  },
];

function RedCheck() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{ flexShrink: 0, marginTop: 3 }}
    >
      <path
        d="M 2 7 L 6 11 L 12 3"
        stroke="#f59e0b"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


const btnPrimary: React.CSSProperties = {
  display: "inline-block",
  background: C.ink,
  color: C.canvas,
  borderRadius: 4,
  padding: "10px 20px",
  fontSize: 13,
  fontWeight: 500,
  textDecoration: "none",
  border: "none",
  cursor: "pointer",
  fontFamily: "var(--font-inter), Inter, sans-serif",
  lineHeight: 1.4,
};

const btnSecondary: React.CSSProperties = {
  display: "inline-block",
  background: "transparent",
  color: C.ink,
  borderRadius: 4,
  padding: "10px 20px",
  fontSize: 13,
  fontWeight: 500,
  textDecoration: "none",
  border: `1px solid ${C.ink}`,
  cursor: "pointer",
  fontFamily: "var(--font-inter), Inter, sans-serif",
  lineHeight: 1.4,
};

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!isLoaded || isSignedIn) return null;

  return (
    <div
      style={{
        background: C.canvas,
        color: C.body,
        fontFamily: "var(--font-inter), Inter, sans-serif",
        minHeight: "100vh",
      }}
    >
      {/* ── NAV ── */}
      <nav
        className="lp-nav"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${C.hairline}`,
          background: scrolled ? "rgba(251,250,245,0.96)" : "transparent",
          backdropFilter: scrolled ? "blur(8px)" : "none",
          transition: "background 0.2s ease",
        }}
      >
        <Wordmark />
        <div className="lp-nav-links">
          <a href="#whats-inside" style={{ color: C.body, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
            What&apos;s inside
          </a>
          <a href="#pricing" style={{ color: C.body, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
            Membership
          </a>
          <a href="#why" style={{ color: C.body, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>
            Why Case Academy
          </a>
          <SignedOut>
            <Link href="/sign-in" style={{ color: C.muted, fontSize: 14, fontWeight: 400, textDecoration: "none" }}>
              Sign in
            </Link>
          </SignedOut>
          <SignedIn>
            <a href="/dashboard" style={{ color: C.muted, fontSize: 14, fontWeight: 400, textDecoration: "none" }}>
              Go to dashboard
            </a>
          </SignedIn>
          <a href="#" style={btnPrimary}>
            Join today
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="lp-hero"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(27,61,143,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(27,61,143,0.06) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        <div style={{ maxWidth: 720, margin: "0 auto" }}>
          <h1
            className="lp-hero-h1"
            style={{
              color: C.ink,
              fontWeight: 500,
              lineHeight: 1.12,
              letterSpacing: "-0.015em",
              marginBottom: 20,
              maxWidth: 640,
            }}
          >
            Go from{" "}
            <span style={{ position: "relative", display: "inline-block" }}>
              &ldquo;what&apos;s consulting?&rdquo;
              <svg
                style={{
                  position: "absolute",
                  left: 0,
                  bottom: -4,
                  width: "100%",
                  height: 10,
                }}
                viewBox="0 0 240 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M 4 6 Q 60 2, 120 6 T 236 5"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            {" "}to interview-ready.
          </h1>

          <p
            style={{
              fontSize: 17,
              color: C.body,
              lineHeight: 1.58,
              marginBottom: 32,
              maxWidth: 600,
            }}
          >
            Consulting prep platform built by a former BCG consultant
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
            <a href="#" style={btnPrimary}>
              Join today — $9.99/mo
            </a>
            <a href="#whats-inside" style={btnSecondary}>
              See what&apos;s inside →
            </a>
          </div>

        </div>
      </section>

      {/* ── WHAT'S INSIDE ── */}
      <section id="whats-inside" className="lp-section">
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2
            style={{
              color: C.ink,
              fontSize: 36,
              fontWeight: 500,
              letterSpacing: "-0.015em",
              lineHeight: 1.1,
              marginBottom: 12,
            }}
          >
            What&apos;s inside
          </h2>
          <p
            style={{
              fontSize: 15,
              color: C.body,
              lineHeight: 1.6,
              marginBottom: 36,
            }}
          >
            Three pillars that take you from total beginner to interview-ready — on your own time.
          </p>

          <div className="lp-pillars">
            {/* Card 1 — Case Crash Course */}
            <div
              style={{
                border: `1px solid ${C.hairline}`,
                borderRadius: 8,
                padding: 24,
                background: C.canvas,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  background: "rgba(27,61,143,0.08)",
                  color: C.ink,
                  borderRadius: 999,
                  padding: "3px 10px",
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  marginBottom: 14,
                }}
              >
                AVAILABLE NOW
              </span>
              <h3
                style={{
                  color: C.ink,
                  fontSize: 18,
                  fontWeight: 500,
                  marginBottom: 10,
                  letterSpacing: "-0.01em",
                }}
              >
                Case Crash Course
              </h3>
              <p style={{ fontSize: 14, color: C.body, lineHeight: 1.6 }}>
                Understand what consultants actually do, what a case interview is, and
                the building blocks you&apos;ll need — explained in plain English for
                someone starting from zero.
              </p>
            </div>

            {/* Card 2 — Case Library */}
            <div
              style={{
                border: `1px solid ${C.hairline}`,
                borderRadius: 8,
                padding: 24,
                background: C.canvas,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  background: "rgba(200,48,46,0.08)",
                  color: C.red,
                  borderRadius: 999,
                  padding: "3px 10px",
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  marginBottom: 14,
                }}
              >
                GROWING WEEKLY
              </span>
              <h3
                style={{
                  color: C.ink,
                  fontSize: 18,
                  fontWeight: 500,
                  marginBottom: 10,
                  letterSpacing: "-0.01em",
                }}
              >
                Case Library
              </h3>
              <p style={{ fontSize: 14, color: C.body, lineHeight: 1.6 }}>
                A growing library of practice cases you can work through piece by
                piece, at your own pace. Build real reps before you ever sit in an
                interview.
              </p>
            </div>

            {/* Card 3 — Video Walkthroughs */}
            <div
              style={{
                border: `1px solid ${C.hairline}`,
                borderRadius: 8,
                padding: 24,
                background: C.canvas,
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  background: "rgba(200,48,46,0.08)",
                  color: C.red,
                  borderRadius: 999,
                  padding: "3px 10px",
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.08em",
                  marginBottom: 14,
                }}
              >
                COMING SOON
              </span>
              <h3
                style={{
                  color: C.ink,
                  fontSize: 18,
                  fontWeight: 500,
                  marginBottom: 10,
                  letterSpacing: "-0.01em",
                }}
              >
                Video Walkthroughs
              </h3>
              <p style={{ fontSize: 14, color: C.body, lineHeight: 1.6 }}>
                Watch me run real cases end-to-end so you can follow along and
                practice, plus deep dives into frameworks and case math.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUNDING MEMBER PRICING ── */}
      <section
        id="pricing"
        className="lp-section"
        style={{ background: "rgba(27,61,143,0.03)" }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h2
            style={{
              color: C.ink,
              fontSize: 36,
              fontWeight: 500,
              letterSpacing: "-0.015em",
              lineHeight: 1.1,
              marginBottom: 32,
            }}
          >
            Membership
          </h2>

          <div
            style={{
              maxWidth: 480,
              border: `1.5px solid ${C.ink}`,
              borderRadius: 8,
              padding: 32,
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: -1,
                left: 24,
                background: C.red,
                color: "#fff",
                fontSize: 10,
                fontWeight: 500,
                letterSpacing: "0.1em",
                padding: "3px 10px",
                borderRadius: "0 0 4px 4px",
              }}
            >
              FOUNDING MEMBER
            </span>

            <div style={{ marginBottom: 8, marginTop: 12 }}>
              <span style={{ color: C.ink, fontSize: 36, fontWeight: 500 }}>$9.99</span>
              <span style={{ color: C.body, fontSize: 15, marginLeft: 4 }}>/ month</span>
            </div>
            <p style={{ color: C.muted, fontSize: 13, marginBottom: 6 }}>
              <span style={{ textDecoration: "line-through" }}>$29 at full launch</span>
            </p>
            <p style={{ color: C.body, fontSize: 14, lineHeight: 1.5, marginBottom: 24 }}>
              Founding rate locked for life. Lock it in now before we open at full price.
            </p>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "0 0 28px 0",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {[
                "Full access to the Case Crash Course",
                "The case library, growing every week",
                "Video walkthroughs as they're released",
                "Weekly group office hours during the build phase",
                "A direct say in what gets built next",
              ].map((f) => (
                <li
                  key={f}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    fontSize: 14,
                    color: C.body,
                  }}
                >
                  <RedCheck />
                  {f}
                </li>
              ))}
            </ul>

            <a href="#" style={{ ...btnPrimary, display: "block", textAlign: "center" }}>
              Join today
            </a>
            <p
              style={{
                fontSize: 11,
                color: C.muted,
                marginTop: 10,
                textAlign: "center",
                letterSpacing: "0.04em",
              }}
            >
              Cancel anytime · founding rate never increases
            </p>
          </div>
        </div>
      </section>

      {/* ── WHY CASE ACADEMY ── */}
      <section
        id="why"
        className="lp-section"
        style={{ background: C.canvas }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div className="lp-why-grid">
            {/* Left: photo */}
            <div>
              <div style={{ position: "relative", aspectRatio: "1 / 1", borderRadius: 6, overflow: "hidden" }}>
                <Image
                  src="/images/perry-headshot.jpg"
                  alt="Perry Kramer, founder of Case Academy"
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="(max-width: 768px) 100vw, 300px"
                />
              </div>
              <p
                style={{
                  marginTop: 12,
                  fontWeight: 500,
                  color: C.ink,
                  fontSize: 14,
                }}
              >
                Perry Kramer · Founder
              </p>
              <p style={{ fontSize: 13, color: C.muted, marginTop: 2 }}>
                Ex-BCG · Washington &amp; Lee &apos;24
              </p>
            </div>

            {/* Right: copy */}
            <div>
              <h2
                style={{
                  color: C.ink,
                  fontSize: 36,
                  fontWeight: 500,
                  letterSpacing: "-0.015em",
                  lineHeight: 1.1,
                  marginBottom: 24,
                }}
              >
                Why Case Academy?
              </h2>
              <div
                style={{
                  fontFamily: "var(--font-source-serif-4), 'Source Serif 4', Georgia, serif",
                  fontSize: 17,
                  lineHeight: 1.65,
                  color: C.body,
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                }}
              >
                <p>Hi, I&apos;m Perry Kramer — Ex-BCG, based in New York City.</p>
                <p>
                  A few years ago, I was exactly where you are now: curious about
                  consulting as a career path, but unsure what cases actually looked
                  like or what the day-to-day job entailed.
                </p>
                <p>
                  I was fortunate to have mentors who helped me navigate the process.
                  Case Academy is my way of paying that forward — everything I wish I
                  had when I was starting out, all in one place.
                </p>
                <p>
                  That means weekly headlines to keep you informed, deadline tracking
                  so you&apos;re never caught off guard, and case practice designed to
                  take you from curious to confident — ready for whatever your
                  interviewer throws at you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="lp-section" style={{ background: "rgba(27,61,143,0.02)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h2
            style={{
              color: C.ink,
              fontSize: 36,
              fontWeight: 500,
              letterSpacing: "-0.015em",
              lineHeight: 1.1,
              marginBottom: 40,
            }}
          >
            FAQ
          </h2>
          <div style={{ borderTop: `1px solid ${C.hairline}` }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderBottom: `1px solid ${C.hairline}` }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "20px 0",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    gap: 16,
                  }}
                >
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      color: C.ink,
                      lineHeight: 1.4,
                    }}
                  >
                    {faq.q}
                  </span>
                  <span
                    style={{
                      color: C.red,
                      fontSize: 22,
                      fontWeight: 300,
                      flexShrink: 0,
                      lineHeight: 1,
                      width: 20,
                      textAlign: "center",
                    }}
                  >
                    {openFaq === i ? "−" : "+"}
                  </span>
                </button>
                <div
                  className={`lp-faq-answer ${openFaq === i ? "open" : "closed"}`}
                  style={{
                    maxHeight: openFaq === i ? 400 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.28s ease, opacity 0.2s ease",
                    opacity: openFaq === i ? 1 : 0,
                  }}
                >
                  <p
                    style={{
                      paddingBottom: 20,
                      fontSize: 14,
                      color: C.body,
                      lineHeight: 1.7,
                    }}
                  >
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── START FREE ── */}
      <section
        id="resources"
        className="lp-section"
        style={{ background: "rgba(27,61,143,0.04)" }}
      >
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <h2
            style={{
              color: C.ink,
              fontSize: 36,
              fontWeight: 500,
              letterSpacing: "-0.015em",
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Start for free today
          </h2>
          <p
            style={{
              fontSize: 15,
              color: C.body,
              lineHeight: 1.6,
              marginBottom: 40,
              maxWidth: 560,
            }}
          >
            A free newsletter to make your life easier during applications —
            weekly application links, business news to stay informed, and practice
            problems to stay sharp. Plus, you&apos;ll get my two go-to templates
            the day you sign up.
          </p>

          <div
            style={{
              border: `1px solid ${C.hairlineStrong}`,
              borderRadius: 8,
              padding: 32,
              maxWidth: 560,
              background: C.canvas,
            }}
          >
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "0 0 28px 0",
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {[
                {
                  title: "Resume template",
                  desc: "The exact format that got me through BCG screening.",
                },
                {
                  title: "Cover letter template",
                  desc: "Plus three real examples that landed first-round interviews at MBB.",
                },
                {
                  title: "CA Weekly newsletter",
                  desc: "Application links, business news, practice problems — every Sunday.",
                },
              ].map((item) => (
                <li
                  key={item.title}
                  style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
                >
                  <RedCheck />
                  <span style={{ fontWeight: 500, color: C.ink, fontSize: 14 }}>
                    {item.title}
                  </span>
                </li>
              ))}
            </ul>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                type="email"
                placeholder="your@email.com"
                style={{
                  flex: 1,
                  minWidth: 180,
                  border: `1px solid ${C.hairlineStrong}`,
                  borderRadius: 4,
                  padding: "10px 14px",
                  fontSize: 13,
                  color: C.body,
                  background: C.canvas,
                  outline: "none",
                  fontFamily: "var(--font-inter), Inter, sans-serif",
                }}
              />
              <button style={btnPrimary}>Send them to me</button>
            </div>
            <p
              style={{
                fontSize: 11,
                color: C.muted,
                marginTop: 10,
                letterSpacing: "0.04em",
              }}
            >
              Unsubscribe anytime
            </p>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="lp-section" style={{ textAlign: "center" }}>
        <h2
          style={{
            color: C.ink,
            fontSize: 40,
            fontWeight: 500,
            letterSpacing: "-0.015em",
            lineHeight: 1.1,
            marginBottom: 32,
          }}
        >
          Join today
        </h2>
        <a href="#" style={btnPrimary}>
          Join today — $9.99/mo
        </a>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          borderTop: `1px solid ${C.hairline}`,
          padding: "28px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <Wordmark fontSize={15} />
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <a href="#" style={{ fontSize: 12, color: C.muted, textDecoration: "none" }}>
            Privacy
          </a>
          <a href="#" style={{ fontSize: 12, color: C.muted, textDecoration: "none" }}>
            Terms
          </a>
          <a href="#" style={{ fontSize: 12, color: C.muted, textDecoration: "none" }}>
            Contact
          </a>
        </div>
      </footer>
    </div>
  );
}
