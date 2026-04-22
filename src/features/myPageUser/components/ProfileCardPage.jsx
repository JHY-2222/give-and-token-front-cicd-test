import { User, LogOut, Settings, Lock, Heart, Mail, House } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function ProfileCard({
  myInfo,
  onGoHome,
  onEditProfile,
  onChangePassword,
  onViewDonations,
}) {
  const { pathname } = useLocation();
  const IMAGE_BASE_URL = "/uploads/";

  const isHome = pathname === "/mypage";
  const isProfileEdit = pathname === "/mypage/profile-edit";
  const isPasswordChange = pathname === "/mypage/password-change";
  const isDonationHistory = pathname === "/mypage/donation-history";

  const getMenuButtonClass = (isActive) =>
    `w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-[15px] transition-all ${
      isActive
        ? "bg-primary text-white shadow-lg shadow-primary/20"
        : "text-stone-500 hover:bg-surface"
    }`;

  
  const getProfileImage = () => {
    if (!myInfo?.profilePath) return null;
    return myInfo.profilePath.startsWith("http")
      ? myInfo.profilePath
      : `${IMAGE_BASE_URL}${myInfo.profilePath}`;
  };

  const handleLogout = () => {
    fetch("/api/auth/logout/user/social", { method: "POST" }).catch(() => {});

    localStorage.removeItem("accessToken");
    localStorage.removeItem("userRole");

    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    alert("로그아웃 되었습니다.");
    window.location.href = "/";
  };

  return (
    <section className="mypage-card relative w-full h-full bg-white border-4 border-line shadow-sm flex flex-col items-center">
        <button className="btn-logout !text-stone-400 hover:!text-primary" onClick={handleLogout}>
          <LogOut size={14} />
          <span className="font-black tracking-widest text-[12px]">LOGOUT</span>
        </button>

      <div className="mt-8 flex flex-col items-center w-full px-6">
        <div className="mb-6 relative">
          {myInfo?.profilePath ? (
            <img
              src={getProfileImage()}
              alt="Profile"
              className="relative w-40 h-40 rounded-full border-4 border-line object-cover"
            />
          ) : (
            <div className="relative w-40 h-40 rounded-full bg-surface flex items-center justify-center border-4 border-line">
              <User size={48} className="text-stone-400" />
            </div>
          )}
        </div>

        <div className="text-center mb-12 w-full px-4 relative">
          <h2 className="text-3xl font-black text-ink mb-2 tracking-tight">
            {myInfo?.name ?? "사용자"} 님
          </h2>
          <div className="inline-flex items-center justify-center gap-1.5 text-stone-500 text-sm font-bold bg-surface py-1.5 px-4 rounded-full w-fit mx-auto border border-line">
            <Mail size={12} className="opacity-60" />
            <span className="whitespace-nowrap">
              {myInfo?.email ?? "No email"}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full mt-2 pt-4 border-t border-line px-6 flex flex-col gap-2">
        <button className={getMenuButtonClass(isHome)} onClick={onGoHome}>
          <House size={18} />
          홈
        </button>

        <button className={getMenuButtonClass(isProfileEdit)} onClick={onEditProfile}>
          <Settings size={18} />
          정보 수정
        </button>

        <button className={getMenuButtonClass(isPasswordChange)} onClick={onChangePassword}>
          <Lock size={18} />
          비밀번호 변경
        </button>

        <button className={getMenuButtonClass(isDonationHistory)} onClick={onViewDonations}>
          <Heart size={18} />
          후원 내역
        </button>
      </div>
    </section>
  );
}
