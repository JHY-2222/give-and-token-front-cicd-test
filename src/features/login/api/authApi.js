export async function loginLocal(loginData) {
  const response = await fetch("/api/auth/login/user/local", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });

  return response;
}

export async function findEmail(findData) {
  const response = await fetch("/users/support/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(findData),
  });

  return response;
}

export async function requestPasswordReset(resetData) {
  const response = await fetch("/users/support/password/reset/request", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(resetData),
  });

  return response;
}

export async function verifyEmailCode({ email, code }) {
  const response = await fetch("/users/verification/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      code,
    }),
  });

  return response;
}

export async function confirmPasswordReset(confirmData) {
  const response = await fetch("/users/support/password/reset/confirm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(confirmData),
  });

  return response;
}