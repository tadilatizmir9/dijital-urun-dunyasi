export const TEST_MODE_KEY = "ds_test_mode";

export const isTestModeOn = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(TEST_MODE_KEY) === "1";
};

export const setTestMode = (on: boolean): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(TEST_MODE_KEY, on ? "1" : "0");
};

