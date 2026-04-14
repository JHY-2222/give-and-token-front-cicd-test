import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="pt-52 pb-32 min-h-screen watercolor-bg">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white border-2 border-line text-primary text-sm font-bold shadow-sm mb-8">
          404
        </div>
        <h1 className="text-5xl font-display font-bold text-ink mb-6">
          페이지를 찾을 수 없습니다
        </h1>
        <p className="text-lg text-stone-500 leading-relaxed mb-10">
          주소가 변경되었거나 잘못 입력되었을 수 있습니다. 아래 버튼으로 다시 이동해보세요.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/" className="btn-fairytale">
            홈으로 가기
          </Link>
          <Link to="/campaigns" className="btn-fairytale-outline">
            캠페인 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
