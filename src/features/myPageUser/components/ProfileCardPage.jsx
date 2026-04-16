import { User, LogOut, Settings, Lock, Heart, Mail } from "lucide-react";

export default function ProfileCard({
  myInfo,
  onEditProfile,
  onChangePassword,
  onViewDonations,
}) {
  const IMAGE_BASE_URL = "http://localhost:8090/uploads/";
  
  const getProfileImage = () => {
    if (!myInfo?.profilePath) return null;
    return myInfo.profilePath.startsWith('http') 
      ? myInfo.profilePath 
      : `${IMAGE_BASE_URL}${myInfo.profilePath}`;
  };

  const handleLogout = () => {
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("accessToken");
    alert("로그아웃 되었습니다.");
    window.location.href = "/login";
  };

  return (
    <section className="mypage-card flex flex-col items-center w-full h-full bg-gradient-to-br from-[#FFB08B] to-[#FF8A65] border-none shadow-xl shadow-orange-100/50">
      <button className="btn-logout !text-white/60 hover:!text-white" onClick={handleLogout}>
        <LogOut size={14} />
        Logout
      </button>

      <div className="mt-8 flex flex-col items-center w-full">
        <div className="mb-6">
          {myInfo?.profilePath ? (
            <img 
              src={getProfileImage()} 
              alt="프로필" 
              className="w-32 h-32 rounded-full border-4 border-white/30 object-cover shadow-lg"
            />
          ) : (
            <div className="w-32 h-32 rounded-full bg-white/20 flex items-center justify-center border-4 border-white/10">
              <User size={48} className="text-white/50" />
            </div>
          )}
        </div>

        <div className="text-center mb-12 w-full px-4">
          <h2 className="text-2xl font-bold text-white mb-2">
            {myInfo?.name ?? "사용자"}님
          </h2>
          <div className="flex items-center justify-center gap-1.5 text-white/70 text-sm font-medium">
            <Mail size={14} />
            <span className="truncate">{myInfo?.email ?? "No email"}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full pt-4 border-t border-white/10">
        <button 
          className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-white/90 font-bold hover:bg-white/15 transition-all text-sm group"
          onClick={onEditProfile}
        >
          <Settings size={18} className="text-white/40 group-hover:text-white" />
          정보 수정
        </button>

        <button 
          className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-white/90 font-bold hover:bg-white/15 transition-all text-sm group"
          onClick={onChangePassword}
        >
          <Lock size={18} className="text-white/40 group-hover:text-white" />
          비밀번호 변경
        </button>

        <button 
          className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-white/90 font-bold hover:bg-white/15 transition-all text-sm group"
          onClick={onViewDonations}
        >
          <Heart size={18} className="text-white/40 group-hover:text-white" />
          나의 후원 내역
        </button>
      </div>
    </section>
  );
}
