import { Wallet, Copy, ExternalLink } from "lucide-react";

function formatAmount(amount) {
  if (amount == null) return "0원";
  return `${Number(amount).toLocaleString()}원`;
}

export default function WalletCard({ walletInfo }) {
  const handleCopy = () => {
    if (walletInfo?.walletAddress) {
      navigator.clipboard.writeText(walletInfo.walletAddress);
      alert("지갑 주소가 복사되었습니다.");
    }
  };

  return (
    <section className="mypage-card w-full h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-4 text-ink">
            <Wallet size={20} className="text-primary" />
            <h3 className="text-xl font-bold">연결된 지갑 정보</h3>
          </div>
          
          <div className="space-y-1">
            <p className="card-label-clean">My Wallet Address</p>
            <div className="flex items-center gap-3 bg-surface p-4 rounded-2xl border border-line group">
              <p className="text-sm font-bold text-ink/70 font-mono break-all leading-relaxed">
                {walletInfo?.walletAddress ?? "연결된 지갑이 없습니다."}
              </p>
              <button 
                onClick={handleCopy}
                className="shrink-0 p-2 hover:bg-white rounded-lg transition-colors text-stone-300 hover:text-primary"
                title="주소 복사"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>
        </div>
        
        <div className="md:w-64 shrink-0 flex flex-col md:items-end md:border-l border-line md:pl-10">
          <a 
            href={`/blockchain/wallets/${walletInfo?.walletAddress}`}
            className="text-xs font-bold text-stone-400 hover:text-primary flex items-center gap-1 transition-colors"
          >
            블록체인 장부 확인 <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </section>
  );
}
