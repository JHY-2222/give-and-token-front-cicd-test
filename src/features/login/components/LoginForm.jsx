import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import "../styles/login.css";

export default function LoginForm({
  loginData,
  onChange,
  onSubmit,
  errorMessage,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="login-form" onSubmit={onSubmit}>
      <div className="login-field">
        <label htmlFor="email-address" className="login-label">
          Email
        </label>
        <div className="login-password-wrap">
          <Mail size={18} className="login-field-icon" />
          <input
            id="email-address"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="login-input"
            placeholder="email@gmail.com"
            value={loginData.email}
            onChange={onChange}
          />
        </div>
      </div>

      <div className="login-field">
        <label htmlFor="password" className="login-label">
          Password
        </label>
        <div className="login-password-wrap">
          <Lock size={18} className="login-field-icon" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="login-input login-input--password"
            placeholder="Enter your password"
            value={loginData.password}
            onChange={onChange}
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="login-password-toggle"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
      </div>

      {errorMessage && <p className="login-error">{errorMessage}</p>}

      <button type="submit" className="login-submit">
        Login
      </button>
    </form>
  );
}
