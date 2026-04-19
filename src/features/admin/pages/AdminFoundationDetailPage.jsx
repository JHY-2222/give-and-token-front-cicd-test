import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAdminApiUrl, getAdminAuthHeaders } from "../util";
import "../css/AdminDashboardPage.css";

function formatNumber(value) {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) {
    return "0";
  }
  return new Intl.NumberFormat("ko-KR").format(num);
}

function formatCurrency(value) {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) {
    return "₩0";
  }
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDate(value) {
  if (!value) {
    return "-";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toLocaleDateString("ko-KR");
}

function normalizePageContent(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }
  if (payload && Array.isArray(payload.content)) {
    return payload.content;
  }
  return [];
}

export default function AdminFoundationDetailPage() {
  const navigate = useNavigate();
  const { foundationNo } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState("");
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReasonInput, setRejectReasonInput] = useState("");
  const [detail, setDetail] = useState(null);
  const [wallet, setWallet] = useState({ walletAddress: "", balance: 0 });
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function loadAll() {
      try {
        setLoading(true);
        setError("");

        const [detailRes, walletRes, campaignRes] = await Promise.all([
          fetch(getAdminApiUrl(`/foundation/${foundationNo}`), {
            method: "GET",
            headers: getAdminAuthHeaders(),
          }),
          fetch(`/api/foundation/${foundationNo}/wallet`, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }),
          fetch(`/api/foundation/${foundationNo}/campaigns?page=0&size=100`, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }),
        ]);

        if (!detailRes.ok) {
          const text = await detailRes.text().catch(() => "");
          throw new Error(text || `Detail load failed (${detailRes.status})`);
        }

        const detailPayload = await detailRes.json();
        const walletPayload = walletRes.ok ? await walletRes.json().catch(() => ({})) : {};
        const campaignPayload = campaignRes.ok ? await campaignRes.json().catch(() => ({})) : {};

        if (cancelled) {
          return;
        }

        setDetail(detailPayload);
        setWallet(walletPayload ?? {});
        setCampaigns(normalizePageContent(campaignPayload));
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "단체 상세 정보를 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadAll();
    return () => {
      cancelled = true;
    };
  }, [foundationNo]);

  const activitySummary = useMemo(() => {
    const now = Date.now();
    const ongoingCount = campaigns.filter((item) => {
      if (!item?.endAt) return true;
      const endAt = new Date(item.endAt).getTime();
      return Number.isFinite(endAt) ? endAt >= now : true;
    }).length;

    const campaignCount = campaigns.length;
    const totalCurrent = campaigns.reduce((sum, item) => sum + Number(item?.currentAmount ?? 0), 0);
    const totalTarget = campaigns.reduce((sum, item) => sum + Number(item?.targetAmount ?? 0), 0);
    const achievementRate = totalTarget > 0 ? (totalCurrent / totalTarget) * 100 : 0;

    return {
      campaignCount,
      ongoingCount,
      totalCurrent,
      totalTarget,
      achievementRate,
    };
  }, [campaigns]);

  const isActive = detail?.accountStatus === "ACTIVE";
  const canReview =
    detail?.accountStatus === "PRE_REGISTERED" &&
    detail?.reviewStatus !== "APPROVED" &&
    detail?.reviewStatus !== "REJECTED";

  const handleDeactivate = async () => {
    try {
      setProcessing(true);
      setProcessingAction("deactivate");
      const response = await fetch(getAdminApiUrl(`/foundation/${foundationNo}/deactivate`), {
        method: "PATCH",
        headers: getAdminAuthHeaders(),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || "비활성화 요청에 실패했습니다.");
      }

      setDetail((prev) => ({
        ...prev,
        accountStatus: "INACTIVE",
      }));
      setShowDeactivateModal(false);
    } catch (err) {
      window.alert(err.message || "단체 비활성화에 실패했습니다.");
    } finally {
      setProcessing(false);
      setProcessingAction("");
    }
  };

  const handleApprove = async () => {
    try {
      setProcessing(true);
      setProcessingAction("approve");
      const response = await fetch(getAdminApiUrl(`/foundation/${foundationNo}/approve`), {
        method: "PATCH",
        headers: getAdminAuthHeaders(),
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || "승인 요청에 실패했습니다.");
      }

      setDetail((prev) => ({
        ...prev,
        reviewStatus: "APPROVED",
        accountStatus: "ACTIVE",
      }));
      window.alert("단체가 승인되었습니다.");
    } catch (err) {
      window.alert(err.message || "단체 승인에 실패했습니다.");
    } finally {
      setProcessing(false);
      setProcessingAction("");
    }
  };

  const handleReject = async () => {
    const trimmedReason = rejectReasonInput.trim();
    if (!trimmedReason) {
      window.alert("반려 사유를 입력해주세요.");
      return;
    }

    try {
      setProcessing(true);
      setProcessingAction("reject");
      const response = await fetch(
        getAdminApiUrl(`/foundation/${foundationNo}/reject?reason=${encodeURIComponent(trimmedReason)}`),
        {
          method: "PATCH",
          headers: getAdminAuthHeaders({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({ reason: trimmedReason }),
        },
      );

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(text || "반려 요청에 실패했습니다.");
      }

      setDetail((prev) => ({
        ...prev,
        reviewStatus: "REJECTED",
        accountStatus: "INACTIVE",
      }));
      setShowRejectModal(false);
      setRejectReasonInput("");
      window.alert("단체가 반려되었습니다.");
    } catch (err) {
      window.alert(err.message || "단체 반려에 실패했습니다.");
    } finally {
      setProcessing(false);
      setProcessingAction("");
    }
  };

  return (
    <>
      <header className="admin-dashboard-topbar">
        <div className="admin-dashboard-topbar__title">
          <button type="button" className="admin-dashboard-topbar__menu" onClick={() => navigate(-1)}>
            <span />
            <span />
            <span />
          </button>
          <h1>단체 상세</h1>
        </div>
      </header>

      <main className="admin-dashboard-content">
          {loading ? <p className="admin-dashboard-empty-text">상세 정보를 불러오는 중...</p> : null}
          {error ? <p className="admin-dashboard-empty-text">{error}</p> : null}

          {!loading && !error && detail ? (
            <section className="admin-foundation-detail-grid">
              <article className="admin-dashboard-panel admin-foundation-detail-card">
                <div className="admin-foundation-detail-header">
                  {detail.profilePath ? (
                    <img src={detail.profilePath} alt="" className="admin-foundation-detail-avatar" />
                  ) : (
                    <div className="admin-foundation-detail-avatar admin-foundation-detail-avatar--fallback">
                      {(detail.foundationName || "G").slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <h2>{detail.foundationName || "-"}</h2>
                    <p>{detail.foundationEmail || "-"}</p>
                  </div>
                </div>

                <div className="admin-foundation-detail-fields">
                  <div className="admin-foundation-detail-field">
                    <span>대표자</span>
                    <strong>{detail.representativeName || "-"}</strong>
                  </div>
                  <div className="admin-foundation-detail-field">
                    <span>사업자 번호</span>
                    <strong>{detail.businessRegistrationNumber || "-"}</strong>
                  </div>
                  <div className="admin-foundation-detail-field">
                    <span>연락처</span>
                    <strong>{detail.contactPhone || "-"}</strong>
                  </div>
                  <div className="admin-foundation-detail-field">
                    <span>단체 유형</span>
                    <strong>{detail.foundationType || "-"}</strong>
                  </div>
                  <div className="admin-foundation-detail-field">
                    <span>검토 상태</span>
                    <strong>{detail.reviewStatus || "-"}</strong>
                  </div>
                  <div className="admin-foundation-detail-field">
                    <span>계정 상태</span>
                    <strong>{detail.accountStatus || "-"}</strong>
                  </div>
                  <div className="admin-foundation-detail-field admin-foundation-detail-field--wide">
                    <span>단체 소개</span>
                    <strong>{detail.description || "-"}</strong>
                  </div>
                </div>

                {canReview ? (
                  <div className="admin-foundation-detail-actions">
                    <button
                      type="button"
                      className="admin-foundation-detail-approve"
                      onClick={handleApprove}
                      disabled={processing}
                    >
                      {processing && processingAction === "approve" ? "처리 중..." : "단체 승인"}
                    </button>
                    <button
                      type="button"
                      className="admin-foundation-detail-reject"
                      onClick={() => setShowRejectModal(true)}
                      disabled={processing}
                    >
                      단체 반려
                    </button>
                  </div>
                ) : null}

                {isActive ? (
                  <button
                    type="button"
                    className="admin-foundation-detail-danger"
                    onClick={() => setShowDeactivateModal(true)}
                  >
                    단체 비활성화
                  </button>
                ) : (
                  <div className="admin-foundation-detail-disabled">이미 비활성 상태입니다</div>
                )}
              </article>

              <article className="admin-foundation-activity-column">
                <section className="admin-dashboard-panel admin-foundation-activity-card">
                  <h3>플랫폼 활동</h3>
                  <div className="admin-foundation-activity-list">
                    <div>
                      <span>지갑 주소</span>
                      <strong>{wallet?.walletAddress || "-"}</strong>
                    </div>
                    <div>
                      <span>지갑 잔액</span>
                      <strong>{formatCurrency(wallet?.balance)}</strong>
                    </div>
                    <div>
                      <span>전체 캠페인</span>
                      <strong>{formatNumber(activitySummary.campaignCount)}</strong>
                    </div>
                    <div>
                      <span>진행 중 캠페인</span>
                      <strong>{formatNumber(activitySummary.ongoingCount)}</strong>
                    </div>
                    <div>
                      <span>모금액</span>
                      <strong>{formatCurrency(activitySummary.totalCurrent)}</strong>
                    </div>
                    <div>
                      <span>목표금액</span>
                      <strong>{formatCurrency(activitySummary.totalTarget)}</strong>
                    </div>
                    <div>
                      <span>달성률</span>
                      <strong>{activitySummary.achievementRate.toFixed(1)}%</strong>
                    </div>
                  </div>
                </section>

                <section className="admin-dashboard-panel admin-foundation-activity-card">
                  <h3>캠페인 현황</h3>
                  <div className="admin-foundation-campaign-list">
                    {campaigns.length ? (
                      campaigns.slice(0, 6).map((campaign) => (
                        <div key={campaign.campaignNo} className="admin-foundation-campaign-item">
                          <strong>{campaign.title || "-"}</strong>
                          <p>
                            {formatCurrency(campaign.currentAmount)} / {formatCurrency(campaign.targetAmount)}
                          </p>
                          <span>마감: {formatDate(campaign.endAt)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="admin-dashboard-empty-text">캠페인 데이터가 없습니다.</p>
                    )}
                  </div>
                </section>
              </article>
            </section>
          ) : null}
      </main>

      {showRejectModal ? (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal">
            <h4>단체 반려</h4>
            <p>반려 사유를 입력한 후 요청하세요.</p>
            <textarea
              className="admin-modal-textarea"
              value={rejectReasonInput}
              onChange={(e) => setRejectReasonInput(e.target.value)}
              placeholder="반려 사유를 입력하세요"
              disabled={processing}
            />
            <div className="admin-modal-actions">
              <button type="button" onClick={() => setShowRejectModal(false)} disabled={processing}>
                취소
              </button>
              <button type="button" className="danger" onClick={handleReject} disabled={processing || !rejectReasonInput.trim()}>
                {processing && processingAction === "reject" ? "처리 중..." : "반려"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showDeactivateModal ? (
        <div className="admin-modal-overlay" role="dialog" aria-modal="true">
          <div className="admin-modal">
            <h4>단체 비활성화</h4>
            <p>승인된 단체를 비활성화하시겠습니까?</p>
            <div className="admin-modal-actions">
              <button type="button" onClick={() => setShowDeactivateModal(false)} disabled={processing}>
                취소
              </button>
              <button type="button" className="danger" onClick={handleDeactivate} disabled={processing}>
                {processing ? "처리 중..." : "비활성화"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
