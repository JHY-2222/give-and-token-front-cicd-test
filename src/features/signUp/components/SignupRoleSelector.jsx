import React, { useState } from "react";
import SignupRoleSelector from "../components/SignupRoleSelector";
import SignupFormFields from "../components/SignupFormFields";
import {
  checkNickname,
  sendEmailVerification,
  verifyEmailCode,
} from "../api/signupApi";

const SignupPage = () => {
  const [formData, setFormData] = useState({
    role: "user",
    photo: null,
    name: "",
    nickname: "",
    email: "",
    phone: "",
    birthday: "",
  });

  const [isNicknameChecked, setIsNicknameChecked] = useState(false);

  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);

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
      photo: e.target.files[0],
    }));
  };

  const handleNicknameCheck = async () => {
    if (!formData.nickname) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    try {
      const response = await checkNickname(formData.nickname);

      if (response.ok) {
        alert("사용 가능한 닉네임입니다.");
        setIsNicknameChecked(true);
      } else {
        alert("이미 사용 중인 닉네임입니다.");
      }
    } catch (error) {
      console.error("닉네임 체크 중 오류 발생:", error);
    }
  };

  const handleSendVerification = async () => {
    if (!formData.email) {
      alert("이메일을 입력해주세요.");
      return;
    }

    try {
      const response = await sendEmailVerification(formData.email);

      if (response.ok) {
        alert("인증 메일이 발송되었습니다.");
        setShowVerificationInput(true);
      } else {
        alert("발송 실패. 이메일을 확인해주세요.");
      }
    } catch (error) {
      console.error("인증 요청 중 오류 발생:", error);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      alert("인증코드를 입력해주세요.");
      return;
    }

    try {
      const response = await verifyEmailCode({
        email: formData.email,
        code: verificationCode,
      });

      if (!response.ok) {
        alert("인증 확인 중 오류가 발생했습니다.");
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
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isNicknameChecked) {
      alert("닉네임 중복 확인이 필요합니다.");
      return;
    }

    if (!isEmailVerified) {
      alert("이메일 인증이 필요합니다.");
      return;
    }

    console.log("최종 제출 데이터:", formData);

    // 회원가입 API 호출 로직
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

        <button type="submit">가입 완료</button>
      </form>
    </div>
  );
};

export default SignupPage;