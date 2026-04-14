export default function SocialLoginSection({
  onGoToSignUp,
  onGoogleLogin,
}) {
  return (
    <div>
      <p>
        처음이신가요?{" "}
        <button type="button" onClick={onGoToSignUp}>
          가입하기
        </button>
      </p>

      <button type="button" onClick={onGoogleLogin}>
        구글 로그인 / 회원가입
      </button>
    </div>
  );
}