/* Vini d’Elite — transparentní hodnocení bez smyšlených referencí. */
(function () {
  function stars(value) {
    var rounded = Math.round(value);
    return '★★★★★'.slice(0, rounded) + '☆☆☆☆☆'.slice(rounded);
  }

  window.renderWineReviews = function (wine) {
    var reviews = (window.VINI_REVIEWS && window.VINI_REVIEWS[wine.id]) || [];
    var count = reviews.length;
    var score = count
      ? reviews.reduce(function (sum, review) { return sum + review.rating; }, 0) / count
      : null;
    var list = reviews.map(function (review) {
      return '<article class="review-card">' +
        '<div class="review-head"><div><div class="review-author">' + review.author + '</div>' +
        '<div class="stars" aria-label="' + review.rating + ' z 5 hvězdiček">' + stars(review.rating) + '</div></div>' +
        '<time class="review-date">' + review.date + '</time></div>' +
        '<p>' + review.text + '</p></article>';
    }).join('');
    var empty = '<div class="review-empty">Toto víno zatím nemá zveřejněnou ověřenou recenzi. ' +
      'Hodnocení nevymýšlíme — zobrazíme je až po skutečné ochutnávce.<br>' +
      '<a href="kontakt.html?tema=Recenze%20vína&vino=' + encodeURIComponent(wine.name) + '">' +
      'Napsat vlastní recenzi</a></div>';
    var label = count ? count + (count === 1 ? ' ověřené hodnocení' : ' ověřených hodnocení') : 'Zatím bez ověřeného hodnocení';
    var button = count ? 'Přečíst recenze' : 'Více o recenzích';

    document.getElementById('reviews').innerHTML =
      '<div class="review-summary"><div class="review-score">' +
      (score ? score.toFixed(1).replace('.', ',') : '—') + '<small>/5</small></div>' +
      '<div><div class="stars" aria-hidden="true">' + (score ? stars(score) : '☆☆☆☆☆') + '</div>' +
      '<div class="review-meta">' + label + '</div></div>' +
      '<button class="review-toggle" type="button" aria-expanded="false" aria-controls="reviewList">' + button + '</button></div>' +
      '<div class="review-list" id="reviewList" hidden>' + (list || empty) + '</div>';

    var toggle = document.querySelector('.review-toggle');
    var reviewList = document.getElementById('reviewList');
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.textContent = open ? button : 'Skrýt recenze';
      reviewList.hidden = open;
    });
  };
}());
