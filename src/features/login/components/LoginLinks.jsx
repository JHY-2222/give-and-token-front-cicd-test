import "../styles/login.css";

export default function LoginLinks({
  onOpenFindEmail,
  onOpenPasswordReset,
}) {
  return (
    <div className="login-inline-links">
      <button
        type="button"
        onClick={onOpenFindEmail}
        className="login-inline-link"
      >
        아이디 찾기
      </button>
      <button
        type="button"
        onClick={onOpenPasswordReset}
        className="login-inline-link"
      >
        Forgot Password?
      </button>
    </div>
  );
}
