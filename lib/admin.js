export function isAdminPhone(phone) {
  const allowlist = (process.env.ADMIN_PHONES || "")
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  return allowlist.includes(phone);
}
