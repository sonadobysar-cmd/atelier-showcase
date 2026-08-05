window.VINI_CATALOG = [
  {id:1,name:'San Lorenzo',region:'Piemonte',grape:'Nebbiolo d’Alba DOC',price:null,type:'red',sweet:0,body:2,intensity:2,tone:'floral',pairing:['maso','syr'],desc:'Elegantní piemontské Nebbiolo s vůní červeného ovoce, květin a jemného koření. Strukturované víno s dlouhým závěrem.',p:{ac:2,tn:2,ok:1,mn:1,sp:1,fr:'fresh',adv:2,wm:0,cx:2,mood:['dinner','cellar','gift']}},
  {id:2,name:'La Cappelletta',region:'Piemonte',grape:'Barbera d’Asti DOCG Superiore · 2019',price:null,type:'red',sweet:0,body:2,intensity:2,tone:'fruity',pairing:['maso','syr'],desc:'Plnější Barbera s energií zralých třešní, švestek a decentního koření. Harmonická volba k italské kuchyni i pomalému večeru.',p:{ac:2,tn:1,ok:1,mn:0,sp:1,fr:'ripe',adv:1,wm:0,cx:2,mood:['dinner','gift']}},
  {id:3,name:'Barbera d’Asti',region:'Piemonte',grape:'Barbera d’Asti DOCG',price:null,type:'red',sweet:0,body:1,intensity:2,tone:'fruity',pairing:['maso','syr'],desc:'Šťavnatá a živá Barbera s tóny višní a lesního ovoce. Univerzální gastronomické víno s typickou piemontskou svěžestí.',p:{ac:2,tn:1,ok:0,mn:0,sp:1,fr:'fresh',adv:0,wm:0,cx:1,mood:['dinner','solo']}},
  {id:4,name:'Grignolino',region:'Piemonte',grape:'Piemonte Grignolino DOC',price:null,type:'red',sweet:0,body:0,intensity:1,tone:'floral',pairing:['syr','solo'],desc:'Lehčí, osobité červené s jemnou kořenitostí, červeným ovocem a květinovou vůní. Skvělé lehce vychlazené k předkrmům.',p:{ac:2,tn:1,ok:0,mn:0,sp:1,fr:'fresh',adv:1,wm:0,cx:1,mood:['aperitiv','dinner','solo']}},
  {id:5,name:'Dolcetto',region:'Monferrato',grape:'Monferrato Dolcetto DOC',price:null,type:'red',sweet:0,body:1,intensity:2,tone:'fruity',pairing:['maso','syr'],desc:'Suché červené s chutí tmavých třešní, švestek a lehce mandlovým dozvukem. Přímé, přátelské a výborné k jídlu.',p:{ac:1,tn:1,ok:0,mn:0,sp:0,fr:'ripe',adv:0,wm:0,cx:1,mood:['dinner','solo']}},
  {id:6,name:'Freisa d’Asti',region:'Piemonte',grape:'Freisa d’Asti DOC',price:null,type:'red',sweet:0,body:1,intensity:1,tone:'fruity',pairing:['maso','syr'],desc:'Charakterní piemontská Freisa s červeným ovocem, bylinkami a jemným kořením. Svěží styl, který krásně doprovodí uzeniny a těstoviny.',p:{ac:2,tn:1,ok:0,mn:0,sp:1,fr:'fresh',adv:1,wm:0,cx:1,mood:['dinner','aperitiv']}},
  {id:7,name:'Cisterna d’Asti',region:'Piemonte',grape:'Cisterna d’Asti DOC',price:null,type:'red',sweet:0,body:1,intensity:2,tone:'fruity',pairing:['maso','syr'],desc:'Výrazné, přitom příjemně ovocné červené z okolí Asti. Nabízí zralé bobulové ovoce, koření a hebký závěr.',p:{ac:1,tn:1,ok:0,mn:0,sp:1,fr:'ripe',adv:1,wm:0,cx:1,mood:['dinner','gift']}},
  {id:8,name:'Bric du Sivu',region:'Piemonte',grape:'Affinato in barriques',price:null,type:'red',sweet:0,body:2,intensity:2,tone:'woody',pairing:['maso','syr'],desc:'Plné červené zrající v barikových sudech. Tmavé ovoce, koření a uhlazené dřevité tóny vytvářejí hluboký, slavnostní charakter.',p:{ac:1,tn:2,ok:2,mn:0,sp:2,fr:'ripe',adv:2,wm:0,cx:2,mood:['dinner','cellar','gift']}},
  {id:9,name:'Mini Fior',region:'Piemonte',grape:'Vino Spumante Brut',price:null,type:'sparkling',sweet:0,body:0,intensity:0,tone:'floral',pairing:['aperitiv','ryba'],desc:'Svěží brut s jemným perlením, květinovou vůní a čistým ovocným projevem. Elegantní aperitiv i lehký doprovod slavnostních okamžiků.',p:{ac:2,tn:0,ok:0,mn:1,sp:0,fr:'fresh',adv:0,wm:0,cx:1,mood:['aperitiv','celebration','gift']}}
];

window.VINI_IMAGES = {
  1:'images/wines/san-lorenzo.png',
  2:'images/wines/la-cappelletta.png',
  3:'images/wines/barbera-dasti.png',
  4:'images/wines/grignolino.png',
  5:'images/wines/dolcetto.png',
  6:'images/wines/freisa-dasti.png',
  7:'images/wines/cisterna-dasti.png',
  8:'images/wines/bric-du-sivu.png',
  9:'images/wines/mini-fior.png'
};

window.viniPriceLabel = function () { return 'Cena na dotaz'; };
window.viniContactHref = function (wine) {
  return 'mailto:obchod@vinidelite.cz?subject=' + encodeURIComponent('Poptávka vína: ' + wine.name);
};
