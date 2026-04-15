import { useState } from "react";
import FoundationApplicationForm from "../components/FoundationApplicationForm";
import FoundationApplicationResult from "../components/FoundationApplicationResult";
import {
  checkBeneficiary,
  getStoredFoundationAuth,
  loginFoundationAccount,
  submitCampaignApplication,
} from "../api/foundationApi";

function createUsePlan() {
  return {
    id: `${Date.now()}-${Math.random()}`,
    planContent: "",
    planAmount: "",
  };
}

function createDetailImageItem() {
  return {
    id: `${Date.now()}-${Math.random()}`,
    file: null,
  };
}

const INITIAL_AUTH_FORM = {
  email: "been.dev.kim@gmail.com",
  password: "1234",
};

const INITIAL_FORM_VALUES = {
  title: "",
  startAt: "",
  endAt: "",
  usageStartAt: "",
  usageEndAt: "",
  recruitDurationDays: "0일",
  usageDurationDays: "0일",
  targetAmount: "0",
  category: "",
  description: "",
  imageFile: null,
  entryCode: "",
  usePlans: [createUsePlan()],
  detailImageFiles: [createDetailImageItem()],
};

function isEmpty(value) {
  return !String(value || "").trim();
}

function calculateDurationLabel(startValue, endValue) {
  if (!startValue || !endValue) {
    return "0일";
  }

  const startDate = new Date(startValue);
  const endDate = new Date(endValue);
  const diff = endDate.getTime() - startDate.getTime();

  if (Number.isNaN(diff) || diff < 0) {
    return "0일";
  }

  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return `${days}일`;
}

export default function FoundationRegisterPage() {
  const initialAuthInfo = getStoredFoundationAuth();
  const [authForm, setAuthForm] = useState(INITIAL_AUTH_FORM);
  const [authInfo, setAuthInfo] = useState(initialAuthInfo);
  const [authStatus, setAuthStatus] = useState(
    initialAuthInfo
      ? "저장된 기부단체 로그인 토큰이 있습니다."
      : "로그인 요청을 보내 토큰을 로컬 스토리지에 저장해주세요."
  );
  const [formValues, setFormValues] = useState(INITIAL_FORM_VALUES);
  const [beneficiaryInfo, setBeneficiaryInfo] = useState(null);
  const [beneficiaryChecked, setBeneficiaryChecked] = useState(false);
  const [beneficiaryStatusMessage, setBeneficiaryStatusMessage] = useState(
    "엔트리 코드를 입력하고 수혜자 확인을 진행해주세요."
  );
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitResult, setSubmitResult] = useState(null);

  const handleAuthChange = (event) => {
    const { name, value } = event.target;

    setAuthForm((previousValues) => ({
      ...previousValues,
      [name]: value,
    }));
  };

  const handleLogin = async () => {
    try {
      setErrorMessage("");
      setAuthStatus("로그인 요청을 보내는 중입니다...");

      const result = await loginFoundationAccount(authForm);
      setAuthInfo({
        foundationNo: result.foundationNo,
        foundationName: result.foundationName,
        email: result.email,
        tokenType: result.tokenType,
      });
      setAuthStatus("토큰 저장이 완료되었습니다. 이제 캠페인을 신청할 수 있습니다.");
    } catch (error) {
      setAuthStatus("로그인 요청에 실패했습니다.");
      setErrorMessage(error.message);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormValues((previousValues) => {
      const nextValues = {
        ...previousValues,
        [name]: value,
      };

      if (name === "startAt" || name === "endAt") {
        nextValues.recruitDurationDays = calculateDurationLabel(
          name === "startAt" ? value : nextValues.startAt,
          name === "endAt" ? value : nextValues.endAt
        );
      }

      if (name === "usageStartAt" || name === "usageEndAt") {
        nextValues.usageDurationDays = calculateDurationLabel(
          name === "usageStartAt" ? value : nextValues.usageStartAt,
          name === "usageEndAt" ? value : nextValues.usageEndAt
        );
      }

      return nextValues;
    });

    if (name === "entryCode") {
      setBeneficiaryChecked(false);
      setBeneficiaryInfo(null);
      setBeneficiaryStatusMessage("엔트리 코드가 변경되어 다시 확인이 필요합니다.");
    }

    setErrorMessage("");
  };

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] ?? null;

    setFormValues((previousValues) => ({
      ...previousValues,
      imageFile: nextFile,
    }));

    setErrorMessage("");
  };

  const handleDetailImageChange = (itemId, event) => {
    const nextFile = event.target.files?.[0] ?? null;

    setFormValues((previousValues) => ({
      ...previousValues,
      detailImageFiles: previousValues.detailImageFiles.map((imageItem) =>
        imageItem.id === itemId ? { ...imageItem, file: nextFile } : imageItem
      ),
    }));
  };

  const handleAddUsePlan = () => {
    setFormValues((previousValues) => ({
      ...previousValues,
      usePlans: [...previousValues.usePlans, createUsePlan()],
    }));
  };

  const handleRemoveUsePlan = (planId) => {
    setFormValues((previousValues) => ({
      ...previousValues,
      usePlans:
        previousValues.usePlans.length === 1
          ? previousValues.usePlans
          : previousValues.usePlans.filter((plan) => plan.id !== planId),
    }));
  };

  const handleUsePlanChange = (planId, key, value) => {
    setFormValues((previousValues) => ({
      ...previousValues,
      usePlans: previousValues.usePlans.map((plan) =>
        plan.id === planId ? { ...plan, [key]: value } : plan
      ),
    }));
  };

  const handleAddDetailImage = () => {
    setFormValues((previousValues) => ({
      ...previousValues,
      detailImageFiles: [...previousValues.detailImageFiles, createDetailImageItem()],
    }));
  };

  const handleRemoveDetailImage = (itemId) => {
    setFormValues((previousValues) => ({
      ...previousValues,
      detailImageFiles:
        previousValues.detailImageFiles.length === 1
          ? previousValues.detailImageFiles
          : previousValues.detailImageFiles.filter((imageItem) => imageItem.id !== itemId),
    }));
  };

  const handleBeneficiaryCheck = async () => {
    if (isEmpty(formValues.entryCode)) {
      setErrorMessage("엔트리 코드를 입력한 뒤 수혜자 확인을 진행해주세요.");
      return;
    }

    try {
      setErrorMessage("");
      setBeneficiaryStatusMessage("수혜자 정보를 확인하는 중입니다...");

      const result = await checkBeneficiary(formValues.entryCode);

      if (!result.valid) {
        setBeneficiaryChecked(false);
        setBeneficiaryInfo(null);
        setBeneficiaryStatusMessage(result.message || "유효하지 않은 수혜자 코드입니다.");
        return;
      }

      setBeneficiaryChecked(true);
      setBeneficiaryInfo(result);
      setBeneficiaryStatusMessage(result.message || "수혜자 확인이 완료되었습니다.");
    } catch (error) {
      setBeneficiaryChecked(false);
      setBeneficiaryInfo(null);
      setBeneficiaryStatusMessage("수혜자 확인 요청에 실패했습니다.");
      setErrorMessage(error.message);
    }
  };

  const validateBeforeSubmit = () => {
    if (!authInfo) {
      return "먼저 기부단체 로그인 토큰을 저장해주세요.";
    }

    if (isEmpty(formValues.title)) {
      return "캠페인명을 입력해주세요.";
    }

    if (isEmpty(formValues.category)) {
      return "카테고리를 선택해주세요.";
    }

    if (isEmpty(formValues.description)) {
      return "상세 설명을 입력해주세요.";
    }

    if (Number(formValues.targetAmount) <= 0) {
      return "목표 금액은 0보다 크게 입력해주세요.";
    }

    if (!formValues.startAt || !formValues.endAt) {
      return "모집 기간을 모두 입력해주세요.";
    }

    if (!formValues.usageStartAt || !formValues.usageEndAt) {
      return "사업 기간을 모두 입력해주세요.";
    }

    if (new Date(formValues.endAt) < new Date(formValues.startAt)) {
      return "모집 종료일은 시작일보다 이후여야 합니다.";
    }

    if (new Date(formValues.usageEndAt) < new Date(formValues.usageStartAt)) {
      return "사업 종료일은 시작일보다 이후여야 합니다.";
    }

    if (!beneficiaryChecked) {
      return "수혜자 확인을 먼저 완료해주세요.";
    }

    if (!formValues.imageFile) {
      return "대표 이미지를 등록해주세요.";
    }

    const hasInvalidUsePlan = formValues.usePlans.some(
      (plan) => isEmpty(plan.planContent) || Number(plan.planAmount) < 0
    );

    if (hasInvalidUsePlan) {
      return "지출 계획 내용을 모두 입력해주세요.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationMessage = validateBeforeSubmit();

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");

      const result = await submitCampaignApplication({
        ...formValues,
        detailImageFiles: formValues.detailImageFiles.map((imageItem) => imageItem.file),
      });
      setSubmitResult(result);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitResult) {
    return <FoundationApplicationResult result={submitResult} authInfo={authInfo} />;
  }

  return (
    <main className="px-4 py-10">
      <FoundationApplicationForm
        authForm={authForm}
        authStatus={authStatus}
        authInfo={authInfo}
        formValues={formValues}
        beneficiaryInfo={beneficiaryInfo}
        beneficiaryChecked={beneficiaryChecked}
        beneficiaryStatusMessage={beneficiaryStatusMessage}
        submitting={submitting}
        errorMessage={errorMessage}
        onAuthChange={handleAuthChange}
        onLogin={handleLogin}
        onChange={handleChange}
        onFileChange={handleFileChange}
        onDetailImageChange={handleDetailImageChange}
        onAddUsePlan={handleAddUsePlan}
        onRemoveUsePlan={handleRemoveUsePlan}
        onUsePlanChange={handleUsePlanChange}
        onAddDetailImage={handleAddDetailImage}
        onRemoveDetailImage={handleRemoveDetailImage}
        onBeneficiaryCheck={handleBeneficiaryCheck}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
