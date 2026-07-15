export function checkCmsAdmin(req: Request): boolean {
  const secret = process.env.NIA_CMS_ADMIN_TOKEN?.trim();
  if (!secret) return false;
  const auth = req.headers.get("authorization")?.trim() ?? "";
  if (auth === `Bearer ${secret}`) return true;
  const q = new URL(req.url).searchParams.get("token")?.trim();
  return q === secret;
}
