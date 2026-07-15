(function () {
  var grid = document.getElementById("ugcVideoGrid");
  var empty = document.getElementById("ugcVideoEmpty");
  if (!grid) return;

  fetch("/api/nia/cms?scope=ugc", { cache: "no-store" })
    .then(function (r) {
      return r.json();
    })
    .then(function (d) {
      var videos = (d.ok && d.ugcVideos) || [];
      if (!videos.length) {
        if (empty) empty.hidden = false;
        return;
      }
      if (empty) empty.hidden = true;
      grid.innerHTML = videos
        .map(function (v) {
          var poster = v.posterUrl ? ' poster="' + v.posterUrl + '"' : "";
          return (
            '<figure class="reel">' +
            "<video src=\"" +
            v.videoUrl +
            "\"" +
            poster +
            ' muted loop playsinline autoplay preload="metadata"></video>' +
            (v.title ? "<figcaption>" + v.title + "</figcaption>" : "") +
            "</figure>"
          );
        })
        .join("");
      grid.querySelectorAll("video").forEach(function (v) {
        v.addEventListener("click", function () {
          if (v.paused) {
            v.play();
            return;
          }
          v.muted = !v.muted;
        });
      });
    })
    .catch(function () {
      if (empty) {
        empty.hidden = false;
        empty.textContent = "Videa se nepodařilo načíst.";
      }
    });
})();
