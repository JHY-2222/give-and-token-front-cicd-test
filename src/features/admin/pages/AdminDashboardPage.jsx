import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  LogOut,
  Megaphone,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getAdminApiUrl, getAdminAuthHeaders, logoutAdmin } from "../util";
import "../css/AdminDashboardPage.css";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Donation" },
  { key: "foundations", label: "Foundation", icon: BriefcaseBusiness, section: "Donation" },
  { key: "campaigns", label: "Campaign", icon: Megaphone, section: "Donation" },
  { key: "reports", label: "Report", icon: FileText, section: "Donation" },
  { key: "inactive", label: "Inactive", icon: ShieldCheck, section: "Donation" },
  { key: "members", label: "Users", icon: Users, section: "Operations" },
  { key: "requests", label: "새 요청", icon: Bell, section: "Operations" },
  { key: "logs", label: "Admin Logs", icon: BarChart3, section: "Operations" },
];

const SECTION_ENDPOINTS = {
  campaigns: "/campaigns/pending?page=0&size=10",
  reports: "/reports/pending?page=0&size=10",
  inactive: "/foundation/rejected?page=0&size=10",
  members: "/users?page=0&size=10",
  requests: "/foundation/applications?page=0&size=20",
  logs: "/logs?page=0&size=10",
};

function formatCurrency(value) {
  const num = Number(value ?? 0);
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(num) ? num : 0);
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("ko-KR");
}

function normalizePageContent(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.content)) return payload.content;
  return [];
}

async function fetchAdminJson(path) {
  const response = await fetch(getAdminApiUrl(path), {
    method: "GET",
    headers: getAdminAuthHeaders(),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `Request failed (${response.status})`);
  }

  return response.json();
}

function parseSseChunk(chunk) {
  const lines = chunk.split("\n");
  let eventName = "message";
  const dataLines = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (trimmed.startsWith("event:")) {
      eventName = trimmed.slice(6).trim();
      return;
    }
    if (trimmed.startsWith("data:")) {
      dataLines.push(trimmed.slice(5).trim());
    }
  });

  const rawData = dataLines.join("\n");
  let data = rawData;
  if (rawData) {
    try {
      data = JSON.parse(rawData);
    } catch {
      data = rawData;
    }
  }

  return { eventName, data };
}

async function streamAdminSse(onEvent, signal) {
  const response = await fetch(getAdminApiUrl("/subscribe"), {
    method: "GET",
    headers: getAdminAuthHeaders({
      Accept: "text/event-stream",
      "Cache-Control": "no-cache",
    }),
    signal,
  });

  if (!response.ok || !response.body) {
    const errorText = await response.text().catch(() => "");
    throw new Error(errorText || `SSE failed (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (!signal.aborted) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";
    chunks.forEach((chunk) => onEvent(parseSseChunk(chunk)));
  }
}

function mapApprovalEventToRecentLog(data) {
  if (!data || typeof data !== "object") return null;
  return {
    logNo: `sse-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    targetType: data.targetType ?? "REQUEST",
    description: data.message ?? "New approval request arrived.",
    createdAt: new Date().toISOString(),
  };
}

function buildLinePath(points) {
  if (!points.length) return "";
  const w = 760;
  const h = 320;
  const padX = 40;
  const padY = 24;
  const amounts = points.map((item) => Number(item?.amount ?? 0));
  const maxAmount = Math.max(...amounts, 1);
  const stepX = points.length > 1 ? (w - padX * 2) / (points.length - 1) : 0;

  return points
    .map((point, index) => {
      const x = padX + stepX * index;
      const y = h - padY - (Number(point?.amount ?? 0) / maxAmount) * (h - padY * 2);
      return `${index === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");
}

function buildDonutGradient(ratios) {
  const total = ratios.reduce((acc, item) => acc + Number(item?.donationAmount ?? 0), 0);
  const safeTotal = total > 0 ? total : 1;
  const colors = ["#3b82f6", "#60a5fa", "#2563eb", "#93c5fd", "#1d4ed8", "#0ea5e9"];
  let offset = 0;

  const segments = ratios.map((item, index) => {
    const ratio = (Number(item?.donationAmount ?? 0) / safeTotal) * 100;
    const start = offset;
    const end = offset + ratio;
    offset = end;
    return `${colors[index % colors.length]} ${start}% ${end}%`;
  });

  if (!segments.length) return "conic-gradient(#dbeafe 0% 100%)";
  return `conic-gradient(${segments.join(", ")})`;
}

function SidebarSection({ title, items, activeKey, onSelect }) {
  return (
    <div className="admin-dashboard-sidebar__section">
      <p className="admin-dashboard-sidebar__section-title">{title}</p>
      <div className="admin-dashboard-sidebar__list">
        {items.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={`admin-dashboard-sidebar__item ${activeKey === key ? "is-active" : ""}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const CATEGORY_COLORS = ["#3b82f6", "#60a5fa", "#2563eb", "#93c5fd", "#1d4ed8", "#0ea5e9"];

function DashboardHome({ dashboardData, loading, error, onNavigate }) {
  const summary = dashboardData.summary ?? {};
  const trend = dashboardData.trend ?? [];
  const categories = dashboardData.categoryRatio ?? [];
  const recentLogs = dashboardData.recentLogs ?? [];
  const activityLogs = dashboardData.activityLogs ?? [];
  const [tooltip, setTooltip] = useState(null);

  if (loading) {
    return (
      <section className="admin-dashboard-panel admin-dashboard-placeholder">
        <h2>Loading dashboard data...</h2>
        <p>Please wait a moment.</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="admin-dashboard-panel admin-dashboard-placeholder">
        <h2>Dashboard load failed</h2>
        <p>{error}</p>
      </section>
    );
  }

  return (
    <div className="admin-dashboard-content__stack">
      <section className="admin-dashboard-summary-grid">
        <article className="admin-dashboard-summary-card">
          <p>오늘 기부액</p>
          <strong style={{ color: "#2563eb" }}>{formatCurrency(summary.todayDonationAmount)}</strong>
        </article>
        <article className="admin-dashboard-summary-card">
          <p>진행 중 캠페인</p>
          <strong style={{ color: "#38bdf8" }}>{Number(summary.activeCampaignCount ?? 0).toLocaleString("ko-KR")}</strong>
        </article>
        <article className="admin-dashboard-summary-card">
          <p>신규 단체 신청</p>
          <strong style={{ color: "#1d4ed8" }}>{Number(summary.pendingFoundationCount ?? 0).toLocaleString("ko-KR")}</strong>
        </article>
        <article className="admin-dashboard-summary-card">
          <p>달성 비율</p>
          <strong style={{ color: "#0891b2" }}>{Number(summary.achievedCampaignRatio ?? 0).toFixed(1)}%</strong>
        </article>
        <article className="admin-dashboard-summary-card">
          <p>전체 누적 기부액</p>
          <strong style={{ color: "#7c3aed" }}>{formatCurrency(summary.totalDonationAmount)}</strong>
          <span className="admin-dashboard-summary-card__sub">{Number(summary.totalUserCount ?? 0).toLocaleString("ko-KR")}명</span>
        </article>
      </section>

      <section className="admin-dashboard-main-grid">
        <div className="admin-dashboard-left-panels">
          <article className="admin-dashboard-panel admin-dashboard-panel--chart">
            <div className="admin-dashboard-panel__header">
              <h2>Donation Trend</h2>
              <span className="admin-dashboard-chip">Last 14 days</span>
            </div>
            <div className="admin-dashboard-line-chart">
              {trend.length ? (
                <>
                  <svg
                    viewBox="0 0 760 320"
                    aria-hidden="true"
                    style={{ cursor: "crosshair" }}
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const svgX = ((e.clientX - rect.left) / rect.width) * 760;
                      const padX = 40;
                      const padY = 24;
                      const w = 760;
                      const h = 320;
                      const stepX = trend.length > 1 ? (w - padX * 2) / (trend.length - 1) : 0;
                      const idx = Math.min(Math.max(Math.round((svgX - padX) / (stepX || 1)), 0), trend.length - 1);
                      const point = trend[idx];
                      const amounts = trend.map((t) => Number(t?.amount ?? 0));
                      const maxAmount = Math.max(...amounts, 1);
                      const x = padX + stepX * idx;
                      const y = h - padY - (Number(point?.amount ?? 0) / maxAmount) * (h - padY * 2);
                      setTooltip({ x, y, xPct: (x / w) * 100, yPct: (y / h) * 100, label: point?.date ?? "-", amount: Number(point?.amount ?? 0) });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    <path d={buildLinePath(trend)} fill="none" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" />
                    {tooltip && (
                      <>
                        <line x1={tooltip.x} y1={0} x2={tooltip.x} y2={320} stroke="#dbeafe" strokeWidth={1.5} strokeDasharray="4 3" />
                        <circle cx={tooltip.x} cy={tooltip.y} r={6} fill="#2563eb" stroke="#fff" strokeWidth={2} />
                      </>
                    )}
                  </svg>
                  {tooltip && (
                    <div
                      className="admin-dashboard-chart-bubble"
                      style={{ left: `${tooltip.xPct}%`, top: `${tooltip.yPct}%` }}
                    >
                      <span>{tooltip.label}</span>
                      <strong>{formatCurrency(tooltip.amount)}</strong>
                    </div>
                  )}
                </>
              ) : (
                <p className="admin-dashboard-empty-text">No trend data.</p>
              )}
            </div>
          </article>

          <article className="admin-dashboard-panel">
            <div className="admin-dashboard-panel__header">
              <h2>활동 로그</h2>
              <button type="button" className="admin-dashboard-detail-btn" onClick={() => onNavigate?.("logs")}>
                자세히 보기
              </button>
            </div>
            <div className="admin-dashboard-activity-list">
              {activityLogs.length ? (
                activityLogs.slice(0, 3).map((log) => (
                  <div key={log.logNo ?? `${log.actionType}-${log.createdAt}`} className="admin-dashboard-activity-item">
                    <span className="admin-dashboard-activity-item__type">{log.actionType || log.targetType || "LOG"}</span>
                    <p className="admin-dashboard-activity-item__desc">{log.description ?? "-"}</p>
                    <span className="admin-dashboard-activity-item__date">{formatDate(log.createdAt)}</span>
                  </div>
                ))
              ) : (
                <p className="admin-dashboard-empty-text">No activity logs.</p>
              )}
            </div>
          </article>
        </div>

        <div className="admin-dashboard-side-panels">
          <article className="admin-dashboard-panel">
            <div className="admin-dashboard-panel__header">
              <h2>Category Ratio</h2>
            </div>
            <div className="admin-dashboard-donut">
              <div className="admin-dashboard-donut__ring" style={{ background: buildDonutGradient(categories) }} />
              <div className="admin-dashboard-donut__legend">
                {categories.length ? (
                  categories.slice(0, 6).map((item, index) => (
                    <div key={item.category} className="admin-dashboard-category-row">
                      <span className="admin-dashboard-category-row__label">
                        <i style={{ background: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }} />
                        {item.categoryLabel || item.category || "Other"}
                      </span>
                      <span className="admin-dashboard-category-row__amount">{formatCurrency(item.donationAmount)}</span>
                      {item.campaignCount != null && (
                        <span className="admin-dashboard-category-row__count">{item.campaignCount}건</span>
                      )}
                    </div>
                  ))
                ) : (
                  <span>No category data.</span>
                )}
              </div>
            </div>
          </article>

          <article className="admin-dashboard-panel">
            <div className="admin-dashboard-panel__header">
              <h2>최근 요청</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="admin-dashboard-badge">LIVE</span>
                <button type="button" className="admin-dashboard-detail-btn" onClick={() => onNavigate?.("requests")}>
                  자세히 보기
                </button>
              </div>
            </div>
            <div className="admin-dashboard-request-list">
              {recentLogs.length ? (
                recentLogs.slice(0, 5).map((log) => (
                  <div key={log.logNo ?? `${log.targetType}-${log.createdAt}`} className="admin-dashboard-request-row">
                    <span className="admin-dashboard-request-row__type">{log.targetType ?? "INFO"}</span>
                    <span className="admin-dashboard-request-row__desc">{log.description ?? "New request arrived."}</span>
                    <span className="admin-dashboard-request-row__date">{formatDate(log.createdAt)}</span>
                  </div>
                ))
              ) : (
                <p className="admin-dashboard-empty-text">No recent logs.</p>
              )}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}

function foundationStatusText(item) {
  if (item.accountStatus === "ACTIVE") return "ACTIVE";
  if (item.accountStatus === "INACTIVE") return "INACTIVE";
  return "PENDING";
}

function FoundationsPanel({
  mode,
  onChangeMode,
  manageRows,
  approvalRows,
  loading,
  error,
  onOpenDetail,
}) {
  const rows = mode === "manage" ? manageRows : approvalRows;

  return (
    <section className="admin-dashboard-panel admin-dashboard-foundations">
      <div className="admin-dashboard-foundations__tabs">
        <button
          type="button"
          className={`admin-dashboard-foundations__tab ${mode === "manage" ? "is-active" : ""}`}
          onClick={() => onChangeMode("manage")}
        >
          Foundation Cards
        </button>
        <button
          type="button"
          className={`admin-dashboard-foundations__tab ${mode === "approvals" ? "is-active" : ""}`}
          onClick={() => onChangeMode("approvals")}
        >
          New Registrations
        </button>
      </div>

      {loading ? <p className="admin-dashboard-empty-text">Loading foundation data...</p> : null}
      {error ? <p className="admin-dashboard-empty-text">{error}</p> : null}

      {!loading && !error && mode === "manage" ? (
        <div className="admin-foundation-card-grid">
          {rows.length ? (
            rows.map((item) => (
              <button
                key={item.foundationNo}
                type="button"
                className="admin-foundation-card"
                onClick={() => onOpenDetail(item.foundationNo)}
              >
                <div className="admin-foundation-card__top">
                  <div className="admin-foundation-card__identity">
                    {item.profilePath ? (
                      <img src={item.profilePath} alt="" className="admin-foundation-card__avatar" />
                    ) : (
                      <div className="admin-foundation-card__avatar admin-foundation-card__avatar--fallback">
                        {(item.foundationName ?? "G").slice(0, 1)}
                      </div>
                    )}
                    <div>
                      <strong>{item.foundationName}</strong>
                      <p>{item.foundationEmail || "-"}</p>
                    </div>
                  </div>
                  <span className="admin-foundation-card__status">{foundationStatusText(item)}</span>
                </div>
                <div className="admin-foundation-card__footer">View details</div>
              </button>
            ))
          ) : (
            <p className="admin-dashboard-empty-text">No foundations found.</p>
          )}
        </div>
      ) : null}

      {!loading && !error && mode === "approvals" ? (
        <div className="admin-foundation-table">
          <div className="admin-foundation-table__head">
            <span>Name</span>
            <span>Representative</span>
            <span>Created</span>
            <span>Review Status</span>
            <span>Action</span>
          </div>
          {rows.length ? (
            rows.map((item) => (
              <div key={item.foundationNo} className="admin-foundation-table__row">
                <div className="admin-foundation-table__name">
                  <strong>{item.foundationName}</strong>
                  {item.foundationType ? <em>{item.foundationType}</em> : null}
                </div>
                <span>{item.representativeName || "-"}</span>
                <span>{formatDate(item.createdAt)}</span>
                <div className="admin-foundation-table__badges">
                  <span className="admin-foundation-table__badge blue">{item.reviewStatus || "-"}</span>
                </div>
                <button type="button" onClick={() => onOpenDetail(item.foundationNo)}>
                  Detail
                </button>
              </div>
            ))
          ) : (
            <p className="admin-dashboard-empty-text">No approval targets.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}

function normalizeTabRows(key, rows) {
  return rows.map((row) => {
    if (key === "campaigns") {
      return {
        id: row.campaignNo,
        title: row.title,
        sub: row.category || row.foundationName || "-",
        status: row.approvalStatus,
        date: row.createdAt,
      };
    }

    if (key === "reports") {
      return {
        id: row.reportNo,
        title: row.title,
        sub: row.usagePurpose || `Campaign #${row.campaignNo ?? "-"}`,
        status: row.approvalStatus,
        date: row.createdAt,
      };
    }

    if (key === "inactive") {
      return {
        id: row.foundationNo,
        title: row.foundationName,
        sub: row.representativeName || row.foundationEmail,
        status: row.reviewStatus || row.accountStatus,
        date: row.createdAt,
      };
    }

    if (key === "requests") {
      return {
        id: row.foundationNo,
        title: row.foundationName,
        sub: row.representativeName || row.foundationEmail || "-",
        status: row.reviewStatus || "PENDING",
        date: row.createdAt,
      };
    }

    if (key === "members") {
      return {
        id: row.userNo,
        title: row.name || row.email,
        sub: row.email || row.loginType || "-",
        status: row.status,
        date: row.createdAt,
      };
    }

    if (key === "logs") {
      return {
        id: row.logNo,
        title: row.description || `${row.actionType ?? ""} ${row.targetType ?? ""}`.trim(),
        sub: row.adminName || row.adminId || "-",
        status: row.actionType,
        date: row.createdAt,
      };
    }

    return {
      id: row.id ?? row.no ?? Math.random(),
      title: row.title || "-",
      sub: row.description || "-",
      status: row.status || "-",
      date: row.createdAt || row.date,
    };
  });
}

function ListPanel({ title, description, rows, loading, error }) {
  return (
    <section className="admin-dashboard-panel admin-dashboard-list-panel">
      <div className="admin-dashboard-panel__header">
        <h2>{title}</h2>
      </div>
      <p className="admin-dashboard-list-panel__desc">{description}</p>

      {loading ? <p className="admin-dashboard-empty-text">Loading list...</p> : null}
      {error ? <p className="admin-dashboard-empty-text">{error}</p> : null}

      {!loading && !error ? (
        <div className="admin-dashboard-list">
          {rows.length ? (
            rows.map((item) => (
              <article key={`${item.id}-${item.date ?? ""}`} className="admin-dashboard-list__item">
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.sub}</p>
                </div>
                <div className="admin-dashboard-list__meta">
                  <span className="admin-dashboard-list__status">{item.status ?? "-"}</span>
                  <span>{formatDate(item.date)}</span>
                </div>
              </article>
            ))
          ) : (
            <p className="admin-dashboard-empty-text">No data found.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeKey, setActiveKey] = useState("dashboard");
  const [foundationMode, setFoundationMode] = useState("manage");

  const [dashboardData, setDashboardData] = useState({
    summary: null,
    trend: [],
    categoryRatio: [],
    recentLogs: [],
    activityLogs: [],
  });
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const [foundationData, setFoundationData] = useState({ manage: [], approvals: [] });
  const [foundationLoading, setFoundationLoading] = useState(false);
  const [foundationError, setFoundationError] = useState("");

  const [sectionData, setSectionData] = useState({});
  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionError, setSectionError] = useState("");

  const groupedItems = useMemo(
    () =>
      NAV_ITEMS.reduce((acc, item) => {
        acc[item.section] = [...(acc[item.section] ?? []), item];
        return acc;
      }, {}),
    [],
  );

  const adminProfile = useMemo(() => {
    try {
      return JSON.parse(window.localStorage.getItem("adminProfile") ?? "{}");
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        setDashboardLoading(true);
        setDashboardError("");

        const [summary, trend, categoryRatio, recentLogsPage, activityLogsPage] = await Promise.all([
          fetchAdminJson("/dashboard/summary"),
          fetchAdminJson("/dashboard/donation-trend?days=14"),
          fetchAdminJson("/dashboard/category-ratio"),
          fetchAdminJson("/dashboard/recent-logs?page=0&size=10"),
          fetchAdminJson("/logs?page=0&size=3"),
        ]);

        if (cancelled) return;

        setDashboardData({
          summary,
          trend: Array.isArray(trend) ? trend : [],
          categoryRatio: Array.isArray(categoryRatio) ? categoryRatio : [],
          recentLogs: normalizePageContent(recentLogsPage),
          activityLogs: normalizePageContent(activityLogsPage),
        });
      } catch (error) {
        if (!cancelled) setDashboardError(error.message || "Dashboard load error.");
      } finally {
        if (!cancelled) setDashboardLoading(false);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const token = window.localStorage.getItem("adminAccessToken");
    if (!token) return undefined;

    const controller = new AbortController();
    streamAdminSse(({ eventName, data }) => {
      if (eventName === "connect" || eventName === "ping") return;
      if (eventName !== "approval-request") return;

      const nextLog = mapApprovalEventToRecentLog(data);
      if (!nextLog) return;

      setDashboardData((prev) => ({
        ...prev,
        recentLogs: [nextLog, ...(prev.recentLogs ?? [])].slice(0, 10),
      }));
    }, controller.signal).catch((error) => {
      if (!controller.signal.aborted) console.error("SSE error:", error);
    });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (activeKey !== "foundations") return;
    if (foundationData.manage.length || foundationData.approvals.length) return;

    let cancelled = false;

    async function loadFoundations() {
      try {
        setFoundationLoading(true);
        setFoundationError("");

        const [approvedPage, applicationsPage] = await Promise.all([
          fetchAdminJson("/foundation/approved?accountStatus=ACTIVE&page=0&size=12"),
          fetchAdminJson("/foundation/applications?page=0&size=20"),
        ]);

        if (cancelled) return;

        setFoundationData({
          manage: normalizePageContent(approvedPage),
          approvals: normalizePageContent(applicationsPage),
        });
      } catch (error) {
        if (!cancelled) setFoundationError(error.message || "Foundation load error.");
      } finally {
        if (!cancelled) setFoundationLoading(false);
      }
    }

    loadFoundations();
    return () => {
      cancelled = true;
    };
  }, [activeKey, foundationData.approvals.length, foundationData.manage.length]);

  useEffect(() => {
    if (activeKey === "dashboard" || activeKey === "foundations") return;
    if (!SECTION_ENDPOINTS[activeKey]) return;

    let cancelled = false;

    async function loadSection() {
      try {
        setSectionLoading(true);
        setSectionError("");

        const payload = await fetchAdminJson(SECTION_ENDPOINTS[activeKey]);
        const rows = normalizePageContent(payload);

        if (cancelled) return;

        setSectionData((prev) => ({
          ...prev,
          [activeKey]: normalizeTabRows(activeKey, rows),
        }));
      } catch (error) {
        if (!cancelled) setSectionError(error.message || "Section load error.");
      } finally {
        if (!cancelled) setSectionLoading(false);
      }
    }

    loadSection();
    const intervalId = setInterval(loadSection, 30_000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [activeKey]);

  const handleLogout = async () => {
    try {
      const response = await logoutAdmin();
      if (!response.ok) throw new Error("Logout failed");
      window.localStorage.removeItem("adminAccessToken");
      window.localStorage.removeItem("adminProfile");
      navigate("/admin/login");
    } catch (error) {
      console.error(error);
      window.alert("Logout request failed. Please retry.");
    }
  };

  const pageTitle = NAV_ITEMS.find((item) => item.key === activeKey)?.label ?? "Dashboard";

  const renderContent = () => {
    if (activeKey === "dashboard") {
      return <DashboardHome dashboardData={dashboardData} loading={dashboardLoading} error={dashboardError} onNavigate={setActiveKey} />;
    }

    if (activeKey === "foundations") {
      return (
        <FoundationsPanel
          mode={foundationMode}
          onChangeMode={setFoundationMode}
          manageRows={foundationData.manage}
          approvalRows={foundationData.approvals}
          loading={foundationLoading}
          error={foundationError}
          onOpenDetail={(foundationNo) => navigate(`/admin/foundation/${foundationNo}`)}
        />
      );
    }

    const rows = sectionData[activeKey] ?? [];
    return (
      <ListPanel
        title={pageTitle}
        description="Fetched from admin controller GET endpoints."
        rows={rows}
        loading={sectionLoading}
        error={sectionError}
      />
    );
  };

  return (
    <div className="admin-dashboard-page">
      <aside className="admin-dashboard-sidebar">
        <div className="admin-dashboard-sidebar__brand">
          <div className="admin-dashboard-sidebar__logo">g</div>
          <div>
            <strong>giva N token</strong>
            <span>Admin Console</span>
          </div>
        </div>

        {Object.entries(groupedItems).map(([section, items]) => (
          <SidebarSection key={section} title={section} items={items} activeKey={activeKey} onSelect={setActiveKey} />
        ))}

        <button type="button" className="admin-dashboard-sidebar__logout" onClick={handleLogout}>
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      <div className="admin-dashboard-main">
        <header className="admin-dashboard-topbar">
          <div className="admin-dashboard-topbar__title">
            <h1>{pageTitle}</h1>
          </div>

          <div className="admin-dashboard-topbar__profile">
            <div>
              <strong>{adminProfile?.name ?? "Admin"}</strong>
              <span>{adminProfile?.adminRole ?? "Admin"}</span>
            </div>
            <div className="admin-dashboard-topbar__avatar">{(adminProfile?.name ?? "A").slice(0, 1)}</div>
          </div>
        </header>

        <main className="admin-dashboard-content">{renderContent()}</main>
      </div>
    </div>
  );
}
