import React from "react";
import { LayoutDashboard, Megaphone, Wallet, Settings, LogOut } from "lucide-react";

const FoundationDashboardPage = () => {
  return (
    <div className="min-h-screen bg-surface font-sans text-ink pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-12">
          <h1 className="text-4xl font-display font-bold mb-2">기부단체 대시보드</h1>
          <p className="text-stone-500 font-medium text-lg">단체 정보와 캠페인, 지갑 현황을 관리하세요.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-[2rem] border-4 border-line shadow-sm">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6">
              <Megaphone size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">캠페인 관리</h3>
            <p className="text-stone-500 text-sm mb-6">새로운 캠페인을 등록하고 현재 진행 중인 캠페인을 관리합니다.</p>
            <button className="text-primary font-bold flex items-center gap-2 hover:gap-3 transition-all">
              관리하기 <span className="text-xl">→</span>
            </button>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border-4 border-line shadow-sm">
            <div className="w-12 h-12 bg-accent/10 text-accent-dark rounded-2xl flex items-center justify-center mb-6">
              <Wallet size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">지갑 및 정산</h3>
            <p className="text-stone-500 text-sm mb-6">후원받은 토큰 잔액을 확인하고 정산 내역을 관리합니다.</p>
            <button className="text-accent-dark font-bold flex items-center gap-2 hover:gap-3 transition-all">
              관리하기 <span className="text-xl">→</span>
            </button>
          </div>

          <div className="bg-white p-8 rounded-[2rem] border-4 border-line shadow-sm">
            <div className="w-12 h-12 bg-stone-100 text-stone-500 rounded-2xl flex items-center justify-center mb-6">
              <Settings size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">단체 정보 설정</h3>
            <p className="text-stone-500 text-sm mb-6">단체의 프로필 정보와 연락처 등을 최신 상태로 유지합니다.</p>
            <button className="text-stone-500 font-bold flex items-center gap-2 hover:gap-3 transition-all">
              관리하기 <span className="text-xl">→</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-10 border-4 border-line shadow-xl shadow-stone-200/50">
          <h2 className="text-2xl font-display font-bold mb-8">최근 활동 내역</h2>
          <div className="py-12 text-center border-4 border-dashed border-line rounded-[2rem]">
            <p className="text-stone-400 font-medium">최근 활동 내역이 없습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoundationDashboardPage;
