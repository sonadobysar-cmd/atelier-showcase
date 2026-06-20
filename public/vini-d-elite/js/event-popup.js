(function () {
  var STORAGE_KEY = "vdelite_event_popup";
  var EVENT_ID = "primitivo-brno-2026-07";
  var modal = document.getElementById("eventModal");
  var target = document.getElementById("akce");
  if (!modal || !target) return;
  if (localStorage.getItem(STORAGE_KEY) === EVENT_ID) return;

  var shown = false;

  function open() {
    if (shown) return;
    shown = true;
    modal.classList.add("on");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }

  function close(persist) {
    modal.classList.remove("on");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (persist) localStorage.setItem(STORAGE_KEY, EVENT_ID);
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          open();
          io.disconnect();
        }
      });
    },
    { threshold: 0.35, rootMargin: "0px 0px -8% 0px" }
  );
  io.observe(target);

  document.getElementById("eventClose").addEventListener("click", function () {
    close(true);
  });
  document.getElementById("eventLater").addEventListener("click", function () {
    close(true);
  });
  modal.querySelector(".event-scrim").addEventListener("click", function () {
    close(true);
  });
  document.getElementById("eventReserve").addEventListener("click", function () {
    close(true);
  });
})();
