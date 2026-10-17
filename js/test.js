// Test-Engine für den summativen Test (aktuell: Kapitel 6).
// Erwartet eine globale Variable TEST_DATA mit { kapitel, titel, fragen[] }.
//
// Unterschiede zur Übungs-Quiz-Engine (js/quiz.js), bewusst so gewählt, weil
// dies ein BENOTETER, summativer Test ist und keine Übung mit Sofort-Feedback:
//   - Keine Sofort-Korrektur pro Frage. Auswahl wird nur markiert, nicht bewertet angezeigt.
//   - Die automatisch bewerteten Fragen (mc/tf/matching/ordering) werden PRO VERSUCH neu
//     gemischt (Reihenfolge der Fragen UND Reihenfolge der Antwortmöglichkeiten bei mc/tf).
//   - Die drei offenen Reflexionsfragen stehen immer am Schluss (fixe Reihenfolge
//     untereinander) und man kann zwischen ihnen beliebig vor/zurück wechseln, bis man
//     endgültig abgibt.
//   - Neuer Fragetyp "offen": freier Text (Textarea + Wortzähler), afb immer 3,
//     wird NICHT automatisch bewertet, sondern von der Lehrperson im Lehrer-Bereich gelesen
//     und die Punkte werden händisch (z. B. in Excel/iDoceo) vergeben.
//   - Eigene, nicht-native Abgabe-Bestätigung vor dem endgültigen Absenden.
//   - Anti-Schummel-Protokoll: Tabwechsel/Fensterwechsel (Page Visibility API) und
//     Verlassen des Vollbildmodus werden mitgezählt und mitgespeichert. Das ist ein
//     Hinweis-/Protokoll-System, KEIN technischer Schutz – ein zweites Gerät oder ein
//     zweiter Bildschirm würde nicht erkannt. Siehe README, Abschnitt "Anti-Schummel".
//   - Keine Bestenliste (nicht passend für einen benoteten Test).
//   - Speicherung in einer eigenen Firestore-Sammlung "test_ergebnisse" (nicht "ergebnisse").

(function () {
  const TEST = TEST_DATA;
  // Jede Frage bekommt eine stabile Original-ID (Position in TEST_DATA.fragen), damit
  // Antworten unabhängig von der gemischten Anzeige-Reihenfolge eindeutig zugeordnet
  // und beim Zurückblättern innerhalb der offenen Fragen wiedergefunden werden können.
  const FRAGEN = TEST.fragen.map((f, i) => Object.assign({}, f, { _id: i }));
  const AUTO_FRAGEN = FRAGEN.filter((f) => f.type !== "offen");
  const OFFEN_FRAGEN = FRAGEN.filter((f) => f.type === "offen");
  const AUTO_MAX = AUTO_FRAGEN.reduce((s, f) => s + f.punkte, 0);
  const OFFEN_MAX = OFFEN_FRAGEN.reduce((s, f) => s + f.punkte, 0);
  const GESAMT_MAX = AUTO_MAX + OFFEN_MAX;

  const state = {
    name: "",
    order: [],          // zufällig gemischte automatisch bewertete Fragen + offene Fragen am Schluss
    posIndex: 0,         // aktuelle Position in state.order
    ergebnisGeschlossen: {}, // _id -> { frage, typ, bereich, afb, gegeben, richtig, korrekt, erreichtePunkte, maxPunkte }
    ergebnisOffen: {},       // _id -> { frage, bereich, afb, antwort, maxPunkte }
    cheatEvents: [],          // { typ, zeitpunkt }
    started: false,
    submitted: false
  };

  // ---- Elemente ----
  const screenName = document.getElementById("screen-name");
  const screenTest = document.getElementById("screen-test");
  const screenConfirm = document.getElementById("screen-confirm");
  const screenResult = document.getElementById("screen-result");

  const introEl = document.getElementById("test-intro");
  if (introEl) {
    introEl.textContent =
      `Summativer Test · ${FRAGEN.length} Fragen · ${GESAMT_MAX} Punkte gesamt ` +
      `(davon ${OFFEN_MAX} Punkte Reflexionsfragen, von der Lehrperson bewertet)`;
  }

  const inputName = document.getElementById("input-name");
  const nameError = document.getElementById("name-error");
  const btnStart = document.getElementById("btn-start");

  const cheatBanner = document.getElementById("cheat-banner");

  const progressFill = document.getElementById("progress-fill");
  const qMeta = document.getElementById("q-meta");
  const qText = document.getElementById("q-text");
  const qBody = document.getElementById("q-body");
  const btnZurueck = document.getElementById("btn-zurueck");
  const btnWeiter = document.getElementById("btn-weiter");

  const confirmAnswered = document.getElementById("confirm-answered");
  const confirmOffen = document.getElementById("confirm-offen");
  const confirmCheat = document.getElementById("confirm-cheat");
  const btnBackToTest = document.getElementById("btn-back-to-test");
  const btnFinalSubmit = document.getElementById("btn-final-submit");

  const resultAuto = document.getElementById("result-auto");
  const resultOffenNote = document.getElementById("result-offen-note");
  const resultSaving = document.getElementById("result-saving");
  const resultSavedError = document.getElementById("result-saved-error");
  const resultCheatNote = document.getElementById("result-cheat-note");

  // ---- Anti-Schummel: Tab/Fenster verlassen + Vollbild verlassen ----
  function logCheatEvent(typ) {
    if (!state.started || state.submitted) return;
    state.cheatEvents.push({ typ: typ, zeitpunkt: new Date().toISOString() });
    if (cheatBanner) {
      cheatBanner.textContent =
        `Hinweis: Fenster/Tab wurde ${state.cheatEvents.length}× verlassen. Dies wird der Lehrperson angezeigt.`;
      cheatBanner.classList.remove("hidden");
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) logCheatEvent("tab_oder_fenster_verlassen");
  });

  document.addEventListener("fullscreenchange", () => {
    if (state.started && !state.submitted && !document.fullscreenElement) {
      logCheatEvent("vollbildmodus_verlassen");
    }
  });

  window.addEventListener("beforeunload", (e) => {
    if (state.started && !state.submitted) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  function tryEnterFullscreen() {
    const el = document.documentElement;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {
        // Vollbild kann vom Browser/Gerät verweigert werden – Test läuft trotzdem weiter.
      });
    }
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // ---- Schritt 1: Start ----
  btnStart.addEventListener("click", () => {
    const name = inputName.value.trim();
    if (!name) {
      nameError.classList.remove("hidden");
      return;
    }
    nameError.classList.add("hidden");
    state.name = name;
    state.started = true;

    // Reihenfolge pro Versuch neu mischen: automatisch bewertete Fragen zufällig,
    // offene Reflexionsfragen bleiben als Block am Schluss (eigene, feste Reihenfolge).
    state.order = shuffle(AUTO_FRAGEN).concat(OFFEN_FRAGEN);

    screenName.classList.add("hidden");
    screenTest.classList.remove("hidden");
    tryEnterFullscreen();
    renderQuestion();
  });

  inputName.addEventListener("keydown", (e) => {
    if (e.key === "Enter") btnStart.click();
  });

  function afbLabel(afb) {
    if (afb === 1) return "AFB I · Reproduktion";
    if (afb === 2) return "AFB II · Anwendung/Transfer";
    return "AFB III · Reflexion";
  }

  // ---- Frage rendern (Dispatch nach Typ) ----
  function renderQuestion() {
    const f = state.order[state.posIndex];
    progressFill.style.width = (state.posIndex / state.order.length * 100) + "%";

    qMeta.innerHTML =
      `Frage ${state.posIndex + 1} von ${state.order.length} · ${escapeHtml(f.bereich)} ` +
      `<span class="afb-tag${f.afb === 3 ? " afb3" : ""}">${afbLabel(f.afb)}</span>`;
    qText.textContent = f.frage;
    qBody.innerHTML = "";
    btnWeiter.textContent = (state.posIndex === state.order.length - 1) ? "Zur Abgabe" : "Weiter";
    btnWeiter.disabled = true;

    // "Zurück" nur innerhalb des Blocks der offenen Reflexionsfragen am Schluss,
    // damit man dort noch einmal zwischen den drei Fragen wechseln kann. Die
    // automatisch bewerteten Fragen davor bleiben bewusst ohne Rücksprung.
    const vorherigeIstOffen = state.posIndex > 0 && state.order[state.posIndex - 1].type === "offen";
    if (f.type === "offen" && vorherigeIstOffen) {
      btnZurueck.classList.remove("hidden");
    } else {
      btnZurueck.classList.add("hidden");
    }

    if (f.type === "tf") {
      renderChoice(f);
    } else if (f.type === "mc") {
      renderChoice(f);
    } else if (f.type === "matching") {
      renderMatching(f);
    } else if (f.type === "ordering") {
      renderOrdering(f);
    } else if (f.type === "offen") {
      renderOffen(f);
    }
  }

  // ---- Typ: Multiple Choice / Wahr-Falsch ----
  // Antwortreihenfolge wird bei jeder Anzeige neu gemischt; die Zuordnung zur
  // ursprünglichen (korrekten) Antwort läuft über "orig", nicht über die Position.
  function renderChoice(f) {
    let items;
    let richtigOrig;
    if (f.type === "tf") {
      items = [{ label: "Wahr", orig: 0 }, { label: "Falsch", orig: 1 }];
      richtigOrig = f.richtig === true ? 0 : 1;
    } else {
      items = f.optionen.map((label, i) => ({ label: label, orig: i }));
      richtigOrig = f.richtig;
    }
    items = shuffle(items);

    let chosen = null;
    const buttons = [];

    items.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "option-btn";
      btn.textContent = item.label;
      btn.addEventListener("click", () => {
        chosen = item;
        buttons.forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        btnWeiter.disabled = false;
      });
      buttons.push(btn);
      qBody.appendChild(btn);
    });

    btnWeiter.onclick = () => {
      if (chosen === null) return;
      const richtigLabel = items.find((it) => it.orig === richtigOrig).label;
      const korrekt = chosen.orig === richtigOrig;
      const erreichtePunkte = korrekt ? f.punkte : 0;
      state.ergebnisGeschlossen[f._id] = {
        frage: f.frage,
        typ: f.type,
        bereich: f.bereich,
        afb: f.afb,
        gegeben: chosen.label,
        richtig: richtigLabel,
        korrekt: korrekt,
        erreichtePunkte: erreichtePunkte,
        maxPunkte: f.punkte
      };
      goNext();
    };
  }

  // ---- Typ: Zuordnung (matching) ----
  function renderMatching(f) {
    const list = document.createElement("div");
    list.className = "matching-list";

    const rechtsOptionen = f.paare.map((p, i) => ({ text: p.rechts, idx: i }));
    const rechtsGemischt = shuffle(rechtsOptionen);
    const selects = [];

    f.paare.forEach((paar, i) => {
      const row = document.createElement("div");
      row.className = "match-row";

      const left = document.createElement("span");
      left.className = "match-left";
      left.textContent = paar.links;

      const select = document.createElement("select");
      select.className = "match-select";
      select.dataset.leftIndex = i;

      const emptyOpt = document.createElement("option");
      emptyOpt.value = "";
      emptyOpt.textContent = "– wählen –";
      select.appendChild(emptyOpt);

      rechtsGemischt.forEach((opt) => {
        const o = document.createElement("option");
        o.value = opt.idx;
        o.textContent = opt.text;
        select.appendChild(o);
      });

      select.addEventListener("change", checkAllFilled);

      selects.push(select);
      row.appendChild(left);
      row.appendChild(select);
      list.appendChild(row);
    });

    qBody.appendChild(list);

    function checkAllFilled() {
      btnWeiter.disabled = !selects.every((s) => s.value !== "");
    }

    btnWeiter.onclick = () => {
      let correctCount = 0;
      selects.forEach((select, i) => {
        const gewaehlt = select.value;
        if (gewaehlt !== "" && parseInt(gewaehlt, 10) === i) correctCount++;
      });
      // Manche Zuordnungsfragen haben eine eigene Punktestaffel (f.punkteStaffel, z. B.
      // { "5": 10, "4": 8, "3": 5 }, alles darunter 0 Punkte) statt proportionaler Rundung.
      let erreichtePunkte;
      if (f.punkteStaffel) {
        erreichtePunkte = f.punkteStaffel[String(correctCount)] || 0;
      } else {
        erreichtePunkte = Math.round(f.punkte * (correctCount / f.paare.length));
      }
      state.ergebnisGeschlossen[f._id] = {
        frage: f.frage,
        typ: f.type,
        bereich: f.bereich,
        afb: f.afb,
        gegeben: `${correctCount} von ${f.paare.length} Zuordnungen richtig`,
        richtig: "vollständig richtig",
        korrekt: correctCount === f.paare.length,
        erreichtePunkte: erreichtePunkte,
        maxPunkte: f.punkte
      };
      goNext();
    };
  }

  // ---- Typ: Reihenfolge (ordering) ----
  function renderOrdering(f) {
    const total = f.elemente.length;
    let order = shuffle(f.elemente.map((_, i) => i));
    while (total > 1 && order.every((v, i) => v === i)) {
      order = shuffle(order);
    }

    const list = document.createElement("div");
    list.className = "ordering-list";
    qBody.appendChild(list);
    btnWeiter.disabled = false; // Reihenfolge ist immer vollständig (nur Umsortierung)

    function draw() {
      list.innerHTML = "";
      order.forEach((origIndex, pos) => {
        const item = document.createElement("div");
        item.className = "ordering-item";

        const num = document.createElement("span");
        num.className = "ordering-num";
        num.textContent = (pos + 1) + ".";

        const text = document.createElement("span");
        text.className = "ordering-text";
        text.textContent = f.elemente[origIndex];

        const controls = document.createElement("span");
        controls.className = "ordering-controls";

        const upBtn = document.createElement("button");
        upBtn.type = "button";
        upBtn.className = "order-btn";
        upBtn.textContent = "▲";
        upBtn.setAttribute("aria-label", "Nach oben");
        upBtn.disabled = pos === 0;
        upBtn.addEventListener("click", () => {
          [order[pos - 1], order[pos]] = [order[pos], order[pos - 1]];
          draw();
        });

        const downBtn = document.createElement("button");
        downBtn.type = "button";
        downBtn.className = "order-btn";
        downBtn.textContent = "▼";
        downBtn.setAttribute("aria-label", "Nach unten");
        downBtn.disabled = pos === order.length - 1;
        downBtn.addEventListener("click", () => {
          [order[pos + 1], order[pos]] = [order[pos], order[pos + 1]];
          draw();
        });

        controls.appendChild(upBtn);
        controls.appendChild(downBtn);

        item.appendChild(num);
        item.appendChild(text);
        item.appendChild(controls);
        list.appendChild(item);
      });
    }

    draw();

    btnWeiter.onclick = () => {
      let correctCount = 0;
      order.forEach((origIndex, pos) => { if (origIndex === pos) correctCount++; });
      const erreichtePunkte = Math.round(f.punkte * (correctCount / total));
      state.ergebnisGeschlossen[f._id] = {
        frage: f.frage,
        typ: f.type,
        bereich: f.bereich,
        afb: f.afb,
        gegeben: `${correctCount} von ${total} an der richtigen Position`,
        richtig: f.elemente.join(" → "),
        korrekt: correctCount === total,
        erreichtePunkte: erreichtePunkte,
        maxPunkte: f.punkte
      };
      goNext();
    };
  }

  // ---- Typ: Offene Frage (freier Text, keine Automatik-Bewertung) ----
  function renderOffen(f) {
    if (f.bild) {
      const imgWrap = document.createElement("div");
      imgWrap.className = "q-image-wrap";
      const img = document.createElement("img");
      img.src = f.bild;
      img.alt = "Abbildung zur Frage";
      imgWrap.appendChild(img);
      if (f.bildquelle) {
        const src = document.createElement("div");
        src.className = "q-image-source";
        src.textContent = f.bildquelle;
        imgWrap.appendChild(src);
      }
      qBody.appendChild(imgWrap);
    }

    const wrap = document.createElement("div");
    wrap.className = "open-answer-wrap";

    const textarea = document.createElement("textarea");
    textarea.className = "open-textarea";
    textarea.placeholder = f.richtwoerter
      ? `Antwort eingeben (Richtwert: ca. ${f.richtwoerter} Wörter) …`
      : "Antwort eingeben …";

    // Bereits eingegebene Antwort wiederherstellen, falls man zu dieser Frage zurückblättert.
    const bisherige = state.ergebnisOffen[f._id];
    if (bisherige) textarea.value = bisherige.antwort;

    const counter = document.createElement("div");
    counter.className = "word-counter";

    function updateCounter() {
      const words = textarea.value.trim().split(/\s+/).filter(Boolean);
      counter.textContent = f.richtwoerter
        ? `${words.length} Wörter (Richtwert: ca. ${f.richtwoerter})`
        : `${words.length} Wörter`;
      // Die Lehrperson bewertet den Inhalt manuell – ein leeres Feld bleibt dennoch
      // zulässig, damit niemand ohne Netz/Fehler hängen bleibt, zählt aber als unbeantwortet.
      btnWeiter.disabled = false;
    }

    textarea.addEventListener("input", updateCounter);
    updateCounter();

    wrap.appendChild(textarea);
    wrap.appendChild(counter);
    qBody.appendChild(wrap);

    const hinweis = document.createElement("div");
    hinweis.className = "feedback info";
    hinweis.textContent = "Diese Reflexionsfrage wird von der Lehrperson gelesen und von Hand bewertet.";
    qBody.appendChild(hinweis);

    function speichern() {
      state.ergebnisOffen[f._id] = {
        frage: f.frage,
        bereich: f.bereich,
        afb: f.afb,
        antwort: textarea.value.trim(),
        maxPunkte: f.punkte
      };
    }

    btnWeiter.onclick = () => {
      speichern();
      goNext();
    };

    btnZurueck.onclick = () => {
      speichern();
      state.posIndex--;
      renderQuestion();
    };
  }

  function goNext() {
    state.posIndex++;
    if (state.posIndex < state.order.length) {
      renderQuestion();
    } else {
      progressFill.style.width = "100%";
      showConfirm();
    }
  }

  // ---- Nicht-native Abgabe-Bestätigung ----
  function showConfirm() {
    screenTest.classList.add("hidden");
    screenConfirm.classList.remove("hidden");
    confirmAnswered.textContent = `${Object.keys(state.ergebnisGeschlossen).length} von ${AUTO_FRAGEN.length}`;
    confirmOffen.textContent = `${Object.keys(state.ergebnisOffen).length} von ${OFFEN_FRAGEN.length}`;
    confirmCheat.textContent = state.cheatEvents.length > 0
      ? `${state.cheatEvents.length}× protokolliert`
      : "keine";
  }

  btnBackToTest.addEventListener("click", () => {
    // Zurück zur letzten (offenen) Frage, zum letzten Kontrollblick vor der Abgabe.
    state.posIndex = state.order.length - 1;
    screenConfirm.classList.add("hidden");
    screenTest.classList.remove("hidden");
    renderQuestion();
  });

  btnFinalSubmit.addEventListener("click", () => {
    state.submitted = true;
    screenConfirm.classList.add("hidden");
    screenResult.classList.remove("hidden");
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    finishTest();
  });

  // ---- Abschluss ----
  function finishTest() {
    const autoPunkte = Object.values(state.ergebnisGeschlossen).reduce((s, a) => s + a.erreichtePunkte, 0);

    resultAuto.textContent = `${autoPunkte} / ${AUTO_MAX} Punkten (automatisch ausgewertet)`;
    resultOffenNote.textContent =
      `Zusätzlich ${OFFEN_MAX} Punkte aus ${OFFEN_FRAGEN.length} Reflexionsfrage(n) – ` +
      `diese bewertet Ihre Lehrperson von Hand. Gesamt möglich: ${GESAMT_MAX} Punkte.`;

    if (state.cheatEvents.length > 0) {
      resultCheatNote.textContent =
        `Hinweis: Während des Tests wurde ${state.cheatEvents.length}× das Fenster/der Tab ` +
        `oder der Vollbildmodus verlassen. Dies wurde protokolliert und ist für die Lehrperson sichtbar.`;
      resultCheatNote.classList.remove("hidden");
    }

    saveResult(autoPunkte);
  }

  function saveResult(autoPunkte) {
    if (typeof db === "undefined") {
      resultSaving.classList.add("hidden");
      resultSavedError.classList.remove("hidden");
      return;
    }

    // Für die Speicherung in der ursprünglichen Reihenfolge der Fragen sortieren
    // (unabhängig von der zufälligen Anzeige-Reihenfolge dieses Versuchs).
    const antwortenGeschlossen = FRAGEN
      .filter((f) => state.ergebnisGeschlossen[f._id])
      .map((f) => state.ergebnisGeschlossen[f._id]);
    const antwortenOffen = FRAGEN
      .filter((f) => state.ergebnisOffen[f._id])
      .map((f) => state.ergebnisOffen[f._id]);

    db.collection("test_ergebnisse").add({
      kapitel: TEST.kapitel,
      name: state.name,
      autoPunkte: autoPunkte,
      autoMaxPunkte: AUTO_MAX,
      offenMaxPunkte: OFFEN_MAX,
      gesamtMaxPunkte: GESAMT_MAX,
      antwortenGeschlossen: antwortenGeschlossen,
      antwortenOffen: antwortenOffen,
      cheatEvents: state.cheatEvents,
      cheatCount: state.cheatEvents.length,
      zeitstempel: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
      resultSaving.textContent = "Ergebnis wurde gespeichert und an die Lehrperson übermittelt.";
    }).catch((err) => {
      console.error("Fehler beim Speichern:", err);
      resultSaving.classList.add("hidden");
      resultSavedError.classList.remove("hidden");
    });
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }
})();
