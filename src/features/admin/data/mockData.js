// ── 대시보드 요약 ──────────────────────────────────────────────────────────────
export const MOCK_SUMMARY = {
  todayDonationAmount: 3_450_000,
  activeCampaignCount: 24,
  pendingFoundationCount: 7,
  achievedCampaignRatio: 68.5,
  totalDonationAmount: 287_650_000,
  totalUserCount: 12_847,
};

// ── 기부금액 추이 (최근 30일) ─────────────────────────────────────────────────
const BASE_DATE = new Date("2026-04-19");
const makeDate = (daysBack) => {
  const d = new Date(BASE_DATE);
  d.setDate(d.getDate() - daysBack);
  return d.toISOString().slice(0, 10);
};

export const MOCK_DONATION_TREND = [
  { date: makeDate(29), amount: 1_200_000 },
  { date: makeDate(28), amount: 2_100_000 },
  { date: makeDate(27), amount: 980_000 },
  { date: makeDate(26), amount: 3_400_000 },
  { date: makeDate(25), amount: 1_750_000 },
  { date: makeDate(24), amount: 4_200_000 },
  { date: makeDate(23), amount: 2_890_000 },
  { date: makeDate(22), amount: 1_640_000 },
  { date: makeDate(21), amount: 3_100_000 },
  { date: makeDate(20), amount: 2_550_000 },
  { date: makeDate(19), amount: 4_800_000 },
  { date: makeDate(18), amount: 3_200_000 },
  { date: makeDate(17), amount: 1_900_000 },
  { date: makeDate(16), amount: 2_700_000 },
  { date: makeDate(15), amount: 5_100_000 },
  { date: makeDate(14), amount: 3_450_000 },
  { date: makeDate(13), amount: 2_200_000 },
  { date: makeDate(12), amount: 4_600_000 },
  { date: makeDate(11), amount: 1_800_000 },
  { date: makeDate(10), amount: 3_900_000 },
  { date: makeDate(9),  amount: 2_400_000 },
  { date: makeDate(8),  amount: 5_500_000 },
  { date: makeDate(7),  amount: 3_100_000 },
  { date: makeDate(6),  amount: 2_800_000 },
  { date: makeDate(5),  amount: 4_200_000 },
  { date: makeDate(4),  amount: 3_600_000 },
  { date: makeDate(3),  amount: 2_900_000 },
  { date: makeDate(2),  amount: 4_100_000 },
  { date: makeDate(1),  amount: 3_800_000 },
  { date: makeDate(0),  amount: 3_450_000 },
];

// ── 카테고리 비율 ──────────────────────────────────────────────────────────────
export const MOCK_CATEGORY_RATIO = [
  { category: "EDUCATION",   categoryLabel: "교육",   donationAmount: 89_500_000, campaignCount: 12 },
  { category: "MEDICAL",     categoryLabel: "의료",   donationAmount: 67_200_000, campaignCount: 8 },
  { category: "WELFARE",     categoryLabel: "복지",   donationAmount: 54_100_000, campaignCount: 15 },
  { category: "ENVIRONMENT", categoryLabel: "환경",   donationAmount: 38_900_000, campaignCount: 7 },
  { category: "CULTURE",     categoryLabel: "문화",   donationAmount: 22_300_000, campaignCount: 5 },
  { category: "OTHER",       categoryLabel: "기타",   donationAmount: 15_650_000, campaignCount: 3 },
];

// ── 회원 가입 추이 (최근 30일) ────────────────────────────────────────────────
export const MOCK_USER_TREND = [
  { date: makeDate(29), count: 42 },
  { date: makeDate(28), count: 67 },
  { date: makeDate(27), count: 38 },
  { date: makeDate(26), count: 95 },
  { date: makeDate(25), count: 51 },
  { date: makeDate(24), count: 120 },
  { date: makeDate(23), count: 73 },
  { date: makeDate(22), count: 44 },
  { date: makeDate(21), count: 88 },
  { date: makeDate(20), count: 62 },
  { date: makeDate(19), count: 140 },
  { date: makeDate(18), count: 91 },
  { date: makeDate(17), count: 55 },
  { date: makeDate(16), count: 78 },
  { date: makeDate(15), count: 160 },
  { date: makeDate(14), count: 102 },
  { date: makeDate(13), count: 68 },
  { date: makeDate(12), count: 135 },
  { date: makeDate(11), count: 47 },
  { date: makeDate(10), count: 110 },
  { date: makeDate(9),  count: 75 },
  { date: makeDate(8),  count: 175 },
  { date: makeDate(7),  count: 98 },
  { date: makeDate(6),  count: 83 },
  { date: makeDate(5),  count: 130 },
  { date: makeDate(4),  count: 115 },
  { date: makeDate(3),  count: 90 },
  { date: makeDate(2),  count: 145 },
  { date: makeDate(1),  count: 122 },
  { date: makeDate(0),  count: 108 },
];

// ── 최근 요청 (SSE 대체) ──────────────────────────────────────────────────────
export const MOCK_RECENT_LOGS = [
  { logNo: 1, actionType: "REQUEST",  targetType: "FOUNDATION",   description: "초록우산 재단 가입 신청",       createdAt: "2026-04-19T10:23:00", targetId: 11 },
  { logNo: 2, actionType: "REQUEST",  targetType: "CAMPAIGN",     description: "아동 급식 지원 캠페인 승인 요청", createdAt: "2026-04-19T09:45:00", targetId: 1 },
  { logNo: 3, actionType: "REQUEST",  targetType: "FINAL_REPORT", description: "2025년 활동 보고서 제출",       createdAt: "2026-04-18T16:30:00", targetId: 1 },
  { logNo: 4, actionType: "REQUEST",  targetType: "FOUNDATION",   description: "사랑의 집 재단 가입 신청",      createdAt: "2026-04-18T14:12:00", targetId: 12 },
  { logNo: 5, actionType: "REQUEST",  targetType: "CAMPAIGN",     description: "노인 돌봄 캠페인 승인 요청",    createdAt: "2026-04-17T11:05:00", targetId: 2 },
];

// ── 활동 로그 ─────────────────────────────────────────────────────────────────
export const MOCK_ACTIVITY_LOGS = [
  { logNo: 101, actionType: "APPROVE", targetType: "FOUNDATION",   description: "복지재단 승인 처리",    adminName: "관리자", createdAt: "2026-04-19T08:30:00" },
  { logNo: 102, actionType: "REJECT",  targetType: "CAMPAIGN",     description: "부적합 캠페인 반려",    adminName: "관리자", createdAt: "2026-04-18T17:20:00" },
  { logNo: 103, actionType: "APPROVE", targetType: "FINAL_REPORT", description: "2024 보고서 승인",     adminName: "관리자", createdAt: "2026-04-18T15:10:00" },
];

// ── 단체 목록 ─────────────────────────────────────────────────────────────────
export const MOCK_FOUNDATIONS_MANAGE = [
  { foundationNo: 1,  foundationName: "초록우산 재단",  representativeName: "김철수", accountStatus: "ACTIVE",         foundationType: "사단법인", createdAt: "2024-01-15" },
  { foundationNo: 2,  foundationName: "사랑의 집",      representativeName: "이영희", accountStatus: "ACTIVE",         foundationType: "재단법인", createdAt: "2024-02-20" },
  { foundationNo: 3,  foundationName: "희망나눔",       representativeName: "박민준", accountStatus: "INACTIVE",       foundationType: "사단법인", createdAt: "2024-03-05" },
  { foundationNo: 4,  foundationName: "행복한 미래",    representativeName: "최지수", accountStatus: "ACTIVE",         foundationType: "재단법인", createdAt: "2024-03-15" },
  { foundationNo: 5,  foundationName: "새빛재단",       representativeName: "정수현", accountStatus: "ACTIVE",         foundationType: "사단법인", createdAt: "2024-04-01" },
  { foundationNo: 6,  foundationName: "나눔과 꿈",      representativeName: "강도현", accountStatus: "PRE_REGISTERED", foundationType: "재단법인", createdAt: "2024-04-10" },
  { foundationNo: 7,  foundationName: "맑은 미래",      representativeName: "윤지현", accountStatus: "ACTIVE",         foundationType: "사단법인", createdAt: "2024-04-15" },
  { foundationNo: 8,  foundationName: "어린이 세상",    representativeName: "장하준", accountStatus: "ACTIVE",         foundationType: "재단법인", createdAt: "2024-04-18" },
  { foundationNo: 9,  foundationName: "푸른 하늘 재단", representativeName: "임소영", accountStatus: "ACTIVE",         foundationType: "사단법인", createdAt: "2025-01-10" },
  { foundationNo: 10, foundationName: "온누리",          representativeName: "신재원", accountStatus: "INACTIVE",       foundationType: "재단법인", createdAt: "2025-03-20" },
];

// ── 단체 가입 신청 ────────────────────────────────────────────────────────────
export const MOCK_FOUNDATIONS_APPROVALS = [
  { foundationNo: 11, foundationName: "별빛재단",      representativeName: "오태준", reviewStatus: "CLEAN",   foundationType: "사단법인", createdAt: "2026-04-17" },
  { foundationNo: 12, foundationName: "푸른 하늘",     representativeName: "임소영", reviewStatus: "PENDING", foundationType: "재단법인", createdAt: "2026-04-18" },
  { foundationNo: 13, foundationName: "온누리 재단",   representativeName: "신재원", reviewStatus: "PENDING", foundationType: "사단법인", createdAt: "2026-04-19" },
  { foundationNo: 14, foundationName: "따뜻한 손길",   representativeName: "홍주영", reviewStatus: "SIMILAR", foundationType: "재단법인", createdAt: "2026-04-19" },
  { foundationNo: 15, foundationName: "초록 지구",     representativeName: "박서진", reviewStatus: "PENDING", foundationType: "사단법인", createdAt: "2026-04-18" },
  { foundationNo: 16, foundationName: "나눔의 빛",     representativeName: "이준혁", reviewStatus: "CLEAN",   foundationType: "재단법인", createdAt: "2026-04-16" },
  { foundationNo: 17, foundationName: "꿈꾸는 아이들", representativeName: "최아람", reviewStatus: "PENDING", foundationType: "사단법인", createdAt: "2026-04-15" },
];

// ── 캠페인 승인 대기 ──────────────────────────────────────────────────────────
export const MOCK_CAMPAIGNS_PENDING = [
  { campaignNo: 1, title: "아동 급식 지원 프로젝트", foundationName: "초록우산 재단", category: "WELFARE",     approvalStatus: "PENDING", createdAt: "2026-04-18" },
  { campaignNo: 2, title: "독거노인 돌봄 서비스",   foundationName: "사랑의 집",     category: "WELFARE",     approvalStatus: "PENDING", createdAt: "2026-04-19" },
  { campaignNo: 3, title: "청소년 교육 지원",        foundationName: "희망나눔",       category: "EDUCATION",   approvalStatus: "PENDING", createdAt: "2026-04-19" },
  { campaignNo: 4, title: "의료 취약계층 지원",      foundationName: "새빛재단",       category: "MEDICAL",     approvalStatus: "PENDING", createdAt: "2026-04-17" },
  { campaignNo: 5, title: "환경 교육 캠페인",        foundationName: "맑은 미래",      category: "ENVIRONMENT", approvalStatus: "PENDING", createdAt: "2026-04-16" },
];

// ── 승인된 캠페인 ────────────────────────────────────────────────────────────
export const MOCK_CAMPAIGNS_APPROVED = [
  { campaignNo: 11, title: "환경 정화 캠페인",       foundationName: "맑은 미래",   category: "ENVIRONMENT", approvalStatus: "APPROVED", createdAt: "2026-03-01" },
  { campaignNo: 12, title: "문화 소외 지역 지원",    foundationName: "행복한 미래", category: "CULTURE",     approvalStatus: "APPROVED", createdAt: "2026-03-10" },
  { campaignNo: 13, title: "장애아동 재활 치료",     foundationName: "어린이 세상", category: "MEDICAL",     approvalStatus: "APPROVED", createdAt: "2026-03-20" },
  { campaignNo: 14, title: "농촌 노인 생활 지원",   foundationName: "나눔과 꿈",   category: "WELFARE",     approvalStatus: "APPROVED", createdAt: "2026-04-01" },
  { campaignNo: 15, title: "다문화 가정 교육 지원",  foundationName: "초록우산 재단", category: "EDUCATION", approvalStatus: "APPROVED", createdAt: "2026-04-05" },
  { campaignNo: 16, title: "저소득층 의료 지원",     foundationName: "새빛재단",    category: "MEDICAL",     approvalStatus: "APPROVED", createdAt: "2026-04-08" },
  { campaignNo: 17, title: "청소년 진로 상담 프로그램", foundationName: "희망나눔", category: "EDUCATION",   approvalStatus: "APPROVED", createdAt: "2026-04-10" },
];

// ── 활동 보고서 ───────────────────────────────────────────────────────────────
export const MOCK_REPORTS = [
  { reportNo: 1, title: "2025년 아동 급식 지원 결과 보고서",   campaignNo: 11, approvalStatus: "PENDING", createdAt: "2026-04-15" },
  { reportNo: 2, title: "환경 정화 캠페인 활동 보고서",        campaignNo: 12, approvalStatus: "PENDING", createdAt: "2026-04-16" },
  { reportNo: 3, title: "청소년 멘토링 프로그램 보고서",       campaignNo: 13, approvalStatus: "PENDING", createdAt: "2026-04-17" },
  { reportNo: 4, title: "다문화 가정 교육 지원 결과 보고서",   campaignNo: 15, approvalStatus: "PENDING", createdAt: "2026-04-18" },
];

// ── 회원 목록 ─────────────────────────────────────────────────────────────────
export const MOCK_MEMBERS = [
  { userNo: 1, name: "김민준", email: "minjun@example.com",   status: "ACTIVE",   loginType: "GOOGLE", createdAt: "2024-01-10" },
  { userNo: 2, name: "이서연", email: "seoyeon@example.com",  status: "ACTIVE",   loginType: "GOOGLE", createdAt: "2024-02-15" },
  { userNo: 3, name: "박지훈", email: "jihun@example.com",    status: "INACTIVE", loginType: "LOCAL",  createdAt: "2024-03-01" },
  { userNo: 4, name: "최수빈", email: "subin@example.com",    status: "ACTIVE",   loginType: "GOOGLE", createdAt: "2024-03-20" },
  { userNo: 5, name: "정하은", email: "haeun@example.com",    status: "ACTIVE",   loginType: "LOCAL",  createdAt: "2024-04-05" },
  { userNo: 6, name: "강도훈", email: "dohun@example.com",    status: "PENDING",  loginType: "GOOGLE", createdAt: "2026-04-19" },
  { userNo: 7, name: "윤아름", email: "areum@example.com",    status: "ACTIVE",   loginType: "GOOGLE", createdAt: "2026-04-18" },
  { userNo: 8, name: "임재원", email: "jaewon@example.com",   status: "ACTIVE",   loginType: "LOCAL",  createdAt: "2026-04-17" },
  { userNo: 9, name: "오승현", email: "seunghyun@example.com",status: "ACTIVE",   loginType: "GOOGLE", createdAt: "2026-04-16" },
  { userNo: 10,name: "한지민", email: "jimin@example.com",    status: "INACTIVE", loginType: "LOCAL",  createdAt: "2026-04-15" },
];

// ── 새 요청 ───────────────────────────────────────────────────────────────────
export const MOCK_REQUESTS = MOCK_FOUNDATIONS_APPROVALS.map((f) => ({
  logNo: f.foundationNo,
  actionType: "REQUEST",
  targetType: "FOUNDATION",
  description: f.foundationName,
  createdAt: f.createdAt,
  targetId: f.foundationNo,
}));

// ── 관리자 로그 ───────────────────────────────────────────────────────────────
export const MOCK_LOGS = [
  { logNo: 101, actionType: "APPROVE", targetType: "FOUNDATION",   description: "초록우산 재단 승인",          adminName: "관리자", createdAt: "2026-04-19T08:30:00" },
  { logNo: 102, actionType: "REJECT",  targetType: "CAMPAIGN",     description: "부적합 캠페인 반려",          adminName: "관리자", createdAt: "2026-04-18T17:20:00" },
  { logNo: 103, actionType: "APPROVE", targetType: "FINAL_REPORT", description: "2024 보고서 승인",           adminName: "관리자", createdAt: "2026-04-18T15:10:00" },
  { logNo: 104, actionType: "DISABLE", targetType: "FOUNDATION",   description: "희망나눔 비활성화",          adminName: "관리자", createdAt: "2026-04-17T11:00:00" },
  { logNo: 105, actionType: "ENABLE",  targetType: "FOUNDATION",   description: "새빛재단 활성화",            adminName: "관리자", createdAt: "2026-04-16T09:30:00" },
  { logNo: 106, actionType: "APPROVE", targetType: "CAMPAIGN",     description: "환경 캠페인 승인",           adminName: "관리자", createdAt: "2026-04-15T14:00:00" },
  { logNo: 107, actionType: "REJECT",  targetType: "FOUNDATION",   description: "부적합 단체 반려",           adminName: "관리자", createdAt: "2026-04-14T10:30:00" },
  { logNo: 108, actionType: "APPROVE", targetType: "FINAL_REPORT", description: "청소년 보고서 승인",         adminName: "관리자", createdAt: "2026-04-13T09:00:00" },
];

// ── 이메일 내역 ───────────────────────────────────────────────────────────────
export const MOCK_EMAILS = [
  { emailQueueNo: 1, title: "캠페인 승인 완료 안내",   recipientEmail: "foundation1@example.com", emailStatus: "SENT",   templateType: "CAMPAIGN_APPROVED",     sentAt: "2026-04-19T09:00:00", createdAt: "2026-04-19T09:00:00" },
  { emailQueueNo: 2, title: "비밀번호 재설정 안내",    recipientEmail: "user2@example.com",       emailStatus: "SENT",   templateType: "PASSWORD_RESET",        sentAt: "2026-04-18T15:00:00", createdAt: "2026-04-18T15:00:00" },
  { emailQueueNo: 3, title: "계정 승인 완료 안내",     recipientEmail: "neworg@example.com",      emailStatus: "SENT",   templateType: "ACCOUNT_APPROVED",      sentAt: "2026-04-18T10:00:00", createdAt: "2026-04-18T10:00:00" },
  { emailQueueNo: 4, title: "기부 완료 감사 알림",     recipientEmail: "donor@example.com",       emailStatus: "FAILED", templateType: "DONATION_COMPLETE",     sentAt: null,                  createdAt: "2026-04-17T14:00:00" },
  { emailQueueNo: 5, title: "캠페인 반려 안내",        recipientEmail: "foundation3@example.com", emailStatus: "SENT",   templateType: "CAMPAIGN_REJECTED",     sentAt: "2026-04-17T09:00:00", createdAt: "2026-04-17T09:00:00" },
  { emailQueueNo: 6, title: "단체 임시 비밀번호",      recipientEmail: "org@example.com",         emailStatus: "SENT",   templateType: "FOUNDATION_TEMP_PASSWORD", sentAt: "2026-04-16T11:00:00", createdAt: "2026-04-16T11:00:00" },
];

// ── 알림 내역 ─────────────────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS = [
  { notificationNo: 1, content: "초록우산 재단이 새 캠페인을 등록했습니다.", notificationType: "CAMPAIGN",    isRead: true,  createdAt: "2026-04-19T10:00:00", readAt: "2026-04-19T10:05:00" },
  { notificationNo: 2, content: "새 가입 신청이 도착했습니다.",            notificationType: "FOUNDATION",  isRead: false, createdAt: "2026-04-19T09:30:00", readAt: null },
  { notificationNo: 3, content: "활동 보고서가 제출되었습니다.",           notificationType: "FINAL_REPORT",isRead: false, createdAt: "2026-04-18T16:00:00", readAt: null },
  { notificationNo: 4, content: "캠페인 달성률 100% 도달",                notificationType: "CAMPAIGN",    isRead: true,  createdAt: "2026-04-17T12:00:00", readAt: "2026-04-17T13:00:00" },
  { notificationNo: 5, content: "새 기부 단체 신청이 접수되었습니다.",    notificationType: "FOUNDATION",  isRead: false, createdAt: "2026-04-16T09:00:00", readAt: null },
];

// ── 비활성화 단체 ─────────────────────────────────────────────────────────────
export const MOCK_INACTIVE = MOCK_FOUNDATIONS_MANAGE.filter(
  (f) => f.accountStatus === "INACTIVE"
);
