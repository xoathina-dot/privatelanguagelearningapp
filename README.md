# Γεια & Hallo — private Griechisch-Deutsch Lern-App

Eine private Lern-App für zwei Personen: eine lernt Deutsch (native Griechisch), die andere
lernt Griechisch (native Deutsch). Mit Streak/XP, Lektionen mit Quiz, einem echten AI-Tutor-Chat,
einem gemeinsamen Nachrichten-Bereich mit KI-Übersetzung & Grammatik-Korrektur, einem
Vokabeltrainer und einem Profil-Bereich.

## Architektur

- **Server:** Node.js + Express (`server/`)
- **Datenbank:** SQLite über Node's eingebautes `node:sqlite`-Modul — keine externe DB nötig,
  keine native Kompilierung, eine einzelne Datei unter `data/app.db`.
- **Frontend:** einfaches Vanilla-JS SPA (`public/`) — kein Build-Schritt, kein Framework.
- **KI-Funktionen** (Tutor-Chat, Nachrichten-Übersetzung, Grammatik-Korrektur): echte Aufrufe an
  die Anthropic API, serverseitig (der API-Key liegt nie im Browser).
- **Login:** zwei feste Accounts (siehe unten) mit eigenem Cookie-Session-Token (JWT). Es gibt
  keine Registrierung — genau 2 Personen, genau wie gewünscht.

## Setup auf Replit

1. **Neuen Repl erstellen:** Auf replit.com → "Create Repl" → "Import from GitHub" (falls du dieses
   Projekt zuerst auf GitHub hochlädst) **oder** einen leeren Node.js-Repl anlegen und alle Dateien
   aus diesem Ordner per Drag & Drop in den Datei-Explorer ziehen.
2. **Node-Version prüfen:** Diese App braucht **Node ≥ 22.5** (wegen `node:sqlite`). Die mitgelieferte
   `.replit`-Datei setzt das Modul `nodejs-22`. Falls Replit beim ersten Start eine ältere Version
   verwendet, stelle in den Repl-Einstellungen ("Tools" → "Languages" bzw. der Sprachauswahl oben)
   sicher, dass Node 22 (oder neuer) ausgewählt ist.
3. **Secrets setzen** (Tab-Symbol "Secrets" in der Seitenleiste, NICHT in `.env` committen):
   - `JWT_SECRET` — eine lange zufällige Zeichenkette
   - `ANTHROPIC_API_KEY` — dein API-Key von https://console.anthropic.com
   - `USER1_USERNAME`, `USER1_PASSWORD`, `USER1_DISPLAY_NAME`, `USER1_TARGET_LANG` (`de` oder `el`)
   - `USER2_USERNAME`, `USER2_PASSWORD`, `USER2_DISPLAY_NAME`, `USER2_TARGET_LANG`
   - Siehe `.env.example` für alle Variablen und Beispielwerte.
4. **Starten:** Klick auf "Run" (führt `npm install` beim ersten Mal automatisch aus, dann `npm start`).
   Die Konsole zeigt: `Seed complete. Accounts ready: ...` — das sind eure zwei Accounts.
5. **Öffnen & einloggen:** Im Webview-Fenster (oder über die öffentliche `.replit.app`/`.replit.dev`-URL)
   mit einem der beiden Logins einloggen.

### Wie die "nur 2 Personen"-Beschränkung funktioniert

Es gibt zwei unabhängige Schutz-Ebenen:

- **App-Login (die eigentliche Zugriffskontrolle):** Es existieren nur die zwei Accounts, die du
  über die Secrets angelegt hast. Niemand kann sich selbst registrieren. Das ist der Schutz, der
  wirklich zählt — auch wenn jemand die App-URL kennt, kommt er ohne Passwort nicht rein.
- **Replit-Sichtbarkeit (optional, zusätzlich):** Stelle den Repl in den Repl-Einstellungen auf
  "Private", damit außer dir niemand den **Quellcode** einsehen oder bearbeiten kann. Das betrifft
  nur den Code-Editor, nicht automatisch die laufende Web-App — die Web-App-URL kann grundsätzlich
  von jedem aufgerufen werden, der sie kennt, landet dann aber auf dem Login-Screen.

## Lokale Entwicklung

```bash
npm install
cp .env.example .env   # dann die Werte in .env eintragen
npm start
```

Server läuft dann unter http://localhost:3000.

## Als iOS-App nutzen

Die App ist bereits als **PWA (Progressive Web App)** eingerichtet — das bedeutet, sie lässt sich auf
dem iPhone wie eine echte App installieren, ganz ohne App Store:

1. Öffne die Replit-URL der App in **Safari** (wichtig: muss Safari sein, nicht Chrome — nur Safari
   bietet auf iOS die "Zum Home-Bildschirm"-Funktion).
2. Tippe auf das Teilen-Symbol (Viereck mit Pfeil nach oben) in der unteren Leiste.
3. Wähle **"Zum Home-Bildschirm"**.
4. Fertig — auf dem Home-Bildschirm erscheint ein Icon, die App öffnet sich im Vollbild ohne
   Safari-Leiste, und die statischen Teile funktionieren dank Service Worker auch kurz offline.

Das ist für eine private 2-Personen-App der pragmatischste Weg: kostenlos, kein Mac nötig, keine
Apple-Developer-Mitgliedschaft, kein App-Store-Review.

**Alternative — eine "echte" native App (Capacitor):** Falls ihr später mehr wollt (z. B. echte
Push-Benachrichtigungen, Verteilung über TestFlight, ein Icon, das sich 1:1 wie eine native App
verhält), lässt sich dieses Projekt mit [Capacitor](https://capacitorjs.com) in ein natives Xcode-Projekt
verpacken. Das braucht dafür:
- einen **Mac mit Xcode**
- ein **Apple-Developer-Konto** (99 $/Jahr) für eine dauerhafte Installation auf dem Gerät bzw. TestFlight
  (ohne Konto lässt sich eine selbst gebaute App nur 7 Tage lang kostenlos über Xcode auf einem Gerät halten)

Das ist deutlich mehr Aufwand für einen Nutzen, der bei einer App für zwei Personen meist nicht nötig
ist — sag Bescheid, falls das trotzdem der gewünschte Weg ist, dann richte ich das Capacitor-Projekt ein.

## Persistenz & Backup

Alle Fortschritte (Streak, XP, abgeschlossene Lektionen, Vokabel-Favoriten, Nachrichten, Tutor-Chat)
liegen in `data/app.db`. Auf Replit bleibt dieser Ordner zwischen Neustarts erhalten. Für zusätzliche
Sicherheit empfiehlt es sich, die Datei gelegentlich herunterzuladen (Rechtsklick → Download im
Datei-Explorer) und als Backup zu sichern.

## Inhalte anpassen

- **Lektionen, Quiz-Fragen, Vokabeln:** `server/content.js` — pro Lernrichtung (`de`/`el`) ein Objekt
  mit `units`, `vocab` und `tutorChips`. Einfach Einträge ergänzen oder Texte ändern.
- **KI-Verhalten (Tutor-Ton, Modell):** `server/ai.js`. Das verwendete Modell lässt sich per
  `ANTHROPIC_MODEL`-Secret überschreiben (Standard: `claude-sonnet-5`).
- **Design/Farben:** `public/styles.css` — CSS-Variablen im `:root`-Block bzw. `body.dark`.

## Hinweis zu Kosten

Die KI-Funktionen (Tutor, Übersetzung, Korrektur) nutzen die Anthropic API mit nutzungsbasierter
Abrechnung. Für den persönlichen Gebrauch durch zwei Personen ist das Volumen sehr gering
(ein paar Cent pro aktivem Tag), aber ein eigener API-Key ist Voraussetzung.
