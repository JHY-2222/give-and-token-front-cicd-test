import { useState } from "react";
import ModalLayout from "./ModalLayout";
import {
  requestPasswordReset,
  verifyEmailCode,
  confirmPasswordReset,
} from "../api/authApi";
import {
  Mail,
  User,
  ShieldCheck,
  Lock,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import "../styles/login.css";

export default function PasswordResetModal({ role, onClose }) {
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

  const extractErrorMessage = async (response, fallback) => {
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();
        return data.message || fallback;
      }
      const text = await response.text();
      return text || fallback;
    } catch {
      return fallback;
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendCode = async () => {
    const nameLabel = role === "foundation" ? "단체명" : "이름";
    if (!form.email.trim()) {
      window.alert("이메일을 입력해 주세요.");
      return;
    }
    if (!form.name.trim()) {
      window.alert(`${nameLabel}을 입력해 주세요.`);
      return;
    }

    try {
      setSending(true);
      setMessage("");
      const response = await requestPasswordReset(role, {
        email: form.email,
        name: form.name,
      });

      if (!response.ok) {
        const errorMsg = await extractErrorMessage(
          response,
          "입력한 정보와 일치하는 계정을 찾을 수 없습니다."
        );
        throw new Error(errorMsg);
      }

      setStep(2);
      setMessage("인증코드를 이메일로 보냈습니다.");
    } catch (error) {
      setMessage(error.message || "인증코드 발송에 실패했습니다.");
    } finally {
      setSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!form.code.trim()) {
      window.alert("인증코드를 입력해 주세요.");
      return;
    }

    try {
      setVerifying(true);
      setMessage("");
      const response = await verifyEmailCode(role, {
        email: form.email,
        code: form.code,
      });

      if (!response.ok) {
        const errorMsg = await extractErrorMessage(
          response,
          "인증코드가 올바르지 않거나 만료되었습니다."
        );
        throw new Error(errorMsg);
      }

      setIsVerified(true);
      setStep(3);
      setMessage("인증이 완료되었습니다. 새 비밀번호를 입력해 주세요.");
    } catch (error) {
      setIsVerified(false);
      setMessage(error.message || "인증 확인에 실패했습니다.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResetPassword = async () => {
    if (!form.newPassword.trim()) {
      window.alert("새 비밀번호를 입력해 주세요.");
      return;
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,20}$/;

    if (!passwordRegex.test(form.newPassword)) {
      window.alert(
        "비밀번호는 영문, 숫자, 특수문자를 각각 1개 이상 포함하고 8~20자여야 합니다."
      );
      return;
    }

    if (form.newPassword !== form.newPassword2) {
      window.alert("비밀번호 확인이 일치하지 않습니다.");
      return;
    }

    try {
      setResetting(true);
      setMessage("");
      const response = await confirmPasswordReset(role, {
        email: form.email,
        newPassword: form.newPassword,
        newPassword2: form.newPassword2,
        isChecked: isVerified,
      });

      if (!response.ok) {
        const errorMsg = await extractErrorMessage(
          response,
          "비밀번호 변경에 실패했습니다."
        );
        throw new Error(errorMsg);
      }

      window.alert("비밀번호가 성공적으로 변경되었습니다.");
      onClose();
    } catch (error) {
      setMessage(error.message || "비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setResetting(false);
    }
  };

  return (
    <ModalLayout title="비밀번호 찾기" onClose={onClose}>
      <div className="password-reset-modal">
        <div className="password-reset-modal__steps">
          {[1, 2, 3].map((s) => (
            <div key={s} className="password-reset-modal__step">
              <div
                className={`password-reset-modal__step-dot ${
                  step >= s ? "is-active" : ""
                }`}
              >
                {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
              <span
                className={`password-reset-modal__step-label ${
                  step >= s ? "is-active" : ""
                }`}
              >
                {s === 1 ? "정보 입력" : s === 2 ? "인증 확인" : "비밀번호 변경"}
              </span>
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="password-reset-modal__section">
            <div className="password-reset-modal__hint">
                <AlertCircle size={18} />
                <p>
                  비밀번호를 재설정할 계정의 이메일과
                  <br />
                  {role === "foundation" ? "단체명" : "이름"}을 입력해 주세요.
                </p>
              </div>

            <label className="password-reset-modal__label" htmlFor="prm-email">
              이메일
            </label>
            <div className="password-reset-modal__input-wrap">
              <Mail size={18} className="password-reset-modal__icon" />
              <input
                id="prm-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="password-reset-modal__input"
                placeholder="example@email.com"
              />
            </div>

            <label className="password-reset-modal__label" htmlFor="prm-name">
              {role === "foundation" ? "단체명" : "이름"}
            </label>
            <div className="password-reset-modal__input-wrap">
              <User size={18} className="password-reset-modal__icon" />
              <input
                id="prm-name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="password-reset-modal__input"
                placeholder={
                  role === "foundation"
                    ? "단체명을 입력해 주세요"
                    : "이름을 입력해 주세요"
                }
              />
            </div>

            <button
              type="button"
              onClick={handleSendCode}
              disabled={sending}
              className="password-reset-modal__submit"
            >
              {sending ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                <>
                  인증코드 발송
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="password-reset-modal__section">
            <div className="password-reset-modal__hint password-reset-modal__hint--ok">
                <ShieldCheck size={18} />
                <p>
                  인증코드를 보냈습니다.
                  <br />
                  {form.email}
                </p>
              </div>

            <label className="password-reset-modal__label" htmlFor="prm-code">
              인증코드
            </label>
            <input
              id="prm-code"
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              className="password-reset-modal__input password-reset-modal__input--center"
              placeholder="6자리 입력"
            />

            <button
              type="button"
              onClick={handleVerifyCode}
              disabled={verifying}
              className="password-reset-modal__submit password-reset-modal__submit--dark"
            >
              {verifying ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                "인증 확인"
              )}
            </button>

            <button
              type="button"
              onClick={handleSendCode}
              className="password-reset-modal__text-btn"
            >
              인증코드를 다시 받으시겠어요?
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="password-reset-modal__section">
            <div className="password-reset-modal__hint">
                <Lock size={18} />
                <p>
                  영문/숫자/특수문자를 포함해 8~20자로
                  <br />
                  새 비밀번호를 입력해 주세요.
                </p>
              </div>

            <label className="password-reset-modal__label" htmlFor="prm-new-password">
              새 비밀번호
            </label>
            <div className="password-reset-modal__input-wrap">
              <Lock size={18} className="password-reset-modal__icon" />
              <input
                id="prm-new-password"
                type="password"
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                className="password-reset-modal__input"
                placeholder="영문+숫자+특수문자 8~20자"
              />
            </div>

            <label className="password-reset-modal__label" htmlFor="prm-new-password2">
              비밀번호 확인
            </label>
            <div className="password-reset-modal__input-wrap">
              <ShieldCheck size={18} className="password-reset-modal__icon" />
              <input
                id="prm-new-password2"
                type="password"
                name="newPassword2"
                value={form.newPassword2}
                onChange={handleChange}
                className="password-reset-modal__input"
                placeholder="비밀번호를 다시 입력해 주세요"
              />
            </div>

            <button
              type="button"
              onClick={handleResetPassword}
              disabled={resetting}
              className="password-reset-modal__submit"
            >
              {resetting ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                "비밀번호 변경"
              )}
            </button>
          </div>
        )}

        {message && (
          <p
            className={`password-reset-modal__message ${
              step === 2 ? "is-ok" : "is-error"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </ModalLayout>
  );
}
