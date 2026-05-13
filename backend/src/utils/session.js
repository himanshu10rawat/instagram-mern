import Session from "../models/session.model.js";

const getSessionExpiresAt = () => {
  const cookieExpiresInDays = Number(process.env.COOKIE_EXPIRES_IN || 7);

  return new Date(Date.now() + cookieExpiresInDays * 24 * 60 * 60 * 1000);
};

export const createSession = async ({ userId, refreshToken, req }) => {
  const userAgent = req.headers["user-agent"] || "";
  const ipAddress = req.ip || req.socket.remoteAddress || "";

  const deviceName = userAgent.includes("Mobile") ? "Mobile Device" : "Desktop Device";

  return Session.create({
    user: userId,
    refreshToken,
    userAgent,
    ipAddress,
    deviceName,
    expiresAt: getSessionExpiresAt(),
  });
};

export { getSessionExpiresAt };
