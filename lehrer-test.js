// Lehrer-Dashboard für den summativen Test (aktuell: Kapitel 6).
// Eigenes Passwort, eigene Firestore-Sammlung ("test_ergebnisse"), eigene Seite –
// bewusst getrennt vom Übungsquiz-Lehrerbereich (js/lehrer.js), damit der bestehende,
// bereits funktionierende Übungsquiz-Bereich unangetastet bleibt.
//
// WICHTIG zur Sicherheit: Das Passwort hier schützt nur die Ansicht in dieser App.
// Es ist KEINE Datenbank-Zugriffskontrolle (siehe README, Abschnitt "Sicherheit").

(function () {
  // SHA-256-Hash des Test-Lehrer-Passworts (nicht das Klartext-Passwort selbst).
  // Das aktuelle Passwort steht in der README.
  const PASSWORT_HASH = "378c5d1a0ee95f0af581b3b8efba63773c05d6c2500f23103fc102849344d426";

  const OFFEN_FRAGEN = TEST_DATA.fragen.filter((f) => f.type === "offen");

  const screenLogin = document.getElementById("screen-login");
  const screenDashboard = document.getElementById("screen-dashboard");
  const screenTable = document.getElementById("screen-table");

  const inputPassword = document.getElementById("input-password");
  const loginError = document.getElementById("login-error");
  const btnLogin = document.getElementById("btn-login");
  const btnRefresh = document.getElementById("btn-refresh");
  const btnExport = document.getElementById("btn-export");

  const statCount = document.getElementById("stat-count");
  const statAvg = document.getElementById("stat-avg");
  const statCheat = document.getElementById("stat-cheat");
  const studentList = document.getElementById("student-list");

  let currentResults = [];

  async function sha256(text) {
    const enc = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }

  btnLogin.addEventListener("click", async () => {
    const pw = inputPassword.value;
    const hash = await sha256(pw);
    if (hash === PASSWORT_HASH) {
      loginError.classList.add("hidden");
      screenLogin.classList.add("hidden");
      screenDashboard.classList.remove("hidden");
      screenTable.classList.remove("hidden");
      loadResults();
    } else {
      loginError.classList.remove("hidden");
    }
  });

  inputPassword.addEventListener("keydown", (e) => {
    if (e.key === "Enter") btnLogin.click();
  });

  btnRefresh.addEventListener("click", loadResults);

  function loadResults() {
    if (typeof db === "undefined") {
      studentList.innerHTML = "<p>Firebase ist noch nicht eingerichtet (siehe README).</p>";
      return;
    }

    db.collection("test_ergebnisse")
      .where("kapitel", "==", TEST_DATA.kapitel)
      .orderBy("autoPunkte", "desc")
      .get()
      .then((snapshot) => {
        currentResults = [];
        snapshot.forEach((doc) => currentResults.push(doc.data()));
        renderResults();
      })
      .catch((err) => {
        console.error(err);
        studentList.innerHTML = "<p>Fehler beim Laden der Ergebnisse.</p>";
      });
  }

  function renderResults() {
    studentList.innerHTML = "";

    if (currentResults.length === 0) {
      studentList.innerHTML = "<p>Noch keine Einreichungen vorhanden.</p>";
      statCount.textContent = "0";
      statAvg.textContent = "–";
      statCheat.textContent = "–";
      return;
    }

    let sumProzent = 0;
    let mitCheat = 0;

    currentResults.forEach((d, idx) => {
      const prozent = d.autoMaxPunkte ? Math.round((d.autoPunkte / d.autoMaxPunkte) * 100) : 0;
      sumProzent += prozent;
      if ((d.cheatCount || 0) > 0) mitCheat++;

      const row = document.createElement("div");
      row.className = "student-row";

      const head = document.createElement("div");
      head.className = "student-row-head";

      const datum = d.zeitstempel && d.zeitstempel.toDate
        ? d.zeitstempel.toDate().toLocaleString("de-AT")
        : "–";

      head.innerHTML =
        `<span class="name">${escapeHtml(d.name)}</span>` +
        `<span>${d.autoPunkte} / ${d.autoMaxPunkte} Pkt. automatisch (${prozent}%)</span>` +
        `<span>+ ${d.offenMaxPunkte || 0} Pkt. Reflexion (manuell)</span>` +
        `<span class="cheat-pill ${(d.cheatCount || 0) > 0 ? "warn" : ""}">` +
          `${(d.cheatCount || 0) > 0 ? (d.cheatCount + "× Fenster verlassen") : "kein Hinweis"}` +
        `</span>` +
        `<span style="color:var(--muted); font-size:0.8rem;">${datum}</span>`;

      const body = document.createElement("div");
      body.className = "student-row-body hidden";

      if (d.antwortenOffen && d.antwortenOffen.length) {
        d.antwortenOffen.forEach((a, i) => {
          const block = document.createElement("div");
          block.className = "open-answer-block";
          const antwortText = (a.antwort || "").trim();
          block.innerHTML =
            `<div class="frage-label">Reflexionsfrage ${i + 1} · ${escapeHtml(a.bereich || "")} · max. ${a.maxPunkte} Punkte</div>` +
            `<div class="frage-text">${escapeHtml(a.frage || "")}</div>` +
            `<div class="antwort-text${antwortText ? "" : " leer"}">${antwortText ? escapeHtml(antwortText) : "(keine Antwort abgegeben)"}</div>`;
          body.appendChild(block);
        });
      } else {
        body.innerHTML = "<p>Keine Reflexionsantworten vorhanden.</p>";
      }

      head.addEventListener("click", () => body.classList.toggle("hidden"));

      row.appendChild(head);
      row.appendChild(body);
      studentList.appendChild(row);
    });

    statCount.textContent = currentResults.length;
    statAvg.textContent = Math.round(sumProzent / currentResults.length) + "%";
    statCheat.textContent = mitCheat + " / " + currentResults.length;
  }

  btnExport.addEventListener("click", () => {
    if (!currentResults.length) {
      alert("Keine Ergebnisse zum Exportieren vorhanden.");
      return;
    }

    const rows = currentResults.map((d) => {
      const row = {
        Name: d.name,
        "Punkte automatisch": d.autoPunkte,
        "Max. automatisch": d.autoMaxPunkte,
        "Fenster/Tab verlassen (Anzahl)": d.cheatCount || 0,
        Datum: d.zeitstempel && d.zeitstempel.toDate ? d.zeitstempel.toDate().toLocaleString("de-AT") : ""
      };

      const antworten = d.antwortenOffen || [];
      OFFEN_FRAGEN.forEach((fDef, i) => {
        const a = antworten.find((x) => x.frage === fDef.frage) || antworten[i];
        const label = `Reflexion ${i + 1} (${fDef.bereich})`;
        row[label + " – Antwort"] = a ? a.antwort : "";
        row[label + ` – Punkte (max. ${fDef.punkte})`] = ""; // von Hand auszufüllen
      });

      row["Gesamtpunkte (automatisch + manuell, von Hand eintragen)"] = "";

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Test Kapitel 6".slice(0, 31));
    const heute = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `Test_Kapitel6_Ergebnisse_${heute}.xlsx`);
  });

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }
})();
