import { Link, useLocation } from "react-router-dom";

const contentMap = {
  "/terms": {
    title: "이용약관",
    intro: "서비스 이용 기준과 사용자 책임, 운영 범위를 설명하는 페이지입니다.",
    sections: [
      "기부엔토큰은 캠페인 정보 제공과 후원 연결 경험을 제공하는 플랫폼입니다.",
      "사용자는 허위 정보 등록, 서비스 악용, 타인 사칭 행위를 해서는 안 됩니다.",
      "운영 정책과 서비스 구조는 고지 후 변경될 수 있습니다.",
    ],
  },
  "/privacy": {
    title: "개인정보처리방침",
    intro: "수집하는 정보와 활용 목적, 보관 기준을 요약해 안내합니다.",
    sections: [
      "이메일, 후원 내역, 서비스 이용 로그 등 최소한의 정보를 수집할 수 있습니다.",
      "수집 정보는 후원 확인, 사용자 안내, 서비스 개선을 위해 활용됩니다.",
      "법령상 보관이 필요한 정보를 제외하고는 목적 달성 후 안전하게 삭제합니다.",
    ],
  },
  "/policy": {
    title: "나눔 정책",
    intro: "어떤 캠페인을 우선 지원하고 어떤 기준으로 검토하는지 정리한 페이지입니다.",
    sections: [
      "긴급성, 영향 범위, 집행 가능성, 파트너 신뢰도를 주요 기준으로 검토합니다.",
      "모든 캠페인은 목표 금액과 사용처를 사전에 정의합니다.",
      "종료 후에는 결과 보고와 증빙 연결을 원칙으로 합니다.",
    ],
  },
};

export default function LegalPage() {
  const location = useLocation();
  const content = contentMap[location.pathname] || contentMap["/terms"];

  return (
    <div className="pt-52 pb-32 min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/5 text-primary text-sm font-bold mb-8 border border-primary/10">
          정책 문서
        </div>
        <h1 className="text-5xl font-display font-bold text-ink mb-6">{content.title}</h1>
        <p className="text-lg text-stone-500 leading-relaxed mb-12">{content.intro}</p>

        <div className="space-y-6">
          {content.sections.map((section, index) => (
            <section key={section} className="bg-[#FFF9F5] border-2 border-line rounded-[2rem] p-8">
              <div className="text-sm font-bold text-primary mb-3">항목 {index + 1}</div>
              <p className="text-stone-600 leading-relaxed font-medium">{section}</p>
            </section>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 mt-12">
          <Link to="/terms" className="btn-fairytale-outline">이용약관</Link>
          <Link to="/privacy" className="btn-fairytale-outline">개인정보처리방침</Link>
          <Link to="/policy" className="btn-fairytale-outline">나눔 정책</Link>
        </div>
      </div>
    </div>
  );
}
