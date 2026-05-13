export const emailVerificationTemplate = ({ fullName, verificationUrl }) => {
  return {
    subject: "Verify your email address",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Hello ${fullName},</h2>
        <p>Please verify your email address to activate your account.</p>
        <a href="${verificationUrl}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;border-radius:6px;">
          Verify Email
        </a>
        <p>This link will expire in 30 minutes.</p>
      </div>
    `,
    text: `Verify your email using this link: ${verificationUrl}`,
  };
};
