import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LoginRoleSelector from "../components/LoginRoleSelector";
import LoginForm from "../components/LoginForm";
import LoginLinks from "../components/LoginLinks";
import SocialLoginSection from "../components/SocialLoginSection";
import EmailFindModal from "../components/EmailFindModal";
import PasswordResetModal from "../components/PasswordResetModal";
import { loginLocal } from "../api/authApi";

const LoginPage = () => {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    role: "user",
    email: "",
    password: "",
  });

  const [loginError, setLoginError] = useState("");
  const [isEmailFindOpen, setIsEmailFindOpen] = useState(false);
  const [isPasswordResetOpen, setIsPasswordResetOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const redirectByRole = (role) => {
    switch (role) {
      case "foundation":
        navigate("/foundation/dashboard");
        break;
      case "beneficiary":
        navigate("/beneficiary/main");
        break;
      case "user":
      default:
        navigate("/");
        break;
    }
  };

  const handleLocalLogin = async (e) => {
    e.preventDefault();

    try {
      setLoginError("");

      const response = await loginLocal({
        email: loginData.email,
        password: loginData.password,
        userType: "LOCAL",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "로그인에 실패했어.");
      }

      const data = await response.json();
      console.log("로그인 성공:", data);

      redirectByRole(loginData.role);
    } catch (error) {
      console.error("로그인 중 오류 발생:", error);
      setLoginError(error.message || "로그인 중 오류가 발생했어.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/oauth2/authorization/google";
  };

  const goToSignUp = () => {
    navigate("/signup");
  };

  return (
    <div>
      <h1>로그인</h1>

      <LoginRoleSelector
        role={loginData.role}
        onChange={handleChange}
      />

      <LoginForm
        loginData={loginData}
        onChange={handleChange}
        onSubmit={handleLocalLogin}
        errorMessage={loginError}
      />

      <LoginLinks
        onOpenFindEmail={() => setIsEmailFindOpen(true)}
        onOpenPasswordReset={() => setIsPasswordResetOpen(true)}
      />

      <hr />

      <SocialLoginSection
        onGoToSignUp={goToSignUp}
        onGoogleLogin={handleGoogleLogin}
      />

      {isEmailFindOpen && (
        <EmailFindModal onClose={() => setIsEmailFindOpen(false)} />
      )}

      {isPasswordResetOpen && (
        <PasswordResetModal
          onClose={() => setIsPasswordResetOpen(false)}
        />
      )}
    </div>
  );
};

export default LoginPage;