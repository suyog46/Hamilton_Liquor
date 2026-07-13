export const AGE_GATE_COOKIE_NAME = "hls_age_verified";
export const AGE_GATE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export const setAgeVerifiedCookie = () => {
  document.cookie = `${AGE_GATE_COOKIE_NAME}=true; path=/; max-age=${AGE_GATE_COOKIE_MAX_AGE}; SameSite=Lax`;
};
