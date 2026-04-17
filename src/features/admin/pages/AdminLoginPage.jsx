import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../util";
import "../css/AdminLoginPage.css";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    adminId: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setErrorMessage("");

      const response = await loginAdmin(form);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "관리자 로그인에 실패했습니다.");
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
      <div className="admin-login-shell">
        <section className="admin-login-card">
          <div className="admin-login-brand">
            <div className="admin-login-brand__badge">giva N token</div>
            <h1>giva N token Admin</h1>
            <p>관리자 전용 대시보드 로그인</p>
          </div>

          <form className="admin-login-form" onSubmit={handleSubmit}>
            <label className="admin-login-field">
              <span>ADMIN ID</span>
              <input
                type="text"
                name="adminId"
                value={form.adminId}
                onChange={handleChange}
                placeholder="아이디를 입력하세요"
              />
            </label>

            <label className="admin-login-field">
              <span>PASSWORD</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="비밀번호를 입력하세요"
              />
            </label>

            {errorMessage && <p className="admin-login-error">{errorMessage}</p>}

            <button type="submit" className="admin-login-submit" disabled={submitting}>
              {submitting ? "접속 중..." : "대시보드 접속하기"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
