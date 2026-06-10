# Fotky klientů — vlnitá zrcadla

Originály jsou ve složce `photo/` v kořeni projektu (`Klientka 1.jpg` … `Klientka 4.jpg`).

Sem se kopírují jako (na výšku, ideálně 800×1200 px nebo víc):

| Soubor | Zrcadlo |
|--------|---------|
| `client-1.jpg` | první zleva |
| `client-2.jpg` | druhé |
| `client-3.jpg` | třetí |
| `client-4.jpg` | čtvrté |

Formáty: `.jpg`, `.jpeg`, `.png`, `.webp`

Fotka se automaticky ořízne do tvaru zrcadla — kolem zůstane růžový lesklý rámeček (jako okraj zrcadla). Po nahrání stačí obnovit stránku.

Ořez obličeje lze doladit v `src/lib/gloss-data.ts` → `objectPosition` u jednotlivých položek.
