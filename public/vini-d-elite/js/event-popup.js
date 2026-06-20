(function () {
  var STORAGE_KEY = "vdelite_event_popup";
  var EVENT_ID = "primitivo-brno-2026-07";
  var modal = document.getElementById("eventModal");
  if (!modal) return;
  if (localStorage.getItem(STORAGE_KEY) === EVENT_ID) return;

  function close(persist) {
    modal.classList.remove("on");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (persist) localStorage.setItem(STORAGE_KEY, EVENT_ID);
  }

  setTimeout(function () {
    modal.classList.add("on");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  }, 1600);

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
