import { motion } from "motion/react";
import { ShieldCheck, FileText, ExternalLink, Sparkles, Heart } from "lucide-react";
import { Link } from "react-router-dom";

export default function TransparencyReport() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div className="relative">
            <div className="relative z-10">
              <div className="organic-shape overflow-hidden border-[16px] border-white shadow-2xl aspect-[4/5] bg-stone-100">
                <img
                  src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop"
                  alt="Transparency"
                  className="w-full h-full object-cover grayscale-[0.2] sepia-[0.1] opacity-80"
                  referrerPolicy="no-referrer"
                />
              </div>

              <motion.div
                animate={{ rotate: [0, 5, 0], scale: [1, 1.05, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-10 -right-10 bg-white p-10 rounded-[3rem] shadow-2xl border-4 border-line max-w-[280px]"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6">
                  <ShieldCheck size={32} fill="currentColor" />
                </div>
                <h4 className="text-2xl font-display font-bold text-ink mb-3">믿음의 기록</h4>
                <p className="text-stone-500 text-sm font-medium leading-relaxed">
                  여러분의 소중한 마음이 어디에 닿았는지 블록체인이 투명하게 기록합니다.
                </p>
              </motion.div>
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/5 text-primary text-sm font-bold mb-8 border border-primary/10">
              <Sparkles size={18} fill="currentColor" />
              투명한 나눔 보고서
            </div>
            <h2 className="text-5xl md:text-6xl font-display font-bold text-ink mb-10 leading-tight">
              우리의 약속은 <br />
              <span className="text-primary italic">거짓말</span>을 하지 않아요
            </h2>

            <div className="space-y-8">
              {[
                {
                  title: "실시간 나눔 장부",
                  desc: "기부금이 들어오고 나가는 모든 순간을 실시간으로 확인할 수 있어요.",
                  icon: FileText,
                },
                {
                  title: "바꿀 수 없는 기록",
                  desc: "한 번 기록된 따뜻한 마음은 누구도 지우거나 수정할 수 없답니다.",
                  icon: ShieldCheck,
                },
                {
                  title: "함께 만드는 기적",
                  desc: "모든 트랜잭션은 공개되어 누구나 검증하고 신뢰할 수 있어요.",
                  icon: Heart,
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-6 group"
                >
                  <div className="w-16 h-16 rounded-[2rem] bg-stone-50 border-2 border-line flex items-center justify-center text-stone-400 group-hover:text-primary group-hover:border-primary/30 transition-all shrink-0">
                    <item.icon size={28} />
                  </div>
                  <div>
                    <h4 className="text-2xl font-display font-bold text-ink mb-2">{item.title}</h4>
                    <p className="text-stone-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <Link to="/transparency" className="mt-16 btn-fairytale inline-flex">
              투명성 센터로 가기 <ExternalLink size={20} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
