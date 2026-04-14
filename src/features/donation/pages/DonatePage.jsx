import { useMemo, useState } from "react";
import { Heart, ShieldCheck } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { campaigns, formatWon } from "../data/campaigns";

const presets = [10000, 30000, 50000, 100000];

export default function DonatePage() {
  const { id } = useParams();
  const campaign = useMemo(
    () => campaigns.find((item) => item.id === Number(id)),
    [id],
  );
  const [selectedAmount, setSelectedAmount] = useState(30000);
  const [method, setMethod] = useState("card");

  if (!campaign) {
    return (
      <div className="pt-52 pb-32 min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-display font-bold text-ink mb-6">캠페인을 찾을 수 없습니다.</h1>
          <Link to="/campaigns" className="btn-fairytale inline-flex">
            캠페인 목록으로 가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-52 pb-32 watercolor-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10">
          <section className="bg-white border-4 border-line rounded-[3rem] p-10 md:p-12">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/5 text-primary text-sm font-bold mb-6">
              <Heart size={16} fill="currentColor" />
              기부 진행
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-ink mb-4">{campaign.shortTitle}</h1>
            <p className="text-stone-500 leading-relaxed mb-10">{campaign.summary}</p>

            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-display font-bold text-ink mb-4">금액 선택</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {presets.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setSelectedAmount(amount)}
                      className={`rounded-2xl px-5 py-5 font-bold border-2 transition-all ${
                        selectedAmount === amount
                          ? "bg-primary text-white border-primary"
                          : "bg-stone-50 text-stone-500 border-line"
                      }`}
                    >
                      {formatWon(amount)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-display font-bold text-ink mb-4">결제 수단</h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    ["card", "신용카드"],
                    ["kakao", "카카오페이"],
                    ["bank", "계좌이체"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMethod(value)}
                      className={`rounded-2xl px-5 py-5 font-bold border-2 transition-all ${
                        method === value
                          ? "bg-primary/10 text-primary border-primary/30"
                          : "bg-white text-stone-500 border-line"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] bg-[#FFF9F5] border-2 border-line p-6">
                <div className="flex items-center gap-3 text-stone-600">
                  <ShieldCheck size={18} className="text-primary" />
                  이 화면은 실제 결제 전 단계의 흐름 데모입니다. 결제 이후에는 원장과 후원 내역 확인 페이지로 연결되도록 확장할 수 있습니다.
                </div>
              </div>
            </div>
          </section>

          <aside className="bg-white border-4 border-line rounded-[3rem] p-10 md:p-12 h-fit">
            <h2 className="text-2xl font-display font-bold text-ink mb-6">후원 요약</h2>
            <div className="space-y-4 text-stone-600 font-medium">
              <div className="flex justify-between gap-6">
                <span>캠페인</span>
                <span className="text-right text-ink font-bold">{campaign.shortTitle}</span>
              </div>
              <div className="flex justify-between gap-6">
                <span>후원 금액</span>
                <span className="text-primary font-bold">{formatWon(selectedAmount)}</span>
              </div>
              <div className="flex justify-between gap-6">
                <span>결제 수단</span>
                <span className="text-ink font-bold">{method === "card" ? "신용카드" : method === "kakao" ? "카카오페이" : "계좌이체"}</span>
              </div>
            </div>
            <button className="w-full mt-10 py-5 bg-primary text-white rounded-full text-lg font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all">
              {formatWon(selectedAmount)} 기부 진행하기
            </button>
            <Link to={`/campaign/${campaign.id}`} className="w-full mt-4 py-5 border border-line rounded-full text-lg font-bold text-stone-500 hover:bg-stone-50 transition-all flex items-center justify-center">
              상세 페이지로 돌아가기
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
