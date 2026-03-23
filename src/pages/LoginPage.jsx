import { useState } from "react";
import T from "../theme";

export default function LoginPage({ onSignIn, onSignUp, onResetPassword }) {
  const [mode, setMode] = useState("login"); // "login", "signup", "reset"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setSubmitting(true);

    if (mode === "reset") {
      if (!email) { setError("Enter your email"); setSubmitting(false); return; }
      const { error } = await onResetPassword(email);
      if (error) setError(error.message);
      else setMessage("Check your email for a password reset link.");
      setSubmitting(false);
      return;
    }

    if (!email || !password) { setError("Fill in all fields"); setSubmitting(false); return; }

    if (mode === "signup") {
      if (password !== confirmPassword) { setError("Passwords don't match"); setSubmitting(false); return; }
      if (password.length < 6) { setError("Password must be at least 6 characters"); setSubmitting(false); return; }
      const { error, data } = await onSignUp(email, password);
      if (error) {
        setError(error.message);
      } else if (data?.user && !data?.session) {
        setMessage("Check your email to confirm your account, then sign in.");
        setMode("login");
      } else {
        setMessage("Account created! You're now logged in.");
      }
    } else {
      const { error } = await onSignIn(email, password);
      if (error) setError(error.message);
    }
    setSubmitting(false);
  };

  const inputStyle = {
    width: "100%", background: T.surfaceHigh, border: `1px solid ${T.border}`,
    borderRadius: 10, padding: "14px 16px", color: T.text, fontSize: 15,
    fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  };

  return (
    <div style={{
      minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center",
      justifyContent: "center", fontFamily: "Georgia, 'Palatino Linotype', serif",
      padding: "20px",
    }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: T.textDim, textTransform: "uppercase" }}>
            Lean Bulk · Carnivore
          </div>
          <div style={{ fontSize: 28, color: T.text, marginTop: 6 }}>Jesse's Plan</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, color: T.textDim, letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>
                Email
              </div>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" autoComplete="email"
                style={inputStyle}
              />
            </div>

            {mode !== "reset" && (
              <div>
                <div style={{ fontSize: 10, color: T.textDim, letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>
                  Password
                </div>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  style={inputStyle}
                />
              </div>
            )}

            {mode === "signup" && (
              <div>
                <div style={{ fontSize: 10, color: T.textDim, letterSpacing: 2, marginBottom: 6, textTransform: "uppercase" }}>
                  Confirm Password
                </div>
                <input
                  type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="new-password"
                  style={inputStyle}
                />
              </div>
            )}

            {error && (
              <div style={{ color: "#e05252", fontSize: 13, textAlign: "center", padding: "8px 0" }}>
                {error}
              </div>
            )}

            {message && (
              <div style={{ color: T.green, fontSize: 13, textAlign: "center", padding: "8px 0" }}>
                {message}
              </div>
            )}

            <button type="submit" disabled={submitting} style={{
              width: "100%", padding: "16px 0", background: T.accent,
              border: "none", borderRadius: 10, color: "#fff",
              fontSize: 15, cursor: "pointer", fontFamily: "inherit",
              opacity: submitting ? 0.6 : 1, marginTop: 4,
            }}>
              {submitting ? "..." : mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
            </button>
          </div>
        </form>

        {/* Links */}
        <div style={{ textAlign: "center", marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          {mode === "login" && (
            <>
              <div onClick={() => { setMode("reset"); setError(""); setMessage(""); }}
                style={{ fontSize: 13, color: T.textDim, cursor: "pointer" }}>
                Forgot password?
              </div>
              <div onClick={() => { setMode("signup"); setError(""); setMessage(""); }}
                style={{ fontSize: 13, color: T.accent, cursor: "pointer" }}>
                Create an account
              </div>
            </>
          )}
          {mode === "signup" && (
            <div onClick={() => { setMode("login"); setError(""); setMessage(""); }}
              style={{ fontSize: 13, color: T.accent, cursor: "pointer" }}>
              Already have an account? Sign in
            </div>
          )}
          {mode === "reset" && (
            <div onClick={() => { setMode("login"); setError(""); setMessage(""); }}
              style={{ fontSize: 13, color: T.accent, cursor: "pointer" }}>
              Back to sign in
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
