/** Texty služeb — odborně popsané, připravené na vizuální doladění. */

export type ServiceItem = { name: string; desc: string; price?: string };
export type ServiceGroup = { title: string; items: ServiceItem[] };

export const elizaClinicServices: ServiceGroup[] = [
  {
    title: "Rty kyselinou hyaluronovou",
    items: [
      {
        name: "Russian Lips",
        desc: "Ruská technika vertikální aplikace filleru — výraznější objem, definovaný okraj a projekce růží bez „kačičího“ efektu.",
        price: "od 9 900 Kč",
      },
      {
        name: "Doll Lips",
        desc: "Zaokrouhlený, „panenkovský“ tvar s důrazem na Cupidův luk a středový objem — svěží, mladistvý vzhled.",
        price: "od 9 500 Kč",
      },
      {
        name: "Natural Lips",
        desc: "Jemné zvětšení a hydratace při zachování přirozené asymetrie a měkkých přechodů — ideální první zákrok.",
        price: "od 8 500 Kč",
      },
      {
        name: "Michelangelo Lips",
        desc: "Autorská sculpting technika rtů — harmonické proporce horní a dolní retové v souladu s profilem obličeje.",
        price: "od 10 900 Kč",
      },
    ],
  },
  {
    title: "Profil & kontury obličeje",
    items: [
      {
        name: "Korekce nosu kyselinou hyaluronovou",
        desc: "Nechirurgická korekce hřbetu a špičky nosu fillerem — vyrovnání profilu bez operační rekonvalescence.",
        price: "od 11 900 Kč",
      },
      {
        name: "Jawline & brada",
        desc: "Definice čelistní linky a projekce brady pro ostřejší profil a vyváženější spodní třetinu obličeje.",
        price: "od 12 900 Kč",
      },
      {
        name: "Balíček Dokonalý profil",
        desc: "Komplexní modelace profilu kyselinou hyaluronovou — rty, brada, jawline a nos dle individuálního plánu.",
        price: "individuálně",
      },
    ],
  },
  {
    title: "Botulotoxin (Botox®)",
    items: [
      {
        name: "Baby Botox",
        desc: "Mikrodávky botulotoxinu — jemná prevence mimických vrásek při zachování přirozené mimiky.",
        price: "od 3 900 Kč",
      },
      {
        name: "Botulotoxin — liftingový efekt",
        desc: "Strategická aplikace pro zvednutí obočí, otevření pohledu a omlazení horní třetiny obličeje.",
        price: "od 4 900 Kč",
      },
      {
        name: "Korekce asymetrie & jawline",
        desc: "Úprava nerovnováhy mimických svalů, ztenčení maseterů a jemné zjemnění čelistní linie.",
        price: "od 5 500 Kč",
      },
    ],
  },
  {
    title: "Regenerace & přístrojová medicína",
    items: [
      {
        name: "PDRN (polydeoxyribonukleotidy)",
        desc: "Injekční regenerace pokožky — zlepšení elasticity, hojení jizev a celkové kvality dermis.",
        price: "od 4 200 Kč",
      },
      {
        name: "Morpheus8®",
        desc: "Frakční radiofrekvence s mikrojehlováním (InMode) — remodelace kolagenu, zpevnění pleti a rejuvenace.",
        price: "od 6 900 Kč",
      },
      {
        name: "Laser — obličej & tělo",
        desc: "Epilace chloupků, omlazení, pigmentace, akné a rozšířené žilky. Protokol dle typu pleti.",
        price: "od 1 200 Kč",
      },
    ],
  },
];

export const hairFactoryServices: ServiceGroup[] = [
  {
    title: "Střih & barva",
    items: [
      {
        name: "Autorský střih",
        desc: "Individuální střih podle struktury vlasů, obličeje a životního stylu — ne šablona z katalogu.",
        price: "od 990 Kč",
      },
      {
        name: "Autorské barvení",
        desc: "Kreativní techniky melíru, balayage a tonování s profesionální řadou Paul Mitchell®.",
        price: "od 2 490 Kč",
      },
    ],
  },
  {
    title: "Ošetření & regenerace",
    items: [
      {
        name: "Laminace vlasů",
        desc: "Uzavření kutikuly pro lesk, hebkost a dlouhotrvající styling bez krepatění.",
        price: "od 1 290 Kč",
      },
      {
        name: "Hair Botox",
        desc: "Hloubková regenerační kúra vlasů (ne botulotoxin) — vyplnění a vyhlazení poškozeného vlákna.",
        price: "od 1 890 Kč",
      },
      {
        name: "Keratinové ošetření",
        desc: "Vyhlazení a posílení struktury vlasů, redukce krepatění a snadnější úprava.",
        price: "od 2 990 Kč",
      },
    ],
  },
  {
    title: "Prodlužování vlasů",
    items: [
      {
        name: "Mikrokeratinové pramínky",
        desc: "Prodlužování pramínky fixované mikrokeratinovými spoji — přirozený pohyb vlasů.",
        price: "od 8 900 Kč",
      },
      {
        name: "Tape-in extensions",
        desc: "Prodlužování tenkými keratinovými pásky — rychlá aplikace objemu a délky při správné údržbě.",
        price: "od 7 500 Kč",
      },
    ],
  },
  {
    title: "Kurzy HairFactory",
    items: [
      {
        name: "Workshop autorské barvy",
        desc: "Intenzivní praktický kurz melírových a balayage technik na modelkách.",
        price: "od 4 900 Kč",
      },
      {
        name: "Prodlužování — mikrokeratin & tape-in extensions",
        desc: "Certifikovaný kurz aplikace, spojů a údržby pro kadeřníky.",
        price: "od 6 900 Kč",
      },
    ],
  },
];

export const lashLoftServices: ServiceGroup[] = [
  {
    title: "Lash lifting",
    items: [
      {
        name: "Classic Lash Lift",
        desc: "Natření a tvarování přirozených řas pro dlouhotrvající zatočení a optické prodloužení.",
        price: "od 890 Kč",
      },
      {
        name: "Korean Lash Lift",
        desc: "Korejská varianta s důrazem na výživu keratinem a laminací — lesklé, zdravě vypadající řasy.",
        price: "od 1 090 Kč",
      },
    ],
  },
  {
    title: "Prodlužování řas",
    items: [
      {
        name: "Nový set",
        desc: "Klasické nebo objemové řasy — mapping podle tvaru oka a požadované intenzity.",
        price: "od 1 390 Kč",
      },
      {
        name: "Doplnění",
        desc: "Údržba setu obvykle každé 2–3 týdny pro stálý perfektní vzhled.",
        price: "od 790 Kč",
      },
    ],
  },
  {
    title: "Brow bar",
    items: [
      {
        name: "Brow lamination + barvení",
        desc: "Laminace obočí a profesionální barvy (americké pigmenty) s efektem jako po PMU — barva až 3 týdny.",
        price: "od 790 Kč",
      },
      {
        name: "Úprava tvaru obočí",
        desc: "Pinzeta nebo vosk v kombinaci s barvením pro čistý, vyvážený rám obličeje.",
        price: "od 390 Kč",
      },
    ],
  },
];

export const revolutionPmuServices: ServiceGroup[] = [
  {
    title: "PMU obočí",
    items: [
      {
        name: "Powder brows (ombre / pudrování)",
        desc: "Jemné stínování obočí pro měkký make-upový efekt — vhodné zejména pro suchou pleť.",
        price: "od 5 900 Kč",
      },
      {
        name: "Vláskování (hair strokes / microblading)",
        desc: "Jednotlivé chloupky pro maximálně přirozený vzhled — dle typu a stavu pleti.",
        price: "od 6 900 Kč",
      },
    ],
  },
  {
    title: "PMU rty & oči",
    items: [
      {
        name: "Aquarelle Lips",
        desc: "Akvarelová technika rtů — měkký gradient bez ostré kontury, přirozená barva.",
        price: "od 6 500 Kč",
      },
      {
        name: "Konturka rtů",
        desc: "Definice okraje rtů pro sjednocení tvaru a dlouhotrvalejší efekt rtěnky.",
        price: "od 5 200 Kč",
      },
      {
        name: "Baby Line",
        desc: "Jemná permanentní linka v linii řas — oči opticky zářivější bez výrazné linky.",
        price: "od 4 900 Kč",
      },
      {
        name: "Shadow Lines",
        desc: "Měkké stínování mezi řasami — efekt zahuštěných řas a jemná doplňková linka.",
        price: "od 5 400 Kč",
      },
    ],
  },
  {
    title: "Revolution Academy",
    items: [
      {
        name: "PMU Masters — kompletní program",
        desc: "Teorie, praxe na modelkách, hygiena, pigmentologie a podnikání v PMU.",
        price: "od 49 900 Kč",
      },
      {
        name: "Jednotlivé techniky",
        desc: "Vláskování, pudrové obočí, aquarelle lips, baby line — modulové kurzy.",
        price: "od 12 900 Kč",
      },
    ],
  },
];

export const sknTtServices: ServiceGroup[] = [
  {
    title: "Tetování",
    items: [
      {
        name: "Fine line — walk-in",
        desc: "Jemné linkové tetování bez předchozí objednávky (dle volné kapacity). Minimalismus, botanika, symboly.",
        price: "od 800 Kč",
      },
      {
        name: "Fine line na objednávku",
        desc: "Větší nebo custom návrh — konzultace, šablona a precizní aplikace tenkou jehlou.",
        price: "od 2 500 Kč",
      },
    ],
  },
  {
    title: "Piercing & šperky",
    items: [
      {
        name: "Piercing ucha",
        desc: "Lobe, helix, tragus, conch — sterilní technika, titan nebo chirurgická ocel.",
        price: "od 490 Kč",
      },
      {
        name: "Šperky do uší",
        desc: "Kurátorovaný výběr náušnic a nástavců — výměna a styling po zahojení.",
        price: "od 290 Kč",
      },
    ],
  },
];

export const yogaMatchaOffer: ServiceGroup[] = [
  {
    title: "Lekce",
    items: [
      {
        name: "Jednorázový vstup",
        desc: "Open class dle rozvrhu — vinyasa, hatha nebo yin.",
        price: "320 Kč",
      },
      {
        name: "Yoga & Matcha",
        desc: "Jóga následovaná rituálem matcha — setkání pohybu a mindfulness.",
        price: "450 Kč",
      },
    ],
  },
  {
    title: "Permanentky & kurzy",
    items: [
      {
        name: "Permanentka 10 vstupů",
        desc: "Platnost 3 měsíce — všechny open lekce kromě workshopů.",
        price: "2 790 Kč",
      },
      {
        name: "Měsíční neomezeno",
        desc: "Neomezený přístup na open lekce po dobu 30 dní.",
        price: "3 490 Kč",
      },
      {
        name: "Workshop víkend",
        desc: "Hlubší práce s dechem, mobilitou nebo meditací — sobota 3 h.",
        price: "1 290 Kč",
      },
    ],
  },
  {
    title: "Retreat pobyty",
    items: [
      {
        name: "Víkendový retreat",
        desc: "2 dny jógy, matcha ceremonií a ubytování v přírodě — reset těla i mysli.",
        price: "od 4 900 Kč",
      },
      {
        name: "Týdenní retreat",
        desc: "Intenzivní praxe, workshopy a prostor pro digitální detox.",
        price: "od 14 900 Kč",
      },
    ],
  },
];
