import { Link } from "react-router-dom";
import NotificationsPageBase from "../../donation/pages/NotificationsPageBase";

export default function FoundationNotificationsPage() {
  const token = localStorage.getItem("foundationAccessToken");

  if (!token) {
    return (
      <div className="min-h-screen bg-[#fffaf7] pt-32 px-4 text-center">
        <p className="text-stone-500 text-lg">
          로그인 후 알림을 확인할 수 있습니다.
        </p>
        <Link
          to="/login"
          className="inline-block mt-4 bg-primary text-white px-6 py-2.5 rounded-full text-sm font-bold"
        >
          로그인하기
        </Link>
      </div>
    );
  }

  return <NotificationsPageBase token={token} />;
}
