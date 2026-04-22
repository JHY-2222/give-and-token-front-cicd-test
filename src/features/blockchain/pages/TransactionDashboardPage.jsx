import { useEffect, useState } from "react";
import Pagination from "../components/Pagination";
import StatCard from "../components/StatCard";
import TransactionTable from "../components/TransactionTable";
import {
  getCachedTransactions,
  getDashboardOverview,
  getTransactions
} from "../api/blockchainApi";

function BlockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3 19.5 7.2v9.6L12 21l-7.5-4.2V7.2L12 3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 3v18M4.5 7.2 12 11.4l7.5-4.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.7v4.8l3.2 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.3 2.9h5.4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function TransferIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 8h12.2m0 0-2.8-2.8M16.2 8l-2.8 2.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 16H7.8m0 0 2.8-2.8M7.8 16l2.8 2.8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18.8" cy="8" r="1.2" fill="currentColor" />
      <circle cx="5.2" cy="16" r="1.2" fill="currentColor" />
    </svg>
  );
}

function TokenIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.2v9.6M14.8 9.4c0-1.2-1.1-2.2-2.8-2.2-1.6 0-2.8.8-2.8 2.1 0 1.2.9 1.8 2.9 2.2 2 .4 2.8 1 2.8 2.2 0 1.3-1.2 2.1-2.9 2.1-1.7 0-3-.8-3-2.2" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatLocaleNumber(value, options) {
  const numericValue = Number(value || 0);

  if (!Number.isFinite(numericValue)) {
    return "0";
  }

  return numericValue.toLocaleString("ko-KR", options);
}

function toBigIntValue(value) {
  if (typeof value === "bigint") {
    return value;
  }

  if (typeof value === "string" && /^\d+$/.test(value)) {
    return BigInt(value);
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return BigInt(Math.trunc(value));
  }

  return null;
}

function formatTokenAmount(value) {
  const raw = toBigIntValue(value);

  if (raw === null) {
    return `${formatLocaleNumber(value)} GNT`;
  }
  return `${raw.toLocaleString("ko-KR")} GNT`;
}

function TransactionDashboardPage() {
  const DASHBOARD_PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], pageInfo: null });
  const [overview, setOverview] = useState({
    latestBlock: 0,
    avgBlockTimeSec: 0,
    totalTransactions: 0,
    tokenAmount: 0,
    tokenDecimals: 18
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [overviewError, setOverviewError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function loadTransactions() {
      const cachedResponse = getCachedTransactions({ page, pageSize: DASHBOARD_PAGE_SIZE });

      if (!ignore && cachedResponse) {
        setData(cachedResponse);
        setLoading(false);
      }

      try {
        if (!cachedResponse) {
          setLoading(true);
        }
        setError("");
        const response = await getTransactions({ page, pageSize: DASHBOARD_PAGE_SIZE });

        if (!ignore) {
          setData(response);
        }
      } catch {
        if (!ignore) {
          setError("트랜잭션 목록을 불러오지 못했습니다.");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadTransactions();

    return () => {
      ignore = true;
    };
  }, [page]);

  useEffect(() => {
    let ignore = false;

    async function loadOverview() {
      try {
        setOverviewError("");
        const overviewResponse = await getDashboardOverview();

        if (!ignore) {
          setOverview(overviewResponse);
        }
      } catch {
        if (!ignore) {
          setOverviewError("대시보드 요약 정보를 불러오지 못했습니다.");
        }
      }
    }

    loadOverview();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <section>
      <div className="dashboard-hero">
        <div className="stats-grid stats-grid--hero">
          <StatCard
            className="stat-card--wide"
            label="Latest Block"
            value={formatLocaleNumber(overview.latestBlock)}
            helper="가장 최근 블록 번호"
            icon={<BlockIcon />}
          />
          <StatCard
            className="stat-card--square"
            label="Avg Block Time"
            value={`${formatLocaleNumber(overview.avgBlockTimeSec, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} sec`}
            helper="최근 블록 간 평균 생성 시간"
            icon={<ClockIcon />}
          />
          <StatCard
            className="stat-card--square"
            label="Total Tx"
            value={formatLocaleNumber(overview.totalTransactions)}
            helper="트랜잭션 수"
            icon={<TransferIcon />}
          />
          <StatCard
            className="stat-card--wide"
            label="Token Amount"
            value={formatTokenAmount(overview.tokenAmount)}
            helper="성공한 기부 이벤트 금액 합계"
            icon={<TokenIcon />}
          />
        </div>

        {overviewError && <p className="hero__text">{overviewError}</p>}
      </div>

      <div className="section-heading">
        <div>
          <p className="hero__eyebrow">Transactions</p>
          <h3>최근 트랜잭션</h3>
        </div>
      </div>

      {loading && <div className="panel empty-state">트랜잭션 데이터를 불러오는 중입니다.</div>}
      {error && <div className="panel empty-state">{error}</div>}

      {!loading && !error && (
        <>
          <TransactionTable transactions={data.items} />
          <Pagination pageInfo={data.pageInfo} onPageChange={setPage} />
        </>
      )}
    </section>
  );
}

export default TransactionDashboardPage;

