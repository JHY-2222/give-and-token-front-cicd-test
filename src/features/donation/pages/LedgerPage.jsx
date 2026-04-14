import { ExternalLink, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import BlockchainLedger from "../components/BlockchainLedger";

export default function LedgerPage() {
  return (
    <div className="pt-52 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/5 text-primary text-sm font-bold mb-8 border border-primary/10">
            <ShieldCheck size={16} />
            블록체인 대시보드
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-ink leading-tight mb-8">
            기부 흐름을 한눈에
            <br />
            확인할 수 있는 기록 페이지
          </h1>
          <p className="text-lg text-stone-500 leading-relaxed">
            현재 화면은 데모 데이터 기반이지만, 실제 제품에서는 캠페인별 트랜잭션과 집행 로그를 같은 흐름 안에서 확인할 수 있도록 확장하기 좋은 구조입니다.
          </p>
          <div className="flex flex-wrap gap-4 mt-10">
            <Link to="/transparency" className="btn-fairytale-outline">
              투명성 센터로 돌아가기
            </Link>
            <Link to="/campaigns" className="btn-fairytale">
              캠페인 보러가기 <ExternalLink size={18} />
            </Link>
          </div>
        </div>
      </div>
      <BlockchainLedger />
    </div>
  );
}
