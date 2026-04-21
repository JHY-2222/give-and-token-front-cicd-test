import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Wallet, FileText, Settings, 
  RefreshCw, ChevronRight, PlusCircle, CheckCircle,
  AlertCircle, Clipboard, X, Upload, Trash2, Camera, Banknote
} from "lucide-react";
import { beneficiaryApi } from "../api/beneficiaryApi";
import "../../myPageUser/styles/MyPage.css";

const formatTokenAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "0";
  return amount.toLocaleString("ko-KR", { maximumFractionDigits: 2 });
};

const BeneficiaryMainPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [reports, setReports] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");

  // 모달 상태
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // 환전 모달 상태
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState("");

  const [reportFormData, setReportFormData] = useState({
    title: "",
    content: "",
    usagePurpose: "",
    campaignNo: "",
    images: [] // { file, preview, purpose }
  });

  const reportedCampaignNos = useMemo(
    () =>
      new Set(
        (reports || [])
          .map((report) => Number(report?.campaignNo ?? report?.campaign_no))
          .filter((campaignNo) => Number.isFinite(campaignNo))
      ),
    [reports]
  );

  const pendingReportCampaigns = useMemo(() => {
    return (campaigns || []).filter((campaign) => {
      const campaignNo = Number(campaign?.campaignNo ?? campaign?.campaign_no);
      if (!Number.isFinite(campaignNo)) return true;
      return !reportedCampaignNos.has(campaignNo);
    });
  }, [campaigns, reportedCampaignNos]);

  const formatCampaignDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("ko-KR");
  };

  const getCampaignStatusLabel = (status) => {
    switch (String(status || "").toUpperCase()) {
      case "RECRUITING":
      case "ACTIVE":
        return "진행중";
      case "ENDED":
        return "종료";
      case "COMPLETED":
        return "완료";
      case "CANCELLED":
        return "취소";
      default:
        return "상태확인";
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setCampaignsLoading(true);
      const [info, reportsData, campaignsData] = await Promise.all([
        beneficiaryApi.getMyInfo(),
        beneficiaryApi.getMyReports(),
        beneficiaryApi.getMyCampaigns(),
      ]);

      console.log("UserInfo loaded:", info);
      setUserInfo(info);
      setReports(reportsData || []);
      setCampaigns(campaignsData || []);
    } catch (error) {
      console.error("데이터 로드 중 오류 발생:", error);
    } finally {
      setCampaignsLoading(false);
      setLoading(false);
    }
  };

  // 새 보고서 작성 시작
  const handleCreateReport = (campaign) => {
    setReportFormData({
      title: `[보고서] ${campaign.title}`,
      content: "",
      usagePurpose: "",
      campaignNo: campaign.campaignNo,
      images: []
    });
    setIsCreateMode(true);
    setIsEditMode(true);
    setSelectedReport(null);
    setIsReportModalOpen(true);
  };

  // 보고서 상세 보기
  const handleViewReport = async (reportNo) => {
    try {
      const detail = await beneficiaryApi.getReportDetail(reportNo);
      setSelectedReport(detail);
      
      const existingImages = (detail.images || []).map((img) => ({
        preview: img.imgPath,
        purpose: img.purpose || "",
        isExisting: true
      }));

      setReportFormData({
        title: detail.title,
        content: detail.content,
        usagePurpose: detail.usagePurpose || "",
        campaignNo: detail.campaignNo,
        images: existingImages
      });
      setIsCreateMode(false);
      setIsEditMode(false);
      setIsReportModalOpen(true);
    } catch (error) {
      alert("보고서 정보를 불러오지 못했습니다.");
    }
  };

  // 이미지 추가
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file: file,
      preview: URL.createObjectURL(file),
      purpose: ""
    }));
    setReportFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  // 이미지 제거
  const removeImage = (index) => {
    setReportFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // 이미지 목적 변경
  const handlePurposeChange = (index, value) => {
    const updatedImages = [...reportFormData.images];
    updatedImages[index].purpose = value;
    setReportFormData({ ...reportFormData, images: updatedImages });
  };

  // 보고서 제출/수정 처리
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dto = {
        campaign_no: reportFormData.campaignNo,
        title: reportFormData.title,
        content: reportFormData.content,
        usagePurpose: reportFormData.usagePurpose,
        purposes: reportFormData.images.map(img => img.purpose || "사진 설명 없음")
      };

      const files = reportFormData.images
        .filter(img => !img.isExisting)
        .map(img => img.file);
      
      if (isCreateMode) {
        await beneficiaryApi.submitReport(dto, files);
        alert("보고서가 제출되었습니다.");
      } else {
        await beneficiaryApi.updateReport(selectedReport.reportNo, dto, files);
        alert("보고서가 수정되었습니다.");
      }
      
      setIsReportModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("오류:", error);
      alert("작업 중 오류가 발생했습니다.");
    }
  };

  // 환전 신청 처리
  const handleRedeemRequest = async (e) => {
    e.preventDefault();
    if (!redeemAmount || isNaN(redeemAmount) || redeemAmount <= 0) {
      alert("올바른 금액을 입력해주세요.");
      return;
    }

    if (redeemAmount > (userInfo?.balance || 0)) {
      alert("보유 잔액보다 많은 금액을 환전할 수 없습니다.");
      return;
    }

    try {
      await beneficiaryApi.requestRedemption({
        amount: parseInt(redeemAmount)
      });
      alert("환전 신청이 완료되었습니다. 관리자 승인 후 계좌로 입금됩니다.");
      setIsRedeemModalOpen(false);
      setRedeemAmount("");
      fetchData(); 
    } catch (error) {
      alert("환전 신청 중 오류가 발생했습니다.");
    }
  };

  const copyToClipboard = (text) => {
    if(!text) return;
    navigator.clipboard.writeText(text);
    alert("복사되었습니다!");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">심사중</span>;
      case 'APPROVED':
        return <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">승인완료</span>;
      case 'REJECTED':
        return <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">반려됨</span>;
      default:
        return <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">{status}</span>;
    }
  };

  const getTabButtonClass = (tabName) =>
    `w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-[15px] transition-all ${
      activeTab === tabName
        ? "bg-primary text-white shadow-lg shadow-primary/20"
        : "text-stone-500 hover:bg-surface"
    }`;

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <RefreshCw className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="mypage-main-page scrollbar-hide font-sans text-ink" style={{ zoom: 1.08 }}>
      <header className="mb-6 px-1">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-1 rounded-full bg-orange-100 text-primary text-[10px] font-black uppercase tracking-widest">
            수혜자
          </span>
        </div>
        <h1 className="text-3xl font-black text-ink tracking-tight !mb-0 !text-left">
          반갑습니다, <span className="text-primary">{userInfo?.name || "수혜자"}</span>님
        </h1>
        <p className="text-ink/40 mt-3 text-sm font-medium">
          후원 현황과 보고서를 한 곳에서 관리하세요.
        </p>
      </header>

      <div className="mypage-layout-shell scrollbar-hide">
        <aside className="mypage-layout-nav scrollbar-hide">
          <div className="lg:sticky lg:top-48 h-full">
            <div className="space-y-4">
              <nav className="bg-white rounded-xl p-4 shadow-sm border-4 border-line">
                <button onClick={() => setActiveTab("dashboard")} className={getTabButtonClass("dashboard")}>
                  <Wallet size={18} />
                  내 현황 및 지갑
                </button>
                <button onClick={() => setActiveTab("campaigns")} className={getTabButtonClass("campaigns")}>
                  <FileText size={18} />
                  참여한 캠페인
                </button>
                <button onClick={() => setActiveTab("reports")} className={getTabButtonClass("reports")}>
                  <CheckCircle size={18} />
                  보고서
                </button>
                <button onClick={() => setActiveTab("profile")} className={getTabButtonClass("profile")}>
                  <Settings size={18} />
                  정보 수정
                </button>
              </nav>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-4 border-4 border-line">
                  <h3 className="font-bold mb-2 flex items-center gap-1 text-sm">
                    <CheckCircle className="text-green-500" size={16} />
                    완료된 보고서
                  </h3>
                  <p className="text-2xl font-black">{reports.length}건</p>
                </div>
                <div className="bg-white rounded-xl p-4 border-4 border-line">
                  <h3 className="font-bold mb-2 flex items-center gap-1 text-sm">
                    <PlusCircle className="text-primary" size={16} />
                    보고서 작성 전 캠페인
                  </h3>
                  {campaignsLoading ? (
                    <p className="text-sm font-bold text-stone-400">캠페인을 불러오고 있습니다...</p>
                  ) : (
                    <p className="text-2xl font-black">{pendingReportCampaigns.length}건</p>
                  )}
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-bold text-secondary mb-2 flex items-center gap-2">
                  <AlertCircle size={16} />
                  도움이 필요하신가요?
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  보고서 작성이나 환전 방법이 궁금하시면 고객센터로 문의해 주세요.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main className="mypage-layout-content">
          <div className="mypage-sub-page">
            <div className="mypage-sub-container">
              <div className="mypage-sub-card mypage-sub-card--scroll pr-1">
            {activeTab === "dashboard" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-white rounded-2xl p-8 md:p-10 border-4 border-line relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <span className="bg-accent/30 text-ink px-4 py-1 rounded-full text-xs font-bold">BENEFICIARY STATUS</span>
                      <Wallet className="text-primary" size={28} />
                    </div>
                    
                    <h2 className="text-stone-500 text-xl font-bold mb-1">보유 토큰 잔액</h2>
                    <div className="flex items-baseline gap-2 mb-8">
                      <span className="text-5xl font-display font-black text-ink">{formatTokenAmount(userInfo?.balance)}</span>
                      <span className="text-xl font-bold text-primary">GNT</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                      <div className="bg-surface rounded-2xl p-5 border-2 border-line">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-stone-400">내 블록체인 지갑 주소</span>
                          <button onClick={() => copyToClipboard(userInfo?.walletAddress)} className="text-stone-400 hover:text-primary transition-colors">
                            <Clipboard size={18} />
                          </button>
                        </div>
                        <code className="text-[12px] font-mono break-all text-stone-600 block">
                          {userInfo?.walletAddress || "지갑 정보를 불러올 수 없습니다."}
                        </code>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[12px] text-stone-400 font-bold">ID :</span>
                          <span className="text-[12px] text-primary font-black">{userInfo?.walletNo || "N/A"}</span>
                        </div>
                      </div>
                      
                      <div className="bg-stone-50 rounded-2xl p-5 border-2 border-line border-dashed">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-stone-400">등록된 환전 계좌</span>
                          <button onClick={() => copyToClipboard(userInfo?.account)} className="text-stone-400 hover:text-primary transition-colors">
                            <Clipboard size={18} />
                          </button>
                        </div>
                        <p className="text-sm font-bold text-ink">{userInfo?.account || "계좌 정보를 등록해주세요."}</p>
                        <p className="text-[12px] text-stone-400 mt-1">* 환전 신청 시 이 계좌로 현금이 입금됩니다.</p>
                      </div>
                    </div>

                    <div className="mt-8">
                      <button 
                        onClick={() => setIsRedeemModalOpen(true)}
                        className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Banknote size={20} />
                        환전 신청하기
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === "campaigns" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section>
                  <h2 className="text-2xl font-display font-bold mb-6">내가 참여한 캠페인</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(campaigns || []).length > 0 ? campaigns.map((campaign, index) => {
                      const campaignNo = Number(campaign?.campaignNo ?? campaign?.campaign_no);
                      const canWriteReport = !reportedCampaignNos.has(campaignNo);
                      return (
                      <div key={campaignNo || `campaign-${index}`} className="bg-white p-6 rounded-3xl border-4 border-line hover:border-primary/30 transition-all group">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] font-black text-stone-400">캠페인 NO. {campaignNo || "-"}</span>
                          <span className="text-[11px] font-black px-3 py-1 rounded-full bg-stone-100 text-stone-600">
                            {getCampaignStatusLabel(campaign?.campaignStatus)}
                          </span>
                        </div>
                        <h4 className="font-bold text-lg mb-2">
                          <button
                            type="button"
                            onClick={() => campaignNo && navigate(`/campaign/${campaignNo}`)}
                            className="text-left group-hover:text-primary transition-colors hover:text-primary"
                          >
                            {campaign.title}
                          </button>
                        </h4>
                        <p className="text-xs text-stone-400 mb-4">
                          종료일: {formatCampaignDate(campaign?.endAt ?? campaign?.endDate)}
                        </p>
                        <button 
                          onClick={() => canWriteReport && handleCreateReport(campaign)}
                          className={`w-full mt-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                            canWriteReport
                              ? "bg-surface text-stone-600 hover:bg-primary hover:text-white"
                              : "bg-green-50 text-green-700 cursor-default"
                          }`}
                        >
                          <PlusCircle size={16} />
                          {canWriteReport ? "보고서 작성하기" : "보고서 작성 완료"}
                        </button>
                      </div>
                    )}) : (
                      <div className="col-span-full bg-white py-12 rounded-xl border-4 border-dashed border-line text-center">
                        <p className="text-stone-400 font-medium">
                          {campaignsLoading ? "캠페인을 불러오고 있습니다..." : "참여 중인 캠페인이 없습니다."}
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {activeTab === "reports" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <section>
                  <h2 className="text-2xl font-display font-bold mb-6">작성 전 보고서</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingReportCampaigns.length > 0 ? pendingReportCampaigns.map(campaign => (
                      <div key={campaign.campaignNo} className="bg-white p-6 rounded-3xl border-4 border-line hover:border-primary/30 transition-all group">
                        <h4 className="font-bold text-lg mb-2">
                          <button
                            type="button"
                            onClick={() => {
                              const campaignId = campaign?.campaignNo ?? campaign?.campaign_no;
                              if (campaignId) navigate(`/campaign/${campaignId}`);
                            }}
                            className="text-left group-hover:text-primary transition-colors hover:text-primary"
                          >
                            {campaign.title}
                          </button>
                        </h4>
                        <button 
                          onClick={() => handleCreateReport(campaign)}
                          className="w-full mt-4 bg-surface py-3 rounded-xl font-bold text-sm text-stone-600 flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all"
                        >
                          <PlusCircle size={16} />
                          보고서 작성하기
                        </button>
                      </div>
                    )) : (
                      <div className="col-span-full bg-white py-12 rounded-xl border-4 border-dashed border-line text-center">
                        <p className="text-stone-400 font-medium">
                          {campaignsLoading ? "캠페인을 불러오고 있습니다..." : "작성 전 보고서가 없습니다."}
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-display font-bold mb-6">작성된 보고서</h2>
                  <div className="space-y-4">
                    {reports.length > 0 ? reports.map(report => (
                      <div 
                        key={report.reportNo} 
                        onClick={() => handleViewReport(report.reportNo)}
                        className="bg-white p-6 rounded-3xl border-4 border-line flex items-center justify-between group hover:shadow-lg hover:shadow-stone-100 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                            <FileText size={24} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-bold">{report.title}</h4>
                              {getStatusBadge(report.approvalStatus)}
                            </div>
                            <p className="text-xs text-stone-400">{new Date(report.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <button className="p-3 bg-surface rounded-2xl text-stone-400 hover:text-primary hover:bg-primary/5 transition-all">
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    )) : (
                      <div className="bg-white py-12 rounded-xl border-4 border-dashed border-line text-center">
                        <p className="text-stone-400 font-medium">작성된 보고서가 없습니다.</p>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}

            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl p-8 md:p-10 border-4 border-line animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl font-display font-bold mb-8">내 정보 수정</h2>
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const formData = new FormData(e.target);
                    const data = {
                      name: formData.get("name"),
                      phone: formData.get("phone"),
                      account: formData.get("account")
                    };
                    try {
                      await beneficiaryApi.updateMyInfo(data);
                      alert("정보가 수정되었습니다.");
                      fetchData(); 
                    } catch (error) {
                      alert("정보 수정 중 오류가 발생했습니다.");
                    }
                  }}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-stone-500 ml-1">이름</label>
                      <input 
                        name="name"
                        type="text" 
                        required
                        defaultValue={userInfo?.name}
                        className="w-full px-6 py-4 rounded-2xl border-2 border-line focus:border-primary focus:ring-0 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-stone-500 ml-1">연락처</label>
                      <input 
                        name="phone"
                        type="text" 
                        required
                        defaultValue={userInfo?.phone}
                        className="w-full px-6 py-4 rounded-2xl border-2 border-line focus:border-primary focus:ring-0 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-stone-500 ml-1">엔트리 코드 (Entry Code)</label>
                      <input 
                        type="text" 
                        value={userInfo?.entryCode || ""}
                        readOnly
                        className="w-full px-6 py-4 rounded-2xl border-2 border-line bg-surface text-stone-400 cursor-not-allowed transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-stone-500 ml-1">수혜자 유형</label>
                      <input 
                        type="text" 
                        value={userInfo?.beneficiaryType === 'INDIVIDUAL' ? "개인 (Individual)" : (userInfo?.beneficiaryType === 'ORGANIZATION' ? "단체 (Organization)" : "")}
                        readOnly
                        className="w-full px-6 py-4 rounded-2xl border-2 border-line bg-surface text-stone-400 cursor-not-allowed transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-stone-500 ml-1 flex items-center gap-2">
                      <Banknote size={16} />
                      은행 계좌 정보 (환전 시 입금 계좌)
                    </label>
                    <input 
                      name="account"
                      type="text" 
                      placeholder="예: 110-123-456789"
                      defaultValue={userInfo?.account}
                      className="w-full px-6 py-4 rounded-2xl border-2 border-line focus:border-primary focus:ring-0 transition-all"
                    />
                  </div>
                  <div className="pt-6">
                    <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all">
                      정보 저장하기
                    </button>
                  </div>
                </form>
              </div>
            )}

              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 환전 신청 모달 */}
      {isRedeemModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-10 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsRedeemModalOpen(false)}
              className="absolute top-8 right-8 text-stone-400 hover:text-ink transition-colors"
            >
              <X size={24} />
            </button>

            <h3 className="text-2xl font-display font-bold mb-2">환전 신청하기</h3>
            <p className="text-stone-500 text-sm mb-8">보유하신 GNT 토큰을 현금으로 환전합니다.</p>

            <form onSubmit={handleRedeemRequest} className="space-y-6">
              <div className="bg-surface p-6 rounded-2xl border-2 border-line mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-stone-400">최대 가능 금액</span>
                  <span className="text-sm font-black text-primary">{formatTokenAmount(userInfo?.balance)} GNT</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-stone-400">입금 예정 계좌</span>
                  <span className="text-xs font-bold text-ink">{userInfo?.account || "등록된 계좌 없음"}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-500">환전할 토큰 양 (GNT)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    required 
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-6 py-4 rounded-2xl border-2 border-line focus:border-primary pr-16 text-lg font-bold"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-stone-400">GNT</span>
                </div>
              </div>

              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                <p className="text-[10px] text-amber-600 leading-relaxed">
                  * 환전 신청 시 토큰은 즉시 차감되며, 관리자 승인 후 영업일 기준 1~3일 이내에 지정하신 계좌로 현금이 입금됩니다.
                </p>
              </div>

              <button 
                type="submit" 
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                신청하기
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 보고서 작성/수정 모달 */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-2xl p-8 md:p-10 shadow-2xl relative my-10 animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsReportModalOpen(false)}
              className="absolute top-8 right-8 text-stone-400 hover:text-ink transition-colors"
            >
              <X size={24} />
            </button>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-display font-bold">
                  {isCreateMode ? '보고서 작성' : (isEditMode ? '보고서 수정' : '보고서 상세')}
                </h3>
                {!isCreateMode && selectedReport && getStatusBadge(selectedReport.approvalStatus)}
              </div>
              <p className="text-stone-500 text-sm">기부금이 투명하게 사용되었음을 증명하기 위해 상세히 작성해주세요.</p>
            </div>

            {!isCreateMode && selectedReport?.approvalStatus === 'REJECTED' && selectedReport.rejectReason && (
              <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-2xl mb-8">
                <h4 className="font-bold text-rose-600 flex items-center gap-2 mb-2">
                  <AlertCircle size={18} />
                  반려 사유
                </h4>
                <p className="text-sm text-rose-500 leading-relaxed">{selectedReport.rejectReason}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-500 ml-1">보고서 제목</label>
                <input 
                  type="text"
                  required
                  value={reportFormData.title}
                  onChange={(e) => setReportFormData({...reportFormData, title: e.target.value})}
                  readOnly={!isEditMode}
                  className={`w-full px-6 py-4 rounded-2xl border-2 border-line transition-all ${!isEditMode ? 'bg-surface text-stone-500' : 'focus:border-primary'}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-500 ml-1">사용 목적 (종합)</label>
                <input 
                  type="text"
                  required
                  placeholder="예: 생필품 구매 및 교육비 지원"
                  value={reportFormData.usagePurpose}
                  onChange={(e) => setReportFormData({...reportFormData, usagePurpose: e.target.value})}
                  readOnly={!isEditMode}
                  className={`w-full px-6 py-4 rounded-2xl border-2 border-line transition-all ${!isEditMode ? 'bg-surface text-stone-500' : 'focus:border-primary'}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-500 ml-1">상세 활동 내용</label>
                <textarea 
                  rows="5"
                  required
                  value={reportFormData.content}
                  onChange={(e) => setReportFormData({...reportFormData, content: e.target.value})}
                  readOnly={!isEditMode}
                  className={`w-full px-6 py-4 rounded-2xl border-2 border-line transition-all resize-none ${!isEditMode ? 'bg-surface text-stone-500' : 'focus:border-primary'}`}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-stone-500 ml-1 flex items-center gap-2">
                    <Camera size={18} />
                    증빙 사진 첨부
                  </label>
                  {isEditMode && (
                    <label className="cursor-pointer bg-stone-100 hover:bg-stone-200 text-stone-600 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2">
                      <Upload size={14} />
                      사진 추가
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {reportFormData.images.map((img, idx) => (
                    <div key={idx} className="bg-surface rounded-2xl p-4 border-2 border-line relative group">
                      <div className="aspect-video rounded-xl overflow-hidden mb-3 bg-stone-200">
                        <img src={img.preview} alt="preview" className="w-full h-full object-cover" />
                      </div>
                      <input 
                        type="text"
                        placeholder="이 사진의 용도를 입력하세요 (예: 영수증)"
                        value={img.purpose}
                        onChange={(e) => handlePurposeChange(idx, e.target.value)}
                        readOnly={!isEditMode}
                        className={`w-full px-3 py-2 rounded-lg border-2 border-line text-xs transition-all ${!isEditMode ? 'bg-stone-50 text-stone-500' : 'focus:border-primary bg-white'}`}
                      />
                      {isEditMode && (
                        <button 
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 p-2 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                {isEditMode ? (
                  <>
                    <button 
                      type="submit"
                      className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    >
                      {isCreateMode ? '보고서 제출하기' : '수정 완료'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => isCreateMode ? setIsReportModalOpen(false) : setIsEditMode(false)}
                      className="flex-1 bg-white border-2 border-line py-4 rounded-2xl font-bold text-stone-600 hover:bg-stone-50 transition-all"
                    >
                      취소
                    </button>
                  </>
                ) : (
                  <>
                    {(selectedReport?.approvalStatus === 'REJECTED' || selectedReport?.approvalStatus === 'PENDING') && (
                      <button 
                        type="button"
                        onClick={() => setIsEditMode(true)}
                        className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                      >
                        수정하기
                      </button>
                    )}
                    <button 
                      type="button"
                      onClick={() => setIsReportModalOpen(false)}
                      className="flex-1 bg-white border-2 border-line py-4 rounded-2xl font-bold text-stone-600 hover:bg-stone-50 transition-all"
                    >
                      닫기
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeneficiaryMainPage;
