import { useState } from "react";
import ModalLayout from "./ModalLayout";
import {
  requestPasswordReset,
  verifyEmailCode,
  confirmPasswordReset,
} from "../api/authApi";

export default function PasswordResetModal({ onClose }) {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    email: "",
    name: "",
    code: "",
    newPassword: "",
    newPassword2: "",
  });

  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSendCode = async () => {
    if (!form.email.trim()) {
      alert("이메일을 입력해.");
      return;
    }

    if (!form.name.trim()) {
      alert("이름을 입력해.");
      return;
    }

    try {
      setSending(true);
      setMessage("");

      const response = await requestPasswordReset({
        email: form.email,
        name: form.name,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "인증번호 발송에 실패했어.");
      }

      setStep(2);
      setMessage("인증번호가 발송됐어.");
      alert("인증번호가 발송됐어.");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "인증번호 발송에 실패했어.");
    } finally {
      setSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!form.code.trim()) {
      alert("인증번호를 입력해.");
      return;
    }

    try {
      setVerifying(true);
      setMessage("");

      const response = await verifyEmailCode({
        email: form.email,
        code: form.code,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "인증 확인에 실패했어.");
      }

      const result = await response.json();

      if (result === true) {
        setIsVerified(true);
        setStep(3);
        setMessage("인증에 성공했어.");
        alert("인증에 성공했어.");
      } else {
        setIsVerified(false);
        setMessage("인증에 실패했어.");
        alert("인증에 실패했어.");
      }
    } catch (error) {
      console.error(error);
      setIsVerified(false);
      setMessage(error.message || "인증 확인에 실패했어.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResetPassword = async () => {
    if (!form.newPassword.trim()) {
      alert("새 비밀번호를 입력해.");
      return;
    }

    if (!form.newPassword2.trim()) {
      alert("새 비밀번호 확인을 입력해.");
      return;
    }

    if (form.newPassword !== form.newPassword2) {
      alert("새 비밀번호가 일치하지 않아.");
      return;
    }

    try {
      setResetting(true);
      setMessage("");

      const response = await confirmPasswordReset({
        email: form.email,
        newPassword: form.newPassword,
        newPassword2: form.newPassword2,
        isChecked: isVerified,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "비밀번호 재설정에 실패했어.");
      }

      alert("비밀번호가 재설정됐어.");
      onClose();
    } catch (error) {
      console.error(error);
      setMessage(error.message || "비밀번호 재설정에 실패했어.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <ModalLayout title="비밀번호 재설정" onClose={onClose}>
      <div>
        <div>
          <label>이메일</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            disabled={step >= 3}
          />
        </div>

        <div>
          <label>이름</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            disabled={step >= 2}
          />
        </div>

        <button
          type="button"
          onClick={handleSendCode}
          disabled={sending || step >= 2}
        >
          {sending ? "발송 중..." : "인증하기"}
        </button>
      </div>

      {step >= 2 && (
        <div>
          <label>인증번호</label>
          <input
            type="text"
            name="code"
            value={form.code}
            onChange={handleChange}
            disabled={step >= 3}
          />
          <button
            type="button"
            onClick={handleVerifyCode}
            disabled={verifying || step >= 3}
          >
            {verifying ? "확인 중..." : "확인"}
          </button>
        </div>
      )}

      {step >= 3 && (
        <div>
          <div>
            <label>새 비밀번호</label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>새 비밀번호 확인</label>
            <input
              type="password"
              name="newPassword2"
              value={form.newPassword2}
              onChange={handleChange}
            />
          </div>

          <button
            type="button"
            onClick={handleResetPassword}
            disabled={resetting}
          >
            {resetting ? "변경 중..." : "저장"}
          </button>
        </div>
      )}

      {message && <p>{message}</p>}
    </ModalLayout>
  );
}