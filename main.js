/* =====================================================================
   Jordan River MBC — site behavior
   You should not need to edit this file. Church details live in config.js.
   ===================================================================== */
(function () {
  "use strict";
  var C = window.JR_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var has = function (v) { return typeof v === "string" ? v.trim().length > 0 : !!v; };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var digits = function (s) { return String(s || "").replace(/[^\d+]/g, ""); };

  function fullAddress() {
    if (!has(C.streetAddress)) return "";
    var line2 = [C.city, [C.state, C.zip].filter(has).join(" ")].filter(has).join(", ");
    return C.streetAddress + ", " + line2;
  }
  function cityLine() { return [C.city, C.state].filter(has).join(", "); }

  /* ------------------------------------------------------------------
     1. Navigation
  ------------------------------------------------------------------ */
  function initNav() {
    var toggle = $(".nav-toggle"), nav = $(".main-nav");
    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      $$("a", nav).forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }); });
      document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("open")) { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); toggle.focus(); } });
    }
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ------------------------------------------------------------------
     2. Fill in church details from config.js
  ------------------------------------------------------------------ */
  function setText(el, val) { el.textContent = val; el.classList.remove("ph", "ph-block"); }

  function disableLink(el, reason) {
    el.removeAttribute("href");
    el.classList.add("is-disabled");
    el.setAttribute("aria-disabled", "true");
    if (reason) el.setAttribute("title", reason);
    var lbl = el.getAttribute("data-missing-label");
    if (lbl) { var t = $(".lbl", el) || el; t.textContent = lbl; }
    el.addEventListener("click", function (e) { e.preventDefault(); });
    if (el.hasAttribute("data-hide-if-missing")) (el.closest("p") || el).hidden = true;
  }

  function linkFor(kind) {
    var g = C.giving || {}, s = C.social || {}, y = C.youtube || {}, addr = fullAddress();
    switch (kind) {
      case "tel": return has(C.phone) ? "tel:" + digits(C.phone) : "";
      case "sms": var n = C.textNumber || ""; return has(n) ? "sms:" + digits(n) : "";
      case "mailto": return has(C.email) ? "mailto:" + C.email.trim() : "";
      case "prayer-mail": var pm = C.prayerEmail || C.email; return has(pm) ? "mailto:" + pm.trim() + "?subject=" + encodeURIComponent("Prayer Request") : "";
      case "directions": return addr ? "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(addr) : "";
      case "giving": return has(g.url) ? g.url : "";
      case "giving:tithes": case "giving:offerings": case "giving:special": case "giving:missions":
        var f = (g.funds || {})[kind.split(":")[1]]; return has(f) ? f : (has(g.url) ? g.url : "");
      case "facebook": return s.facebook || "";
      case "instagram": return s.instagram || "";
      case "youtube": return s.youtube || (has(y.channelId) ? "https://www.youtube.com/channel/" + y.channelId : "");
      case "youtube-live": return has(y.channelId) ? "https://www.youtube.com/channel/" + y.channelId + "/live" : (s.youtube || "");
      case "calendar-subscribe": var id = (C.calendar || {}).googleCalendarId; return has(id) ? "https://calendar.google.com/calendar/ical/" + encodeURIComponent(id) + "/public/basic.ics" : "";
      case "calendar-google": var id2 = (C.calendar || {}).googleCalendarId; return has(id2) ? "https://calendar.google.com/calendar/u/0/r?cid=" + encodeURIComponent(id2) : "";
    }
    return "";
  }

  function bindConfig() {
    if (C.showPlaceholderMarkers) document.body.classList.add("show-ph");

    $$("[data-cfg]").forEach(function (el) {
      var key = el.getAttribute("data-cfg"), val = "";
      if (key === "address") val = fullAddress();
      else if (key === "cityline") val = cityLine();
      else if (key.indexOf(".") > -1) { var p = key.split("."); val = (C[p[0]] || {})[p[1]]; }
      else val = C[key];
      if (has(val)) setText(el, val);
    });

    $$("[data-link]").forEach(function (el) {
      var kind = el.getAttribute("data-link"), href = linkFor(kind);
      if (href) {
        el.setAttribute("href", href);
        if (/^https?:/.test(href) && kind !== "calendar-subscribe") { el.setAttribute("target", "_blank"); el.setAttribute("rel", "noopener"); }
      } else {
        disableLink(el, el.getAttribute("data-missing-title") || "Coming soon — not yet set up");
      }
    });

    // Service times
    var times = (C.serviceTimes || []).filter(function (t) { return has(t.name); });
    $$("[data-service-times]").forEach(function (ul) {
      ul.innerHTML = times.map(function (t) {
        return '<li><span class="t-name">' + esc(t.name) + '</span><span class="t-time' + (has(t.time) ? "" : " ph") + '">' + (has(t.time) ? esc(t.time) : "Time TBA") + "</span></li>";
      }).join("");
    });
    $$("[data-service-times-inline]").forEach(function (ul) {
      ul.innerHTML = times.map(function (t) { return "<li>" + esc(t.name) + ": " + (has(t.time) ? esc(t.time) : '<span class="ph">Time TBA</span>') + "</li>"; }).join("");
    });

    var allTimes = times.length && times.every(function (t) { return has(t.time); });
    $$("[data-times-note]").forEach(function (el) { el.hidden = allTimes; });

    // Images
    $$("[data-logo]").forEach(function (img) { if (has(C.logo)) { img.src = C.logo; img.hidden = false; } else img.remove(); });
    $$("[data-logo-slot]").forEach(function (el) { if (has(C.logo)) el.remove(); });
    var hero = $(".hero[data-hero]");
    if (hero && has(C.heroImage)) {
      hero.classList.add("has-image");
      hero.style.backgroundImage = "linear-gradient(160deg, rgba(7,15,31,.88), rgba(11,26,51,.72)), url('" + C.heroImage.replace(/'/g, "%27") + "')";
    }
    $$("[data-img-key]").forEach(function (box) {
      var src = C[box.getAttribute("data-img-key")];
      if (has(src)) box.innerHTML = '<img src="' + esc(src) + '" alt="' + esc(box.getAttribute("data-alt") || C.churchName) + '" loading="lazy">';
    });
    $$("[data-pastor-photo]").forEach(function (box) {
      if (has(C.pastorPhoto)) box.innerHTML = '<img src="' + esc(C.pastorPhoto) + '" alt="Photo of the pastor">';
    });
    $$("[data-gallery]").forEach(function (g) {
      var imgs = C.galleryImages || [];
      if (imgs.length) g.innerHTML = imgs.map(function (src) { return '<div class="photo"><img src="' + esc(src) + '" alt="Jordan River church photo" loading="lazy"></div>'; }).join("");
    });

    // Map
    $$("[data-map]").forEach(function (box) {
      var a = fullAddress();
      if (a) box.outerHTML = '<iframe class="map-frame" title="Map showing the location of ' + esc(C.churchName) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=' + encodeURIComponent(C.churchName + ", " + a) + '&output=embed"></iframe>';
    });

    // Giving fee note
    $$("[data-fee-note]").forEach(function (el) { var n = (C.giving || {}).feeNote; if (has(n)) setText(el, n); });

    // Text opt-in only when a texting service is active
    $$("[data-text-optin]").forEach(function (el) { el.hidden = !C.textAnnouncementsActive; $$("input", el).forEach(function (i) { i.disabled = !C.textAnnouncementsActive; }); });
    $$("[data-text-inactive]").forEach(function (el) { el.hidden = !!C.textAnnouncementsActive; });

    // Structured data for search engines
    try {
      var ld = { "@context": "https://schema.org", "@type": "Church", name: C.churchName, url: C.websiteUrl,
        address: { "@type": "PostalAddress", addressLocality: C.city, addressRegion: C.state, addressCountry: "US" } };
      if (has(C.streetAddress)) ld.address.streetAddress = C.streetAddress;
      if (has(C.zip)) ld.address.postalCode = C.zip;
      if (has(C.phone)) ld.telephone = C.phone;
      if (has(C.email)) ld.email = C.email;
      var same = [C.social && C.social.facebook, C.social && C.social.youtube, C.social && C.social.instagram].filter(has);
      if (same.length) ld.sameAs = same;
      var s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(ld); document.head.appendChild(s);
    } catch (e) { /* ignore */ }
  }

  /* ------------------------------------------------------------------
     3. Modal helper
  ------------------------------------------------------------------ */
  var modal;
  function getModal() {
    if (modal) return modal;
    modal = document.createElement("dialog");
    modal.className = "modal";
    modal.setAttribute("aria-labelledby", "modal-title");
    modal.innerHTML = '<div class="modal-head"><h2 id="modal-title"></h2><button type="button" class="modal-close" aria-label="Close">×</button></div><div class="modal-body"></div>';
    document.body.appendChild(modal);
    $(".modal-close", modal).addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    modal.addEventListener("close", function () { $(".modal-body", modal).innerHTML = ""; });
    return modal;
  }
  function openModal(title, html, wide) {
    var m = getModal();
    m.classList.toggle("wide", !!wide);
    $("#modal-title", m).textContent = title;
    $(".modal-body", m).innerHTML = html;
    if (typeof m.showModal === "function") m.showModal(); else m.setAttribute("open", "");
    return m;
  }
  function closeModal() { if (modal) { if (typeof modal.close === "function") modal.close(); else modal.removeAttribute("open"); } }

  /* ------------------------------------------------------------------
     4. Events (Google Calendar, or labeled samples)
  ------------------------------------------------------------------ */
  var CATS = [
    { id: "worship", label: "Worship", re: /worship|service|sunday morning|communion|baptism/i },
    { id: "bible", label: "Bible Study", re: /bible|study|sunday school|class/i },
    { id: "prayer", label: "Prayer", re: /prayer|revival/i },
    { id: "anniversary", label: "Anniversary", re: /anniversar/i },
    { id: "concert", label: "Concert", re: /concert|choir|music|gospel|musical|sing/i },
    { id: "outreach", label: "Outreach", re: /outreach|community|food|pantry|serve|giveaway|clothing/i },
    { id: "youth", label: "Youth", re: /youth|teen|children|kids|vbs|vacation bible/i },
    { id: "special", label: "Special Program", re: /.*/ }
  ];
  function catOf(title, desc) {
    var m = /\[(worship|bible|prayer|anniversary|concert|outreach|youth|special)\]/i.exec(desc || "");
    if (m) return m[1].toLowerCase();
    for (var i = 0; i < CATS.length; i++) if (CATS[i].re.test(title || "")) return CATS[i].id;
    return "special";
  }
  function catLabel(id) { for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i].label; return "Event"; }

  function sampleEvents() {
    var out = [], now = new Date(); now.setHours(0, 0, 0, 0);
    function nextDow(dow, weeks) { var d = new Date(now); d.setDate(d.getDate() + ((dow - d.getDay() + 7) % 7) + weeks * 7); return d; }
    var note = "This is a SAMPLE event that shows how the calendar works. It will disappear once the church connects its Google Calendar (see the Admin Guide).";
    for (var w = 0; w < 8; w++) {
      out.push({ title: "Sample: Sunday Worship Service", start: nextDow(0, w), allDay: true, location: "Church", description: note });
      out.push({ title: "Sample: Midweek Bible Study", start: nextDow(3, w), allDay: true, location: "Call for location", description: note });
    }
    var extra = [
      ["Sample: Prayer Meeting", 2, 1], ["Sample: Youth Fellowship Night", 5, 1], ["Sample: Community Outreach Day", 6, 2],
      ["Sample: Gospel Concert", 6, 3], ["Sample: Church Anniversary Celebration", 0, 5], ["Sample: Special Program", 6, 6]
    ];
    extra.forEach(function (x) { out.push({ title: x[0], start: nextDow(x[1], x[2]), allDay: true, location: "Church", description: note }); });
    out.forEach(function (e) { e.sample = true; e.end = new Date(e.start); e.end.setDate(e.end.getDate() + 1); e.cat = catOf(e.title, ""); });
    return out.sort(function (a, b) { return a.start - b.start; });
  }

  function parseGDate(o) {
    if (!o) return null;
    if (o.dateTime) return new Date(o.dateTime);
    var p = o.date.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  function stripHtml(s) { if (!s) return ""; var d = new DOMParser().parseFromString(String(s).replace(/<br\s*\/?>/gi, "\n"), "text/html"); return (d.body.textContent || "").trim(); }

  var eventsPromise;
  function loadEvents() {
    if (eventsPromise) return eventsPromise;
    var cal = C.calendar || {};
    if (has(cal.googleCalendarId) && has(cal.googleApiKey)) {
      var from = new Date(); from.setMonth(from.getMonth() - 2); from.setDate(1);
      var to = new Date(); to.setMonth(to.getMonth() + 12);
      var url = "https://www.googleapis.com/calendar/v3/calendars/" + encodeURIComponent(cal.googleCalendarId) +
        "/events?singleEvents=true&orderBy=startTime&maxResults=500&timeMin=" + encodeURIComponent(from.toISOString()) +
        "&timeMax=" + encodeURIComponent(to.toISOString()) + "&key=" + encodeURIComponent(cal.googleApiKey);
      eventsPromise = fetch(url).then(function (r) { if (!r.ok) throw new Error("Calendar " + r.status); return r.json(); }).then(function (data) {
        var evs = (data.items || []).filter(function (it) { return it.status !== "cancelled" && it.visibility !== "private"; }).map(function (it) {
          var desc = stripHtml(it.description);
          return { title: it.summary || "Church event", start: parseGDate(it.start), end: parseGDate(it.end), allDay: !!(it.start && it.start.date),
            location: it.location || "", description: desc.replace(/\[(worship|bible|prayer|anniversary|concert|outreach|youth|special)\]/ig, "").trim(), cat: catOf(it.summary, desc) };
        });
        return { source: "google", events: evs };
      }).catch(function (err) {
        console.warn("[JR] Could not load Google Calendar:", err);
        return { source: "error", events: [] };
      });
    } else if (has(cal.googleCalendarId)) {
      eventsPromise = Promise.resolve({ source: "embed", events: [] });
    } else if (C.showSampleEvents !== false) {
      eventsPromise = Promise.resolve({ source: "sample", events: sampleEvents() });
    } else {
      eventsPromise = Promise.resolve({ source: "none", events: [] });
    }
    return eventsPromise;
  }

  var TZ = (C.calendar && C.calendar.timeZone) || undefined;
  function fmt(d, opts) { try { return new Intl.DateTimeFormat("en-US", Object.assign({ timeZone: TZ }, opts)).format(d); } catch (e) { return new Intl.DateTimeFormat("en-US", opts).format(d); } }
  function fmtLocal(d, opts) { return new Intl.DateTimeFormat("en-US", opts).format(d); }
  function evDateLong(e) { return (e.allDay ? fmtLocal : fmt)(e.start, { weekday: "long", month: "long", day: "numeric", year: "numeric" }); }
  function evTime(e) {
    if (e.sample) return "Time to be announced";
    if (e.allDay) return "All day";
    var t = fmt(e.start, { hour: "numeric", minute: "2-digit" });
    if (e.end && e.end - e.start > 0) t += " – " + fmt(e.end, { hour: "numeric", minute: "2-digit" });
    return t;
  }
  function dayKey(d, allDay) {
    // Key in the church's time zone for timed events, local for all-day dates
    if (allDay) return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
    var parts = fmt(d, { year: "numeric", month: "numeric", day: "numeric" }).split("/");
    return parts[2] + "-" + (+parts[0]) + "-" + (+parts[1]);
  }
  function keyOf(y, m, d) { return y + "-" + (m + 1) + "-" + d; }
  function startOfToday() { var t = new Date(); t.setHours(0, 0, 0, 0); return t; }

  function icsStamp(d) { return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }
  function dateOnly(d) { return "" + d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0"); }
  function googleAddUrl(e) {
    var dates = e.allDay ? dateOnly(e.start) + "/" + dateOnly(e.end || new Date(e.start.getTime() + 864e5)) : icsStamp(e.start) + "/" + icsStamp(e.end || new Date(e.start.getTime() + 36e5));
    return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(e.title) + "&dates=" + dates +
      "&details=" + encodeURIComponent((e.description || "") + "\n\n" + C.churchName) + "&location=" + encodeURIComponent(e.location || fullAddress() || C.churchName);
  }
  function icsEscape(s) { return String(s || "").replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;"); }
  function downloadIcs(e) {
    var lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Jordan River MBC//Website//EN", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      "UID:" + (e.start.getTime()) + "-" + encodeURIComponent(e.title).slice(0, 40) + "@jordanriverbuffalo.com", "DTSTAMP:" + icsStamp(new Date())];
    if (e.allDay) { lines.push("DTSTART;VALUE=DATE:" + dateOnly(e.start)); lines.push("DTEND;VALUE=DATE:" + dateOnly(e.end || new Date(e.start.getTime() + 864e5))); }
    else { lines.push("DTSTART:" + icsStamp(e.start)); lines.push("DTEND:" + icsStamp(e.end || new Date(e.start.getTime() + 36e5))); }
    lines.push("SUMMARY:" + icsEscape(e.title), "DESCRIPTION:" + icsEscape(e.description), "LOCATION:" + icsEscape(e.location || fullAddress() || C.churchName), "END:VEVENT", "END:VCALENDAR");
    var blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = e.title.replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-") + ".ics";
    document.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function showEvent(e) {
    var loc = e.location || "";
    var html = '<p class="mt-0">' + (e.sample ? '<span class="tag tag-sample">Sample</span>' : "") + '<span class="tag cat-' + e.cat + '">' + esc(catLabel(e.cat)) + "</span></p>" +
      "<dl><dt>Date</dt><dd>" + esc(evDateLong(e)) + "</dd><dt>Time</dt><dd>" + esc(evTime(e)) + "</dd>" +
      (loc ? "<dt>Location</dt><dd>" + esc(loc) + "</dd>" : "") + "</dl>" +
      (e.description ? '<p style="white-space:pre-line">' + esc(e.description) + "</p>" : "") +
      '<div class="btn-row mt-1">' + (e.sample ? "" :
        '<a class="btn btn-navy btn-small" target="_blank" rel="noopener" href="' + esc(googleAddUrl(e)) + '">Add to Google Calendar</a>' +
        '<button type="button" class="btn btn-outline-dark btn-small" data-ics>Add to Apple / Outlook Calendar</button>') +
      (loc && !e.sample ? '<a class="btn btn-outline-dark btn-small" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(loc) + '">Directions</a>' : "") +
      "</div>" + (e.sample ? '<p class="notice mt-1">Calendar buttons appear on real events once the church calendar is connected.</p>' : "");
    var m = openModal(e.title, html);
    var b = $("[data-ics]", m); if (b) b.addEventListener("click", function () { downloadIcs(e); });
  }

  function eventButton(e) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "event-item";
    var dFmt = e.allDay ? fmtLocal : fmt;
    b.innerHTML = '<span class="event-date" aria-hidden="true"><span class="m">' + esc(dFmt(e.start, { month: "short" })) + '</span><span class="d">' + esc(dFmt(e.start, { day: "numeric" })) + "</span></span>" +
      '<span><span class="event-title">' + esc(e.title) + "</span>" +
      '<span class="event-meta">' + (e.sample ? '<span class="tag tag-sample">Sample</span>' : "") + '<span class="tag cat-' + e.cat + '">' + esc(catLabel(e.cat)) + "</span>" +
      esc(dFmt(e.start, { weekday: "long" })) + " · " + esc(evTime(e)) + (e.location ? " · " + esc(e.location) : "") + "</span></span>";
    b.setAttribute("aria-label", e.title + ", " + evDateLong(e) + ", " + evTime(e) + ". Open details.");
    b.addEventListener("click", function () { showEvent(e); });
    return b;
  }

  function sampleBanner(source) {
    $$("[data-sample-banner]").forEach(function (el) { el.hidden = source !== "sample"; });
    $$("[data-calendar-error]").forEach(function (el) { el.hidden = source !== "error"; });
  }

  function initUpcoming() {
    var box = $("[data-upcoming-events]"); if (!box) return;
    loadEvents().then(function (res) {
      sampleBanner(res.source);
      var today = startOfToday();
      var list = res.events.filter(function (e) { return (e.end || e.start) >= today; }).slice(0, +(box.getAttribute("data-count") || 4));
      box.innerHTML = "";
      if (res.source === "embed") { box.innerHTML = '<div class="empty">See all upcoming services and events on our <a href="events.html">church calendar</a>.</div>'; return; }
      if (!list.length) { box.innerHTML = '<div class="empty">' + (res.source === "error" ? "Our calendar is temporarily unavailable. Please check back soon." : "No upcoming events are listed right now. Please check back soon.") + "</div>"; return; }
      list.forEach(function (e) { box.appendChild(eventButton(e)); });
    });
  }

  function initCalendar() {
    var root = $("[data-calendar]"); if (!root) return;
    var state = { month: new Date(new Date().getFullYear(), new Date().getMonth(), 1), view: window.innerWidth < 720 ? "list" : "month", cat: "all", selected: null, events: [] };
    var grid = $("[data-cal-grid]", root), listBox = $("[data-cal-list]", root), title = $("[data-cal-title]", root), dayPanel = $("[data-day-panel]", root);

    loadEvents().then(function (res) {
      sampleBanner(res.source);
      if (res.source === "embed") {
        var id = C.calendar.googleCalendarId, tz = (C.calendar.timeZone || "America/New_York");
        root.innerHTML = '<div class="video-wrap" style="aspect-ratio:4/3"><iframe title="Church calendar" src="https://calendar.google.com/calendar/embed?src=' + encodeURIComponent(id) + "&ctz=" + encodeURIComponent(tz) + '&mode=' + (window.innerWidth < 720 ? "AGENDA" : "MONTH") + '&showPrint=0&showTitle=0"></iframe></div>';
        return;
      }
      state.events = res.events;
      buildFilters(); render();
    });

    function filtered() { return state.events.filter(function (e) { return state.cat === "all" || e.cat === state.cat; }); }

    function buildFilters() {
      var f = $("[data-cal-filters]", root); if (!f) return;
      var used = {}; state.events.forEach(function (e) { used[e.cat] = true; });
      var chips = [{ id: "all", label: "All events" }].concat(CATS.filter(function (c) { return used[c.id]; }));
      f.innerHTML = "";
      chips.forEach(function (c) {
        var b = document.createElement("button"); b.type = "button"; b.className = "filter-chip"; b.textContent = c.label;
        b.setAttribute("aria-pressed", c.id === state.cat ? "true" : "false");
        b.addEventListener("click", function () { state.cat = c.id; $$(".filter-chip", f).forEach(function (x) { x.setAttribute("aria-pressed", "false"); }); b.setAttribute("aria-pressed", "true"); render(); });
        f.appendChild(b);
      });
    }

    $$("[data-cal-prev], [data-cal-next]", root).forEach(function (b) {
      b.addEventListener("click", function () { state.month.setMonth(state.month.getMonth() + (b.hasAttribute("data-cal-next") ? 1 : -1)); state.selected = null; render(); });
    });
    var todayBtn = $("[data-cal-today]", root);
    if (todayBtn) todayBtn.addEventListener("click", function () { var n = new Date(); state.month = new Date(n.getFullYear(), n.getMonth(), 1); state.selected = null; render(); });
    $$("[data-view]", root).forEach(function (b) {
      b.addEventListener("click", function () { state.view = b.getAttribute("data-view"); render(); });
    });

    function render() {
      $$("[data-view]", root).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-view") === state.view ? "true" : "false"); });
      title.textContent = fmtLocal(state.month, { month: "long", year: "numeric" });
      var evs = filtered();
      grid.hidden = state.view !== "month"; listBox.hidden = state.view !== "list"; dayPanel.hidden = state.view !== "month";
      $$("[data-month-only]", root).forEach(function (el) { el.hidden = state.view !== "month"; });
      if (state.view === "month") renderMonth(evs); else renderList(evs);
    }

    function byDay(evs) { var map = {}; evs.forEach(function (e) { var k = dayKey(e.start, e.allDay); (map[k] = map[k] || []).push(e); }); return map; }

    function renderMonth(evs) {
      var map = byDay(evs), y = state.month.getFullYear(), m = state.month.getMonth();
      var first = new Date(y, m, 1), start = new Date(y, m, 1 - first.getDay());
      var weeks = Math.ceil((first.getDay() + new Date(y, m + 1, 0).getDate()) / 7);
      var t = new Date(), tKey = keyOf(t.getFullYear(), t.getMonth(), t.getDate());
      var html = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(function (d) { return '<div class="cal-dow" aria-hidden="true">' + d + "</div>"; }).join("");
      grid.innerHTML = html;
      for (var i = 0; i < weeks * 7; i++) {
        var d = new Date(start); d.setDate(start.getDate() + i);
        var k = keyOf(d.getFullYear(), d.getMonth(), d.getDate()), list = map[k] || [];
        var cell = document.createElement("button"); cell.type = "button";
        cell.className = "cal-day" + (d.getMonth() !== m ? " other" : "") + (k === tKey ? " today" : "") + (state.selected === k ? " selected" : "");
        cell.setAttribute("aria-label", fmtLocal(d, { weekday: "long", month: "long", day: "numeric" }) + (list.length ? ", " + list.length + " event" + (list.length > 1 ? "s" : "") : ", no events"));
        cell.innerHTML = '<span class="num">' + d.getDate() + "</span>" +
          list.slice(0, 3).map(function (e, idx) { return '<span class="cal-chip cat-' + e.cat + '" data-idx="' + idx + '">' + esc(e.title.replace(/^Sample:\s*/, "")) + "</span>"; }).join("") +
          (list.length > 3 ? '<span class="muted" style="font-size:.75rem">+' + (list.length - 3) + " more</span>" : "") +
          (list.length ? '<span class="cal-dots" aria-hidden="true">' + list.slice(0, 4).map(function (e) { return '<i class="cat-' + e.cat + '"></i>'; }).join("") + "</span>" : "");
        (function (key, items, date) {
          cell.addEventListener("click", function (ev) {
            var chip = ev.target.closest(".cal-chip");
            if (chip) { showEvent(items[+chip.getAttribute("data-idx")]); return; }
            state.selected = key; renderMonth(filtered()); showDay(date, items);
          });
        })(k, list, d);
        grid.appendChild(cell);
      }
      if (!state.selected) {
        var monthEvs = evs.filter(function (e) { return dayKey(e.start, e.allDay).indexOf(y + "-" + (m + 1) + "-") === 0; });
        dayPanel.innerHTML = '<h3>Events in ' + esc(fmtLocal(state.month, { month: "long" })) + "</h3>";
        var lb = document.createElement("div"); lb.className = "event-list";
        if (!monthEvs.length) lb.innerHTML = '<div class="empty">No events are listed for this month.</div>';
        monthEvs.forEach(function (e) { lb.appendChild(eventButton(e)); });
        dayPanel.appendChild(lb);
      }
    }

    function showDay(date, items) {
      dayPanel.innerHTML = "<h3>" + esc(fmtLocal(date, { weekday: "long", month: "long", day: "numeric" })) + "</h3>";
      var lb = document.createElement("div"); lb.className = "event-list";
      if (!items.length) lb.innerHTML = '<div class="empty">No events on this day.</div>';
      items.forEach(function (e) { lb.appendChild(eventButton(e)); });
      dayPanel.appendChild(lb);
      if (window.innerWidth < 720) dayPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function renderList(evs) {
      var today = startOfToday();
      var up = evs.filter(function (e) { return (e.end || e.start) >= today; });
      listBox.innerHTML = "";
      if (!up.length) { listBox.innerHTML = '<div class="empty">No upcoming events are listed right now.</div>'; return; }
      var lastMonth = "";
      up.slice(0, 60).forEach(function (e) {
        var mLabel = (e.allDay ? fmtLocal : fmt)(e.start, { month: "long", year: "numeric" });
        if (mLabel !== lastMonth) { var h = document.createElement("h3"); h.className = "mt-2"; h.textContent = mLabel; listBox.appendChild(h); lastMonth = mLabel; }
        listBox.appendChild(eventButton(e));
      });
    }
  }

  /* ------------------------------------------------------------------
     5. Google Sheet CSV (announcements & sermons)
  ------------------------------------------------------------------ */
  function parseCSV(text) {
    var rows = [], row = [], cur = "", q = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (q) { if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
      else if (ch === '"') q = true;
      else if (ch === ",") { row.push(cur); cur = ""; }
      else if (ch === "\n" || ch === "\r") { if (ch === "\r" && text[i + 1] === "\n") i++; row.push(cur); rows.push(row); row = []; cur = ""; }
      else cur += ch;
    }
    if (cur.length || row.length) { row.push(cur); rows.push(row); }
    if (!rows.length) return [];
    var head = rows[0].map(function (h) { return h.trim().toLowerCase(); });
    return rows.slice(1).filter(function (r) { return r.some(function (c) { return c.trim(); }); }).map(function (r) {
      var o = {}; head.forEach(function (h, idx) { o[h] = (r[idx] || "").trim(); }); return o;
    });
  }
  function fetchCSV(url) { return fetch(url, { cache: "no-store" }).then(function (r) { if (!r.ok) throw new Error("Sheet " + r.status); return r.text(); }).then(parseCSV); }
  function pick(o, keys) { for (var i = 0; i < keys.length; i++) if (has(o[keys[i]])) return o[keys[i]]; return ""; }
  function parseDay(s) {
    if (!has(s)) return null;
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s); if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
    m = /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/.exec(s); if (m) return new Date(+(m[3].length === 2 ? "20" + m[3] : m[3]), +m[1] - 1, +m[2]);
    var d = new Date(s); return isNaN(d) ? null : d;
  }
  function safeUrl(u) { return /^https?:\/\//i.test(u || "") ? u : ""; }

  function initAnnouncements() {
    $$("[data-announcements]").forEach(loadAnnouncements);
  }
  function loadAnnouncements(box) {
    var url = (C.sheets || {}).announcementsCsv;
    var emptyMsg = '<div class="empty">There are no announcements at this time. Please check back soon.</div>';
    if (!has(url)) { box.innerHTML = emptyMsg; return; }
    box.innerHTML = '<p class="loading">Loading announcements…</p>';
    fetchCSV(url).then(function (rows) {
      var today = startOfToday(), max = +(box.getAttribute("data-count") || 6);
      var items = rows.map(function (r) {
        return { title: pick(r, ["title", "announcement"]), date: parseDay(pick(r, ["date", "posted"])), details: pick(r, ["details", "description", "text"]), link: safeUrl(pick(r, ["link", "url"])), expires: parseDay(pick(r, ["expires", "end date", "show until"])) };
      }).filter(function (a) { return has(a.title) && (!a.expires || a.expires >= today); })
        .sort(function (a, b) { return (b.date || 0) - (a.date || 0); }).slice(0, max);
      if (!items.length) { box.innerHTML = emptyMsg; return; }
      box.innerHTML = items.map(function (a) {
        return '<article class="card announce">' + (a.date ? '<div class="a-date">' + esc(fmtLocal(a.date, { month: "long", day: "numeric", year: "numeric" })) + "</div>" : "") +
          "<h3>" + esc(a.title) + "</h3>" + (a.details ? '<p style="white-space:pre-line">' + esc(a.details) + "</p>" : "") +
          (a.link ? '<a class="btn btn-outline-dark btn-small" href="' + esc(a.link) + '" target="_blank" rel="noopener">Learn more</a>' : "") + "</article>";
      }).join("");
    }).catch(function (e) { console.warn("[JR] Announcements:", e); box.innerHTML = '<div class="empty">Announcements are temporarily unavailable.</div>'; });
  }

  function ytId(u) {
    if (!u) return "";
    var m = /(?:youtu\.be\/|v=|\/embed\/|\/live\/|\/shorts\/)([A-Za-z0-9_-]{11})/.exec(u);
    return m ? m[1] : (/^[A-Za-z0-9_-]{11}$/.test(u.trim()) ? u.trim() : "");
  }

  function playVideo(id, title) {
    openModal(title, '<div class="video-wrap"><iframe src="https://www.youtube-nocookie.com/embed/' + esc(id) + '?autoplay=1&rel=0" title="' + esc(title) + '" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>', true);
  }

  function initWatch() {
    var y = C.youtube || {};
    $$("[data-live-player]").forEach(function (box) {
      if (has(y.channelId)) box.innerHTML = '<div class="video-wrap"><iframe src="https://www.youtube.com/embed/live_stream?channel=' + encodeURIComponent(y.channelId) + '" title="Jordan River live worship stream" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>' +
        '<p class="muted mt-1" style="font-size:.98rem">If the player says the stream is offline, we are not live right now — please join us at the next service time or watch a recent sermon below.</p>';
    });
    $$("[data-playlist]").forEach(function (box) {
      if (has(y.sermonsPlaylistId)) { box.hidden = false; $(".video-wrap", box).innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/videoseries?list=' + encodeURIComponent(y.sermonsPlaylistId) + '" title="Sermon playlist" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'; }
    });

    var list = $("[data-sermon-list]"); if (!list) return;
    var search = $("#sermon-search"), yearSel = $("#sermon-year"), count = $("[data-sermon-count]");
    var url = (C.sheets || {}).sermonsCsv, all = [];
    if (!has(url)) { list.innerHTML = '<div class="empty">Recorded sermons will be listed here once the church adds them. ' + (has(linkFor("youtube")) ? 'In the meantime, visit our <a href="' + esc(linkFor("youtube")) + '" target="_blank" rel="noopener">YouTube channel</a>.' : "") + "</div>"; return; }
    list.innerHTML = '<p class="loading">Loading sermons…</p>';
    fetchCSV(url).then(function (rows) {
      all = rows.map(function (r) {
        return { title: pick(r, ["title", "sermon title", "sermon"]), date: parseDay(pick(r, ["date", "sermon date"])), speaker: pick(r, ["speaker", "preacher", "pastor"]), scripture: pick(r, ["scripture", "text", "passage"]), id: ytId(pick(r, ["youtube link", "youtube", "link", "video", "url"])) };
      }).filter(function (s) { return has(s.title) && s.id; }).sort(function (a, b) { return (b.date || 0) - (a.date || 0); });
      var years = {}; all.forEach(function (s) { if (s.date) years[s.date.getFullYear()] = 1; });
      Object.keys(years).sort().reverse().forEach(function (yr) { var o = document.createElement("option"); o.value = yr; o.textContent = yr; yearSel.appendChild(o); });
      draw();
    }).catch(function (e) { console.warn("[JR] Sermons:", e); list.innerHTML = '<div class="empty">The sermon archive is temporarily unavailable.</div>'; });

    function draw() {
      var q = (search.value || "").toLowerCase().trim(), yr = yearSel.value;
      var res = all.filter(function (s) {
        var dateText = s.date ? fmtLocal(s.date, { month: "long", day: "numeric", year: "numeric" }) + " " + fmtLocal(s.date, { month: "numeric", day: "numeric", year: "numeric" }) : "";
        var hay = (s.title + " " + s.speaker + " " + s.scripture + " " + dateText).toLowerCase();
        return (!q || hay.indexOf(q) > -1) && (!yr || (s.date && String(s.date.getFullYear()) === yr));
      });
      if (count) count.textContent = res.length + " sermon" + (res.length === 1 ? "" : "s") + " found";
      if (!res.length) { list.innerHTML = '<div class="empty">No sermons match your search.</div>'; return; }
      list.innerHTML = "";
      res.forEach(function (s) {
        var b = document.createElement("button"); b.type = "button"; b.className = "sermon-card";
        b.innerHTML = '<span class="sermon-thumb" style="background-image:url(https://i.ytimg.com/vi/' + esc(s.id) + '/hqdefault.jpg)"></span><span class="sermon-info"><strong>' + esc(s.title) + "</strong><span>" +
          esc([s.date ? fmtLocal(s.date, { month: "long", day: "numeric", year: "numeric" }) : "", s.speaker, s.scripture].filter(has).join(" · ")) + "</span></span>";
        b.setAttribute("aria-label", "Play sermon: " + s.title);
        b.addEventListener("click", function () { playVideo(s.id, s.title); });
        list.appendChild(b);
      });
    }
    search.addEventListener("input", draw); yearSel.addEventListener("change", draw);
  }

  /* ------------------------------------------------------------------
     6. Forms (Web3Forms — free tier)
  ------------------------------------------------------------------ */
  function fieldWrap(el) { return el.closest(".field") || el.parentElement; }
  function setErr(el, msg) {
    var w = fieldWrap(el); w.classList.add("has-error");
    var e = $(".field-error", w); if (!e) { e = document.createElement("div"); e.className = "field-error"; e.id = (el.id || el.name) + "-err"; w.appendChild(e); }
    e.textContent = msg; el.setAttribute("aria-invalid", "true"); el.setAttribute("aria-describedby", e.id);
  }
  function clearErr(el) { var w = fieldWrap(el); w.classList.remove("has-error"); el.removeAttribute("aria-invalid"); }
  function labelOf(el) {
    if (el.getAttribute("data-label")) return el.getAttribute("data-label");
    var fs = el.closest("fieldset"); if ((el.type === "radio" || el.type === "checkbox") && fs && $("legend", fs)) return $("legend", fs).textContent.replace(/[*]|\(optional\)/g, "").trim();
    var l = el.id && $('label[for="' + el.id + '"]'); return l ? l.textContent.replace(/[*]|\(optional\)/g, "").trim() : el.name;
  }

  function validate(form) {
    var errors = [], seen = {};
    $$("input, select, textarea", form).forEach(function (el) {
      if (el.disabled || el.type === "hidden" || el.closest(".hp-field") || el.closest("[hidden]")) return;
      clearErr(el);
    });
    $$("input, select, textarea", form).forEach(function (el) {
      if (el.disabled || el.type === "hidden" || el.closest(".hp-field") || el.closest("[hidden]")) return;
      if (el.type === "radio") {
        if (seen[el.name]) return; seen[el.name] = 1;
        var group = $$('input[name="' + el.name + '"]', form);
        if (group.some(function (r) { return r.required; }) && !group.some(function (r) { return r.checked; })) { setErr(group[0], "Please choose an option."); errors.push(group[0]); }
        return;
      }
      var v = (el.value || "").trim();
      if (el.type === "checkbox") { if (el.required && !el.checked) { setErr(el, el.getAttribute("data-msg") || "Please check this box to continue."); errors.push(el); } return; }
      if (el.required && !v) { setErr(el, "Please enter your " + labelOf(el).toLowerCase() + "."); errors.push(el); return; }
      if (!v) return;
      if (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { setErr(el, "Please enter a valid email address, like name@example.com."); errors.push(el); }
      if (el.type === "tel" && v.replace(/\D/g, "").length < 10) { setErr(el, "Please enter a 10-digit phone number, including area code."); errors.push(el); }
      if (el.type === "date" && el.min && v < el.min) { setErr(el, "Please choose today or a later date."); errors.push(el); }
      if (el.type === "number" && ((el.min && +v < +el.min) || (el.max && +v > +el.max))) { setErr(el, "Please enter a number from " + el.min + " to " + el.max + "."); errors.push(el); }
    });
    // Conditional rules
    var pref = $('input[name="preferred_contact"]:checked', form);
    var email = $('input[type="email"]', form), phone = $('input[type="tel"]', form);
    if (pref && /email/i.test(pref.value) && email && !email.value.trim() && errors.indexOf(email) < 0) { setErr(email, "You chose email as your preferred contact — please enter your email address."); errors.push(email); }
    if (pref && /(phone|text)/i.test(pref.value) && phone && !phone.value.trim() && errors.indexOf(phone) < 0) { setErr(phone, "Please enter a phone number so we can reach you."); errors.push(phone); }
    if (form.hasAttribute("data-need-one-contact") && email && phone && !email.value.trim() && !phone.value.trim()) { setErr(email, "Please give us an email address or a phone number."); errors.push(email); }
    if (form.hasAttribute("data-subscribe")) {
      var wantEmail = $('input[name="subscribe_email"]', form), wantText = $('input[name="subscribe_text"]', form);
      var any = (wantEmail && wantEmail.checked) || (wantText && !wantText.disabled && wantText.checked);
      if (!any) { setErr(wantEmail, "Please choose at least one way to receive announcements."); errors.push(wantEmail); }
      if (wantEmail && wantEmail.checked && email && !email.value.trim() && errors.indexOf(email) < 0) { setErr(email, "Please enter the email address for announcements."); errors.push(email); }
      if (wantText && !wantText.disabled && wantText.checked && phone && !phone.value.trim() && errors.indexOf(phone) < 0) { setErr(phone, "Please enter the mobile number for text announcements."); errors.push(phone); }
    }
    return errors;
  }

  function status(form, type, html) {
    var s = $(".form-status", form); if (!s) return;
    s.className = "form-status show " + type; s.innerHTML = html; s.setAttribute("tabindex", "-1"); s.focus({ preventScroll: false });
  }

  function fallbackContact() {
    var bits = [];
    if (has(C.phone)) bits.push('call <a href="tel:' + digits(C.phone) + '">' + esc(C.phone) + "</a>");
    if (has(C.email)) bits.push('email <a href="mailto:' + esc(C.email) + '">' + esc(C.email) + "</a>");
    return bits.length ? "Please " + bits.join(" or ") + "." : "Please speak with a member of the church staff after service.";
  }

  function initForms() {
    var today = new Date(), iso = today.getFullYear() + "-" + String(today.getMonth() + 1).padStart(2, "0") + "-" + String(today.getDate()).padStart(2, "0");
    $$('input[type="date"][data-future]').forEach(function (d) { d.min = iso; });

    // Pre-fill topic from ?topic= (used by ministry buttons)
    var params = new URLSearchParams(location.search), topic = params.get("topic");
    var topicSel = $("#contact-topic");
    if (topic && topicSel) {
      var opt = $$("option", topicSel).filter(function (o) { return o.value === topic; })[0];
      if (!opt) { opt = document.createElement("option"); opt.value = opt.textContent = topic; topicSel.appendChild(opt); }
      topicSel.value = topic;
    }

    $$("form[data-form]").forEach(function (form) {
      form.setAttribute("novalidate", "");
      $$("input, select, textarea", form).forEach(function (el) { el.addEventListener("input", function () { clearErr(el); }); el.addEventListener("change", function () { clearErr(el); }); });

      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var errs = validate(form);
        if (errs.length) {
          status(form, "error", "<strong>Please fix " + (errs.length === 1 ? "the item" : "the " + errs.length + " items") + " marked in red</strong>, then press the button again.");
          errs[0].focus(); return;
        }
        if ($('input[name="botcheck"]', form) && $('input[name="botcheck"]', form).checked) return; // spam bot

        var keyName = form.getAttribute("data-key"), F = C.forms || {};
        var key = (keyName && has(F[keyName])) ? F[keyName] : F.accessKey;
        if (!has(key)) {
          status(form, "info", "<strong>This online form is not switched on yet, so your request was NOT sent.</strong> " + fallbackContact() +
            ' <span class="muted">(Church administrators: see “Turn on the forms” in the Admin Guide.)</span>');
          return;
        }

        var payload = { access_key: key, subject: form.getAttribute("data-subject") || "Website form", from_name: C.churchName + " website" };
        var seen = {};
        $$("input, select, textarea", form).forEach(function (el) {
          if (!el.name || el.disabled || el.closest(".hp-field") || el.closest("[hidden]") || seen[el.name + el.value]) return;
          if ((el.type === "radio" || el.type === "checkbox") && !el.checked) return;
          seen[el.name + el.value] = 1;
          var label = labelOf(el);
          var val = el.type === "checkbox" ? (el.getAttribute("data-yes") || "Yes") : el.value.trim();
          if (!val) return;
          if (el.name === "email") payload.email = val;
          if (el.name === "name") payload.name = val;
          payload[label] = payload[label] ? payload[label] + ", " + val : val;
        });
        payload["Submitted from page"] = document.title;

        var btn = $('button[type="submit"]', form), old = btn.innerHTML;
        btn.disabled = true; btn.innerHTML = "Sending…";
        fetch("https://api.web3forms.com/submit", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(payload) })
          .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
          .then(function (res) {
            if (res.ok && res.j && res.j.success) {
              form.reset();
              status(form, "success", form.getAttribute("data-success") || "<strong>Thank you — your message was sent.</strong> A member of our church staff will follow up with you.");
            } else throw new Error((res.j && res.j.message) || "Submission failed");
          })
          .catch(function (e) {
            console.warn("[JR] Form error:", e);
            status(form, "error", "<strong>Sorry — we couldn't send your request.</strong> Please check your internet connection and try again, or " + fallbackContact().replace(/^Please /, ""));
          })
          .then(function () { btn.disabled = false; btn.innerHTML = old; });
      });
    });
  }

  /* ------------------------------------------------------------------ */
  function start() {
    initNav(); bindConfig(); initUpcoming(); initCalendar(); initAnnouncements(); initWatch(); initForms();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
