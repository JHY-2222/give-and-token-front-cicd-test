const ADMIN_API_PREFIX = "/admin-api";

export function getAdminApiUrl(path = "") {
  return `${ADMIN_API_PREFIX}${path}`;
}

export async function loginAdmin(loginData) {
  const response = await fetch(getAdminApiUrl("/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });

  return response;
}

export async function logoutAdmin() {
  const response = await fetch(getAdminApiUrl("/auth/logout"), {
    method: "POST",
    headers: getAdminAuthHeaders({
      "Content-Type": "application/json",
    }),
  });

  return response;
}

export function getAdminAccessToken() {
  return window.localStorage.getItem("adminAccessToken");
}

export function getAdminAuthHeaders(headers = {}) {
  const token = getAdminAccessToken();

  return {
    ...headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function handleUnauthorized() {
  window.localStorage.removeItem("adminAccessToken");
  window.localStorage.removeItem("adminProfile");
  window.location.href = "/admin/login";
}

export async function fetchAdminJson(path, params = {}) {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
  );
  const qs = new URLSearchParams(filtered).toString();
  const url = getAdminApiUrl(`${path}${qs ? `?${qs}` : ""}`);
  const res = await fetch(url, { headers: getAdminAuthHeaders() });
  if (res.status === 401) { handleUnauthorized(); throw new Error("HTTP 401"); }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function patchAdminAction(path, params = {}) {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined)
  );
  const qs = new URLSearchParams(filtered).toString();
  const url = getAdminApiUrl(`${path}${qs ? `?${qs}` : ""}`);
  const res = await fetch(url, { method: "PATCH", headers: getAdminAuthHeaders() });
  if (res.status === 401) { handleUnauthorized(); throw new Error("HTTP 401"); }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}
