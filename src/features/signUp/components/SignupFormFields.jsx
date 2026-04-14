export default function SignupFormFields({
  formData,
  onChange,
  onFileChange,
  onNicknameCheck,
  onSendVerification,
  verificationCode,
  onVerificationCodeChange,
  onVerifyCode,
  showVerificationInput,
  isEmailVerified,
}) {
  return (
    <div>
      <p>
        사진:{" "}
        <input type="file" accept="image/*" onChange={onFileChange} />
      </p>

      <p>
        이름:{" "}
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={onChange}
          required
        />
      </p>

      <p>
        닉네임:{" "}
        <input
          type="text"
          name="nickname"
          value={formData.nickname}
          onChange={onChange}
          required
        />
        <button type="button" onClick={onNicknameCheck}>
          중복체크
        </button>
      </p>

      <p>
        이메일:{" "}
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={onChange}
          required
          disabled={isEmailVerified}
        />
        <button
          type="button"
          onClick={onSendVerification}
          disabled={isEmailVerified}
        >
          {isEmailVerified ? "인증완료" : "인증하기"}
        </button>
      </p>

      {showVerificationInput && !isEmailVerified && (
        <p>
          인증코드:{" "}
          <input
            type="text"
            value={verificationCode}
            onChange={onVerificationCodeChange}
            placeholder="인증코드 입력"
          />
          <button type="button" onClick={onVerifyCode}>
            확인하기
          </button>
        </p>
      )}

      <p>
        비밀번호:{" "}
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={onChange}
          required
        />
      </p>

      <p>
        비밀번호 확인:{" "}
        <input
          type="password"
          name="password2"
          value={formData.password2}
          onChange={onChange}
          required
        />
      </p>

      <p>
        전화번호:{" "}
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={onChange}
          placeholder="010-0000-0000"
          required
        />
      </p>

      <p>
        생일:{" "}
        <input
          type="date"
          name="birthday"
          value={formData.birthday}
          onChange={onChange}
          required
        />
      </p>
    </div>
  );
}