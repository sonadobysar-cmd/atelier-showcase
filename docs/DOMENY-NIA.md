# Domény a subdomény — Nia Dobyšar portfolio

Projekt: **atelier-showcase** na Vercelu (`atelier-showcase-cyan.vercel.app`).

Middleware v `src/middleware.ts` už mapuje subdomény na jednotlivé weby. Stačí doménu připojit ve Vercelu a nastavit DNS u registrátora.

---

## Co uděláš ty (cca 15 min)

### 1. Google Meet (jednorázově)

1. Otevři [meet.google.com](https://meet.google.com) → **Nové setkání** → **Vytvořit schůzku pro později**.
2. Zkopíruj odkaz (např. `https://meet.google.com/abc-defg-hij`).
3. Ve Vercelu → projekt **atelier-showcase** → **Settings → Environment Variables**:
   - `NIA_GOOGLE_MEET_URL` = tvůj Meet odkaz
   - `RESEND_API_KEY` = klíč z [resend.com](https://resend.com)
   - `NIA_EMAIL_FROM` = `Nia Dobyšar <konzultace@niadobysar.cz>` (až ověříš doménu)
   - `NIA_EMAIL_TO` = `niadobyshar@gmail.com`
4. **Redeploy** (Deployments → … → Redeploy).

### 2. Resend (e-mail)

1. Účet na [resend.com](https://resend.com) → **Domains** → přidej `niadobysar.cz`.
2. U registrátora domény vlož DNS záznamy (SPF, DKIM) — Resend ti je ukáže.
3. Po ověření nastav `NIA_EMAIL_FROM` na adresu z tvé domény (ne `onboarding@resend.dev`).

Do ověření domény můžeš testovat s `onboarding@resend.dev` — e-maily půjdou jen na adresu tvého Resend účtu.

### 3. Doména ve Vercelu

1. [vercel.com](https://vercel.com) → **atelier-showcase** → **Settings → Domains**.
2. Přidej:
   - `niadobysar.cz`
   - `www.niadobysar.cz`
3. Vercel ukáže DNS záznamy (A / CNAME). Zadej je u registrátora (Wedos, Forpsi, …).
4. Po propagaci (5 min – 48 h) bude portfolio na kořeni domény.

### 4. Subdomény (ukázkové weby)

U registrátora přidej **CNAME** záznamy (všechny → `cname.vercel-dns.com` nebo hodnota z Vercelu):

| Subdoména | Web |
|-----------|-----|
| `gloss.niadobysar.cz` | Gloss |
| `void.niadobysar.cz` | Atelier Void |
| `lume.niadobysar.cz` | LUMÉ |
| `laleia.niadobysar.cz` | Lash Babe's |
| `matcha.niadobysar.cz` | MATCHÁ |
| `realty.niadobysar.cz` | Prémiová realitka |
| `bdy.niadobysar.cz` | BDY to BDY |
| `funnel.niadobysar.cz` | Masterclass / funnel |
| `vini.niadobysar.cz` | Vini d'Elite |
| `portfolio.niadobysar.cz` | Case study |
| `nia.niadobysar.cz` | Portfolio (alternativa) |

Každou subdoménu také **přidej ve Vercelu** (Domains → Add).

**ALTEZ** běží zvlášť na [altez.vercel.app](https://altez.vercel.app) — pokud chceš `altez.niadobysar.cz`, připoj doménu k projektu **altez** ve Vercelu.

---

## Co už je hotové v kódu

- Online rezervace konzultací (jen online, 30 min)
- Kalendář Po–Pá dle tvých časů; So–Ne „po domluvě“ (info v UI)
- Po rezervaci: e-mail klientovi s **Google Meet** + potvrzení tobě
- Kontaktní formulář přes API (bez mailto)
- Middleware pro kořen domény → `/nia` a subdomény → jednotlivé demo weby

---

## Ověření po nasazení

1. Otevři `https://niadobysar.cz/#konzultace` (nebo Vercel URL `/nia#konzultace`).
2. Vyber termín, odešli testovací rezervaci na svůj e-mail.
3. Zkontroluj doručenou poštu — potvrzení + odkaz Meet.
4. Zkus `https://gloss.niadobysar.cz` (po DNS).

---

## Osobní schůzka

V UI je text: osobní setkání až po úvodní online konzultaci; zájemce ať napíše e-mail. Není potřeba nic dalšího nastavovat.
