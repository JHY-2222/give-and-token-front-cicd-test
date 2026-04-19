import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../util";
import "../css/AdminLoginPage.css";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ adminId: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSubmitting(true);
      setErrorMessage("");

      const response = await loginAdmin(form);

      if (!response.ok) {
        const errorJson = await response.json().catch(() => null);
        throw new Error(errorJson?.message || "관리자 로그인에 실패했습니다.");
      }

      const data = await response.json();
      window.localStorage.setItem("adminAccessToken", data.accessToken);
      window.localStorage.setItem("adminProfile", JSON.stringify(data));
      navigate("/admin/dashboard");
    } catch (error) {
      setErrorMessage(error.message || "관리자 로그인 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      {/* 왼쪽 건물 사진 패널 */}
      <div className="admin-login-left">
        <div className="admin-login-left__overlay" />
        <div className="admin-login-left__content">
          <h2 className="admin-login-left__title">
            Give N Token
          </h2>
          <p className="admin-login-left__desc">관리자 전용 페이지</p>
        </div>
      </div>

      {/* 오른쪽 로그인 폼 */}
      <div className="admin-login-right">
        <div className="admin-login-form-wrap">
          <div className="admin-login-form-header">
            <h1>Login</h1>
            <p>관리자 계정으로 로그인하세요</p>
          </div>

          <form className="admin-login-form" onSubmit={handleSubmit}>
            <div className="admin-login-field">
              <input
                type="text"
                name="adminId"
                value={form.adminId}
                onChange={handleChange}
                placeholder="아이디를 입력하세요"
                autoComplete="username"
                required
              />
            </div>

            <div className="admin-login-field">
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력하세요"
                autoComplete="current-password"
                required
              />
            </div>

            {errorMessage && (
              <p className="admin-login-error">{errorMessage}</p>
            )}

            <button type="submit" className="admin-login-submit" disabled={submitting}>
              {submitting ? "접속 중..." : "로그인"}
            </button>
          </form>

          <div className="admin-login-footer">
            계정 정보 확인은 담당자에게 문의하세요 &nbsp;·&nbsp; <a href="/">홈으로</a>
          </div>
        </div>
      </div>
    </div>
  );
}
