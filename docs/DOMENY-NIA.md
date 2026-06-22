# Domény a subdomény — niadobysar.com

Tvoje doména: **niadobysar.com**  
Middleware v `src/middleware.ts` už mapuje subdomény na jednotlivé weby. Ty jen připojíš doménu ve Vercelu a nastavíš DNS u registrátora.

---

## Přehled — co kam patří

| URL | Projekt ve Vercelu | Poznámka |
|-----|-------------------|----------|
| `niadobysar.com` | **atelier-showcase** | Portfolio NIA + galerie na `/projekty` |
| `www.niadobysar.com` | **atelier-showcase** | Přesměrování na kořen |
| `gloss.niadobysar.com` | **atelier-showcase** | Gloss |
| `void.niadobysar.com` | **atelier-showcase** | Atelier Void |
| `lume.niadobysar.com` | **atelier-showcase** | LUMÉ |
| `lashbabes.niadobysar.com` | **atelier-showcase** | Lashbabes |
| `matcha.niadobysar.com` | **atelier-showcase** | MATCHÁ |
| `realitka.niadobysar.com` | **atelier-showcase** | Prémiová realitka |
| `bdy.niadobysar.com` | **atelier-showcase** | BDY to BDY |
| `funnel.niadobysar.com` | **atelier-showcase** | Masterclass / funnel |
| `vini.niadobysar.com` | **atelier-showcase** | Vini d'Elite |
| `altez.niadobysar.com` | **altez** | ALTEZ wellness (samostatný projekt) |
| `mochi.niadobysar.com` | **mochi-shop** | Mochi Box (samostatný projekt) |

---

## Krok 1 — Kořenová doména (portfolio)

1. [vercel.com](https://vercel.com) → projekt **atelier-showcase** → **Settings → Domains**.
2. Přidej:
   - `niadobysar.com`
   - `www.niadobysar.com`
3. Vercel ukáže DNS záznamy. Typicky:
   - **A** záznam `@` → `76.76.21.21` (nebo hodnota z Vercelu)
   - **CNAME** `www` → `cname.vercel-dns.com`
4. U registrátora (Wedos, Forpsi, Cloudflare, …) zadej tyto záznamy.
5. Počkej na propagaci (5 min – 48 h). Vercel ukáže zelenou fajfku.

---

## Krok 2 — Subdomény (ukázkové weby v atelier-showcase)

Pro **každou** subdoménu udělej dvě věci:

### A) Ve Vercelu (atelier-showcase → Domains → Add)

Přidej všechny najednou (Vercel je přijme jako wildcard nebo po jedné):

```
gloss.niadobysar.com
void.niadobysar.com
lashbabes.niadobysar.com
lume.niadobysar.com
matcha.niadobysar.com
realitka.niadobysar.com
bdy.niadobysar.com
funnel.niadobysar.com
vini.niadobysar.com
```

### B) U registrátora — CNAME záznamy

| Host (název) | Typ | Hodnota |
|--------------|-----|---------|
| `gloss` | CNAME | `cname.vercel-dns.com` |
| `void` | CNAME | `cname.vercel-dns.com` |
| `lashbabes` | CNAME | `cname.vercel-dns.com` |
| `lume` | CNAME | `cname.vercel-dns.com` |
| `matcha` | CNAME | `cname.vercel-dns.com` |
| `realitka` | CNAME | `cname.vercel-dns.com` |
| `bdy` | CNAME | `cname.vercel-dns.com` |
| `funnel` | CNAME | `cname.vercel-dns.com` |
| `vini` | CNAME | `cname.vercel-dns.com` |

> Hodnota CNAME může být jiná — vždy použij přesně to, co ukáže Vercel u dané domény.

**Tip (Cloudflare):** Zapni proxy (oranžový mráček) až po ověření, že Vercel doménu přijal. U Wedosu/Forpsi proxy není.

---

## Krok 3 — Samostatné projekty (ALTEZ, Mochi)

Tyto weby běží na jiných Vercel projektech — subdoména se připojí **k tomu projektu**, ne k atelier-showcase.

### ALTEZ

1. Vercel → projekt **altez** → Domains → přidej `altez.niadobysar.com`
2. DNS: CNAME `altez` → `cname.vercel-dns.com`

### Mochi Box

1. Vercel → projekt **mochi-shop** → Domains → přidej `mochi.niadobysar.com`
2. DNS: CNAME `mochi` → `cname.vercel-dns.com`

---

## Krok 4 — E-mail (rezervace konzultací)

1. Účet na [resend.com](https://resend.com) → **Domains** → přidej `niadobysar.com`.
2. U registrátora vlož DNS záznamy (SPF, DKIM) — Resend ti je ukáže.
3. Ve Vercelu (atelier-showcase → Environment Variables):

| Proměnná | Hodnota |
|----------|---------|
| `NIA_GOOGLE_MEET_URL` | Odkaz z Google Meet (Nové setkání → pro později) |
| `RESEND_API_KEY` | Klíč z Resend |
| `NIA_EMAIL_FROM` | `Nia Dobyšar <konzultace@niadobysar.com>` |
| `NIA_EMAIL_TO` | `niadobysar@gmail.com` (nebo tvůj e-mail) |

4. **Redeploy** (Deployments → … → Redeploy).

Do ověření domény v Resend můžeš testovat s `onboarding@resend.dev`.

---

## Ověření po nasazení

1. `https://niadobysar.com` → portfolio NIA
2. `https://niadobysar.com/#konzultace` → rezervační kalendář
3. `https://gloss.niadobysar.com` → Gloss demo
4. `https://void.niadobysar.com` → Atelier Void
5. `https://altez.niadobysar.com` → ALTEZ (po připojení k projektu altez)

---

## Co už je hotové v kódu

- Middleware mapuje subdomény na správné složky v `public/`
- Podpora `niadobysar.com` i `niadobysar.cz` (pokud .cz koupíš později)
- Online rezervace konzultací + e-mail s Google Meet
- Kontaktní formulář přes API

---

## Rychlý checklist

- [ ] `niadobysar.com` + `www` ve Vercelu (atelier-showcase)
- [ ] A + CNAME záznamy u registrátora
- [ ] Všechny subdomény ve Vercelu (atelier-showcase)
- [ ] CNAME pro každou subdoménu u registrátora
- [ ] `altez.niadobysar.com` → projekt altez
- [ ] `mochi.niadobysar.com` → projekt mochi-shop
- [ ] Resend + env proměnné + redeploy
- [ ] Test rezervace a pár subdomén
