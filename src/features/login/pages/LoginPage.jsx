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
        navigate("/foundation/me");
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
      const response = await loginLocal(loginData.role, {
        email: loginData.email,
        password: loginData.password,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "濡쒓렇?몄뿉 ?ㅽ뙣?덉뼱.");
      }

      const data = await response.json();
      console.log("濡쒓렇???깃났:", data);
      if (loginData.role === "foundation") {
        const rawToken = String(data?.accessToken || "")
          .replace(/^Bearer\s+/i, "")
          .trim();

        if (rawToken) {
          window.localStorage.setItem("accessToken", rawToken);
          window.localStorage.setItem("foundationAccessToken", rawToken);
        }

        window.localStorage.setItem(
          "foundationAuthInfo",
          JSON.stringify({
            foundationNo: data?.foundationNo ?? null,
            foundationName: data?.foundationName ?? "",
            email: data?.email ?? loginData.email,
            tokenType: data?.tokenType ?? "Bearer",
          }),
        );
      }
      redirectByRole(loginData.role);
    } catch (error) {
      console.error("濡쒓렇??以??ㅻ쪟 諛쒖깮:", error);
      setLoginError(error.message || "濡쒓렇??以??ㅻ쪟媛 諛쒖깮?덉뼱.");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "/oauth2/authorization/google";
  };

  const goToSignUp = () => {
    navigate("/signup");
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-2xl shadow-lg text-ink">
        <h1 className="text-center text-3xl font-display font-bold tracking-tight text-ink">
          濡쒓렇??
        </h1>

        <LoginRoleSelector role={loginData.role} onChange={handleChange} />

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

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="flex-shrink mx-4 text-gray-400 text-xs">
            ?먮뒗
          </span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <SocialLoginSection
          onGoToSignUp={goToSignUp}
          onGoogleLogin={handleGoogleLogin}
        />

        {isEmailFindOpen && (
          <EmailFindModal onClose={() => setIsEmailFindOpen(false)} />
        )}

        {isPasswordResetOpen && (
          <PasswordResetModal onClose={() => setIsPasswordResetOpen(false)} />
        )}
      </div>
    </div>
  );
};

export default LoginPage;

