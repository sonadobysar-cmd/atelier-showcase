(function () {
  var DNY = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"];
  var schedule = null;
  var selDay = null;
  var selTime = null;
  var konzDays = document.getElementById("konzDays");
  var konzTimes = document.getElementById("konzTimes");
  var konzSummary = document.getElementById("konzSummary");
  var konzForm = document.getElementById("konzForm");
  var konzOk = document.getElementById("konzOk");
  var konzConfirm = document.getElementById("konzConfirm");
  if (!konzDays || !konzTimes || !konzForm) return;

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function fmtDate(dt) {
    return dt.getDate() + ". " + (dt.getMonth() + 1) + ".";
  }

  function dateIso(dt) {
    return dt.getFullYear() + "-" + pad(dt.getMonth() + 1) + "-" + pad(dt.getDate());
  }

  function nextDates(count) {
    var out = [];
    var d = new Date();
    d.setHours(12, 0, 0, 0);
    var guard = 0;
    while (out.length < count && guard < 120) {
      var wd = String(d.getDay());
      if (schedule && schedule.weekly[wd] && schedule.weekly[wd].times.length) {
        out.push(new Date(d));
      }
      d.setDate(d.getDate() + 1);
      guard++;
    }
    return out;
  }

  function renderTimes() {
    konzTimes.innerHTML = "";
    selTime = null;
    if (!selDay || !schedule) return;
    var times = schedule.weekly[String(selDay.getDay())];
    if (!times || !times.times.length) return;
    times.times.forEach(function (t, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "konz-time" + (i === 0 ? " on" : "");
      if (i === 0) selTime = t;
      b.textContent = t;
      b.addEventListener("click", function () {
        document.querySelectorAll(".konz-time").forEach(function (x) {
          x.classList.remove("on");
        });
        b.classList.add("on");
        selTime = t;
        updateSummary();
      });
      konzTimes.appendChild(b);
    });
  }

  function renderDays() {
    konzDays.innerHTML = "";
    selDay = null;
    var dates = nextDates(10);
    dates.forEach(function (dt, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "konz-day" + (i === 0 ? " on" : "");
      if (i === 0) selDay = dt;
      b.innerHTML = '<span class="wd">' + DNY[dt.getDay()] + "</span><span class=\"dt\">" + fmtDate(dt) + "</span>";
      b.addEventListener("click", function () {
        document.querySelectorAll(".konz-day").forEach(function (x) {
          x.classList.remove("on");
        });
        b.classList.add("on");
        selDay = dt;
        renderTimes();
        updateSummary();
      });
      konzDays.appendChild(b);
    });
    renderTimes();
  }

  function updateSummary() {
    if (!selDay || !selTime) {
      konzSummary.textContent = "Vyber den a čas vlevo.";
      return;
    }
    konzSummary.innerHTML =
      "<b>Online konzultace · 30 min</b><br>" + DNY[selDay.getDay()] + " " + fmtDate(selDay) + " · " + selTime;
  }

  function showConfirm(data) {
    if (konzForm) konzForm.hidden = true;
    if (konzOk) konzOk.style.display = "none";
    if (!konzConfirm) return;
    konzConfirm.hidden = false;
    var whenEl = document.getElementById("konzConfirmWhen");
    var refEl = document.getElementById("konzConfirmRef");
    var meetEl = document.getElementById("konzConfirmMeet");
    if (whenEl && selDay && selTime) {
      whenEl.textContent = DNY[selDay.getDay()] + " " + fmtDate(selDay) + " · " + selTime;
    }
    if (refEl) refEl.textContent = data.ref || "";
    if (meetEl) {
      meetEl.href = data.meetUrl || "#";
      meetEl.textContent = "Připojit se přes Google Meet ↗";
    }
    konzConfirm.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  fetch("/api/nia/konzultace")
    .then(function (r) {
      return r.json();
    })
    .then(function (data) {
      schedule = data;
      renderDays();
      updateSummary();
    })
    .catch(function () {
      konzSummary.textContent = "Kalendář se nepodařilo načíst. Obnov stránku nebo napiš na niadobyshar@gmail.com.";
    });

  konzForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!selDay || !selTime) return;
    var btn = konzForm.querySelector('button[type="submit"]');
    var n = document.getElementById("kName").value.trim();
    var m = document.getElementById("kMail").value.trim();
    var ph = document.getElementById("kPhone").value.trim();
    var msg = document.getElementById("kMsg").value.trim();
    var errEl = document.getElementById("konzErr");
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = "";
    }
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Odesílám…";
    }
    fetch("/api/nia/konzultace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: n,
        email: m,
        phone: ph,
        message: msg,
        date: dateIso(selDay),
        time: selTime,
        website: (document.getElementById("kWebsite") || {}).value || "",
      }),
    })
      .then(function (r) {
        return r.json().then(function (data) {
          return { ok: r.ok, data: data };
        });
      })
      .then(function (res) {
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Rezervovat konzultaci ✦";
        }
        if (!res.ok || !res.data.ok) {
          if (errEl) {
            errEl.hidden = false;
            errEl.textContent = (res.data && res.data.error) || "Rezervace se nepodařila.";
          }
          return;
        }
        showConfirm(res.data);
      })
      .catch(function () {
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Rezervovat konzultaci ✦";
        }
        if (errEl) {
          errEl.hidden = false;
          errEl.textContent = "Chyba sítě. Zkus to znovu nebo napiš na niadobyshar@gmail.com.";
        }
      });
  });

  var kForm = document.getElementById("kForm");
  if (kForm) {
    kForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var okEl = document.getElementById("kOk");
      var errEl = document.getElementById("kErr");
      var btn = kForm.querySelector('button[type="submit"]');
      if (errEl) errEl.hidden = true;
      if (btn) btn.disabled = true;
      fetch("/api/nia/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: document.getElementById("fName").value.trim(),
          email: document.getElementById("fMail").value.trim(),
          message: document.getElementById("fMsg").value.trim(),
          website: (document.getElementById("fWebsite") || {}).value || "",
        }),
      })
        .then(function (r) {
          return r.json().then(function (d) {
            return { ok: r.ok, data: d };
          });
        })
        .then(function (res) {
          if (btn) btn.disabled = false;
          if (res.ok && res.data.ok) {
            if (okEl) okEl.style.display = "block";
            kForm.reset();
          } else if (errEl) {
            errEl.hidden = false;
            errEl.textContent = (res.data && res.data.error) || "Odeslání selhalo.";
          }
        })
        .catch(function () {
          if (btn) btn.disabled = false;
          if (errEl) {
            errEl.hidden = false;
            errEl.textContent = "Chyba sítě.";
          }
        });
    });
  }
})();
