import { useState } from "react";
import ModalLayout from "./ModalLayout";
import { findEmail } from "../api/authApi";

export default function EmailFindModal({ onClose }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
  });

  const [resultEmail, setResultEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFindEmail = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setMessage("");
      setResultEmail("");

      const response = await findEmail({
        name: form.name,
        phone: form.phone,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "이메일 찾기에 실패했어.");
      }

      const data = await response.json();

      setResultEmail(data?.email ?? "");
      setMessage("이메일 조회가 완료됐어.");
    } catch (error) {
      console.error(error);
      setMessage(error.message || "이메일 찾기에 실패했어.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ModalLayout title="이메일 찾기" onClose={onClose}>
      <form onSubmit={handleFindEmail}>
        <div>
          <label>이름</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>전화번호</label>
          <input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="010-0000-0000"
            required
          />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? "조회 중..." : "확인"}
        </button>
      </form>

      {message && <p>{message}</p>}
      {resultEmail && <p>가입된 이메일: {resultEmail}</p>}
    </ModalLayout>
  );
}