import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileCard from "../components/ProfileCardPage";
import WalletCard from "../components/MyWalletCard";
import DonationSummaryCard from "../components/MyDonationSummaryCard";
import DonationHistorySection from "../components/DonationHistorySection";
import "../styles/MyPage.css";
import {
  getMyPageInfo,
  getTransactionHistory,
  getWalletInfo,
} from "../api/mypageApi";

export default function MyPageMain() {
  const navigate = useNavigate();

  const [myInfo, setMyInfo] = useState(null);
  const [walletInfo, setWalletInfo] = useState(null);
  const [transactionList, setTransactionList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 로그인 여부 확인용 헬퍼 함수
  const getIsLoggedIn = () => {
    const cookies = document.cookie.split(';');
    const hasCookieToken = cookies.some(cookie => cookie.trim().startsWith('accessToken='));
    const hasLocalStorageToken = !!localStorage.getItem('accessToken');
    return hasCookieToken || hasLocalStorageToken;
  };

  useEffect(() => {
    // 1. 로그인 여부 즉시 확인
    if (!getIsLoggedIn()) {
      alert("로그아웃되었습니다. 다시 로그인해주세요.");
      navigate("/login", { replace: true });
      return;
    }

    // 2. 데이터 불러오기
    fetchMyPageData();
  }, [navigate]);
  const fetchMyPageData = async () => {
    try {
      setLoading(true);
      setError("");

      const [myInfoRes, walletRes, transactionRes] = await Promise.all([
        getMyPageInfo(),
        getWalletInfo(),
        getTransactionHistory(),
      ]);

      setMyInfo(myInfoRes.data);
      setWalletInfo(walletRes.data);
      setTransactionList(transactionRes.data ?? []);
    } catch (err) {
      console.error(err);
      setError("마이페이지 정보를 불러오지 못했어.");
    } finally {
      setLoading(false);
    }
  };

  const summary = useMemo(() => {
    if (!transactionList.length) {
      return {
        transactionNum: 0,
        totalAmount: 0,
      };
    }

    return {
      transactionNum: transactionList[0]?.transactionNum ?? 0,
      totalAmount: transactionList[0]?.total_amount ?? 0,
    };
  }, [transactionList]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-display text-xl text-ink">로딩 중...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center font-display text-xl text-ink">{error}</div>;
  }

  return (
    <div className="mypage-main-page">
      <div className="flex flex-col lg:flex-row gap-16">
        {/* 좌측 사이드바: 프로필 정보 */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="lg:sticky lg:top-48 h-full">
            <ProfileCard
              myInfo={myInfo}
              onEditProfile={() => navigate("/mypage/profile")}
              onChangePassword={() => navigate("/mypage/password")}
              onViewDonations={() => navigate("/mypage/history")}
            />
          </div>
        </aside>

        {/* 우측 메인 콘텐츠 영역 */}
        <div className="flex-1 min-w-0 space-y-12">
          {/* 제목: 대폭 강화 (4xl -> 5xl급) */}
          <header className="mb-10">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight !mb-0 !text-left">마이페이지</h1>
            <p className="text-slate-400 mt-4 text-lg font-medium">후원 활동과 자산 현황을 한 눈에 확인하세요.</p>
          </header>

          {/* 1단: 지갑 정보 (상단 배치) */}
          <div className="w-full">
            <WalletCard walletInfo={walletInfo} />
          </div>

          {/* 2단: 요약(좌) & 기부내역(우) */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            <div className="xl:col-span-4 h-full">
              <DonationSummaryCard summary={summary} />
            </div>
            <div className="xl:col-span-8 h-full">
              <DonationHistorySection
                donationHistory={transactionList}
                onViewAll={() => navigate("/mypage/history")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}