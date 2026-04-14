import { HeartHandshake, Sparkles, Target, Users } from "lucide-react";
import { Link } from "react-router-dom";

const values = [
  {
    title: "연결",
    description: "기부를 숫자만이 아닌 사람과 이야기의 흐름으로 전달합니다.",
    icon: HeartHandshake,
  },
  {
    title: "투명성",
    description: "감정과 결과가 함께 보이도록 기록을 공개합니다.",
    icon: Sparkles,
  },
  {
    title: "지속성",
    description: "한 번의 후원으로 끝나지 않도록 더 긴 지원 구조를 고민합니다.",
    icon: Target,
  },
  {
    title: "연대",
    description: "기부자와 현장 파트너, 수혜자의 변화를 하나의 흐름으로 연결합니다.",
    icon: Users,
  },
];

export default function MissionPage() {
  return (
    <div className="pt-52 pb-32 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/5 text-primary text-sm font-bold mb-8 border border-primary/10">
              <Sparkles size={16} fill="currentColor" />
              우리의 사명
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-ink leading-tight mb-8">
              의미를 남기는
              <br />
              <span className="text-primary italic">기부 경험</span>을 만듭니다
            </h1>
            <p className="text-lg text-stone-500 leading-relaxed">
              기부엔토큰은 아름다운 문구만 있는 기부 플랫폼이 아니라, 기부 전의 이해와
              기부 후의 확인까지 포함된 경험을 목표로 합니다. 사용자는 왜 후원하는지 알 수
              있어야 하고, 후원 이후 어떤 변화가 만들어졌는지도 확인할 수 있어야 합니다.
            </p>
          </div>

          <div className="bg-[#FFF9F5] border-4 border-line rounded-[3rem] p-10 md:p-12">
            <h2 className="text-3xl font-display font-bold text-ink mb-8">
              우리가 중요하게 보는 것
            </h2>
            <div className="space-y-6">
              {values.map((value) => (
                <div key={value.title} className="flex gap-4">
                  <div className="w-14 h-14 rounded-3xl bg-white border-2 border-line text-primary flex items-center justify-center shrink-0">
                    <value.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-display font-bold text-ink mb-1">{value.title}</h3>
                    <p className="text-stone-500 font-medium">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-20 bg-primary text-white rounded-[4rem] p-12 md:p-16">
          <h2 className="text-4xl font-display font-bold mb-6">다음 단계</h2>
          <p className="text-white/85 text-lg max-w-3xl leading-relaxed mb-10">
            캠페인 데이터 정교화와 집행 이력 시각화를 중심으로 더 투명한 기부 경험을
            확장하고 있습니다. 단순한 모금 페이지가 아니라 흐름을 설명하고 확인할 수 있는
            서비스로 발전시키는 것이 목표입니다.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/campaigns" className="bg-white text-primary px-8 py-4 rounded-full font-bold">
              캠페인 보러가기
            </Link>
            <Link to="/transparency" className="bg-white/10 border border-white/20 px-8 py-4 rounded-full font-bold">
              투명성 센터 보기
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
