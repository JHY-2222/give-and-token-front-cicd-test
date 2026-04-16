export async function checkNickname(nameHash) {
  const response = await fetch("/api/signup/nickname", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nameHash,
    }),
  });

  return response;
}

export async function sendEmailVerification(email) {
  const response = await fetch("/users/verification/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      loginType: "LOCAL",
    }),
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

export async function submitSignup(signupData) {
  const response = await fetch("/api/signup/local", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(signupData),
  });

  return response;
}