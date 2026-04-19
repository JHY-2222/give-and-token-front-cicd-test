import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../css/AdminDashboardPage.css";
import { fetchAdminJson, patchAdminAction } from "../util";

// ── 상수 ─────────────────────────────────────────────────────────────────────
const PAGE_TITLES = {
  dashboard: "대시보드",
  foundations: "단체 관리",
  campaigns: "캠페인 관리",
  reports: "보고서 관리",
  inactive: "비활성화 단체",
  members: "회원 관리",
  requests: "새 요청",
  logs: "관리자 로그",
  "send-history": "발송 내역",
};

const CATEGORY_COLORS = ["#3b82f6", "#60a5fa", "#2563eb", "#93c5fd", "#1d4ed8", "#0ea5e9"];

const DC = { W: 760, H: 280, pL: 64, pR: 16, pT: 16, pB: 36 };
DC.cW = DC.W - DC.pL - DC.pR;
DC.cH = DC.H - DC.pT - DC.pB;

const UC = { W: 760, H: 260, pL: 56, pR: 16, pT: 12, pB: 36 };
UC.cW = UC.W - UC.pL - UC.pR;
UC.cH = UC.H - UC.pT - UC.pB;

// ── 유틸리티 ─────────────────────────────────────────────────────────────────
function formatCurrency(value) {
  const num = Number(value ?? 0);
  return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(Number.isFinite(num) ? num : 0);
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("ko-KR");
}

function abbreviateCurrency(value) {
  if (value === 0) return "0";
  if (value >= 100_000_000) return `${(value / 100_000_000).toFixed(1).replace(/\.0$/, "")}억`;
  if (value >= 10_000) return `${(value / 10_000).toFixed(0)}만`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}천`;
  return String(Math.round(value));
}


function buildDonutGradient(ratios, field = "donationAmount") {
  const total = ratios.reduce((acc, item) => acc + Number(item?.[field] ?? 0), 0);
  const safeTotal = total > 0 ? total : 1;
  let offset = 0;
  const segments = ratios.map((item, index) => {
    const ratio = (Number(item?.[field] ?? 0) / safeTotal) * 100;
    const start = offset;
    const end = offset + ratio;
    offset = end;
    return `${CATEGORY_COLORS[index % CATEGORY_COLORS.length]} ${start}% ${end}%`;
  });
  if (!segments.length) return "conic-gradient(#dbeafe 0% 100%)";
  return `conic-gradient(${segments.join(", ")})`;
}

// ── 배지 ─────────────────────────────────────────────────────────────────────
function StatusBadge({ text }) {
  const colorMap = {
    ACTIVE: "badge--green", 활성: "badge--green",
    INACTIVE: "badge--gray", 비활성: "badge--gray",
    PRE_REGISTERED: "badge--yellow", 대기중: "badge--yellow", PENDING: "badge--yellow",
    APPROVED: "badge--blue", 승인됨: "badge--blue",
    REJECTED: "badge--red", 반려됨: "badge--red",
    CLEAN: "badge--green", SIMILAR: "badge--yellow", ILLEGAL: "badge--red",
    APPROVE: "badge--blue", REJECT: "badge--red",
    DISABLE: "badge--gray", ENABLE: "badge--green",
    REQUEST: "badge--yellow",
    SENT: "badge--blue", FAILED: "badge--red",
    FOUNDATION: "badge--blue", CAMPAIGN: "badge--green", FINAL_REPORT: "badge--yellow",
    읽음: "badge--gray", 안읽음: "badge--yellow",
  };
  const cls = colorMap[text] ?? "badge--gray";
  return <span className={`admin-badge ${cls}`}>{text}</span>;
}

// ── 반려 모달 ─────────────────────────────────────────────────────────────────
function RejectModal({ title, onConfirm, onClose }) {
  const [reason, setReason] = useState("");
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <h4>{title}</h4>
        <p>반려 사유를 입력하세요.</p>
        <textarea
          className="admin-modal-textarea"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          placeholder="반려 사유..."
        />
        <div className="admin-modal-actions">
          <button type="button" onClick={onClose}>취소</button>
          <button
            type="button"
            className="danger"
            disabled={!reason.trim()}
            onClick={() => onConfirm(reason.trim())}
          >
            반려 처리
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 공통 테이블 ───────────────────────────────────────────────────────────────
function AdminTable({ columns, rows, onRowClick, emptyText = "데이터가 없습니다.", className = "" }) {
  if (!rows.length) {
    return <p className="admin-empty-text">{emptyText}</p>;
  }
  return (
    <div className="admin-table-wrap">
      <table className={`admin-table ${className}`}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.width ? { width: col.width } : {}}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row._key ?? i}
              onClick={() => onRowClick?.(row)}
              className={onRowClick ? "is-clickable" : ""}
            >
              {columns.map((col) => (
                <td key={col.key}>{col.render ? col.render(row) : (row[col.key] ?? "-")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── 페이지네이션 ──────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  const start = Math.max(0, page - 2);
  const end = Math.min(totalPages - 1, start + 4);
  for (let i = start; i <= end; i++) pages.push(i);
  return (
    <div className="admin-pagination">
      <button type="button" disabled={page === 0} onClick={() => onChange(page - 1)}>이전</button>
      {pages.map((p) => (
        <button key={p} type="button" className={p === page ? "is-active" : ""} onClick={() => onChange(p)}>{p + 1}</button>
      ))}
      <button type="button" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>다음</button>
    </div>
  );
}

// ── 탭 ───────────────────────────────────────────────────────────────────────
function PanelTabs({ tabs, active, onChange }) {
  return (
    <div className="admin-panel-tabs">
      {tabs.map(({ key, label }) => (
        <button key={key} type="button" className={`admin-panel-tab ${active === key ? "is-active" : ""}`} onClick={() => onChange(key)}>
          {label}
        </button>
      ))}
    </div>
  );
}

// ── 검색/필터 바 ──────────────────────────────────────────────────────────────
function FilterBar({ keyword, onKeywordChange, onSearch, selects = [] }) {
  return (
    <div className="admin-filter-bar">
      <div className="admin-filter-bar__left">
        {selects.map(({ value, onChange, options, key }) => (
          <select key={key} value={value} onChange={(e) => onChange(e.target.value)} className="admin-select">
            {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        ))}
      </div>
      {onSearch && (
        <form className="admin-filter-bar__search" onSubmit={(e) => { e.preventDefault(); onSearch(); }}>
          <input type="text" placeholder="검색어" value={keyword} onChange={(e) => onKeywordChange(e.target.value)} />
          <button type="submit">검색</button>
        </form>
      )}
    </div>
  );
}

// ── 기간 선택기 ───────────────────────────────────────────────────────────────
function PeriodSelector({ days, onChangeDays }) {
  return (
    <div className="admin-period-selector">
      {[7, 14, 30].map((d) => (
        <button key={d} type="button" className={`admin-period-btn ${days === d ? "is-active" : ""}`} onClick={() => onChangeDays(d)}>
          {d}일
        </button>
      ))}
    </div>
  );
}

// ── 대시보드 홈 ───────────────────────────────────────────────────────────────
function DashboardHome({ onNavigate, navigate, donationDays, userDays, onDonationDaysChange, onUserDaysChange }) {
  const [tooltip, setTooltip] = useState(null);
  const [userTooltip, setUserTooltip] = useState(null);
  const [summary, setSummary] = useState({ todayDonationAmount: 0, activeCampaignCount: 0, pendingFoundationCount: 0, achievedCampaignRatio: 0, totalUserCount: 0, totalDonationAmount: 0 });
  const [trend, setTrend] = useState([]);
  const [userTrend, setUserTrend] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);

  useEffect(() => {
    fetchAdminJson("/dashboard/summary").then(setSummary).catch((e) => console.error("[Summary]", e));
    fetchAdminJson("/dashboard/category-ratio").then(setCategories).catch((e) => console.error("[Category]", e));
    fetchAdminJson("/dashboard/recent-logs", { size: 10, sort: "createdAt,DESC" })
      .then((d) => setRecentLogs(d.content ?? [])).catch((e) => console.error("[RecentLogs]", e));
    fetchAdminJson("/logs", { size: 10, sort: "createdAt,DESC" })
      .then((d) => setActivityLogs(d.content ?? [])).catch((e) => console.error("[Logs]", e));
  }, []);

  useEffect(() => {
    fetchAdminJson("/dashboard/donation-trend", { days: donationDays }).then(setTrend).catch((e) => console.error("[DonationTrend]", e));
  }, [donationDays]);

  useEffect(() => {
    fetchAdminJson("/dashboard/user-registration-trend", { days: userDays }).then(setUserTrend).catch((e) => console.error("[UserTrend]", e));
  }, [userDays]);

  // 기부금액 추이 차트
  const amounts = trend.map((t) => Number(t.amount));
  const maxAmt = Math.max(...amounts, 1);
  const stepXD = trend.length > 1 ? DC.cW / (trend.length - 1) : 0;
  const ptXD = (i) => DC.pL + stepXD * i;
  const ptYD = (v) => DC.pT + DC.cH - (v / maxAmt) * DC.cH;
  const linePathD = trend.map((p, i) => `${i === 0 ? "M" : "L"}${ptXD(i)} ${ptYD(p.amount)}`).join(" ");
  const xStepD = Math.max(1, Math.floor(trend.length / 6));

  // 회원 가입 추이 차트
  const counts = userTrend.map((t) => Number(t.count));
  const maxCnt = Math.max(...counts, 1);
  const stepXU = userTrend.length > 1 ? UC.cW / (userTrend.length - 1) : 0;
  const ptXU = (i) => UC.pL + stepXU * i;
  const ptYU = (v) => UC.pT + UC.cH - (v / maxCnt) * UC.cH;
  const linePathU = userTrend.map((p, i) => `${i === 0 ? "M" : "L"}${ptXU(i)} ${ptYU(p.count)}`).join(" ");
  const xStepU = Math.max(1, Math.floor(userTrend.length / 6));

  const yLevels = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="admin-dashboard-content__stack">
      {/* 요약 카드 */}
      <section className="admin-summary-grid">
        <article className="admin-summary-card">
          <p className="admin-summary-card__label">오늘 기부액</p>
          <strong className="admin-summary-card__value" style={{ color: "#2563eb" }}>{formatCurrency(summary.todayDonationAmount)}</strong>
        </article>
        <article className="admin-summary-card">
          <p className="admin-summary-card__label">진행 중 캠페인</p>
          <strong className="admin-summary-card__value">{summary.activeCampaignCount.toLocaleString("ko-KR")}</strong>
        </article>
        <article className="admin-summary-card">
          <p className="admin-summary-card__label">신규 단체 신청</p>
          <strong className="admin-summary-card__value" style={{ color: "#2563eb" }}>{summary.pendingFoundationCount.toLocaleString("ko-KR")}</strong>
        </article>
        <article className="admin-summary-card">
          <p className="admin-summary-card__label">달성 비율</p>
          <strong className="admin-summary-card__value">{summary.achievedCampaignRatio.toFixed(1)}%</strong>
        </article>
        <article className="admin-summary-card">
          <p className="admin-summary-card__label">전체 누적 기부액</p>
          <strong className="admin-summary-card__value" style={{ color: "#2563eb" }}>{formatCurrency(summary.totalDonationAmount)}</strong>
          <span className="admin-summary-card__sub">{summary.totalUserCount.toLocaleString("ko-KR")}명</span>
        </article>
      </section>

      <section className="admin-dashboard-2x2-grid">
          {/* 기부금액 추이 */}
          <article className="admin-panel admin-panel--chart">
            <div className="admin-panel__header">
              <h2>기부금액 추이</h2>
              <PeriodSelector days={donationDays} onChangeDays={onDonationDaysChange} />
            </div>
            <div className="admin-line-chart">
              <svg viewBox={`0 0 ${DC.W} ${DC.H}`} aria-hidden="true" style={{ cursor: "crosshair" }}
                onMouseMove={(e) => {
                  if (!trend.length) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const svgX = ((e.clientX - rect.left) / rect.width) * DC.W;
                  const idx = Math.min(Math.max(Math.round((svgX - DC.pL) / (stepXD || 1)), 0), trend.length - 1);
                  const p = trend[idx];
                  if (!p) return;
                  const x = ptXD(idx); const y = ptYD(p.amount);
                  setTooltip({ x, y, xPct: (x / DC.W) * 100, yPct: (y / DC.H) * 100, label: p.date, amount: p.amount });
                }}
                onMouseLeave={() => setTooltip(null)}
              >
                {yLevels.map((r) => {
                  const yp = DC.pT + DC.cH - r * DC.cH;
                  return (
                    <g key={r}>
                      <line x1={DC.pL} y1={yp} x2={DC.W - DC.pR} y2={yp} stroke="#f1f5f9" strokeWidth={r === 0 ? 1.5 : 1} strokeDasharray={r === 0 ? "none" : "4 3"} />
                      <text x={DC.pL - 6} y={yp + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{abbreviateCurrency(maxAmt * r)}</text>
                    </g>
                  );
                })}
                {trend.map((p, i) => i % xStepD !== 0 ? null : (
                  <text key={i} x={ptXD(i)} y={DC.H - DC.pB + 14} textAnchor="middle" fontSize="10" fill="#94a3b8">{p.date.slice(5)}</text>
                ))}
                <path d={linePathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {tooltip && (
                  <>
                    <line x1={tooltip.x} y1={DC.pT} x2={tooltip.x} y2={DC.pT + DC.cH} stroke="#dbeafe" strokeWidth={1} strokeDasharray="4 3" />
                    <circle cx={tooltip.x} cy={tooltip.y} r={4} fill="#2563eb" stroke="#fff" strokeWidth={2} />
                  </>
                )}
              </svg>
              {tooltip && (
                <div className="admin-chart-bubble" style={{ left: `${tooltip.xPct}%`, top: `${tooltip.yPct}%` }}>
                  <span>{tooltip.label}</span>
                  <strong>{formatCurrency(tooltip.amount)}</strong>
                </div>
              )}
            </div>
          </article>

          {/* 카테고리 비율 */}
          <article className="admin-panel">
            <div className="admin-panel__header"><h2>카테고리 비율</h2></div>
            <div className="admin-donut-pair">
              <div className="admin-donut-pair__item">
                <p className="admin-donut-pair__label">기부금액</p>
                <div className="admin-donut__ring" style={{ background: buildDonutGradient(categories, "donationAmount") }} />
              </div>
              <div className="admin-donut-pair__item">
                <p className="admin-donut-pair__label">캠페인 수</p>
                <div className="admin-donut__ring" style={{ background: buildDonutGradient(categories, "campaignCount") }} />
              </div>
            </div>
            <div className="admin-donut__legend">
              <div className="admin-donut__legend-header">
                <span>카테고리</span><span>기부금액</span><span>건수</span>
              </div>
              {categories.slice(0, 6).map((item, index) => (
                <div key={item.category} className="admin-category-row">
                  <span className="admin-category-row__label">
                    <i style={{ background: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }} />
                    {item.categoryLabel}
                  </span>
                  <span>{formatCurrency(item.donationAmount)}</span>
                  <span>{item.campaignCount}건</span>
                </div>
              ))}
            </div>
          </article>

          {/* 회원 가입 추이 */}
          <article className="admin-panel">
            <div className="admin-panel__header">
              <h2>회원 가입 추이</h2>
              <PeriodSelector days={userDays} onChangeDays={onUserDaysChange} />
            </div>
            <div className="admin-user-trend-chart">
              <svg viewBox={`0 0 ${UC.W} ${UC.H}`} aria-hidden="true" style={{ cursor: "crosshair" }}
                onMouseMove={(e) => {
                  if (!userTrend.length) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const svgX = ((e.clientX - rect.left) / rect.width) * UC.W;
                  const idx = Math.min(Math.max(Math.round((svgX - UC.pL) / (stepXU || 1)), 0), userTrend.length - 1);
                  const p = userTrend[idx];
                  if (!p) return;
                  const x = ptXU(idx); const y = ptYU(p.count);
                  setUserTooltip({ x, y, xPct: (x / UC.W) * 100, yPct: (y / UC.H) * 100, label: p.date, count: p.count });
                }}
                onMouseLeave={() => setUserTooltip(null)}
              >
                {yLevels.map((r) => {
                  const yp = UC.pT + UC.cH - r * UC.cH;
                  const v = maxCnt * r;
                  const label = v >= 10_000 ? `${Math.round(v / 10_000)}만명` : `${Math.round(v)}명`;
                  return (
                    <g key={r}>
                      <line x1={UC.pL} y1={yp} x2={UC.W - UC.pR} y2={yp} stroke="#f1f5f9" strokeWidth={r === 0 ? 1.5 : 1} strokeDasharray={r === 0 ? "none" : "4 3"} />
                      <text x={UC.pL - 6} y={yp + 4} textAnchor="end" fontSize="10" fill="#94a3b8">{label}</text>
                    </g>
                  );
                })}
                {userTrend.map((p, i) => i % xStepU !== 0 ? null : (
                  <text key={i} x={ptXU(i)} y={UC.H - UC.pB + 14} textAnchor="middle" fontSize="10" fill="#94a3b8">{p.date.slice(5)}</text>
                ))}
                <path d={linePathU} fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {userTooltip && (
                  <>
                    <line x1={userTooltip.x} y1={UC.pT} x2={userTooltip.x} y2={UC.pT + UC.cH} stroke="#ede9fe" strokeWidth={1} strokeDasharray="4 3" />
                    <circle cx={userTooltip.x} cy={userTooltip.y} r={4} fill="#7c3aed" stroke="#fff" strokeWidth={2} />
                  </>
                )}
              </svg>
              {userTooltip && (
                <div className="admin-chart-bubble admin-chart-bubble--purple" style={{ left: `${userTooltip.xPct}%`, top: `${userTooltip.yPct}%` }}>
                  <span>{userTooltip.label}</span>
                  <strong>{userTooltip.count.toLocaleString("ko-KR")}명</strong>
                </div>
              )}
            </div>
          </article>

          {/* 최근 요청 — 테이블 */}
          <article className="admin-panel" style={{ padding: 0 }}>
            <div className="admin-panel__header" style={{ padding: "14px 16px" }}>
              <h2>최근 요청 <span className="admin-badge badge--yellow">{recentLogs.length}건</span></h2>
              <button type="button" className="admin-detail-btn" onClick={() => onNavigate?.("requests")}>자세히 보기</button>
            </div>
            <AdminTable
              columns={[
                { key: "targetType", label: "유형", width: "80px", render: (r) => <StatusBadge text={r.targetType} /> },
                { key: "description", label: "내용", render: (r) => <strong>{r.description}</strong> },
                { key: "createdAt", label: "일시", width: "90px", render: (r) => formatDate(r.createdAt) },
              ]}
              rows={recentLogs.slice(0, 5).map((r) => ({ ...r, _key: r.logNo }))}
              onRowClick={(r) => navigate?.(`/admin/foundation/${r.targetId}`, { state: { record: r } })}
            />
          </article>
      </section>

      {/* 활동 로그 — 전체 너비 테이블 */}
      <article className="admin-panel" style={{ padding: 0 }}>
        <div className="admin-panel__header" style={{ padding: "14px 20px" }}>
          <h2>활동 로그</h2>
          <button type="button" className="admin-detail-btn" onClick={() => onNavigate?.("logs")}>자세히 보기</button>
        </div>
        <AdminTable
          columns={[
            { key: "actionType", label: "액션", width: "110px", render: (r) => <StatusBadge text={r.actionType} /> },
            { key: "targetType", label: "대상 유형", width: "130px", render: (r) => <StatusBadge text={r.targetType} /> },
            { key: "description", label: "내용", render: (r) => <strong>{r.description}</strong> },
            { key: "adminName", label: "처리자", width: "90px" },
            { key: "createdAt", label: "처리일시", width: "120px", render: (r) => formatDate(r.createdAt) },
          ]}
          rows={activityLogs.map((r) => ({ ...r, _key: r.logNo }))}
          className="admin-table--spacious"
        />
      </article>
    </div>
  );
}

// ── 단체 관리 패널 ────────────────────────────────────────────────────────────
function FoundationsPanel({ initialView, onOpenDetail }) {
  const [mode, setMode] = useState(initialView === "list" ? "list" : "approval");
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [reviewFilter, setReviewFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refetch, setRefetch] = useState(0);
  const [rejectTarget, setRejectTarget] = useState(null);
  const PAGE_SIZE = 10;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const endpoint = mode === "approval" ? "/foundation/applications" : "/foundation/approved";
    const params = {
      page, size: PAGE_SIZE, sort: "createdAt,DESC", keyword: appliedKeyword,
      ...(mode === "approval" ? { reviewStatus: reviewFilter } : { accountStatus: accountFilter }),
    };
    fetchAdminJson(endpoint, params)
      .then((json) => { if (!cancelled) { setRows(json.content ?? []); setTotalPages(json.totalPages ?? 0); } })
      .catch(() => { if (!cancelled) setRows([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [mode, page, reviewFilter, accountFilter, appliedKeyword, refetch]);

  const handleApprove = async (no) => {
    try { await patchAdminAction(`/foundation/${no}/approve`); setRefetch((r) => r + 1); }
    catch { alert("처리 중 오류가 발생했습니다."); }
  };

  const handleReject = async (no) => {
    if (!window.confirm("반려 처리하시겠습니까?")) return;
    try { await patchAdminAction(`/foundation/${no}/reject`); setRefetch((r) => r + 1); }
    catch { alert("처리 중 오류가 발생했습니다."); }
  };

  const handleActivate = async (no) => {
    try { await patchAdminAction(`/foundation/${no}/activate`); setRefetch((r) => r + 1); }
    catch { alert("처리 중 오류가 발생했습니다."); }
  };

  const handleDeactivate = async (no) => {
    if (!window.confirm("비활성화 처리하시겠습니까?")) return;
    try { await patchAdminAction(`/foundation/${no}/deactivate`); setRefetch((r) => r + 1); }
    catch { alert("처리 중 오류가 발생했습니다."); }
  };

  const approvalColumns = [
    { key: "foundationName", label: "단체명", render: (r) => (<><strong>{r.foundationName}</strong><em>{r.foundationType}</em></>) },
    { key: "representativeName", label: "대표자" },
    { key: "foundationEmail", label: "이메일" },
    { key: "reviewStatus", label: "검토 상태", width: "90px", render: (r) => <StatusBadge text={r.reviewStatus} /> },
    { key: "createdAt", label: "신청일", width: "90px", render: (r) => formatDate(r.createdAt) },
    { key: "_action", label: "관리", width: "160px", render: (r) => (
      <div style={{ display: "flex", gap: "4px", flexWrap: "nowrap" }}>
        <button type="button" className="admin-row-btn" style={{ color: "#2563eb", borderColor: "#2563eb" }}
          onClick={(e) => { e.stopPropagation(); handleApprove(r.foundationNo); }}>승인</button>
        <button type="button" className="admin-row-btn" style={{ color: "#dc2626", borderColor: "#fca5a5" }}
          onClick={(e) => { e.stopPropagation(); handleReject(r.foundationNo); }}>반려</button>
        <button type="button" className="admin-row-btn"
          onClick={(e) => { e.stopPropagation(); onOpenDetail(r.foundationNo); }}>상세</button>
      </div>
    )},
  ];

  const listColumns = [
    { key: "foundationName", label: "단체명", render: (r) => (<><strong>{r.foundationName}</strong><em>{r.foundationType}</em></>) },
    { key: "representativeName", label: "대표자" },
    { key: "foundationEmail", label: "이메일" },
    { key: "accountStatus", label: "계정 상태", width: "90px", render: (r) => {
      const map = { ACTIVE: "활성", INACTIVE: "비활성", PRE_REGISTERED: "대기중" };
      return <StatusBadge text={map[r.accountStatus] ?? r.accountStatus} />;
    }},
    { key: "createdAt", label: "등록일", width: "90px", render: (r) => formatDate(r.createdAt) },
    { key: "_action", label: "관리", width: "140px", render: (r) => (
      <div style={{ display: "flex", gap: "4px", flexWrap: "nowrap" }}>
        {r.accountStatus === "ACTIVE"
          ? <button type="button" className="admin-row-btn" style={{ color: "#dc2626", borderColor: "#fca5a5" }}
              onClick={(e) => { e.stopPropagation(); handleDeactivate(r.foundationNo); }}>비활성화</button>
          : <button type="button" className="admin-row-btn" style={{ color: "#16a34a", borderColor: "#86efac" }}
              onClick={(e) => { e.stopPropagation(); handleActivate(r.foundationNo); }}>활성화</button>
        }
        <button type="button" className="admin-row-btn"
          onClick={(e) => { e.stopPropagation(); onOpenDetail(r.foundationNo); }}>상세</button>
      </div>
    )},
  ];

  const reviewOptions = [
    { value: "", label: "전체 상태" },
    { value: "PENDING", label: "대기" },
    { value: "CLEAN", label: "정상" },
    { value: "SIMILAR", label: "유사" },
    { value: "ILLEGAL", label: "위법" },
    { value: "APPROVED", label: "승인됨" },
    { value: "REJECTED", label: "반려됨" },
  ];
  const accountOptions = [
    { value: "", label: "전체 상태" },
    { value: "ACTIVE", label: "활성" },
    { value: "INACTIVE", label: "비활성" },
    { value: "PRE_REGISTERED", label: "사전 등록" },
  ];

  return (
    <>
      <section className="admin-panel admin-panel--list">
        <PanelTabs
          tabs={[{ key: "approval", label: "신규 신청" }, { key: "list", label: "단체 목록" }]}
          active={mode}
          onChange={(k) => { setMode(k); setPage(0); setKeyword(""); setAppliedKeyword(""); setReviewFilter(""); setAccountFilter(""); }}
        />
        <FilterBar
          keyword={keyword}
          onKeywordChange={setKeyword}
          onSearch={() => { setPage(0); setAppliedKeyword(keyword); }}
          selects={mode === "approval"
            ? [{ key: "review", value: reviewFilter, onChange: (v) => { setReviewFilter(v); setPage(0); }, options: reviewOptions }]
            : [{ key: "account", value: accountFilter, onChange: (v) => { setAccountFilter(v); setPage(0); }, options: accountOptions }]
          }
        />
        {loading
          ? <p className="admin-empty-text">불러오는 중...</p>
          : <AdminTable
              columns={mode === "approval" ? approvalColumns : listColumns}
              rows={rows.map((r) => ({ ...r, _key: r.foundationNo }))}
              emptyText="데이터가 없습니다."
            />
        }
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </section>
    </>
  );
}

// ── 캠페인 관리 패널 ──────────────────────────────────────────────────────────
function CampaignsPanel({ initialView, onOpenDetail }) {
  const [mode, setMode] = useState(initialView === "list" ? "approved" : "pending");
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refetch, setRefetch] = useState(0);
  const [rejectTarget, setRejectTarget] = useState(null);
  const PAGE_SIZE = 10;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const endpoint = mode === "pending" ? "/campaigns/pending" : "/campaigns/approved";
    fetchAdminJson(endpoint, { page, size: PAGE_SIZE, sort: "createdAt,DESC", keyword: appliedKeyword })
      .then((json) => { if (!cancelled) { setRows(json.content ?? []); setTotalPages(json.totalPages ?? 0); } })
      .catch(() => { if (!cancelled) setRows([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [mode, page, appliedKeyword, refetch]);

  const handleApprove = async (no) => {
    try { await patchAdminAction(`/campaigns/${no}/approve`); setRefetch((r) => r + 1); }
    catch { alert("처리 중 오류가 발생했습니다."); }
  };

  const handleReject = async (no, reason) => {
    try {
      await patchAdminAction(`/campaigns/${no}/reject`, { reason });
      setRejectTarget(null);
      setRefetch((r) => r + 1);
    } catch { alert("처리 중 오류가 발생했습니다."); }
  };

  const pendingColumns = [
    { key: "title", label: "캠페인명", render: (r) => (<><strong>{r.title}</strong><em>{r.foundationName}</em></>) },
    { key: "category", label: "카테고리" },
    { key: "targetAmount", label: "목표 금액", render: (r) => formatCurrency(r.targetAmount) },
    { key: "createdAt", label: "신청일", width: "90px", render: (r) => formatDate(r.createdAt) },
    { key: "_action", label: "관리", width: "120px", render: (r) => (
      <div style={{ display: "flex", gap: "4px", flexWrap: "nowrap" }}>
        <button type="button" className="admin-row-btn" style={{ color: "#2563eb", borderColor: "#2563eb" }}
          onClick={(e) => { e.stopPropagation(); handleApprove(r.campaignNo); }}>승인</button>
        <button type="button" className="admin-row-btn" style={{ color: "#dc2626", borderColor: "#fca5a5" }}
          onClick={(e) => { e.stopPropagation(); setRejectTarget(r); }}>반려</button>
      </div>
    )},
  ];

  const approvedColumns = [
    { key: "title", label: "캠페인명", render: (r) => (<><strong>{r.title}</strong><em>{r.foundationName}</em></>) },
    { key: "category", label: "카테고리" },
    { key: "currentAmount", label: "현재 기부금", render: (r) => formatCurrency(r.currentAmount) },
    { key: "endAt", label: "마감일", width: "90px", render: (r) => formatDate(r.endAt) },
    { key: "approvalStatus", label: "상태", width: "80px", render: (r) => {
      const map = { APPROVED: "승인됨", PENDING: "검토중", REJECTED: "반려됨" };
      return <StatusBadge text={map[r.approvalStatus] ?? r.approvalStatus} />;
    }},
    { key: "_action", label: "관리", width: "60px", render: (r) => (
      <button type="button" className="admin-row-btn"
        onClick={(e) => { e.stopPropagation(); onOpenDetail(r); }}>상세</button>
    )},
  ];

  return (
    <>
      <section className="admin-panel admin-panel--list">
        <PanelTabs
          tabs={[{ key: "pending", label: "승인 대기" }, { key: "approved", label: "승인된 캠페인" }]}
          active={mode}
          onChange={(k) => { setMode(k); setPage(0); setKeyword(""); setAppliedKeyword(""); }}
        />
        <FilterBar
          keyword={keyword}
          onKeywordChange={setKeyword}
          onSearch={() => { setPage(0); setAppliedKeyword(keyword); }}
        />
        {loading
          ? <p className="admin-empty-text">불러오는 중...</p>
          : <AdminTable
              columns={mode === "pending" ? pendingColumns : approvedColumns}
              rows={rows.map((r) => ({ ...r, _key: r.campaignNo }))}
              emptyText="캠페인이 없습니다."
            />
        }
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </section>
      {rejectTarget && (
        <RejectModal
          title={`"${rejectTarget.title}" 반려`}
          onConfirm={(reason) => handleReject(rejectTarget.campaignNo, reason)}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </>
  );
}

// ── 보고서 패널 ───────────────────────────────────────────────────────────────
function ReportsPanel({ initialView, onOpenDetail }) {
  const [mode, setMode] = useState(initialView === "list" ? "all" : "pending");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refetch, setRefetch] = useState(0);
  const [rejectTarget, setRejectTarget] = useState(null);
  const PAGE_SIZE = 10;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAdminJson("/reports/pending", { page, size: PAGE_SIZE, sort: "createdAt,DESC" })
      .then((json) => { if (!cancelled) { setRows(json.content ?? []); setTotalPages(json.totalPages ?? 0); } })
      .catch(() => { if (!cancelled) setRows([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, refetch]);

  const handleApprove = async (no) => {
    try { await patchAdminAction(`/reports/${no}/approve`); setRefetch((r) => r + 1); }
    catch { alert("처리 중 오류가 발생했습니다."); }
  };

  const handleReject = async (no, reason) => {
    try {
      await patchAdminAction(`/reports/${no}/reject`, { reason });
      setRejectTarget(null);
      setRefetch((r) => r + 1);
    } catch { alert("처리 중 오류가 발생했습니다."); }
  };

  const pendingColumns = [
    { key: "title", label: "보고서 제목", render: (r) => (<><strong>{r.title}</strong><em>캠페인 #{r.campaignNo}</em></>) },
    { key: "usagePurpose", label: "사용 목적" },
    { key: "approvalStatus", label: "상태", width: "80px", render: (r) => <StatusBadge text={r.approvalStatus === "PENDING" ? "검토중" : r.approvalStatus} /> },
    { key: "createdAt", label: "제출일", width: "90px", render: (r) => formatDate(r.createdAt) },
    { key: "_action", label: "관리", width: "120px", render: (r) => (
      <div style={{ display: "flex", gap: "4px", flexWrap: "nowrap" }}>
        <button type="button" className="admin-row-btn" style={{ color: "#2563eb", borderColor: "#2563eb" }}
          onClick={(e) => { e.stopPropagation(); handleApprove(r.reportNo); }}>승인</button>
        <button type="button" className="admin-row-btn" style={{ color: "#dc2626", borderColor: "#fca5a5" }}
          onClick={(e) => { e.stopPropagation(); setRejectTarget(r); }}>반려</button>
      </div>
    )},
  ];

  return (
    <>
      <section className="admin-panel admin-panel--list">
        <PanelTabs
          tabs={[{ key: "pending", label: "승인 대기" }, { key: "all", label: "전체 보고서" }]}
          active={mode}
          onChange={(k) => { setMode(k); setPage(0); }}
        />
        {mode === "all" ? (
          <p className="admin-empty-text" style={{ padding: "40px 20px" }}>
            전체 보고서 조회 API가 아직 제공되지 않습니다. (백엔드: /admin/reports 엔드포인트 미구현)
          </p>
        ) : loading ? (
          <p className="admin-empty-text">불러오는 중...</p>
        ) : (
          <AdminTable
            columns={pendingColumns}
            rows={rows.map((r) => ({ ...r, _key: r.reportNo }))}
            emptyText="승인 대기 보고서가 없습니다."
          />
        )}
        {mode === "pending" && <Pagination page={page} totalPages={totalPages} onChange={setPage} />}
      </section>
      {rejectTarget && (
        <RejectModal
          title={`"${rejectTarget.title}" 반려`}
          onConfirm={(reason) => handleReject(rejectTarget.reportNo, reason)}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </>
  );
}

// ── 회원 관리 패널 ────────────────────────────────────────────────────────────
function MembersPanel() {
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const PAGE_SIZE = 10;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAdminJson("/users", { page, size: PAGE_SIZE, sort: "createdAt,DESC", status: statusFilter, keyword: appliedKeyword })
      .then((json) => { if (!cancelled) { setRows(json.content ?? []); setTotalPages(json.totalPages ?? 0); } })
      .catch(() => { if (!cancelled) setRows([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, statusFilter, appliedKeyword]);

  const columns = [
    { key: "name", label: "이름", render: (r) => (<><strong>{r.name}</strong><em>{r.email}</em></>) },
    { key: "loginType", label: "로그인 유형" },
    { key: "status", label: "상태", render: (r) => {
      const map = { ACTIVE: "활성", INACTIVE: "비활성" };
      return <StatusBadge text={map[r.status] ?? r.status} />;
    }},
    { key: "createdAt", label: "가입일", width: "90px", render: (r) => formatDate(r.createdAt) },
  ];

  const statusOptions = [
    { value: "", label: "전체 상태" },
    { value: "ACTIVE", label: "활성" },
    { value: "INACTIVE", label: "비활성" },
  ];

  return (
    <section className="admin-panel admin-panel--list">
      <div className="admin-panel__header"><h2>회원 목록</h2></div>
      <FilterBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        onSearch={() => { setPage(0); setAppliedKeyword(keyword); }}
        selects={[{ key: "status", value: statusFilter, onChange: (v) => { setStatusFilter(v); setPage(0); }, options: statusOptions }]}
      />
      {loading
        ? <p className="admin-empty-text">불러오는 중...</p>
        : <AdminTable columns={columns} rows={rows.map((r) => ({ ...r, _key: r.userNo }))} emptyText="회원이 없습니다." />
      }
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </section>
  );
}

// ── 새 요청 패널 (SSE 실시간) ─────────────────────────────────────────────────
function RequestsPanel({ onNavigate }) {
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const DETAIL_PATH = {
    FOUNDATION: (id) => `/admin/foundation/${id}`,
    CAMPAIGN: (id) => `/admin/campaign/${id}`,
    FINAL_REPORT: (id) => `/admin/report/${id}`,
  };

  useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    async function connect() {
      const token = window.localStorage.getItem("adminAccessToken");
      if (!token) { setError("로그인이 필요합니다."); return; }

      try {
        const res = await fetch("/admin-api/subscribe", {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        if (res.status === 401) { window.location.href = "/admin/login"; return; }
        if (!res.ok) { setError(`연결 오류: HTTP ${res.status}`); return; }

        setConnected(true);
        setError(null);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });

          const blocks = buf.split("\n\n");
          buf = blocks.pop();

          for (const block of blocks) {
            const lines = block.split("\n");
            let eventType = "";
            let dataStr = "";
            for (const line of lines) {
              if (line.startsWith("event:")) eventType = line.slice(6).trim();
              if (line.startsWith("data:")) dataStr = line.slice(5).trim();
            }
            if (eventType === "approval-request" && dataStr) {
              try {
                const payload = JSON.parse(dataStr);
                setEvents((prev) => [{ ...payload, _id: Date.now() + Math.random(), receivedAt: new Date() }, ...prev].slice(0, 100));
              } catch { /* ignore malformed */ }
            }
          }
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setConnected(false);
          setError("SSE 연결이 끊어졌습니다. 페이지를 새로고침 하세요.");
        }
      } finally {
        setConnected(false);
      }
    }

    connect();
    return () => { abortRef.current?.abort(); };
  }, []);

  return (
    <section className="admin-panel admin-panel--list">
      <div className="admin-panel__header">
        <h2>
          새 요청
          <span className={`admin-sse-dot ${connected ? "admin-sse-dot--on" : "admin-sse-dot--off"}`} title={connected ? "연결됨" : "연결 끊김"} />
        </h2>
        {events.length > 0 && (
          <button type="button" className="admin-row-btn" onClick={() => setEvents([])}>전체 삭제</button>
        )}
      </div>
      {error && <p className="admin-empty-text" style={{ color: "#dc2626", padding: "12px 20px" }}>{error}</p>}
      {!error && events.length === 0 && (
        <p className="admin-empty-text" style={{ padding: "40px 20px" }}>
          {connected ? "실시간 대기 중... 새 승인 요청이 들어오면 여기에 표시됩니다." : "SSE 연결 중..."}
        </p>
      )}
      {events.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: "100px" }}>유형</th>
                <th>메시지</th>
                <th style={{ width: "90px" }}>수신 시각</th>
                <th style={{ width: "60px" }}>이동</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev._id}>
                  <td><StatusBadge text={ev.targetType} /></td>
                  <td><strong>{ev.message}</strong></td>
                  <td style={{ fontSize: "12px", color: "#64748b" }}>
                    {ev.receivedAt.toLocaleTimeString("ko-KR")}
                  </td>
                  <td>
                    {DETAIL_PATH[ev.targetType] && (
                      <button type="button" className="admin-row-btn"
                        onClick={() => onNavigate?.(DETAIL_PATH[ev.targetType](ev.targetId))}>
                        상세
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ── 비활성화 단체 패널 ────────────────────────────────────────────────────────
function InactivePanel({ onOpenDetail }) {
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const PAGE_SIZE = 10;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAdminJson("/foundation/approved", { accountStatus: "INACTIVE", page, size: PAGE_SIZE, sort: "createdAt,DESC" })
      .then((json) => { if (!cancelled) { setRows(json.content ?? []); setTotalPages(json.totalPages ?? 0); } })
      .catch(() => { if (!cancelled) setRows([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page]);

  const columns = [
    { key: "foundationName", label: "단체명", render: (r) => (<><strong>{r.foundationName}</strong><em>{r.foundationType}</em></>) },
    { key: "representativeName", label: "대표자" },
    { key: "foundationEmail", label: "이메일" },
    { key: "createdAt", label: "등록일", width: "90px", render: (r) => formatDate(r.createdAt) },
    { key: "_action", label: "관리", width: "60px", render: (r) => (
      <button type="button" className="admin-row-btn" onClick={(e) => { e.stopPropagation(); onOpenDetail?.(r.foundationNo); }}>상세</button>
    )},
  ];

  return (
    <section className="admin-panel admin-panel--list">
      <div className="admin-panel__header"><h2>비활성화 단체</h2></div>
      <p className="admin-panel__desc">활동 보고서 미이행 등으로 비활성화된 기부단체 목록입니다.</p>
      {loading
        ? <p className="admin-empty-text">불러오는 중...</p>
        : <AdminTable columns={columns} rows={rows.map((r) => ({ ...r, _key: r.foundationNo }))} emptyText="비활성화 단체가 없습니다." />
      }
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </section>
  );
}

// ── 관리자 로그 패널 (활동 로그 전용) ─────────────────────────────────────────
function LogsHubPanel() {
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState("");
  const [logTargetType, setLogTargetType] = useState("");
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");
  const PAGE_SIZE = 10;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchAdminJson("/logs", { page, size: PAGE_SIZE, sort: "createdAt,DESC", actionType, targetType: logTargetType, keyword: appliedKeyword })
      .then((json) => { if (!cancelled) { setRows(json.content ?? []); setTotalPages(json.totalPages ?? 0); } })
      .catch((e) => { console.error("[AdminLog]", e); if (!cancelled) setRows([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, actionType, logTargetType, appliedKeyword]);

  const columns = [
    { key: "description", label: "내용", render: (r) => <strong>{r.description}</strong> },
    { key: "actionType", label: "액션", width: "90px", render: (r) => <StatusBadge text={r.actionType} /> },
    { key: "targetType", label: "대상", width: "110px", render: (r) => <StatusBadge text={r.targetType} /> },
    { key: "adminName", label: "처리자", width: "80px" },
    { key: "createdAt", label: "처리일", width: "90px", render: (r) => formatDate(r.createdAt) },
  ];

  const actionOptions = [
    { value: "", label: "전체 액션" }, { value: "APPROVE", label: "승인" },
    { value: "REJECT", label: "반려" }, { value: "DISABLE", label: "비활성화" }, { value: "ENABLE", label: "활성화" },
  ];
  const targetOptions = [
    { value: "", label: "전체 대상" }, { value: "FOUNDATION", label: "단체" },
    { value: "CAMPAIGN", label: "캠페인" }, { value: "FINAL_REPORT", label: "활동 보고서" },
  ];

  return (
    <section className="admin-panel admin-panel--list">
      <div className="admin-panel__header"><h2>관리자 활동 로그</h2></div>
      <FilterBar
        keyword={keyword}
        onKeywordChange={setKeyword}
        onSearch={() => { setPage(0); setAppliedKeyword(keyword); }}
        selects={[
          { key: "action", value: actionType, onChange: (v) => { setActionType(v); setPage(0); }, options: actionOptions },
          { key: "target", value: logTargetType, onChange: (v) => { setLogTargetType(v); setPage(0); }, options: targetOptions },
        ]}
      />
      {loading
        ? <p className="admin-empty-text">불러오는 중...</p>
        : <AdminTable columns={columns} rows={rows.map((r, i) => ({ ...r, _key: r.logNo ?? i }))} emptyText="로그가 없습니다." />
      }
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </section>
  );
}

// ── 발송 내역 패널 (이메일 + 알림) ────────────────────────────────────────────
function SendHistoryPanel() {
  const [activeTab, setActiveTab] = useState("emails");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);

  // 이메일 필터
  const [templateType, setTemplateType] = useState("");

  // 알림 필터
  const [recipientType, setRecipientType] = useState("");
  const [notificationType, setNotificationType] = useState("");
  const [isRead, setIsRead] = useState("");
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");

  const PAGE_SIZE = 20;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const fetchPromise = activeTab === "emails"
      ? fetchAdminJson("/email-send-list", { page, size: PAGE_SIZE, sort: "createdAt,DESC", templateType })
      : fetchAdminJson("/notifications", {
          page, size: PAGE_SIZE, sort: "createdAt,DESC",
          recipientType, notificationType,
          ...(isRead !== "" ? { isRead } : {}),
          keyword: appliedKeyword,
        });

    fetchPromise
      .then((json) => { if (!cancelled) { setRows(json.content ?? []); setTotalPages(json.totalPages ?? 0); } })
      .catch((e) => { console.error("[SendHistory]", e); if (!cancelled) setRows([]); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [activeTab, page, templateType, recipientType, notificationType, isRead, appliedKeyword]);

  const resetFilters = () => {
    setPage(0);
    setTemplateType("");
    setRecipientType("");
    setNotificationType("");
    setIsRead("");
    setKeyword("");
    setAppliedKeyword("");
  };

  const emailColumns = [
    { key: "title", label: "제목", render: (r) => <strong>{r.title}</strong> },
    { key: "recipientEmail", label: "수신자" },
    { key: "emailStatus", label: "상태", width: "80px", render: (r) => <StatusBadge text={r.emailStatus} /> },
    { key: "templateType", label: "템플릿", render: (r) => <span style={{ fontSize: "12px", color: "#64748b" }}>{r.templateType}</span> },
    { key: "sentAt", label: "발송일", width: "100px", render: (r) => formatDate(r.sentAt || r.createdAt) },
  ];

  const notifColumns = [
    { key: "content", label: "내용", render: (r) => <strong>{r.content}</strong> },
    { key: "recipientType", label: "수신자 유형", width: "110px", render: (r) => <StatusBadge text={r.recipientType} /> },
    { key: "notificationType", label: "알림 유형", width: "110px", render: (r) => <span style={{ fontSize: "12px", color: "#64748b" }}>{r.notificationType}</span> },
    { key: "isRead", label: "읽음", width: "70px", render: (r) => <StatusBadge text={r.isRead ? "읽음" : "안읽음"} /> },
    { key: "createdAt", label: "발송일", width: "100px", render: (r) => formatDate(r.createdAt) },
  ];

  const templateOptions = [
    { value: "", label: "전체 템플릿" },
    { value: "ACCOUNT_APPROVED", label: "계정 승인" },
    { value: "ACCOUNT_REJECTED", label: "계정 반려" },
    { value: "FOUNDATION_INACTIVE_BATCH", label: "자동 비활성화" },
    { value: "FOUNDATION_DEACTIVATED_BY_ADMIN", label: "관리자 비활성화" },
  ];
  const recipientOptions = [
    { value: "", label: "전체 수신자" },
    { value: "USERS", label: "일반 사용자" },
    { value: "FOUNDATION", label: "재단" },
    { value: "BENEFICIARY", label: "수혜자" },
  ];
  const isReadOptions = [
    { value: "", label: "읽음 여부" },
    { value: "true", label: "읽음" },
    { value: "false", label: "안읽음" },
  ];

  return (
    <section className="admin-panel admin-panel--list">
      <PanelTabs
        tabs={[{ key: "emails", label: "이메일 발송 내역" }, { key: "notifications", label: "알림 내역" }]}
        active={activeTab}
        onChange={(k) => { setActiveTab(k); resetFilters(); }}
      />

      {activeTab === "emails" && (
        <FilterBar
          selects={[{ key: "template", value: templateType, onChange: (v) => { setTemplateType(v); setPage(0); }, options: templateOptions }]}
        />
      )}

      {activeTab === "notifications" && (
        <FilterBar
          keyword={keyword}
          onKeywordChange={setKeyword}
          onSearch={() => { setPage(0); setAppliedKeyword(keyword); }}
          selects={[
            { key: "recipient", value: recipientType, onChange: (v) => { setRecipientType(v); setPage(0); }, options: recipientOptions },
            { key: "isRead", value: isRead, onChange: (v) => { setIsRead(v); setPage(0); }, options: isReadOptions },
          ]}
        />
      )}

      {loading
        ? <p className="admin-empty-text">불러오는 중...</p>
        : <AdminTable
            columns={activeTab === "emails" ? emailColumns : notifColumns}
            rows={rows.map((r, i) => ({ ...r, _key: r.emailQueueNo ?? r.notificationNo ?? i }))}
            emptyText="내역이 없습니다."
          />
      }
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </section>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const activeKey = searchParams.get("tab") ?? "dashboard";
  const activeView = searchParams.get("view") ?? "";
  const [donationDays, setDonationDays] = useState(14);
  const [userDays, setUserDays] = useState(14);

  const adminProfile = useMemo(() => {
    try { return JSON.parse(window.localStorage.getItem("adminProfile") ?? "{}"); }
    catch { return {}; }
  }, []);

  const setActiveKey = (key) => {
    navigate(key === "dashboard" ? "/admin/dashboard" : `/admin/dashboard?tab=${key}`);
  };

  const renderContent = () => {
    if (activeKey === "dashboard") {
      return (
        <DashboardHome
          onNavigate={setActiveKey}
          navigate={navigate}
          donationDays={donationDays}
          userDays={userDays}
          onDonationDaysChange={setDonationDays}
          onUserDaysChange={setUserDays}
        />
      );
    }
    if (activeKey === "foundations") return <FoundationsPanel initialView={activeView} onOpenDetail={(no) => navigate(`/admin/foundation/${no}`)} />;
    if (activeKey === "campaigns") return <CampaignsPanel initialView={activeView} onOpenDetail={(item) => navigate(`/admin/campaign/${item.campaignNo}`, { state: { record: item } })} />;
    if (activeKey === "reports") return <ReportsPanel initialView={activeView} onOpenDetail={(item) => navigate(`/admin/report/${item.reportNo}`, { state: { record: item } })} />;
    if (activeKey === "inactive") return <InactivePanel onOpenDetail={(no) => navigate(`/admin/foundation/${no}`)} />;
    if (activeKey === "members") return <MembersPanel />;
    if (activeKey === "requests") return <RequestsPanel onNavigate={(path) => navigate(path)} />;
    if (activeKey === "logs") return <LogsHubPanel />;
    if (activeKey === "send-history") return <SendHistoryPanel />;
    return null;
  };

  const pageTitle = PAGE_TITLES[activeKey] ?? "대시보드";

  return (
    <>
      <header className="admin-dashboard-topbar">
        <div className="admin-dashboard-topbar__title">
          <h1>{pageTitle}</h1>
        </div>
        <div className="admin-dashboard-topbar__profile">
          <div>
            <strong>{adminProfile?.name ?? "관리자"}</strong>
            <span>{adminProfile?.adminRole ?? "ADMIN"}</span>
          </div>
          <div className="admin-dashboard-topbar__avatar">{(adminProfile?.name ?? "A").slice(0, 1)}</div>
        </div>
      </header>
      <main className="admin-dashboard-content">{renderContent()}</main>
    </>
  );
}
