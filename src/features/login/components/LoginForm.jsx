export default function LoginForm({
  loginData,
  onChange,
  onSubmit,
  errorMessage,
}) {
  return (
    <form onSubmit={onSubmit}>
      <div>
        <p>
          이메일:
          <input
            type="email"
            name="email"
            value={loginData.email}
            onChange={onChange}
            required
          />
        </p>

        <p>
          비밀번호:
          <input
            type="password"
            name="password"
            value={loginData.password}
            onChange={onChange}
            required
          />
        </p>
      </div>

      {errorMessage && <p>{errorMessage}</p>}

      <div>
        <button type="submit">로그인</button>
      </div>
    </form>
  );
}