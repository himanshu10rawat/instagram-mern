import crypto from "crypto";

import qrcode from "qrcode";
import speakeasy from "speakeasy";

export const generateTwoFactorSecret = ({ username }) => {
  return speakeasy.generateSecret({
    name: `Instagram Clone (${username})`,
    issuer: "Instagram Clone",
    length: 20,
  });
};

export const generateQrCode = async (otpauthUrl) => {
  return qrcode.toDataURL(otpauthUrl);
};

export const verifyTwoFactorToken = ({ token, secret }) => {
  return speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 1,
  });
};

export const generateBackupCodes = () => {
  return Array.from({ length: 8 }).map(() => ({
    code: crypto.randomBytes(4).toString("hex"),
    used: false,
  }));
};

export const hashBackupCode = (code) => {
  return crypto.createHash("sha256").update(code).digest("hex");
};

export const generateHashedBackupCodes = () => {
  const rawCodes = generateBackupCodes();

  const hashedCodes = rawCodes.map((item) => ({
    code: hashBackupCode(item.code),
    used: false,
  }));

  return {
    rawCodes: rawCodes.map((item) => item.code),
    hashedCodes,
  };
};
