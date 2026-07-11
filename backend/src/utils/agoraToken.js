import agoraToken from "agora-token";

const { RtcRole, RtcTokenBuilder } = agoraToken;

const DEFAULT_TOKEN_EXPIRES_IN_SECONDS = 3600;

const getPositiveInteger = (value, fallback) => {
  const number = Number(value);

  return Number.isInteger(number) && number > 0 ? number : fallback;
};

export const getAgoraRtcRole = (role) => {
  const normalizedRole = String(role || "").trim().toLowerCase();

  if (["audience", "subscriber", "viewer"].includes(normalizedRole)) {
    return RtcRole.SUBSCRIBER;
  }

  return RtcRole.PUBLISHER;
};

export const getAgoraTokenExpiresInSeconds = () => {
  return getPositiveInteger(
    process.env.AGORA_RTC_TOKEN_EXPIRES_IN_SECONDS,
    DEFAULT_TOKEN_EXPIRES_IN_SECONDS,
  );
};

export const generateAgoraToken = ({
  channelName,
  uid,
  role = "publisher",
  expiresInSeconds = getAgoraTokenExpiresInSeconds(),
}) => {
  const tokenExpiresInSeconds = getPositiveInteger(
    expiresInSeconds,
    DEFAULT_TOKEN_EXPIRES_IN_SECONDS,
  );
  const privilegeExpiresInSeconds = tokenExpiresInSeconds;
  const rtcRole = typeof role === "number" ? role : getAgoraRtcRole(role);

  if (!process.env.AGORA_APP_ID || !process.env.AGORA_APP_CERTIFICATE) {
    throw new Error("AGORA_APP_ID and AGORA_APP_CERTIFICATE are required");
  }

  const token = RtcTokenBuilder.buildTokenWithUid(
    process.env.AGORA_APP_ID,
    process.env.AGORA_APP_CERTIFICATE,
    channelName,
    uid,
    rtcRole,
    tokenExpiresInSeconds,
    privilegeExpiresInSeconds,
  );

  return {
    token,
    expiresIn: tokenExpiresInSeconds,
    expiresAt: new Date(Date.now() + tokenExpiresInSeconds * 1000).toISOString(),
  };
};
