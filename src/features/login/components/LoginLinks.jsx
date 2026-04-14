export default function LoginLinks({
  onOpenFindEmail,
  onOpenPasswordReset,
}) {
  return (
    <div>
      <button type="button" onClick={onOpenFindEmail}>
        이메일 찾기
      </button>

      <button type="button" onClick={onOpenPasswordReset}>
        비밀번호 재설정
      </button>
    </div>
  );
}