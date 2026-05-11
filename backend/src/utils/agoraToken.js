import pkg from "agora-access-token";

const { RtcRole, RtcTokenBuilder } = pkg;

export const generateAgoraToken = ({
  channelName,
  uid,
  role = RtcRole.PUBLISHER,
  expirationTimeInSeconds = 3600,
}) => {
  const currentTimestamp = Math.floor(Date.now() / 1000);

  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  const token = RtcTokenBuilder.buildTokenWithUid(
    process.env.AGORA_APP_ID,
    process.env.AGORA_APP_CERTIFICATE,
    channelName,
    uid,
    role,
    privilegeExpiredTs,
  );

  return token;
};
