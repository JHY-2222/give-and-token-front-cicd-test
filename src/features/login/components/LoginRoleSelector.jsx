export default function LoginRoleSelector({ role, onChange }) {
  return (
    <fieldset>
      <legend>권한 선택</legend>

      <label>
        <input
          type="radio"
          name="role"
          value="user"
          checked={role === "user"}
          onChange={onChange}
        />
        사용자
      </label>

      <label>
        <input
          type="radio"
          name="role"
          value="foundation"
          checked={role === "foundation"}
          onChange={onChange}
        />
        기업단체
      </label>

      <label>
        <input
          type="radio"
          name="role"
          value="beneficiary"
          checked={role === "beneficiary"}
          onChange={onChange}
        />
        수혜자
      </label>
    </fieldset>
  );
}