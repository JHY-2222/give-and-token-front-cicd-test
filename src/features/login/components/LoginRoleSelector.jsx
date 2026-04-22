export default function LoginRoleSelector({ role, onChange }) {
  const roles = [
    { value: "user", label: "사용자 회원" },
    { value: "foundation", label: "기업 회원" },
    { value: "beneficiary", label: "수혜자 회원" }
  ];

  return (
    <fieldset className="login-role-tabs" role="radiogroup" aria-label="로그인 유형 선택">
      <legend className="sr-only">로그인 유형 선택</legend>
      <div className="login-role-tabs__list">
        {roles.map((item) => {
          const isActive = role === item.value;
          return (
            <label
              key={item.value}
              className={`login-role-tabs__item ${isActive ? "is-active" : ""}`}
            >
              <input
                type="radio"
                name="role"
                value={item.value}
                checked={isActive}
                onChange={onChange}
                className="login-role-tabs__input"
              />
              <span className="login-role-tabs__label">{item.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
