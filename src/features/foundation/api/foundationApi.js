const FOUNDATION_BASE_PATH = "/api/foundation";
const FOUNDATION_CAMPAIGN_BASE_PATH = "/api/foundation/campaigns";

export const FOUNDATION_AUTH_STORAGE_KEY = "foundationAccessToken";
export const FOUNDATION_INFO_STORAGE_KEY = "foundationAuthInfo";

async function parseErrorResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const data = await response.json();
    return data.message || data.error || "요청 처리 중 오류가 발생했습니다.";
  }

  const text = await response.text();
  return text || "요청 처리 중 오류가 발생했습니다.";
}

function getStoredAccessToken() {
  return window.localStorage.getItem(FOUNDATION_AUTH_STORAGE_KEY) || "";
}

function saveFoundationAuth(authResponse) {
  window.localStorage.setItem(FOUNDATION_AUTH_STORAGE_KEY, authResponse.accessToken);
  window.localStorage.setItem("accessToken", authResponse.accessToken);
  window.localStorage.setItem(
    FOUNDATION_INFO_STORAGE_KEY,
    JSON.stringify({
      foundationNo: authResponse.foundationNo,
      foundationName: authResponse.foundationName,
      email: authResponse.email,
      tokenType: authResponse.tokenType,
    })
  );
}

function buildAuthorizedHeaders() {
  const accessToken = getStoredAccessToken();

  if (!accessToken) {
    throw new Error("먼저 기부단체 로그인 토큰을 저장해주세요.");
  }

  return {
    Authorization: `Bearer ${accessToken}`,
  };
}

function formatLocalDateTime(value) {
  if (!value) {
    return null;
  }

  return `${value}:00`;
}

export function getStoredFoundationAuth() {
  const raw = window.localStorage.getItem(FOUNDATION_INFO_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function loginFoundationAccount({ email, password }) {
  const response = await fetch(`${FOUNDATION_BASE_PATH}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  const data = await response.json();
  saveFoundationAuth(data);
  return data;
}

export async function checkBeneficiary(entryCode) {
  const query = new URLSearchParams({
    entryCode: String(entryCode || "").trim(),
  });

  const response = await fetch(
    `${FOUNDATION_CAMPAIGN_BASE_PATH}/beneficiary-check?${query.toString()}`,
    {
      headers: buildAuthorizedHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  return response.json();
}

export async function submitCampaignApplication(formValues) {
  const multipartData = new FormData();

  const requestData = {
    title: formValues.title.trim(),
    description: formValues.description.trim(),
    category: formValues.category,
    entryCode: formValues.entryCode.trim(),
    targetAmount: Number(formValues.targetAmount),
    startAt: formatLocalDateTime(formValues.startAt),
    endAt: formatLocalDateTime(formValues.endAt),
    usageStartAt: formatLocalDateTime(formValues.usageStartAt),
    usageEndAt: formatLocalDateTime(formValues.usageEndAt),
    usePlans: formValues.usePlans
      .map((plan) => ({
        planContent: plan.planContent.trim(),
        planAmount: Number(plan.planAmount),
      }))
      .filter((plan) => plan.planContent && !Number.isNaN(plan.planAmount)),
  };

  multipartData.append(
    "dto",
    new Blob([JSON.stringify(requestData)], { type: "application/json" })
  );

  if (formValues.imageFile) {
    multipartData.append("imageFile", formValues.imageFile);
  }

  formValues.detailImageFiles.forEach((imageFile) => {
    if (imageFile) {
      multipartData.append("detailImageFiles", imageFile);
    }
  });

  const response = await fetch(`${FOUNDATION_CAMPAIGN_BASE_PATH}/register`, {
    method: "POST",
    headers: buildAuthorizedHeaders(),
    body: multipartData,
  });

  if (!response.ok) {
    throw new Error(await parseErrorResponse(response));
  }

  return response.json();
}
