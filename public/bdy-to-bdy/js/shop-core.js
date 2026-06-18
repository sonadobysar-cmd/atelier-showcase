/* BDY to BDY — sdílená data a konfigurace objednávek */
(function (global) {
  var PRODUCTS = [
    { id: 1, name: 'Legíny Sculpt', cat: 'Legíny', price: 1290, rating: 5, rev: 214, tag: 'Bestseller', sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Černá', 'Šedá'] },
    { id: 2, name: 'Podprsenka Air', cat: 'Podprsenky', price: 890, rating: 5, rev: 168, tag: 'Bestseller', sizes: ['XS', 'S', 'M', 'L'], colors: ['Krémová', 'Černá'] },
    { id: 3, name: 'Top Seamless', cat: 'Topy', price: 790, rating: 4, rev: 96, tag: '', sizes: ['S', 'M', 'L', 'XL'], colors: ['Černá', 'Krémová'] },
    { id: 4, name: 'Kraťasy Move', cat: 'Kraťasy', price: 990, rating: 5, rev: 132, tag: '', sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Krémová', 'Černá'] },
    { id: 5, name: 'Mikina Oversize', cat: 'Mikiny', price: 1490, rating: 5, rev: 88, tag: 'Novinka', sizes: ['S', 'M', 'L', 'XL'], colors: ['Krémová', 'Šedá'] },
    { id: 6, name: 'Legíny Flow', cat: 'Legíny', price: 1190, rating: 4, rev: 74, tag: '', sizes: ['XS', 'S', 'M', 'L'], colors: ['Černá'] },
    { id: 7, name: 'Mikina Studio', cat: 'Mikiny', price: 1590, rating: 5, rev: 41, tag: 'Novinka', sizes: ['S', 'M', 'L', 'XL'], colors: ['Krémová', 'Šedá'] },
    { id: 8, name: 'Kšiltovka', cat: 'Doplňky', price: 490, rating: 4, rev: 120, tag: '', sizes: ['UNI'], colors: ['Krémová', 'Černá'] }
  ];

  var IMG = {
    1: 'img/product-1.jpg',
    2: 'img/product-2.jpg',
    3: 'img/product-3.jpg',
    4: 'img/product-4.jpg',
    5: 'img/product-5.jpg',
    6: 'img/product-6.jpg',
    7: 'img/product-7.jpg',
    8: 'img/product-8.jpg'
  };

  /* Nahraď vlastním Formspree ID: https://formspree.io → New form → zkopíruj /f/xxxxx */
  var FORMSPREE_ORDER_URL = 'https://formspree.io/f/YOUR_FORM_ID';

  function find(id) {
    for (var i = 0; i < PRODUCTS.length; i++) {
      if (PRODUCTS[i].id == id) return PRODUCTS[i];
    }
    return null;
  }

  function buildOrderPayload(opts) {
    var lines = (opts.items || []).map(function (row) {
      var p = find(row.id);
      return (p ? p.name : 'Produkt #' + row.id) + ' · ' + row.size + ' × ' + row.qty + ' — ' + (p ? p.price * row.qty : 0) + ' Kč';
    });

    return {
      _subject: 'BDY to BDY — objednávka ' + opts.orderNo,
      order_no: opts.orderNo,
      email: opts.email,
      first_name: opts.firstName,
      last_name: opts.lastName,
      phone: opts.phone || '',
      address: opts.address,
      city: opts.city,
      zip: opts.zip,
      country: opts.country || 'Česká republika',
      shipping: opts.shipping,
      payment: opts.payment,
      promo: opts.promo || '',
      gift_wrap: opts.giftWrap ? 'Ano (+49 Kč)' : 'Ne',
      subtotal: opts.subtotal + ' Kč',
      discount: opts.discount ? '−' + opts.discount + ' Kč' : '0 Kč',
      shipping_cost: opts.shippingCost === 0 ? 'Zdarma' : opts.shippingCost + ' Kč',
      total: opts.total + ' Kč',
      delivery_estimate: opts.deliveryEstimate,
      items: lines.join('\n'),
      cart_json: JSON.stringify(opts.items)
    };
  }

  function submitOrder(payload) {
    if (!FORMSPREE_ORDER_URL || FORMSPREE_ORDER_URL.indexOf('YOUR_FORM_ID') > -1) {
      return Promise.reject(new Error('FORM_NOT_CONFIGURED'));
    }
    return fetch(FORMSPREE_ORDER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error('ORDER_FAILED');
      return res.json();
    });
  }

  global.BDY = {
    PRODUCTS: PRODUCTS,
    IMG: IMG,
    FORMSPREE_ORDER_URL: FORMSPREE_ORDER_URL,
    find: find,
    buildOrderPayload: buildOrderPayload,
    submitOrder: submitOrder
  };

  /* Zpětná kompatibilita — inline skripty používají PRODUCTS a IMG přímo */
  global.PRODUCTS = PRODUCTS;
  global.IMG = IMG;
})(typeof window !== 'undefined' ? window : this);
