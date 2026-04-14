import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const CAMPAIGNS = ["희망 교실 만들기", "깨끗한 물을 선물해요", "아이들의 치료를 응원해요", "초록 숲을 지켜요"];
const NAMES = ["김*후", "이**", "박*준", "최**", "정**", "투명 기부자"];

function generateTx(seed) {
  return {
    id: `${seed}-${Math.random().toString(36).slice(2, 9)}`,
    hash: `0x${Math.random().toString(16).slice(2, 14).toUpperCase()}`,
    amount: (Math.floor(Math.random() * 50) + 1) * 10000,
    donor: NAMES[Math.floor(Math.random() * NAMES.length)],
    time: "방금 전",
    campaignName: CAMPAIGNS[Math.floor(Math.random() * CAMPAIGNS.length)],
  };
}

export default function BlockchainLedger() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const initial = Array.from({ length: 5 }).map((_, index) => generateTx(index));
    setTransactions(initial);

    const interval = window.setInterval(() => {
      setTransactions((prev) => [generateTx(Date.now()), ...prev.slice(0, 4)]);
    }, 4000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="pt-2 pb-24">
      <div className="w-full">
        <div className="flex justify-end mb-1">
          <div className="text-right mr-8">
            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">
              Total Transactions
            </div>
            <div className="text-2xl font-display font-bold text-slate-500">142,804</div>
          </div>
        </div>

        <div className="border border-stone-300 bg-white rounded-[2rem] overflow-hidden shadow-[0_18px_40px_rgba(78,52,46,0.06)]">
          <div className="grid grid-cols-12 bg-slate-50 border-b border-stone-300 p-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            <div className="col-span-4">Transaction Hash</div>
            <div className="col-span-2">Donor</div>
            <div className="col-span-3">Campaign</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-1" />
          </div>

          <div className="divide-y divide-line">
            <AnimatePresence mode="popLayout">
              {transactions.map((tx) => (
                <motion.div
                  key={tx.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="grid grid-cols-12 p-6 items-center hover:bg-slate-50 transition-colors group"
                >
                  <div className="col-span-4 font-mono text-[11px] text-slate-400 group-hover:text-ink transition-colors">
                    {tx.hash}
                  </div>
                  <div className="col-span-2 text-sm font-bold text-ink">{tx.donor}</div>
                  <div className="col-span-3">
                    <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded uppercase">
                      {tx.campaignName}
                    </span>
                  </div>
                  <div className="col-span-2 text-right font-display font-bold text-lg text-ink">
                    {tx.amount.toLocaleString()}원
                  </div>
                  <div className="col-span-1 flex justify-end">
                    <div className="w-2 h-2 bg-green-500 rounded-full" title={tx.time} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <Link
            to="/blockchain"
            className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500 hover:text-ink transition-colors flex items-center gap-4"
          >
            <div className="h-px w-12 bg-line" />
            블록체인 대시보드 데이터 보기
            <div className="h-px w-12 bg-line" />
          </Link>
        </div>
      </div>
    </section>
  );
}
