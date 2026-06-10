export type ContourService = {
  slug: string;
  name: string;
  shortDesc: string;
  category: string;
  mark: string;
  image: string;
  bestseller?: boolean;
  heroImage?: string;
  intro: string;
  techniques: { name: string; desc: string }[];
  benefits: string[];
  priceFrom: string;
};

export const contourTicker =
  "Perfection is our business, confidence is our mission.";

export const contourWhyItems = [
  {
    num: "01",
    title: "Zdravotnická klinika",
    desc: "Jako jediní nabízíme světové techniky a protokoly pod odborným lékařským dohledem.",
  },
  {
    num: "02",
    title: "Špičková technologie",
    desc: "Nejmodernější přístroje a certifikované materiály prémiové kvality.",
  },
  {
    num: "03",
    title: "Přirozený výsledek",
    desc: "Méně je vždy více — pracujeme s citem pro vaše rysy, ne proti nim.",
  },
  {
    num: "04",
    title: "100% záruka",
    desc: "Záruka spokojenosti a bezplatná kontrola po každém ošetření.",
  },
] as const;

export const contourServices: ContourService[] = [
  {
    slug: "architektura-rtu",
    name: "Architektura rtů",
    shortDesc: "Souměrné, přirozeně plné rty navržené na míru vašemu obličeji.",
    category: "01 — Lip Architecture",
    mark: "A",
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1000&q=90",
    bestseller: true,
    intro:
      "Rty jsou vizitkou obličeje. V Contour Clinic pracujeme s architekturou rtů jako s sochařským oborem — každý zákrok stavíme na anatomii, proporcích a vašem přirozeném výrazu.",
    techniques: [
      {
        name: "Russian Lips",
        desc: "Vertikální aplikace pro výraznější objem růží a definovaný okraj bez přeplácaného efektu.",
      },
      {
        name: "Doll Lips",
        desc: "Zaokrouhlený, mladistvý tvar s důrazem na Cupidův luk a středový objem.",
      },
      {
        name: "Natural Lips",
        desc: "Jemné zvětšení a hydratace — ideální první zákrok nebo refresh.",
      },
      {
        name: "Michelangelo Lips",
        desc: "Autorská sculpting technika — harmonie horního a dolního rtu v souladu s profilem.",
      },
    ],
    benefits: [
      "Individuální návrh tvaru před zákrokem",
      "Prémiové fillery schválené pro EU",
      "Minimální downtime",
      "Konzultace v ceně první návštěvy",
    ],
    priceFrom: "8 500 Kč",
  },
  {
    slug: "contouring-obliceje",
    name: "Contouring obličeje",
    shortDesc: "Harmonizace rysů, definice lícních kostí, brady a linie čelisti.",
    category: "02 — Face Contour",
    mark: "C",
    image:
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=1000&q=90",
    intro:
      "Contouring obličeje kyselinou hyaluronovou umožňuje precizně tvarovat profil, zjemnit asymetrie a získat ostřejší, vyváženější rysy — bez operační rekonvalescence.",
    techniques: [
      {
        name: "Jawline & brada",
        desc: "Definice čelistní linie a projekce brady pro harmonický profil.",
      },
      {
        name: "Korekce nosu",
        desc: "Nechirurgické vyrovnání hřbetu a špičky nosu fillerem.",
      },
      {
        name: "Balíček Dokonalý profil",
        desc: "Komplexní modelace rty · brada · jawline · nos dle plánu.",
      },
      {
        name: "Lifting střední třetiny",
        desc: "Obnovení objemu v oblasti lícních kostí a spánků.",
      },
    ],
    benefits: [
      "Okamžitě viditelný výsledek",
      "Postupné budování objemu dle tolerance",
      "3D analýza obličeje na konzultaci",
      "Dlouhodobá spolupráce s plánem údržby",
    ],
    priceFrom: "11 900 Kč",
  },
  {
    slug: "botox-a-nite",
    name: "Botox a nitě",
    shortDesc: "Vyhlazení mimických vrásek, prevence a nechirurgický lifting.",
    category: "03 — Botox & Threads",
    mark: "B",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1000&q=90",
    intro:
      "Kombinujeme přesnou aplikaci botulotoxinu s moderními liftingovými technikami nití — pro mladší vzhled, který stále vypadá jako vy.",
    techniques: [
      {
        name: "Baby Botox",
        desc: "Mikrodávky pro jemnou prevenci vrásek při zachování mimiky.",
      },
      {
        name: "Lifting obočí & očí",
        desc: "Otevření pohledu, redukce vrásek kolem očí a na čele.",
      },
      {
        name: "PDO mono nitě",
        desc: "Stimulace kolagenu a jemné zpevnění povislé pleti.",
      },
      {
        name: "Kogrední nitě",
        desc: "Výraznější lifting efekt v oblasti kontur a střední třetiny.",
      },
    ],
    benefits: [
      "Certifikovaní lékaři s estetickou praxí",
      "Kombinované protokoly botox + nitě",
      "Minimální invazivita",
      "Výsledek do 14 dnů",
    ],
    priceFrom: "3 900 Kč",
  },
  {
    slug: "morpheus8",
    name: "Morpheus8",
    shortDesc: "Frakční radiofrekvence pro pevnější, vypnutou a svěží pleť.",
    category: "04 — Skin Remodelling",
    mark: "M",
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=88",
    intro:
      "Morpheus8® spojuje mikrojehličkování s hlubokou radiofrekvencí. Stimuluje kolagen, zpevňuje pokožku a remodeluje kontury obličeje i těla.",
    techniques: [
      {
        name: "Obličej — lifting & textura",
        desc: "Zpevnění pleti, redukce pórů a jemných vrásek.",
      },
      {
        name: "Podbradek & krk",
        desc: "Cílená remodelace oblasti pod bradou a na krku.",
      },
      {
        name: "Kombinace s PDRN",
        desc: "Regenerační boost pro maximální obnovu pokožky.",
      },
      {
        name: "Tělo — strie & celulitida",
        desc: "Frakční RF i na problematické partie těla.",
      },
    ],
    benefits: [
      "Technologie InMode® — světový standard",
      "Minimální rekonvalescence",
      "Progresivní zlepšování 3–6 měsíců",
      "Vhodné i pro citlivou pleť",
    ],
    priceFrom: "6 900 Kč",
  },
  {
    slug: "lipolyza",
    name: "Lipolýza",
    shortDesc: "Cílené rozpuštění lokálních tukových polštářů bez skalpelu.",
    category: "05 — Body Sculpt",
    mark: "L",
    image:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=88",
    intro:
      "Cílená lipolýza rozpouští tukové buňky v problematických oblastech — podbradek, břicho, boky — bez chirurgického zákroku a s rychlým návratem do běžného režimu.",
    techniques: [
      {
        name: "Podbradek (double chin)",
        desc: "Nejčastější indikace — ostřejší profil bez operace.",
      },
      {
        name: "Břicho & boky",
        desc: "Lokální redukce odolných tukových depot.",
      },
      {
        name: "Kombinace s Morpheus8",
        desc: "Současné zpevnění pokožky po redukci objemu.",
      },
    ],
    benefits: [
      "Bez celkové anestezie",
      "Viditelný efekt po 2–4 týdnech",
      "Individuální plán dle anatomie",
      "Doplnění o konturovací protokol",
    ],
    priceFrom: "4 500 Kč",
  },
  {
    slug: "laserove-osetreni",
    name: "Laserové ošetření",
    shortDesc: "Rovnoměrný tón, redukce pigmentací a viditelně hladší pleť.",
    category: "06 — Laser Care",
    mark: "L",
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&q=88",
    intro:
      "Disponujeme laserovými platformami pro epilaci, léčbu pigmentací, akné a celkové omlazení pleti. Každý protokol sestavujeme podle typu pokožky a cíle.",
    techniques: [
      {
        name: "Laserová epilace",
        desc: "Trvalá redukce chloupků na obličeji i těle.",
      },
      {
        name: "Pigmentace & skvrny",
        desc: "Cílené ošetření melasm, slunečních skvrn a nerovnoměrného tónu.",
      },
      {
        name: "Akné & jizvičky",
        desc: "Redukce aktivního akné a zlepšení textury po jizvách.",
      },
      {
        name: "Rejuvenizace",
        desc: "Stimulace kolagenu a celkové zlepšení kvality pleti.",
      },
    ],
    benefits: [
      "Bezpečné pro většinu fototypů",
      "Kombinace s domácí péčí na míru",
      "Pravidelné kontrolní protokoly",
      "Certifikované operátory",
    ],
    priceFrom: "1 890 Kč",
  },
];

export type PriceRow = { name: string; price: string; note?: string };
export type PriceCategory = { title: string; rows: PriceRow[] };

export const contourPriceList: PriceCategory[] = [
  {
    title: "Konzultace",
    rows: [
      { name: "Úvodní konzultace s lékařem", price: "1 500 Kč", note: "45 min · započítává se při zákroku" },
      { name: "Kontrolní prohlídka", price: "zdarma", note: "do 14 dnů po zákroku" },
    ],
  },
  {
    title: "Architektura rtů",
    rows: [
      { name: "Natural Lips", price: "od 8 500 Kč" },
      { name: "Doll Lips", price: "od 9 500 Kč" },
      { name: "Russian Lips", price: "od 9 900 Kč" },
      { name: "Michelangelo Lips", price: "od 10 900 Kč" },
      { name: "Doplnění / refresh", price: "od 6 900 Kč" },
    ],
  },
  {
    title: "Contouring obličeje",
    rows: [
      { name: "Brada", price: "od 11 900 Kč" },
      { name: "Jawline", price: "od 12 900 Kč" },
      { name: "Korekce nosu", price: "od 13 900 Kč" },
      { name: "Balíček Dokonalý profil", price: "individuálně" },
    ],
  },
  {
    title: "Botox a nitě",
    rows: [
      { name: "Baby Botox", price: "od 3 900 Kč" },
      { name: "Čelo + obočí", price: "od 4 900 Kč" },
      { name: "Havraní nohy + oči", price: "od 4 200 Kč" },
      { name: "PDO mono nitě (1 oblast)", price: "od 8 900 Kč" },
      { name: "Kogrední nitě", price: "od 14 900 Kč" },
    ],
  },
  {
    title: "Morpheus8 & regenerace",
    rows: [
      { name: "Morpheus8 — obličej", price: "od 6 900 Kč" },
      { name: "Morpheus8 — podbradek", price: "od 5 500 Kč" },
      { name: "PDRN injekce", price: "od 4 200 Kč" },
      { name: "Kombinovaný protokol", price: "individuálně" },
    ],
  },
  {
    title: "Lipolýza",
    rows: [
      { name: "Podbradek", price: "od 4 500 Kč" },
      { name: "Břicho (1 oblast)", price: "od 6 900 Kč" },
      { name: "Boky / love handles", price: "od 7 500 Kč" },
    ],
  },
  {
    title: "Laser",
    rows: [
      { name: "Epilace — obličej (1 oblast)", price: "od 890 Kč" },
      { name: "Epilace — celé nohy", price: "od 3 900 Kč" },
      { name: "Pigmentace / skvrny", price: "od 1 890 Kč" },
      { name: "Rejuvenizační protokol", price: "od 2 900 Kč" },
    ],
  },
];

export const contourGallery = [
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=85",
  "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=600&q=85",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=85",
  "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&q=85",
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=85",
  "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=85",
];

export function getContourService(slug: string) {
  return contourServices.find((s) => s.slug === slug);
}
