import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignupRoleSelector from "../components/SignupRoleSelector";
import SignupFormFields from "../components/SignupFormFields";
import {
  checkNickname,
  sendEmailVerification,
  verifyEmailCode,
  submitSignup,
} from "../api/signupApi";

const SignupPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    role: "user",
    photo: null,
    name: "",
    nickname: "",
    email: "",
    password: "",
    password2: "",
    phone: "",
    birth: "",
  });

  const [isNicknameChecked, setIsNicknameChecked] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "nickname") {
      setIsNicknameChecked(false);
    }

    if (name === "email") {
      setIsEmailVerified(false);
      setShowVerificationInput(false);
      setVerificationCode("");
    }
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      photo: e.target.files?.[0] ?? null,
    }));
  };

  const handleNicknameCheck = async () => {
    if (!formData.nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    try {
      const response = await checkNickname(formData.nickname);

      if (response.ok) {
        alert("사용 가능한 닉네임입니다.");
        setIsNicknameChecked(true);
      } else {
        const text = await response.text();
        alert(text || "이미 사용 중인 닉네임입니다.");
      }
    } catch (error) {
      console.error("닉네임 체크 중 오류 발생:", error);
      alert("닉네임 체크 중 오류가 발생했습니다.");
    }
  };

  const handleSendVerification = async () => {
    if (!formData.email.trim()) {
      alert("이메일을 입력해주세요.");
      return;
    }

    try {
      const response = await sendEmailVerification(formData.email);

      if (response.ok) {
        const data = await response.json();
        alert(data?.message || "인증 메일이 발송되었습니다.");
        setShowVerificationInput(true);
      } else {
        const text = await response.text();
        alert(text || "발송 실패. 이메일을 확인해주세요.");
      }
    } catch (error) {
      console.error("인증 요청 중 오류 발생:", error);
      alert("인증 요청 중 오류가 발생했습니다.");
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      alert("인증코드를 입력해주세요.");
      return;
    }

    try {
      const response = await verifyEmailCode({
        email: formData.email,
        code: verificationCode,
      });

      if (!response.ok) {
        const text = await response.text();
        alert(text || "인증 확인 중 오류가 발생했습니다.");
        return;
      }

      const result = await response.json();

      if (result === true) {
        alert("인증에 성공했습니다.");
        setIsEmailVerified(true);
      } else {
        alert("인증에 실패했습니다.");
      }
    } catch (error) {
      console.error("인증코드 확인 중 오류 발생:", error);
      alert("인증코드 확인 중 오류가 발생했습니다.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isNicknameChecked) {
      alert("닉네임 중복 확인이 필요합니다.");
      return;
    }

    if (!isEmailVerified) {
      alert("이메일 인증이 필요합니다.");
      return;
    }

    if (!formData.password.trim()) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    if (!formData.password2.trim()) {
      alert("비밀번호 확인을 입력해주세요.");
      return;
    }

    if (formData.password !== formData.password2) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      setSubmitting(true);

      const signupPayload = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        birth: formData.birth,
        loginType: "LOCAL",
        nameHash: formData.nickname,
      };

      const response = await submitSignup(signupPayload);

      if (!response.ok) {
        const text = await response.text();
        alert(text || "회원가입에 실패했습니다.");
        return;
      }

      alert("회원가입이 완료되었습니다.");

      if (formData.photo) {
        console.log("현재 DTO 기준으로 사진 업로드는 아직 회원가입 요청에 포함되지 않았어.");
      }

      navigate("/login");
    } catch (error) {
      console.error("회원가입 중 오류 발생:", error);
      alert("회원가입 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>회원가입</h1>

      <form onSubmit={handleSubmit}>
        <SignupRoleSelector
          role={formData.role}
          onChange={handleChange}
        />

        <SignupFormFields
          formData={formData}
          onChange={handleChange}
          onFileChange={handleFileChange}
          onNicknameCheck={handleNicknameCheck}
          onSendVerification={handleSendVerification}
          verificationCode={verificationCode}
          onVerificationCodeChange={(e) =>
            setVerificationCode(e.target.value)
          }
          onVerifyCode={handleVerifyCode}
          showVerificationInput={showVerificationInput}
          isEmailVerified={isEmailVerified}
        />

        <button type="submit" disabled={submitting}>
          {submitting ? "가입 중..." : "가입 완료"}
        </button>
      </form>
    </div>
  );
};

export default SignupPage;