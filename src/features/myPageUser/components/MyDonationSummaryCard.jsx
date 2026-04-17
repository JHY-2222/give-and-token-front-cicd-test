import { Heart } from "lucide-react";

function formatAmount(amount) {
  if (amount == null) return "0원";
  return `${Number(amount).toLocaleString()}원`;
}

export default function DonationSummaryCard({ summary }) {
  return (
    <section className="mypage-card flex flex-col h-full bg-white border border-line">
      <div className="flex items-center gap-2 mb-8 text-ink">
        <div className="p-1.5 bg-rose-50 rounded-lg text-rose-500">
          <Heart size={16} fill="currentColor" />
        </div>
        <h3 className="text-lg font-bold">후원 요약</h3>
      </div>
      
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex flex-col">
          <p className="card-label-clean">Total Donated</p>
          <p className="text-4xl font-black text-ink leading-none">
            {formatAmount(summary?.totalAmount)}
          </p>
        </div>

        <div className="pt-8 border-t border-line mt-auto">
          <p className="card-label-clean">Total Participation</p>
          <p className="text-2xl font-black text-ink">
            {summary?.transactionNum ?? 0}<span className="text-sm font-bold ml-1 text-stone-300">회</span>
          </p>
        </div>
      </div>
    </section>
  );
}
