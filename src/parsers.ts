export function parseTrustedEmails(trustedEmails?: string) {
  return String(trustedEmails || "")
    .split(/[;,]/)
    .map(v => v.trim())
}