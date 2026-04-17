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
