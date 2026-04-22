import { useState } from "react";
import ModalLayout from "./ModalLayout";
import { findEmail } from "../api/authApi";
import { User, Phone, Mail, Search, ArrowRight, RefreshCw, LogIn } from "lucide-react";
import "../styles/login.css";

export default function EmailFindModal({ role, onClose }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  const [resultEmail, setResultEmail] = useState("");
  const [message, setMessage] = useState("");
  const [searching, setSearching] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFindEmail = async () => {
    const nameLabel = role === "foundation" ? "단체명" : "이름";

    if (!form.name.trim()) {
      window.alert(`${nameLabel}을 입력해 주세요.`);
      return;
    }

    if (!form.phone.trim()) {
      window.alert("전화번호를 입력해 주세요.");
      return;
    }

    try {
      setSearching(true);
      setMessage("");
      setResultEmail("");

      const response = await findEmail(role, {
        name: form.name,
        phone: form.phone,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || "가입 정보를 찾을 수 없습니다.");
      }

      const data = await response.json();
      if (data?.email) {
        setResultEmail(data.email);
      } else {
        throw new Error("이메일 정보를 확인할 수 없습니다.");
      }
    } catch (error) {
      console.error(error);
      setMessage(error.message || "조회 중 오류가 발생했습니다.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <ModalLayout title="아이디 찾기" onClose={onClose}>
      <div className="email-find-modal">
        {!resultEmail ? (
          <div className="email-find-modal__content">
            <div className="email-find-modal__hint">
              <Search size={18} />
              <p>
                가입 시 등록한 {role === "foundation" ? "단체명" : "이름"}과 전화번호를 입력하면
                <br />
                등록된 이메일 주소를 확인할 수 있습니다.
              </p>
            </div>

            <div className="email-find-modal__fields">
              <label className="email-find-modal__label" htmlFor="find-name">
                {role === "foundation" ? "단체명" : "이름"}
              </label>
              <div className="email-find-modal__input-wrap">
                <User size={18} className="email-find-modal__icon" />
                <input
                  id="find-name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={role === "foundation" ? "단체명을 입력해 주세요" : "이름을 입력해 주세요"}
                  className="email-find-modal__input"
                  disabled={searching}
                />
              </div>

              <label className="email-find-modal__label" htmlFor="find-phone">
                전화번호
              </label>
              <div className="email-find-modal__input-wrap">
                <Phone size={18} className="email-find-modal__icon" />
                <input
                  id="find-phone"
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="01000000000"
                  className="email-find-modal__input"
                  disabled={searching}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleFindEmail}
              disabled={searching}
              className="email-find-modal__submit"
            >
              {searching ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                <>
                  조회하기
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {message && <p className="email-find-modal__message email-find-modal__message--error">{message}</p>}
          </div>
        ) : (
          <div className="email-find-modal__result">
            <div className="email-find-modal__badge">
              <Mail size={26} />
            </div>

            <div className="email-find-modal__result-box">
              <p className="email-find-modal__result-label">가입된 이메일</p>
              <p className="email-find-modal__result-email">{resultEmail}</p>
            </div>

            <p className="email-find-modal__result-note">
              개인정보 보호를 위해 일부 정보는 마스킹 처리될 수 있습니다.
            </p>

            <div className="email-find-modal__actions">
              <button
                type="button"
                onClick={() => {
                  setResultEmail("");
                  setMessage("");
                }}
                className="email-find-modal__btn email-find-modal__btn--ghost"
              >
                <RefreshCw size={16} />
                다시 조회
              </button>

              <button type="button" onClick={onClose} className="email-find-modal__btn email-find-modal__btn--primary">
                <LogIn size={16} />
                로그인
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalLayout>
  );
}
