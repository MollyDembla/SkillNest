import React from "react";
import { Link } from "react-router-dom";

const highlights = [
  { label: "Verified learning", value: "24h email checks" },
  { label: "Secure access", value: "JWT + role guards" },
  { label: "Fast recovery", value: "Forgot/reset flow" },
];

const featureCards = [
  {
    title: "Students",
    text: "Browse, enroll, track progress, and keep everything synced across devices.",
    background: "#f8e5f2",
    color: "#4d4276",
  },
  {
    title: "Instructors",
    text: "Publish courses, manage payments, and unlock analytics from one workspace.",
    background: "#b88cff",
    color: "white",
  },
  {
    title: "Admins",
    text: "Moderate users, approve content, and keep the platform healthy.",
    background: "#efe8ff",
    color: "#4d4276",
  },
];

const styles = {
  shell: {
    minHeight: "100vh",
    background: "#f7f1fb",
    color: "#3d3666",
    position: "relative",
    overflow: "hidden",
  },
  backdrop1: {
    position: "absolute",
    top: "-96px",
    left: "-32px",
    width: "288px",
    height: "288px",
    borderRadius: "9999px",
    background: "#d8c4ff",
    filter: "blur(70px)",
    opacity: 0.55,
  },
  backdrop2: {
    position: "absolute",
    top: "140px",
    right: "-32px",
    width: "320px",
    height: "320px",
    borderRadius: "9999px",
    background: "#ffd4ea",
    filter: "blur(70px)",
    opacity: 0.55,
  },
  backdrop3: {
    position: "absolute",
    bottom: "-64px",
    left: "33%",
    width: "256px",
    height: "256px",
    borderRadius: "9999px",
    background: "#e7ddff",
    filter: "blur(70px)",
    opacity: 0.7,
  },
  grid: {
    position: "relative",
    maxWidth: "1280px",
    margin: "0 auto",
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "1.05fr 0.95fr",
    gap: "40px",
    alignItems: "center",
    padding: "40px 16px",
  },
  left: {
    borderRadius: "32px",
    border: "1px solid rgba(255,255,255,0.7)",
    background: "rgba(255,255,255,0.62)",
    boxShadow: "0 25px 80px rgba(95, 73, 153, 0.12)",
    backdropFilter: "blur(18px)",
    padding: "32px",
  },
  right: {
    width: "100%",
    maxWidth: "560px",
    margin: "0 auto",
  },
  card: {
    borderRadius: "32px",
    border: "1px solid rgba(255,255,255,0.8)",
    background: "rgba(255,255,255,0.92)",
    boxShadow: "0 25px 80px rgba(95, 73, 153, 0.18)",
    backdropFilter: "blur(18px)",
    padding: "24px",
  },
  eyebrow: {
    margin: 0,
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.28em",
    textTransform: "uppercase",
    color: "#c27fb6",
  },
  title: {
    margin: "12px 0 0",
    fontSize: "44px",
    lineHeight: 1.05,
    fontWeight: 900,
    color: "#433777",
    maxWidth: "720px",
  },
  subtitle: {
    margin: "16px 0 0",
    fontSize: "16px",
    lineHeight: 1.9,
    color: "#6d658e",
    maxWidth: "760px",
  },
  badgesRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "24px",
  },
  badge: {
    borderRadius: "999px",
    background: "white",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: 600,
    color: "#766a9d",
    boxShadow: "0 10px 24px rgba(95, 73, 153, 0.08)",
  },
  highlightGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
    marginTop: "24px",
  },
  highlightCard: {
    borderRadius: "20px",
    background: "rgba(255,255,255,0.85)",
    padding: "16px",
    boxShadow: "0 8px 20px rgba(95, 73, 153, 0.08)",
    border: "1px solid white",
  },
  highlightLabel: {
    fontSize: "12px",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    color: "#b77abb",
  },
  highlightValue: {
    marginTop: "8px",
    fontSize: "14px",
    fontWeight: 700,
    color: "#4d4276",
  },
  featureGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
    marginTop: "24px",
  },
  featureCard: {
    borderRadius: "24px",
    padding: "20px",
    boxShadow: "0 8px 20px rgba(95, 73, 153, 0.08)",
    border: "1px solid white",
  },
  featureTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 800,
  },
  featureText: {
    margin: "8px 0 0",
    fontSize: "14px",
    lineHeight: 1.7,
    opacity: 0.95,
  },
  darkPanel: {
    marginTop: "24px",
    borderRadius: "28px",
    background: "#4f4188",
    color: "white",
    padding: "24px",
    boxShadow: "0 25px 80px rgba(79, 65, 136, 0.28)",
  },
  darkTitle: {
    margin: "12px 0 0",
    fontSize: "26px",
    lineHeight: 1.15,
    fontWeight: 900,
  },
  darkStack: {
    display: "grid",
    gap: "12px",
    marginTop: "16px",
  },
  darkStackItem: {
    borderRadius: "18px",
    background: "rgba(255,255,255,0.12)",
    padding: "14px 16px",
    fontSize: "14px",
  },
  rightTop: {
    borderRadius: "32px",
    border: "1px solid rgba(255,255,255,0.8)",
    background: "rgba(255,255,255,0.92)",
    boxShadow: "0 25px 80px rgba(95, 73, 153, 0.18)",
    backdropFilter: "blur(18px)",
    padding: "24px",
  },
  rightHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    marginBottom: "24px",
  },
  brand: {
    margin: 0,
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.28em",
    textTransform: "uppercase",
    color: "#c27fb6",
  },
  smallTitle: {
    margin: "4px 0 0",
    fontSize: "26px",
    fontWeight: 900,
    color: "#433777",
  },
  browseLink: {
    textDecoration: "none",
    borderRadius: "999px",
    background: "#f4ebff",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: 700,
    color: "#5d4e98",
  },
  formTitle: {
    margin: 0,
    fontSize: "34px",
    lineHeight: 1.1,
    fontWeight: 900,
    color: "#3c3168",
  },
  formSubtitle: {
    margin: "12px 0 0",
    fontSize: "14px",
    lineHeight: 1.8,
    color: "#6d658e",
  },
  formWrap: {
    marginTop: "32px",
  },
  footer: {
    marginTop: "16px",
    textAlign: "center",
    fontSize: "14px",
    color: "#6d658e",
  },
};

export default function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  showMarketing = true,
}) {
  return (
    <div style={styles.shell}>
      <div style={styles.backdrop1} />
      <div style={styles.backdrop2} />
      <div style={styles.backdrop3} />

      <div
        style={{
          ...styles.grid,
          gridTemplateColumns: showMarketing ? "1.05fr 0.95fr" : "1fr",
        }}
      >
        {showMarketing ? (
          <section style={styles.left}>
            <div>
              <p style={styles.eyebrow}>{eyebrow}</p>
              <h1 style={styles.title}>{title}</h1>
              <p style={styles.subtitle}>{subtitle}</p>
            </div>

            <div style={styles.highlightGrid}>
              {highlights.map((item) => (
                <div key={item.label} style={styles.highlightCard}>
                  <div style={styles.highlightLabel}>{item.label}</div>
                  <div style={styles.highlightValue}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={styles.featureGrid}>
              {featureCards.map((card) => (
                <div
                  key={card.title}
                  style={{
                    ...styles.featureCard,
                    background: card.background,
                    color: card.color,
                  }}
                >
                  <h3 style={styles.featureTitle}>{card.title}</h3>
                  <p style={styles.featureText}>{card.text}</p>
                </div>
              ))}
            </div>

            <div style={styles.badgesRow}>
              <span style={styles.badge}>Secure signup</span>
              <span style={styles.badge}>Email verification</span>
              <span style={styles.badge}>Password recovery</span>
            </div>

            <div style={styles.darkPanel}>
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  letterSpacing: "0.25em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                Built for SkillNest
              </p>
              <h2 style={styles.darkTitle}>
                A polished authentication flow for students and instructors.
              </h2>
              <div style={styles.darkStack}>
                <div style={styles.darkStackItem}>JWT sessions</div>
                <div style={styles.darkStackItem}>Role-based access</div>
                <div style={styles.darkStackItem}>Verify, recover, sign in</div>
              </div>
            </div>
          </section>
        ) : null}

        <section style={styles.right}>
          <div style={showMarketing ? styles.rightTop : styles.card}>
            <div style={styles.rightHeader}>
              <div>
                <p style={styles.brand}>SkillNest</p>
                <h2 style={styles.smallTitle}>{eyebrow}</h2>
              </div>
              <Link to="/" style={styles.browseLink}>
                Browse home
              </Link>
            </div>

            <div>
              <h3 style={styles.formTitle}>{title}</h3>
              <p style={styles.formSubtitle}>{subtitle}</p>
            </div>

            <div style={styles.formWrap}>{children}</div>
          </div>

          {footer ? <div style={styles.footer}>{footer}</div> : null}
        </section>
      </div>
    </div>
  );
}
