# Geografie-Quiz – mehrere Kapitel

Dieses Projekt enthält zwei unterschiedliche App-Typen für die 2. Jahrgang-HAK-Geografie
(Geospots HAK), die dieselbe Codebasis, dasselbe Design und dasselbe Firebase-Projekt
teilen, sich aber in Zweck und Ablauf unterscheiden:

1. **Übungsquiz** (`kapitel6.html`, `kapitel7.html`, …) – unbenotete Wiederholung mit
   Sofort-Feedback nach jeder Frage, öffentlicher Bestenliste.
2. **Benoteter Test** (`test-kapitel6.html`) – summativer, benoteter Test ohne
   Sofort-Feedback, mit Reflexionsfragen und einem Hinweis-Protokoll gegen Schummeln.

## Übungsquiz – deckt aktuell fünf Kapitel ab

- Kapitel 6 – Zentren der Weltwirtschaft außerhalb Europas
- Kapitel 7 – Europa im Überblick
- Kapitel 8 – Die Europäische Union
- Kapitel 10 – Grundlagen und Naturraum Österreichs
- Kapitel 11+12 – Österreichs Bevölkerung & Wirtschaftsstandort Österreich

Auf der Startseite (`index.html`) wählen die Schüler:innen einfach das gewünschte
Kapitel aus und starten direkt mit der Wiederholung.

## Nur EIN Firebase-Projekt für alles

Sie brauchen **kein eigenes Firebase-Projekt pro Kapitel oder App-Typ**. Es gibt genau
ein gemeinsames Firebase/Firestore-Setup für die gesamte App (einmalig einrichten,
siehe unten). Das Übungsquiz speichert seine Ergebnisse in der Sammlung `ergebnisse`,
der Test in einer eigenen Sammlung `test_ergebnisse` – beide im selben Firebase-Projekt,
beide über dieselbe `js/firebase-config.js`.

## Was das Übungsquiz kann

- Namensabfrage vor Quizbeginn
- Kapitelauswahl auf der Startseite
- Pro Kapitel 20 Fragen (100 Punkte gesamt), in vier Fragetypen für mehr Abwechslung:
  - **Multiple Choice** (4 Antwortmöglichkeiten)
  - **Wahr/Falsch**
  - **Zuordnung** – Begriffe werden per Dropdown den passenden Beschreibungen zugeordnet
  - **Reihenfolge** – durchmischte Elemente werden per Auf/Ab-Knöpfen in die richtige
    Reihenfolge gebracht (z. B. chronologische Ereignisse, Ablaufschritte)
  - Bei Zuordnung und Reihenfolge gibt es **Teilpunkte** (z. B. 3 von 4 Zuordnungen
    richtig = 75 % der Punkte dieser Frage); bei Multiple Choice und Wahr/Falsch gibt
    es sofortiges Feedback nach jedem Klick, bei Zuordnung/Reihenfolge über den Button
    "Antwort prüfen"
- Speicherung jedes Ergebnisses in einer Online-Datenbank (Firebase Firestore)
- Öffentliche Bestenliste (Top 10) pro Kapitel
- Passwortgeschützter Lehrer-Bereich mit Kapitelauswahl (auch "Alle Kapitel" auf
  einen Blick), allen Ergebnissen und Statistiken
- Export der Ergebnisse als Excel-Datei (.xlsx) zum Eintragen in iDoceo – wahlweise
  pro Kapitel oder als Gesamtexport aller Kapitel

### Ihr Lehrer-Passwort (Übungsquiz)

```
qG3ScDcoYQ_6
```

---

## Benoteter Test (Kapitel 6) – `test-kapitel6.html`

Zusätzlich zum Übungsquiz gibt es einen eigenständigen, summativen Test zu Kapitel 6,
dessen Fragen sich direkt auf die im Unterricht bisher behandelten Inhalte beziehen
(USA, Brasilien, Südafrika, Arabische Halbinsel, China, Indien sowie BIP/Wohlstand –
auf Basis der hochgeladenen Arbeitsblätter und des bereits AFB-eingeteilten
Lösungsblatts "Zentren der Weltwirtschaft").

### Was den Test vom Übungsquiz unterscheidet

- **Kein Sofort-Feedback.** Eine Antwort wird nur als "ausgewählt" markiert, nicht
  als richtig/falsch angezeigt – das ist bei einem benoteten Test so gewollt.
- **27 Fragen, 68 Punkte gesamt**, bewusst über alle drei Anforderungsbereiche verteilt:
  - **AFB I (Reproduktion)** – 12 Fragen (MC/Wahr-Falsch), je 1 Punkt = 12 Punkte
  - **AFB II (Anwendung/Transfer)** – 10 MC/Wahr-Falsch-Fragen (je 2 Punkte) + 1
    Zuordnungsfrage und 1 Reihenfolge-Frage (je 8 Punkte, mit Teilpunkten) = 36 Punkte
  - **AFB I+II zusammen** = 48 Punkte
  - **AFB III (Reflexion)** – 3 offene Fragen (freier Text, 7+7+6 Punkte) = 20 Punkte,
    darunter die Beschreibung/Interpretation einer im Unterricht behandelten Karikatur
    (Erdöl-Fördermächte vs. Industriestaaten) und eine Frage zur Aussagekraft von BIP
    pro Kopf und Gini-Index über die tatsächliche Vermögensverteilung
  - Ein eigener Block zu 8 Fragen stammt aus dem Arbeitsblatt "Das BIP – kurz
    nachgedacht" (was zählt zum BIP, Entstehung/Verteilung/Verwendung, BIP-pro-Kopf-
    Berechnung, Unwetter-Beispiel zur Kritik am BIP als Wohlstandsmaß)
- **Zufällige Reihenfolge pro Versuch.** Die automatisch bewerteten Fragen (AFB I/II)
  werden bei jedem Testversuch neu gemischt, ebenso die Reihenfolge der
  Antwortmöglichkeiten bei Multiple-Choice/Wahr-Falsch-Fragen. Die drei offenen
  Reflexionsfragen stehen immer als fester Block am Schluss (in der Reihenfolge
  Karikatur → BIP/Gini → Kapitelabschluss).
- **Zwischen den drei Reflexionsfragen vor/zurück wechseln.** Innerhalb dieses
  Schluss-Blocks kann man noch einmal zur vorherigen offenen Frage zurückblättern,
  bevor man endgültig abgibt – bereits eingegebener Text bleibt dabei erhalten. Bei
  den automatisch bewerteten Fragen davor gibt es bewusst kein Zurückblättern.
- **Offene Reflexionsfragen werden NICHT automatisch bewertet.** Die Schüler:innen
  sehen direkt nach Abgabe nur den automatisch ausgewerteten Teilscore (AFB I + AFB
  II, max. 48 Punkte); die restlichen 20 Punkte aus den drei Reflexionsfragen vergibt
  die Lehrperson von Hand im Lehrer-Bereich bzw. beim Eintragen in iDoceo.
- **Nicht-native Abgabe-Bestätigung**: Vor dem endgültigen Absenden zeigt die App eine
  eigene Zusammenfassungsseite ("X von Y Fragen beantwortet, Fenster Y-mal verlassen")
  statt eines Browser-`confirm()`-Fensters, und erlaubt einen letzten Blick auf die
  zuletzt bearbeitete Frage.
- **Keine Bestenliste** (unpassend für einen benoteten Test).
- Eigene Fragenkatalog-Datei `js/test-data-kapitel6.js`, eigene Engine `js/test.js`,
  eigene Firestore-Sammlung `test_ergebnisse`, eigener Lehrer-Bereich
  `lehrer-test.html` mit **eigenem, separatem Passwort**.

### Anti-Schummel-Funktion – bitte die Grenzen kennen

Auf Wunsch wurde eine Sperre/Warnung gegen das Verlassen des Fensters eingebaut:

- Der Test versucht beim Start, in den **Vollbildmodus** zu wechseln.
- Ein Wechsel zu einem anderen **Tab oder Fenster** (Page Visibility API) sowie ein
  **Verlassen des Vollbildmodus** werden gezählt und mit Zeitstempel protokolliert.
- Während des Tests erscheint ein **sichtbarer Hinweis-Banner**, sobald das mindestens
  einmal passiert ist, und die Anzahl wird am Ende mit abgespeichert und im
  Lehrer-Bereich pro Person angezeigt (inkl. "Hinweis"-Markierung in der Übersicht).
- Ein Schließen/Neuladen der Seite während des Tests löst die native
  Browser-Warnung "Änderungen verwerfen?" aus.

**Wichtig – das ist kein echter technischer Schummelschutz:** In einem normalen
Browser-Tab gibt es keine Möglichkeit, ein zweites Gerät, ein zweites Browserfenster
auf einem zweiten Bildschirm oder jemanden, der im selben Raum mitliest, zuverlässig
zu erkennen oder zu verhindern. Die Funktion ist als **Transparenz- und
Abschreckungsmaßnahme** gedacht (die Schüler:innen werden vor Testbeginn auch
ausdrücklich darauf hingewiesen) und als zusätzliches Signal für die Lehrperson bei
der Korrektur – nicht als Ersatz für Aufsicht im Klassenzimmer.

### Ihr Lehrer-Passwort (Test-Bereich, separat vom Übungsquiz-Passwort!)

```
8ekgTsqBCK_qv
```

Im `lehrer-test.html`-Bereich sehen Sie pro Person den automatisch bewerteten
Punktestand, die Anzahl der Fenster-/Vollbild-Hinweise, und können durch Anklicken
eines Namens die drei Reflexionsantworten im Volltext lesen. Der **Excel-Export**
(„Als Excel exportieren (für iDoceo)“) enthält pro Person:

- Name, automatisch erreichte Punkte, automatisches Maximum, Anzahl Fenster-Hinweise, Datum
- für jede der drei Reflexionsfragen: den vollständigen Antworttext **und** eine
  leere Spalte für die von Ihnen zu vergebenden Punkte (max. 7, 7 bzw. 6 je Frage)
- eine leere Spalte "Gesamtpunkte" zum händischen Eintragen der Endsumme

Bewusst **keine** automatischen Excel-Formeln – das hätte die Datei unnötig
fehleranfällig gemacht; die Addition erledigen Sie beim Eintragen in iDoceo oder in
der Excel-Datei selbst.

---

## Einmaliges Setup (ca. 15 Minuten)

Die App selbst ist eine reine "statische" Website (nur HTML/CSS/JavaScript), die
GitHub Pages kostenlos hosten kann. Damit Ergebnisse, Bestenliste und
Lehrer-Export aber **über alle Schüler-Geräte hinweg** funktionieren, braucht es
zusätzlich einen kleinen kostenlosen Online-Speicher – dafür wird hier
**Firebase** (ein Google-Produkt) verwendet. GitHub Pages allein kann keine
Daten speichern.

Falls Sie das Übungsquiz bereits eingerichtet haben, ist **kein weiteres Setup**
nötig – der Test nutzt dieselbe `js/firebase-config.js` und dieselben
`firestore.rules` (die aktualisierte Version in diesem Ordner enthält jetzt sowohl
die Regeln für `ergebnisse` als auch für `test_ergebnisse`; bitte beim nächsten
Update einmal erneut in der Firebase-Konsole unter "Regeln" veröffentlichen).

### Schritt 1 – Firebase-Projekt anlegen

1. Gehen Sie auf https://console.firebase.google.com und melden Sie sich mit
   einem Google-Konto an (ein privates oder das Schul-Konto funktioniert).
2. Klicken Sie auf **"Projekt hinzufügen"**, vergeben Sie einen Namen (z. B.
   `geo-quiz-hak-feldbach`) und folgen Sie dem Assistenten (Google Analytics
   können Sie deaktivieren, wird nicht benötigt).
3. Im Projekt links im Menü **Build → Firestore Database** öffnen →
   **"Datenbank erstellen"** → Standort z. B. `eur3 (Europa)` wählen →
   **Produktionsmodus** auswählen (die Sicherheitsregeln liefern wir gleich mit).
4. Im Reiter **"Regeln"** der Firestore-Datenbank den gesamten Inhalt löschen
   und durch den Inhalt der mitgelieferten Datei `firestore.rules` ersetzen,
   dann auf **"Veröffentlichen"** klicken.

### Schritt 2 – Web-App verbinden

1. Zurück auf der Projekt-Übersicht (Zahnrad-Symbol oben links →
   **Projekteinstellungen**).
2. Unter "Meine Apps" auf das Symbol **`</>`** (Web) klicken.
3. Einen Spitznamen vergeben (z. B. "Geo-Quiz"), **nicht** "Firebase Hosting"
   ankreuzen, auf "App registrieren" klicken.
4. Es erscheint ein Codeblock mit `const firebaseConfig = { ... }`. Diesen
   kompletten Block kopieren.
5. Öffnen Sie die Datei `js/firebase-config.js` in diesem Projekt und ersetzen
   Sie den Platzhalter-Block durch den kopierten `firebaseConfig`-Block
   (die Zeile `firebase.initializeApp(...)` darunter bleibt unverändert stehen).

### Schritt 3 – Auf GitHub veröffentlichen

1. Erstellen Sie auf https://github.com ein neues, öffentliches Repository
   (z. B. `geo-quiz`).
2. Laden Sie alle Dateien aus diesem Ordner in das Repository hoch (per
   GitHub-Weboberfläche "Add file → Upload files", oder per `git push`, wenn
   Ihnen das vertrauter ist).
3. Im Repository unter **Settings → Pages**: bei "Source" den Branch `main`
   und Ordner `/ (root)` auswählen, speichern.
4. Nach ein bis zwei Minuten ist die App unter
   `https://IHR-GITHUB-NAME.github.io/geo-quiz/` erreichbar.

### Schritt 4 – Testen

1. Öffnen Sie den Link, klicken Sie auf Kapitel 6, geben Sie einen Testnamen
   ein und schließen Sie das Quiz ab.
2. Öffnen Sie `lehrer.html`, melden Sie sich mit dem Passwort oben an – Ihr
   Testergebnis sollte in der Tabelle erscheinen.
3. Testen Sie den Excel-Export.
4. Öffnen Sie zusätzlich `test-kapitel6.html`, schließen Sie den Test testweise ab,
   und prüfen Sie in `lehrer-test.html` (mit dem **separaten** Test-Passwort), ob die
   Einreichung samt Reflexionsantworten erscheint.

Danach können Sie den Link mit Ihrer Klasse teilen (z. B. per QR-Code oder in
Ihrem Lernmanagementsystem).

---

## Weitere Kapitel ergänzen (Übungsquiz)

Dank des gemeinsamen `js/quiz.js` (das für alle Kapitel unverändert bleibt) ist ein
neues Kapitel in drei Schritten ergänzt:

1. Eine neue Datei `js/quiz-data-kapitelX.js` anlegen (siehe z. B.
   `js/quiz-data-kapitel7.js` als Vorlage). Sie muss eine globale Variable
   `QUIZ_DATA` definieren:
   ```js
   const QUIZ_DATA = {
     kapitel: "X",              // eindeutige Kennung, z. B. "9" oder "13_14"
     titel: "Kapitel X – ...",
     punkteProFrage: 5,
     fragen: [ /* siehe unten: vier mögliche Fragetypen */ ]
   };
   ```
   Mögliche Fragetypen in `fragen[]`:
   - `{ type: "mc", unterkapitel, frage, optionen: [4 Strings], richtig: Index }`
   - `{ type: "tf", unterkapitel, frage, richtig: true|false }`
   - `{ type: "matching", unterkapitel, frage, paare: [{links, rechts}, ...] }`
     (3–5 Paare, jedes `rechts` muss eindeutig zu genau einem `links` passen)
   - `{ type: "ordering", unterkapitel, frage, elemente: [...] }`
     (3–5 Elemente, **bereits in der richtigen Reihenfolge** im Array – die App
     mischt sie für die Anzeige selbst; nur für Inhalte mit eindeutiger Reihenfolge
     geeignet, z. B. Chronologien oder Ablaufschritte)
2. `kapitel6.html` kopieren zu `kapitelX.html` und nur anpassen: den Titel-Tag,
   den Badge- und Überschriftentext, die Bestenlisten-Überschrift sowie den
   Skript-Verweis auf `js/quiz-data-kapitelX.js`. **`js/quiz.js` bleibt
   unverändert** – die Engine erkennt Fragetypen und Punktestand automatisch.
3. In `index.html` einen weiteren `<a class="chapter-item">`-Eintrag ergänzen und
   in `js/lehrer.js` im `CHAPTERS`-Array eine Zeile mit `{ id: "X", label: "..." }`
   hinzufügen, damit das Kapitel im Lehrer-Dashboard auswählbar ist.

## Weitere Tests ergänzen (benoteter Test)

Analog zum Übungsquiz, mit `js/test.js` als unveränderter, gemeinsamer Engine:

1. Neue Datei `js/test-data-kapitelX.js` anlegen, die `const TEST_DATA = { kapitel,
   titel, fragen: [...] }` definiert. Zusätzlich zu den vier Fragetypen oben gibt es
   den Typ `{ type: "offen", afb: 3, bereich, punkte, richtwoerter, frage, bild?,
   bildquelle? }` für frei zu beantwortende Reflexionsfragen (jede Frage braucht ein
   `afb`-Feld: 1 = Reproduktion, 2 = Anwendung/Transfer, 3 = Reflexion).
2. `test-kapitel6.html` kopieren zu `test-kapitelX.html`, Titel/Badge sowie den
   Skript-Verweis auf `js/test-data-kapitelX.js` anpassen.
3. In `index.html` einen weiteren `<a class="chapter-item chapter-item-test">`-Eintrag
   ergänzen.
4. `lehrer-test.html`/`js/lehrer-test.js` sind aktuell fix auf Kapitel 6 eingestellt.
   Bei mehreren Tests am besten analog zu `js/lehrer.js` ein `CHAPTERS`-Array und ein
   Auswahl-Dropdown ergänzen (die Firestore-Abfrage nach `kapitel` funktioniert dafür
   bereits).

Ein neues Firebase-Projekt ist auch dafür **nicht** nötig.

## Passwort ändern

1. Neues Passwort ausdenken (z. B. ein Passwortgenerator).
2. Den SHA-256-Hash davon erzeugen, z. B. in der Browser-Konsole (F12) auf
   irgendeiner Seite:
   ```js
   crypto.subtle.digest("SHA-256", new TextEncoder().encode("IHR_NEUES_PASSWORT"))
     .then(buf => console.log(Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("")));
   ```
3. Für das Übungsquiz: den ausgegebenen Wert in `js/lehrer.js` in die Zeile
   `PASSWORT_HASH = "..."` eintragen. Für den Test: denselben Vorgang in
   `js/lehrer-test.js` wiederholen (eigene, unabhängige `PASSWORT_HASH`-Zeile).
4. Datei auf GitHub aktualisieren.

## Sicherheit – bitte lesen

Diese App ist für den Schulgebrauch gebaut. Bewusste Vereinfachungen:

- **Bestenliste (Übungsquiz) ist öffentlich lesbar**, damit sie ohne Anmeldung
  angezeigt werden kann. Gespeichert werden nur Name, Kapitel, Punkte und Zeitpunkt.
- **Die Lehrer-Passwörter schützen nur die jeweilige Ansicht** (`lehrer.html` bzw.
  `lehrer-test.html`), nicht den Datenbankzugriff selbst – wer technisch versiert
  genug ist, könnte die Ergebnisse auch ohne Passwort direkt aus der Datenbank
  auslesen. Für Klassenquiz-Punkte ist das ein akzeptables Risiko.
- **Beim benoteten Test gilt das zusätzlich für die Reflexionsantworten im Volltext**
  (`test_ergebnisse`-Sammlung) – das ist ein größeres Zugeständnis als beim reinen
  Übungsquiz, weil dort echter, inhaltlicher Schülertext gespeichert wird, nicht nur
  eine Punktzahl. Für ein Schulprojekt wird das als vertretbar eingestuft; sollten
  Sie eine strengere Absicherung wollen (z. B. echte Firebase-Anmeldung nur für Sie
  als Lehrperson), sagen Sie einfach Bescheid – das lässt sich nachrüsten.
- Ergebnisse können nach dem Speichern von niemandem mehr verändert oder
  gelöscht werden (siehe `firestore.rules`), das verhindert nachträgliches
  Frisieren von Punkten. Zum gezielten Löschen von Testdaten siehe weiter unten.

### Testdaten/Ergebnisse löschen

Da die App selbst keine Lösch-Funktion hat (Absicht, siehe oben), geht das Löschen
einzelner Einträge direkt in der Firebase-Konsole:

1. https://console.firebase.google.com → Ihr Projekt → **Firestore Database** →
   Reiter **"Daten"**.
2. Die Sammlung `ergebnisse` (Übungsquiz) bzw. `test_ergebnisse` (Test) öffnen.
3. Den gewünschten Eintrag anklicken und oben rechts löschen (Papierkorb-Symbol).

## Dateiübersicht

```
index.html                       Startseite / Auswahl Übungsquiz & Test
kapitel6.html                    Übungsquiz-Seite Kapitel 6
kapitel7.html                    Übungsquiz-Seite Kapitel 7
kapitel8.html                    Übungsquiz-Seite Kapitel 8
kapitel10.html                   Übungsquiz-Seite Kapitel 10
kapitel11_12.html                Übungsquiz-Seite Kapitel 11+12
lehrer.html                      Lehrer-Bereich Übungsquiz (Passwort, Kapitelauswahl, Export)
test-kapitel6.html               Benoteter Test, Kapitel 6
lehrer-test.html                 Lehrer-Bereich Test (eigenes Passwort, Volltext-Reflexionsantworten, Export)
css/style.css                    Gemeinsames Design (Übungsquiz + Test)
js/firebase-config.js            Ihre Firebase-Zugangsdaten (einmalig ausfüllen, gilt für alles)
js/quiz-data-kapitel6.js         Fragenkatalog Übungsquiz Kapitel 6
js/quiz-data-kapitel7.js         Fragenkatalog Übungsquiz Kapitel 7
js/quiz-data-kapitel8.js         Fragenkatalog Übungsquiz Kapitel 8
js/quiz-data-kapitel10.js        Fragenkatalog Übungsquiz Kapitel 10
js/quiz-data-kapitel11_12.js     Fragenkatalog Übungsquiz Kapitel 11+12
js/quiz.js                       Gemeinsame Übungsquiz-Ablauflogik (Sofort-Feedback, alle 4 Fragetypen)
js/lehrer.js                     Lehrer-Dashboard-Logik Übungsquiz inkl. Kapitelauswahl und Excel-Export
js/test-data-kapitel6.js         Fragenkatalog Test Kapitel 6 (27 Fragen, AFB I–III, inkl. Karikatur-Bild)
js/test.js                       Test-Ablauflogik (kein Sofort-Feedback, offene Fragen, Anti-Schummel-Protokoll)
js/lehrer-test.js                Lehrer-Dashboard-Logik Test (eigenes Passwort, Volltext-Reflexionsantworten, Export)
firestore.rules                  Sicherheitsregeln für die Firebase-Datenbank (Übungsquiz + Test)
```
