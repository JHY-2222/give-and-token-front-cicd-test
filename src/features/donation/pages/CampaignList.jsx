import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Search, ArrowRight, Sparkles } from "lucide-react";
import { campaignCategories, campaigns, formatWon } from "../data/campaigns";

export default function CampaignList() {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((camp) => {
      const matchesCategory =
        selectedCategory === "전체" || camp.category === selectedCategory;
      const matchesQuery =
        camp.title.includes(query) ||
        camp.shortTitle.includes(query) ||
        camp.summary.includes(query) ||
        camp.category.includes(query);

      return matchesCategory && matchesQuery;
    });
  }, [query, selectedCategory]);

  return (
    <div className="pt-52 pb-32 watercolor-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-20 text-center">
          <div className="inline-flex items-center gap-2 text-primary font-bold text-sm mb-6 bg-white px-6 py-2 rounded-full border-2 border-line shadow-sm">
            <Sparkles size={16} fill="currentColor" />
            함께 만드는 기적
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold text-ink mb-12">
            진행 중인 <span className="text-primary italic">나눔</span> 이야기
          </h1>

          <div className="flex flex-col md:flex-row gap-6 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-300" size={20} />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="어떤 기적을 함께 만들고 싶나요?"
                className="w-full bg-white border-4 border-line rounded-3xl pl-16 pr-8 py-6 text-sm font-bold focus:outline-none focus:border-primary/30 transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3 justify-center mt-8">
            {campaignCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full border-2 font-bold text-sm transition-all ${
                  selectedCategory === category
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-stone-500 border-line hover:border-primary/30 hover:text-primary"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredCampaigns.map((camp) => (
            <Link
              key={camp.id}
              to={`/campaign/${camp.id}`}
              className="storybook-card group block p-0"
            >
              <div className="aspect-video overflow-hidden relative">
                <img
                  src={camp.image}
                  alt={camp.shortTitle}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.1] sepia-[0.05]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6">
                  <div className="bg-white/90 backdrop-blur-md px-5 py-2 rounded-full text-xs font-bold text-ink shadow-lg border border-line">
                    {camp.category}
                  </div>
                </div>
              </div>

              <div className="p-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center ${camp.color}`}>
                    <camp.icon size={24} />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-ink leading-tight group-hover:text-primary transition-colors">
                    {camp.shortTitle}
                  </h3>
                </div>

                <div className="space-y-5 mb-10">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-primary">{camp.progress}% 달성</span>
                    <span className="text-stone-400">{camp.donors.toLocaleString()}명 참여</span>
                  </div>
                  <div className="h-4 bg-stone-100 rounded-full overflow-hidden p-1 border border-line">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${camp.progress}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                  <div className="text-xs text-stone-400 text-right font-bold">목표액: {formatWon(camp.goal)}</div>
                </div>

                <button className="w-full py-5 bg-stone-50 text-stone-500 font-bold rounded-2xl group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center gap-2 shadow-sm">
                  자세히 보기 <ArrowRight size={18} />
                </button>
              </div>
            </Link>
          ))}
        </div>

        {filteredCampaigns.length === 0 && (
          <div className="mt-16 bg-white border-4 border-line rounded-[3rem] p-12 text-center">
            <h2 className="text-3xl font-display font-bold text-ink mb-4">조건에 맞는 캠페인이 아직 없어요</h2>
            <p className="text-stone-500 font-medium mb-8">검색어를 줄이거나 다른 카테고리를 선택해 보세요.</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setSelectedCategory("전체");
              }}
              className="btn-fairytale inline-flex"
            >
              필터 초기화
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
