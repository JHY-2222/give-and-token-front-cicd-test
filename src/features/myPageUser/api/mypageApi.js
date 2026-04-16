import axios from "axios";

// 모든 요청에 로컬스토리지 토큰이 있으면 헤더에 추가하는 인터셉터 설정
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export function getMyPageInfo() {
  return axios.get("/users/support/mypage/my", {
    withCredentials: true,
  });
}

export function updateMyPageInfo(formData) {
  return axios.patch("/users/support/mypage/my", formData, {
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function checkNicknameDuplicate(nameHash) {
  return axios.get(
      "/api/signup/nickname",
      {
        params: { nameHash },
        withCredentials: true,
      }
  );
}

export function getWalletInfo() {
  return axios.get("/users/support/user/wallet", {
    withCredentials: true,
  });
}

export function getTransactionHistory() {
  return axios.get("/users/support/user/wallet/token/transactions", {
    withCredentials: true,
  });
}

export function updatePassword(passwordData) {
  return axios.patch("/users/support/password", passwordData, {
    withCredentials: true,
  });
}

export function getMyDonations() {
  return axios.get("/users/support/user/wallet/token/transactions", {
    withCredentials: true,
  });
}

export function getMicroTracking(campaignNo) {
  return axios.get("/users/support/see", {
    params: { campaignNo },
    withCredentials: true,
  });
}