import { motion } from "motion/react";
import { Users, Heart, ShieldCheck, Globe, Sparkles } from "lucide-react";

const stats = [
  { 
    label: "따뜻한 마음", 
    value: "124억+", 
    icon: Heart,
    color: "bg-primary/10 text-primary"
  },
  { 
    label: "함께하는 천사들", 
    value: "4.5만+", 
    icon: Users,
    color: "bg-secondary/10 text-secondary"
  },
  { 
    label: "피어난 희망", 
    value: "1,280개", 
    icon: Sparkles,
    color: "bg-accent/20 text-ink"
  },
  { 
    label: "투명한 믿음", 
    value: "100%", 
    icon: ShieldCheck,
    color: "bg-green-50 text-green-600"
  }
];

export default function Stats() {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
              className="text-center group"
            >
              <div className={`w-24 h-24 mx-auto organic-shape flex items-center justify-center mb-8 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 ${stat.color} shadow-lg shadow-current/5`}>
                <stat.icon size={40} />
              </div>
              <div className="text-4xl font-display font-bold text-ink mb-3">
                {stat.value}
              </div>
              <div className="text-sm font-bold text-stone-400 tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
