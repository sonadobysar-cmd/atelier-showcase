(function () {
  var KEY = "vdelite_cookie_consent";
  var bar = document.getElementById("cookieBar");
  if (!bar) return;
  if (localStorage.getItem(KEY)) return;
  bar.classList.add("on");
  document.getElementById("cookieAccept").addEventListener("click", function () {
    localStorage.setItem(KEY, "accepted");
    bar.classList.remove("on");
  });
  document.getElementById("cookieReject").addEventListener("click", function () {
    localStorage.setItem(KEY, "rejected");
    bar.classList.remove("on");
  });
})();
