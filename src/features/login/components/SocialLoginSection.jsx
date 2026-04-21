import "../styles/login.css";

export default function SocialLoginSection({
  role,
  onGoToSignUp,
  onGoogleLogin,
}) {
  return (
    <div className="login-social">
      <p className="login-social-sep">- or -</p>

      {role === "user" && (
        <div className="login-social-icons">
          <button
            type="button"
            onClick={onGoogleLogin}
            className="login-social-icon"
            aria-label="Google login"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.8 0-5.18-1.88-6.04-4.42H2.34v2.84C4.12 20.98 7.79 23 12 23z" fill="#34A853" />
              <path d="M5.96 14.25c-.21-.66-.32-1.36-.32-2.08s.11-1.42.32-2.08V7.29H2.34C1.5 8.83 1 10.55 1 12.33s.5 3.5 1.34 5.04l3.62-2.87z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.79 1 4.12 3.02 2.34 6.16l3.62 2.85c.86-2.54 3.24-4.42 6.04-4.42z" fill="#EA4335" />
            </svg>
          </button>
          <button type="button" className="login-social-icon" aria-label="Facebook">
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.98h-1.51c-1.49 0-1.95.93-1.95 1.88v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07z" />
            </svg>
          </button>
          <button type="button" className="login-social-icon" aria-label="Apple">
            <svg viewBox="0 0 24 24" className="h-5 w-5">
              <path fill="#111827" d="M16.37 1.43c0 1.14-.46 2.2-1.19 2.96-.79.81-2.08 1.43-3.2 1.34-.14-1.08.43-2.24 1.2-3 .78-.79 2.12-1.37 3.19-1.3zM20.78 17.29c-.56 1.28-.84 1.85-1.56 2.99-1.01 1.58-2.42 3.55-4.17 3.57-1.55.02-1.95-1-4.06-.99-2.11.01-2.56 1.01-4.12.99-1.76-.02-3.09-1.79-4.1-3.37-2.83-4.46-3.12-9.69-1.38-12.37 1.24-1.9 3.2-3.02 5.05-3.02 1.89 0 3.08 1.04 4.64 1.04 1.52 0 2.45-1.04 4.62-1.04 1.65 0 3.41.9 4.64 2.45-4.06 2.22-3.4 8.03.44 9.75z" />
            </svg>
          </button>
        </div>
      )}

      <p className="login-signup-copy">
        Don't have an account?{" "}
        <button type="button" onClick={onGoToSignUp} className="login-signup-link">
          Sign up
        </button>
      </p>
    </div>
  );
}
