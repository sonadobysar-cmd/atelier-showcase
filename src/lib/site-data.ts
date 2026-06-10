import type { BookingService } from "./booking";
import type { ShopProduct } from "./shop";

export const contourBooking: BookingService[] = [
  { id: "konzultace", name: "Úvodní konzultace", duration: "45 min", price: "1 500 Kč" },
  { id: "rty", name: "Architektura rtů", duration: "60 min", price: "od 8 500 Kč" },
  { id: "contouring", name: "Contouring obličeje", duration: "60 min", price: "od 11 900 Kč" },
  { id: "botox", name: "Botox a nitě", duration: "30–60 min", price: "od 3 900 Kč" },
  { id: "morpheus", name: "Morpheus8", duration: "60 min", price: "od 6 900 Kč" },
  { id: "lipolyza", name: "Lipolýza", duration: "45 min", price: "od 4 500 Kč" },
  { id: "laser", name: "Laserové ošetření", duration: "30–90 min", price: "od 1 890 Kč" },
];

/** @deprecated use contourBooking */
export const elizaBooking = contourBooking;

export const hairFactoryBooking: BookingService[] = [
  { id: "strih", name: "Autorský střih", duration: "60 min", price: "od 990 Kč" },
  { id: "barva", name: "Autorské barvení", duration: "150 min", price: "od 2 490 Kč" },
  { id: "keratin", name: "Keratin / Hair Botox", duration: "120 min", price: "od 1 890 Kč" },
  { id: "prodlouzeni", name: "Konzultace prodlužování", duration: "45 min", price: "zdarma" },
];

export const lashLoftBooking: BookingService[] = [
  { id: "korean-lift", name: "Korean Lash Lift", duration: "75 min", price: "od 1 090 Kč" },
  { id: "lash-lift", name: "Classic Lash Lift", duration: "60 min", price: "od 890 Kč" },
  { id: "extensions", name: "Nový set řas", duration: "120 min", price: "od 1 390 Kč" },
  { id: "brow", name: "Brow bar — laminace + barva", duration: "45 min", price: "od 790 Kč" },
];

export const glossBooking: BookingService[] = [
  { id: "korean-lift", name: "Korean Lash Lift", duration: "60 min", price: "1 290 Kč" },
  { id: "brow-arch", name: "Brow Architecture", duration: "45 min", price: "990 Kč" },
  { id: "hydra-glow", name: "Hydra-Glow Facial", duration: "75 min", price: "1 690 Kč" },
  { id: "classic-lash", name: "Classic Lash Set", duration: "90 min", price: "1 290 Kč" },
];

export const revolutionBooking: BookingService[] = [
  { id: "pmu-oboči", name: "PMU obočí", duration: "150 min", price: "od 5 900 Kč" },
  { id: "pmu-rty", name: "Aquarelle / konturka rtů", duration: "150 min", price: "od 5 200 Kč" },
  { id: "pmu-oci", name: "Baby Line / Shadow Lines", duration: "120 min", price: "od 4 900 Kč" },
  { id: "korekce", name: "Korekce PMU", duration: "90 min", price: "od 1 500 Kč" },
];

export const sknTtBooking: BookingService[] = [
  { id: "walkin", name: "Fine line walk-in", duration: "dle motivu", price: "od 800 Kč" },
  { id: "custom", name: "Custom fine line", duration: "120+ min", price: "od 2 500 Kč" },
  { id: "piercing", name: "Piercing", duration: "30 min", price: "od 490 Kč" },
];

export const yogaBooking: BookingService[] = [
  { id: "vstup", name: "Jednorázový vstup", duration: "60–75 min", price: "320 Kč" },
  { id: "matcha", name: "Yoga & Matcha", duration: "90 min", price: "450 Kč" },
  { id: "retreat", name: "Víkendový retreat", duration: "2 dny", price: "od 4 900 Kč" },
  { id: "workshop", name: "Workshop", duration: "3 h", price: "1 290 Kč" },
];

export const coachServices: BookingService[] = [
  { id: "uvod", name: "Úvodní hovor", duration: "30 min", price: "zdarma" },
  { id: "session", name: "Koučovací session", duration: "60 min", price: "2 200 Kč" },
  { id: "program", name: "Program 6 sessioní", duration: "balíček", price: "11 900 Kč" },
];

export const yogaSchedule = [
  { day: "Pondělí", classes: [{ time: "7:00", name: "Vinyasa", teacher: "Eli" }, { time: "18:30", name: "Yoga & Matcha", teacher: "Eli" }] },
  { day: "Úterý", classes: [{ time: "17:00", name: "Yin jóga", teacher: "Tom" }] },
  { day: "Středa", classes: [{ time: "7:00", name: "Hatha", teacher: "Tom" }, { time: "19:00", name: "Yoga & Matcha", teacher: "Eli" }] },
  { day: "Čtvrtek", classes: [{ time: "18:00", name: "Vinyasa flow", teacher: "Eli" }] },
  { day: "Pátek", classes: [{ time: "7:30", name: "Ranní praxe", teacher: "Tom" }] },
  { day: "Sobota", classes: [{ time: "9:00", name: "Workshop víkend", teacher: "Eli & Tom" }, { time: "11:00", name: "Yin & matcha", teacher: "Eli" }] },
];

export const paulMitchellProducts: ShopProduct[] = [
  {
    id: "pm-shampoo",
    name: "Paul Mitchell® Extra-Body Daily Boost",
    price: 690,
    description: "Šampon pro objem · 300 ml.",
    image: "https://images.unsplash.com/photo-1608248543801-ba977fed7ae9?w=600&q=80",
  },
  {
    id: "pm-mask",
    name: "Paul Mitchell® Neuro Smooth Iron Mask",
    price: 890,
    description: "Vyhlazující maska pro nepoddajné vlasy.",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80",
  },
  {
    id: "pm-oil",
    name: "Paul Mitchell® Super Skinny Serum",
    price: 790,
    description: "Sérum pro rychlejší foukání a tepelnou ochranu.",
    image: "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=600&q=80",
  },
];

export const revolutionShopProducts: ShopProduct[] = [
  {
    id: "pigment",
    name: "PMU pigment — warm brown",
    price: 890,
    description: "Profesionální pigment pro pudrové obočí · 15 ml.",
    image: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=600&q=80",
  },
  {
    id: "strojek",
    name: "PMU strojek — pen",
    price: 4_900,
    description: "Bezdrátové PMU pero, nastavitelný výkon.",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
  },
  {
    id: "jehly",
    name: "Cartridge jehly — mix 20 ks",
    price: 490,
    description: "Nano a shader cartridge pro PMU práci.",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80",
  },
];

export const coffeeProducts: ShopProduct[] = [
  {
    id: "etiopie",
    name: "Etiopie Yirgacheffe",
    price: 320,
    description: "250 g · filtrovaná káva, květinové tóny.",
    image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600&q=80",
  },
  {
    id: "brazilie",
    name: "Brazílie Santos",
    price: 290,
    description: "250 g · oříšek, čokoláda.",
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80",
  },
];

export const caffeholicMenu = [
  { name: "Espresso", price: "55 Kč" },
  { name: "Flat white", price: "75 Kč" },
  { name: "Pour-over V60", price: "85 Kč" },
  { name: "Cold brew", price: "79 Kč" },
  { name: "Matcha latte", price: "95 Kč" },
  { name: "Croissant máslový", price: "55 Kč" },
];

export const petraSladekPrograms = [
  {
    name: "Kariérní koučink 1:1",
    desc: "Pro lidi na rozcestí — jasná vize, rozhodnutí a konkrétní kroky bez prázdných frází.",
    price: "2 200 Kč / session",
  },
  {
    name: "Life coaching",
    desc: "Rovnováha, hranice a návyky — když vás život přetěžuje a potřebujete nadhled.",
    price: "2 200 Kč / session",
  },
  {
    name: "Balíček 6 sessioní",
    desc: "Hlubší práce na jednom tématu s průběžnou podporou mezi setkáními.",
    price: "11 900 Kč",
  },
];

export const sknTtPortfolio = [
  { artist: "SKN", style: "Fine line botanika", image: "https://images.unsplash.com/photo-1590246814883-57c511b30dd2?w=600&q=80" },
  { artist: "SKN", style: "Minimal symbol", image: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=600&q=80" },
  { artist: "TT", style: "Jemná geometrie", image: "https://images.unsplash.com/photo-1598371839696-5c5bb00f9a77?w=600&q=80" },
  { artist: "TT", style: "Single needle script", image: "https://images.unsplash.com/photo-1562962234-7e5a740d05b8?w=600&q=80" },
];
