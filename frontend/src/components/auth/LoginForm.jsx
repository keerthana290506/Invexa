import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
 
export default function Login() {
  const { login, loading, error, isAuthenticated, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
 
  const from = location.state?.from?.pathname || "/dashboard";
 
  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true });
  }, [isAuthenticated, navigate, from]);
 
  useEffect(() => {
    return () => clearError();
  }, [clearError]);
 
  function validate() {
    const errs = {};
    if (!email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email";
    if (!password) errs.password = "Password is required";
    return errs;
  }
 
  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setFieldErrors(errs);
    setFieldErrors({});
    await login(email, password);
  }
 
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
 
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
 
        .login-root {
          min-height: 100vh;
          background: #0a0a0f;
          display: flex;
          font-family: 'Syne', sans-serif;
          position: relative;
          overflow: hidden;
        }
 
        /* Animated grid background */
        .login-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,.06) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: gridDrift 20s linear infinite;
        }
 
        @keyframes gridDrift {
          from { background-position: 0 0; }
          to   { background-position: 60px 60px; }
        }
 
        /* Glow blob */
        .login-root::after {
          content: '';
          position: absolute;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(99,102,241,.18) 0%, transparent 70%);
          top: -150px;
          left: -150px;
          pointer-events: none;
          animation: blobPulse 8s ease-in-out infinite alternate;
        }
 
        @keyframes blobPulse {
          from { transform: scale(1) translate(0, 0); opacity: .6; }
          to   { transform: scale(1.2) translate(40px, 60px); opacity: 1; }
        }
 
        /* Left panel */
        .login-panel-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px 72px;
          position: relative;
          z-index: 1;
        }
 
        .brand-mark {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 80px;
        }
 
        .brand-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 24px rgba(99,102,241,.4);
        }
 
        .brand-icon svg { width: 20px; height: 20px; color: white; }
 
        .brand-name {
          font-size: 22px;
          font-weight: 800;
          color: #f8fafc;
          letter-spacing: -.5px;
        }
 
        .login-headline {
          font-size: clamp(36px, 4vw, 52px);
          font-weight: 800;
          color: #f8fafc;
          line-height: 1.1;
          letter-spacing: -1.5px;
          margin-bottom: 20px;
        }
 
        .login-headline span {
          background: linear-gradient(90deg, #6366f1, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
 
        .login-subline {
          font-size: 16px;
          color: #64748b;
          line-height: 1.6;
          max-width: 340px;
        }
 
        .stat-row {
          display: flex;
          gap: 40px;
          margin-top: 60px;
        }
 
        .stat-item { display: flex; flex-direction: column; gap: 4px; }
 
        .stat-num {
          font-size: 28px;
          font-weight: 800;
          color: #f8fafc;
          letter-spacing: -1px;
        }
 
        .stat-label {
          font-size: 12px;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-family: 'JetBrains Mono', monospace;
        }
 
        /* Right panel — form card */
        .login-panel-right {
          width: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          position: relative;
          z-index: 1;
        }
 
        .form-card {
          width: 100%;
          background: rgba(15,15,23,.9);
          border: 1px solid rgba(99,102,241,.2);
          border-radius: 24px;
          padding: 48px 44px;
          backdrop-filter: blur(20px);
          box-shadow: 0 32px 80px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.04);
          animation: cardIn .5s cubic-bezier(.22,1,.36,1) both;
        }
 
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
 
        .form-title {
          font-size: 26px;
          font-weight: 700;
          color: #f1f5f9;
          letter-spacing: -.5px;
          margin-bottom: 6px;
        }
 
        .form-subtitle {
          font-size: 14px;
          color: #475569;
          margin-bottom: 36px;
        }
 
        .form-subtitle a {
          color: #818cf8;
          text-decoration: none;
          font-weight: 600;
          transition: color .15s;
        }
        .form-subtitle a:hover { color: #a5b4fc; }
 
        .field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
 
        .field label {
          font-size: 13px;
          font-weight: 600;
          color: #94a3b8;
          letter-spacing: .3px;
          font-family: 'JetBrains Mono', monospace;
        }
 
        .input-wrap { position: relative; }
 
        .field input {
          width: 100%;
          padding: 14px 44px 14px 16px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          border-radius: 12px;
          color: #f1f5f9;
          font-size: 15px;
          font-family: 'Syne', sans-serif;
          outline: none;
          transition: border-color .2s, background .2s, box-shadow .2s;
        }
 
        .field input::placeholder { color: #334155; }
 
        .field input:focus {
          border-color: rgba(99,102,241,.6);
          background: rgba(99,102,241,.06);
          box-shadow: 0 0 0 3px rgba(99,102,241,.12);
        }
 
        .field input.has-error {
          border-color: rgba(239,68,68,.5);
          background: rgba(239,68,68,.04);
        }
 
        .toggle-pw {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #475569;
          padding: 0;
          display: flex;
          align-items: center;
          transition: color .15s;
        }
        .toggle-pw:hover { color: #94a3b8; }
 
        .field-error {
          font-size: 12px;
          color: #ef4444;
          font-family: 'JetBrains Mono', monospace;
          animation: errIn .2s ease;
        }
 
        @keyframes errIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
 
        .global-error {
          background: rgba(239,68,68,.08);
          border: 1px solid rgba(239,68,68,.25);
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 13px;
          color: #fca5a5;
          margin-bottom: 24px;
          font-family: 'JetBrains Mono', monospace;
          animation: errIn .2s ease;
        }
 
        .btn-submit {
          width: 100%;
          padding: 15px;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border: none;
          border-radius: 12px;
          color: #fff;
          font-size: 15px;
          font-weight: 700;
          font-family: 'Syne', sans-serif;
          letter-spacing: .3px;
          cursor: pointer;
          transition: opacity .2s, transform .15s, box-shadow .2s;
          box-shadow: 0 4px 20px rgba(99,102,241,.35);
          position: relative;
          overflow: hidden;
          margin-top: 8px;
        }
 
        .btn-submit::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,.15), transparent);
          opacity: 0;
          transition: opacity .2s;
        }
 
        .btn-submit:hover::before { opacity: 1; }
        .btn-submit:hover { box-shadow: 0 6px 28px rgba(99,102,241,.5); transform: translateY(-1px); }
        .btn-submit:active { transform: translateY(0); }
        .btn-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }
 
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin .6s linear infinite;
          vertical-align: middle;
          margin-right: 8px;
        }
 
        @keyframes spin { to { transform: rotate(360deg); } }
 
        @media (max-width: 900px) {
          .login-panel-left { display: none; }
          .login-panel-right { width: 100%; padding: 24px; }
        }
      `}</style>
 
      <div className="login-root">
        {/* Left branding panel */}
        <div className="login-panel-left">
          <div className="brand-mark">
            <div className="brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="brand-name">Invexa</span>
          </div>
 
          <h1 className="login-headline">
            Inventory<br />
            <span>reimagined.</span>
          </h1>
          <p className="login-subline">
            Track stock, manage products, and get real-time insights — all from one intelligent dashboard.
          </p>
 
          <div className="stat-row">
            <div className="stat-item">
              <span className="stat-num">99.9%</span>
              <span className="stat-label">Uptime</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">Real-time</span>
              <span className="stat-label">Stock Alerts</span>
            </div>
            <div className="stat-item">
              <span className="stat-num">RBAC</span>
              <span className="stat-label">Role Access</span>
            </div>
          </div>
        </div>
 
        {/* Right form panel */}
        <div className="login-panel-right">
          <div className="form-card">
            <h2 className="form-title">Welcome back</h2>
            <p className="form-subtitle">
              New here?{" "}
              <Link to="/register">Create an account</Link>
            </p>
 
            {error && <div className="global-error">⚠ {error}</div>}
 
            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="email">EMAIL</label>
                <div className="input-wrap">
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setFieldErrors(p => ({ ...p, email: "" })); }}
                    className={fieldErrors.email ? "has-error" : ""}
                    autoComplete="email"
                  />
                </div>
                {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
              </div>
 
              <div className="field">
                <label htmlFor="password">PASSWORD</label>
                <div className="input-wrap">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setFieldErrors(p => ({ ...p, password: "" })); }}
                    className={fieldErrors.password ? "has-error" : ""}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-pw"
                    onClick={() => setShowPassword(s => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
                {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
              </div>
 
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading && <span className="spinner" />}
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}