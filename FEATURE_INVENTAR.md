# digi-gastro.de — Vollständiges Feature-Inventar

> Recherche-Basis: `main.py` (12.861 Zeilen) · `database.py` (869 Zeilen, 14 Tabellen) · `admin.html` (13.211 Zeilen) · `menu.html` (3.579 Zeilen) · `landing.html` (1.888 Zeilen)
> Stand: 29.06.2026 · Alle Features mit Datei:Zeile-Referenz für Verifizierung

---

## 1. Bestellwesen (Order Management)

| Feature | Beschreibung | Benefit für Betreiber | Datei:Zeile |
|---|---|---|---|
| **QR-Code-Bestellung** | Gäste scannen Tisch-QR-Code, Speisekarte öffnet sich sofort im Browser ohne App | Keine App-Downloads, kein Personalbedarf für Bestellaufnahme | main.py:7814, 11920 |
| **Scan-to-Table-Sicherheit** | Drei-Token-System: `qr_token` (dauerhaft), `security_token` (rotierbar), `active_session_token` (Sitzung) | Sperrt Bestellungen von außerhalb des Lokals (Token muß am Tisch gescannt werden) | database.py:255-263 |
| **Tischverwaltung** | Tische erstellen, löschen, mit Zone & Form (Rechteck/Rund) | Volle Kontrolle über Layout, auch ungewöhnliche Tischformen abbildbar | main.py:7069, 7114 |
| **Mehrfach-Bestellungen pro Tisch** | Mehrere offene Bons pro Tisch, on-the-fly zusammenführen | Gast kann jederzeit nachbestellen, ohne dass altes Tablet-Bezahlen blockiert | main.py:5414 `tische-zusammenfuehren` |
| **Ganze-Bon-Stornierung** | Stornierung kompletter Bestellung mit PIN-Pflicht | Fehleingaben korrigierbar, manipulationssicher protokolliert | main.py:5531 |
| **Einzel-Artikel-Stornierung** | Einzelne Positionen stornieren (auch Bulk) | Präzise Korrektur möglich ohne ganzen Bon zu löschen | main.py:6118, 6269 |
| **Einzel-Artikel-Teilzahlung** | Kellner zahlt einzelne Artikel aus (pay-item, pay-items-bulk) | "Ich zahle nur mein Cola" — kein Rechenstress mehr am Tisch | main.py:5749, 5851 |
| **Split-Pay (Rechnung teilen)** | Bestellung auf mehrere Personen aufteilen | Gäste können getrennt zahlen, Kellner spare Rechenzeit | main.py:12407 |
| **Tisch-Zusammenführung** | Zwei Tische zu einer Bestellung vereinen | Tisch-Verschiebungen im laufenden Betrieb kein Problem | main.py:5414 |
| **Artikel-Transfer zwischen Tischen** | Einzelne Artikel oder ganze Bons auf anderen Tisch umbuchen | "Wir ziehen um zu Tisch 5" ohne Neubestellung | main.py:5938, 6367 |
| **Manuelle Bestellung durch Personal** | Kellner fügt Artikel manuell hinzu (`/api/admin/orders/add-manual`) | Telefon-Bestellungen, Nachbestellungen aus der Küche nachträglich | main.py:12767 |
| **Bestell-Workflow-Status** | Statuskette: eingegangen → bestaetigt → zubereitet → serviert → bezahlt | Jeder im Team sieht sofort, wo die Bestellung steht | main.py:9911, 9930 |
| **Artikel-Notizen** | Freitext-Notiz pro Artikel (`note`) | "Ohne Zwiebeln", "extra scharf" — läuft direkt mit in die Küche | database.py:218 |
| **Trinkgeld-Erfassung** | Trinkgeld-Betrag beim Bezahlen erfassen (`tip_amount`) | Korrekte Abrechnung & Ausweisung im Steuerreport | main.py:5255, database.py:201 |
| **Original-Warenwert-Invariante** | `original_total` wird beim Anlegen gesetzt und nie reduziert | Nie wieder 0€-Bons im Report nach Teilzahlung/Storno | database.py:206, main.py:5081 |
| **Anti-Doppel-Bestellung** | Race-Condition-Handling verhindert doppelte Bestell-Submissions | Keine Duplikate bei schnellen Klicks, kein doppelter Umsatz im Report | main.py:6154 |
| **Rechnung anfordern (Gast)** | Gast drückt "Rechnung"-Button im Menü → Kellner bekommt Signal | Gast muss nicht mehr winken, Service-Flow beschleunigt | menu.html:933, main.py:7653 |

## 2. Küche / KDS (Kitchen Display System)

| Feature | Beschreibung | Benefit | Datei:Zeile |
|---|---|---|---|
| **Küchen-Display (KDS)** | Eigener Rolle "Zubereiter" → eigene KDS-Ansicht unter `/{slug}/kitchen` | Küche arbeitet berührungslos am Monitor statt mit Papierbons | main.py:6874 |
| **KDS-Magic-Link-Pairing** | Einmal-Pairing-Secret koppelt Tablet/Monitor sicher an Tenant | Keine Passwort-Eingabe am Küchen-Monitor nötig | database.py:92, main.py:5234 |
| **KDS-Token-Rotation** | Chef kann Pairing-Secret rotieren → alle KDS-Geräte werden gekickt | Bei Verlust/Personalwechsel sofort entziehbar | main.py:5234 |
| **Live-Bestell-Stream** | Neue Bestellungen erscheinen per WebSocket in Echtzeit auf dem KDS | Kein Refresh, keine verlorenen Bons | main.py:449, 290 `broadcast_global` |
| **Serviert-Markierung** | Artikel für Artikel als serviert markieren | Küche & Kellner sehen synchron, was noch offen ist | main.py:12286 `admin/orders/serve` |
| **Artikel-Status-Tracking** | pending → confirmed → delivered pro Artikel | Präzise Nachverfolgung jeder Position | main.py:6518 |
| **POS-Webhook (Bon-Druck via Fremdsystem)** | Bezahlte Bestellung als standardisiertes JSON an POS-System gesendet | Bon-Druck über bestehendes Kassensystem, kein eigener Drucker nötig | main.py:8781 `send_order_to_pos` |
| **Bestell-Bestätigung** | Kellner/Küche bestätigt Eingang der Bestellung | Gast sieht Status-Update in Echtzeit | main.py:9911 |
| **KDS-Device-Cookie** | KDS-Geräte haben eigene Session, getrennt von Admin | Gerät darf nur anzeigen, nicht konfigurieren | main.py:417, 2504 |

## 3. Sitzplan & Tisch-Editor

| Feature | Beschreibung | Benefit | Datei:Zeile |
|---|---|---|---|
| **Visueller Tisch-Editor (Drag & Drop)** | Tische per Drag-Handle frei positionieren | Sitzplan 1:1 wie im echten Lokal abbildbar | main.py:7209, admin.html:4669, 5320 |
| **Tisch-Formen** | Rechteck & Rund (`shape: rect/round`) | Auch runde Tische oder Bar-Plätze darstellbar | database.py:261, main.py:7074 |
| **Zonen (Drinnen/Draußen)** | Beliebig viele Zonen pro Tenant | Mehrere Bereiche, Etagen oder Außenflächen abbildbar | database.py:254, main.py:7073 |
| **Live-Status-Farb-Codierung** | free / active / pending / calling — farblich codiert | Kellner sieht auf einen Blick, welcher Tisch Bedarf hat | admin.html:1158-1181 |
| **Offene-Artikel-Badge pro Tisch** | Leiste zeigt nicht servierte Artikel pro Tisch | Schnelle Priorisierung: welche Tische warten am längsten? | admin.html:4419 |
| **Gruppierte Ansicht** | Toggle zwischen Layout-View und gruppiert (nach Zone) | Schneller Überblick bei vielen Tischen | admin.html:1063 `view-mode-grouped` |
| **Auto-Grid-Sortierung** | Neue Tische automatisch ins Grid einsortiert | Sauberes Layout ohne manuelles Aufräumen | main.py:7104 `sort_tables_in_grid` |
| **Sitzungs-Ablauf-Seite** | Gäste sehen友好 "Sitzung abgelaufen"-Seite nach Timeout | Saubere UX statt kryptischer Fehlermeldung | main.py:4379 |
| **QR-Code-Druck-PDF** | A4-PDF mit 2×2-Grid aller Tisch-QR-Codes zum Ausdrucken | Fertiges Etiketten-PDF, direkt aufklebbar | main.py:11920 `/admin/qr-print` |

## 4. Produktverwaltung

| Feature | Beschreibung | Benefit | Datei:Zeile |
|---|---|---|---|
| **Kategorien (CRUD + Drag-Drop-Reorder)** | Beliebig viele Kategorien, Sortierung per Drag-Handle | Speisekarte logisch strukturierbar, jederzeit anpassbar | main.py:7236, 7617, 9969 |
| **Hauptgruppen (Super-Groups)** | Obergruppe fasst mehrere Kategorien zusammen (mit Farbe & Icon) | Bessere Übersicht im Bon, PDF und Kasse-Popup | database.py:131, main.py:10054 |
| **Hauptgruppen-Farben & Icons** | Eigene Farbe (Hex) + Material-Symbol pro Hauptgruppe | Visuelle Trennung Shisha/Getränk/Snacks auf einen Blick | database.py:141-142 |
| **Allergene (EU 1169/2011-kompatibel)** | JSON-Array von Allergen-Kürzeln pro Produkt | Rechtssicher, keine Bußgelder bei falscher Deklaration | database.py:173, main.py:1063 |
| **Vegan & Glutenfrei-Flags** | Zwei separate Boolean-Flags pro Produkt | Filter-Funktion für Gäste mit Unverträglichkeiten | database.py:170-172 |
| **Vegan/Glutenfrei-Filter (Gästeseite)** | Gast filtert Speisekarte mit einem Klick | Höhere Kundenzufriedenheit, mehr Bestellungen von Zielgruppen | menu.html:1299, 2139 |
| **Produktbilder** | Bild-URL pro Produkt, Upload + WebP-Konvertierung | Appetitanregend, mehr Upselling-Potential | database.py:169, main.py:7557 |
| **Brutto/Netto-Modus** | Toggle pro Tenant (`price_mode: brutto/netto`) | Flexible Preis-Ausweisung je nach Bedarf | database.py:128, main.py:9722 |
| **Kategorie-Typen** | `küche` / `bar` / `shisha` — steuert MwSt & Routing | Korrekte MwSt-Zuweisung automatisch (7% vs 19%) | database.py:174, main.py:7494 |
| **Verfügbarkeits-Toggle** | Produkt schnell verstecken ohne zu löschen | "Heute ausverkauft" mit einem Klick | main.py:10348 |
| **CSV-Import/Export** | Produkte als CSV exportieren & wieder importieren | Schneller Speisekarten-Austausch, Bulk-Edits in Excel | main.py:7269, 7319 |
| **AI-Bildauto-Auswahl** | Kuratierte Premium-Bildbibliothek + Lorem-Flickr + Open Food Facts Fallback | Speisekarte sofort produktiv ohne eigene Fotos | main.py:10631, 10673 |
| **AI-Bild-Verarbeitung** | Hintergrund entfernen, Auto-Trim, WebP-Konvertierung | Optisch perfekte Produktbilder ohne Photoshop | main.py:10302, 10645 |
| **Drag-Drop-Produkt-Sortierung** | SortableJS-Integration, Position wird persistiert | Reihenfolge jederzeit drag-and-drop anpassbar | admin.html:11300, main.py:9942 |
| **Mehrsprachige Produkttexte (DE/EN)** | `name_en` und `description_en` pro Produkt | Internationale Gäste direkt ansprechen | database.py:181-182, main.py:7547 |

## 5. Marketing & Upselling

| Feature | Beschreibung | Benefit | Datei:Zeile |
|---|---|---|---|
| **Events / Aktionen (mehrere parallel)** | Beliebig viele Events: "Ladys Night", "Hookah Night", "Lunch Deal" | Mehrere Promotion-Stränge gleichzeitig fahrbar | main.py:9452, database.py:279 |
| **Event-Produkte (Festpreise)** | Einzelne Produkte mit Event-Sonderpreis | Präzise Steuerung, welche Artikel rabattiert sind | database.py:299 |
| **Event-Combos** | Kombi-Deals: z.B. "Cola + Shisha = 18€" | Höherer Ø-Bon-Wert durch Bündel-Rabatt | database.py:307 |
| **Combo-eigene Zeiten/Tage** | Jedes Combo kann eigene Zeitfenster haben (oder erben) | Sehr feine Steuerung: "nur Happy Hour, nur Donnerstag" | database.py:316-318 |
| **Event-Modi** | `selected` (nur gewählte Produkte) oder `discount` (% auf alles) | Flexibel je nach Aktionsart | database.py:294 |
| **Event-Display-Name** | Interner Name vs. was der Gast sieht | Saubere Trennung Backend/Frontend | database.py:289 |
| **Happy-Hour (Legacy, vereinfacht)** | Globaler %‑Rabatt in Zeitfenster + Tage | Quick-Win-Aktion ohne komplexes Event-Setup | database.py:116-122, main.py:1250 |
| **Upselling Schicht 1 — Manuelle Empfehlungen** | Pro Produkt: `related_product_ids` als "Passende Extras" | Bewerber entscheidet selbst, was als Upsell passt | database.py:186, main.py:1074 |
| **Upselling Schicht 2 — Event-Combos** | Combo-Logik als Auto-Upselling | System schlägt Combos automatisch vor | main.py:9496 |
| **Upselling Schicht 3 — Co-Occurrence-Engine** | Algorithmus analysiert alle bezahlten Bons, berechnet "wer A kaufte, kaufte auch B"-Matrix | System lernt aus echtem Bestellverhalten, schlägt Top-5-Extras vor | main.py:10081 `compute_upsell_cooccurrences`, 4785 |
| **Landingpage-Editor mit Live-Vorschau** | Eigener Tab, iframe-Vorschau der Gäste-Landingpage | Chef sieht sofort, was Gäste sehen werden | admin.html:5196, main.py:8860 |
| **Willkommens-Section** | Titel + Untertitel personalisierbar | Individuelle Begrüßung, Branding | admin.html:5233 |
| **Hero-Slideshow (Bilder + Videos)** | Hintergrund-Slideshow mit Bild und Video | Hochwertige Erst-Optik für Landingpage | admin.html:5403, main.py:8898 |
| **Galerie-Sektion (Bilder + Videos)** | Eigene Galerie-Sektion mit Multi-Upload | Lokal-Atmosphäre zeigen | admin.html, main.py:8905 |
| **About-/Öffnungszeiten-Sektion** | Editierbare Text-Sektionen | Vollständige Info-Seite ohne Entwickler | admin.html:5304, 5311 |
| **Custom Sections mit Markdown + Drag-Drop** | Beliebig viele eigene Sektionen, Markdown-rendered, sortierbar | Vollflexibel, keine Programmierkenntnisse nötig | admin.html:5315, 12674 |
| **Google-Rating-Link** | Direktlink zu Google-Reviews einfügbar | Mehr 5-Sterne-Bewertungen durch direkten CTA | admin.html:5242, main.py:8865 |
| **Video-Upload (bis 50 MB, 41 Sek.)** | MP4/WebM/MOV/AVI/MKV mit Dauer-Validierung via ffprobe | Performance-schonende Videos, Auto-Ablehnung zu langer Clips | main.py:8921, 8933 |
| **Aktion-Active-Card im Gästemenü** | Wenn Event aktiv: Banner oben im Menü "Aktion aktiv!" | Gäste werden sofort auf Angebote aufmerksam | menu.html:489 |

## 6. Kassensystem (POS-Integration)

| Feature | Beschreibung | Benefit | Datei:Zeile |
|---|---|---|---|
| **POS-Integration (universal)** | Unterstützt: `none` / `lightspeed` / `sumup` / `tillhub` / `custom` | Bestehendes Kassensystem weiter nutzbar, kein Vendor-Lock-in | database.py:106, main.py:8689 |
| **POS-API-Konfiguration** | API-URL, API-Key, API-Secret, Location-ID pro Tenant | Volle Flexibilität für alle gängigen POS-Systeme | database.py:107-110, main.py:8693 |
| **POS-Webhook beim Bezahlen** | Bezahlte Bestellung als standardisiertes JSON an POS gesendet | Bon-Druck & Verbuchung im Bestehsystem, kein Double-Entry | main.py:8781 `send_order_to_pos`, 5324 |
| **POS-Connection-Test** | Test-Ping an POS-URL mit sofortigem Feedback | Fehlerfrei-Setup ohne Probieren im Live-Betrieb | main.py:8730 `/api/pos/test-connection` |
| **POS-Active-Toggle** | POS-Integration per Schalter aktivieren/deaktivieren | Schnell abschaltbar bei POS-Ausfall | database.py:111, main.py:8697 |
| **Kartenzahlung-Toggle** | "Akzeptiert Kartenzahlung" Ja/Nein pro Tenant | Gästemenü zeigt passendes Zahlungssymbol | database.py:124, main.py:9710 |
| **Brutto/Netto-Umschaltung** | Toggle pro Tenant, MwSt-Kennzeichnung dynamisch | Flexibel für unterschiedliche Abrechnungsmodi | database.py:128, main.py:9722 |
| **MwSt-Split (7% / 19%)** | Automatische Trennung Küche (7%) vs. Bar/Shisha (19%) | Korrekte Umsatzsteuer-Verbuchung, Compliance | main.py:6800-6806 |
| **Trinkgeld im POS-Webhook** | `tip`-Feld separat im JSON übertragen | Trinkgeld sauber im Kassensystem erfasst | main.py:8799 |

## 7. Personal & Rollen

| Feature | Beschreibung | Benefit | Datei:Zeile |
|---|---|---|---|
| **Mitarbeiter-PIN (4-stellig)** | PIN pro Mitarbeiter (`pin_code`) | Schneller Login am Tablet ohne Passwort-Tippen | database.py:232-233 |
| **3 Rollen: Chef / Kellner / Zubereiter** | Rollenbasiertes Redirect: Chef→Dashboard, Kellner→Tablet, Zubereiter→KDS | Jeder sieht nur, was er braucht — keine Verwirrung | main.py:6869-6874 |
| **Chef-Login (Owner)** | Owner-Login über globale /login-Route, separate Session | Höchste Berechtigung, voller Tenant-Zugriff | main.py:2261, 2738 |
| **PIN-Validierung gegen DB** | Login prüft PIN gegen Staff-Tabelle | Sicherheit: nur registrierte Mitarbeiter | main.py:2276 |
| **Staff-Verwaltung (CRUD)** | Mitarbeiter anlegen, löschen, PIN ändern | Personalwechsel schnell administrierbar | main.py:8555, 8576 |
| **Kellner-Zuweisung pro Bon** | `waiter_id` wird bei Bezahlung erfasst | Nachvollziehbar, wer welchen Tisch abgerechnet hat | database.py:205, main.py:5255 |
| **PIN-Pflicht bei Stornierung** | Storno erfordert Mitarbeiter-PIN | Manipulationssicher, GoBD-konform | landing.html:1093 |

## 8. PWA (Progressive Web App)

| Feature | Beschreibung | Benefit | Datei:Zeile |
|---|---|---|---|
| **Service Worker** | Eigene `/sw.js` mit Cache-Strategien | Offline-Toleranz bei schlechtem WLAN | main.py:951, static/sw.js |
| **Web-App-Manifest** | `/manifest.json` mit Icons, Theme-Color, Name | "Zum Home-Bildschirm hinzufügen" — installierbar wie App | main.py:940, static/manifest.json |
| **Apple-Touch-Icon + Maskable-Icon** | Vollständige Icon-Suite (16/32/192/512 px) | Sauberes App-Icon auf iOS & Android | static/images/ |
| **Theme-Color pro Tenant** | `theme: dark/light` pro Restaurant | Branding-spezifische Optik | database.py:123 |
| **Installierbar (Apple Meta Tags)** | `apple-mobile-web-app-capable`, `mobile-web-app-capable` | Vollbild-Modus ohne Browser-Leiste | landing.html:7-13 |
| **Offline-Asset-Caching** | Statische Assets `Cache-Control: immutable, max-age=1y` | Schneller Laden auch bei schlechtem Empfang | main.py:743 |
| **Service-Worker-Update-Flow** | `controllerchange`-Listener, Auto-Reload bei Update | Gäste haben immer aktuelle Speisekarte | menu.html:3506 |
| **PWA-Cookie-Jar-Detection** | Erkennt, wenn PWA separate Cookie-Jar hat, fordert Login | Gäste bleiben eingeloggt in installierter PWA | landing.html:1386-1401 |

## 9. Compliance & Sicherheit

| Feature | Beschreibung | Benefit | Datei:Zeile |
|---|---|---|---|
| **Lückenloses Audit-Log** | Jede Aktion (Storno, Bezahlung, Anpassung) wird mit User/Timestamp/Details geloggt | Betriebsprüfung-sicher, manipulationssicher | database.py:265, main.py:2478, 1144 |
| **RevenueAdjustment-Log (Super-Admin)** | Eigene Tabelle für manuelle Umsatz-Anpassungen durch admin@digi-gastro.de | Volle Transparenz über Gott-Modus-Eingriffe | database.py:335, main.py:2912 |
| **Audit-Log-Sektion im Dashboard** | Letzte 10 Umsatz-Anpassungen sichtbar | Chef sieht, wenn Super-Admin eingegriffen hat | main.py:2917-2956 |
| **GoBD-PDF-Export** | Bestellreport als PDF für Steuerberater | Finanzamt-konform, mit Brutto/Netto-Split | main.py:10826 `/admin/orders-export/pdf` |
| **GoBD-XLSX-Export** | Derselbe Report als Excel, SUM-fähig | Steuerberater kann direkt weiterarbeiten | main.py:11493 `/admin/orders-export/xlsx` |
| **Monatsreport PDF (von-bis)** | Profesisoneller Umsatzreport mit Top-Produkten, Tagen, Ø-Bon-Wert | Monatliche Auswertung mit einem Klick | main.py:11087 `/admin/monatsreport/pdf` |
| **Brutto/Netto-Split im Report** | Getrennte Ausweisung 7% und 19% | Umsatzsteuer-Voranmeldung direkt möglich | main.py:6788 |
| **Trinkgeld-Ausweisung** | Trinkgeld-Summe separat im Report | Korrekte Lohnabrechnung für Servicepersonal | main.py:6808 |
| **Ø-Bon-Wert-Statistik** | Durchschnittlicher Bon-Wert im Report | KPI für Optimierung von Upselling | main.py:6811, 10963 |
| **Impressum & Datenschutz (pro Tenant editierbar)** | Eigene Inhalte pro Restaurant | Rechtssicher ohne externe Beratung | database.py:86-87, main.py:2672, 2677 |
| **Platzhalter-Auto-Fill für Rechtstexte** | `[Vorname Nachname]` etc. werden automatisch mit Tenant-Daten ersetzt | Weniger Aufwand, keine fehlenden Felder | main.py:8825 |
| **DSGVO-Cookie-Consent-Banner** | Banner mit "technisch essenziell"-Erklärung | Rechtssicher nach DSGVO, kein Opt-in nötig | menu.html:3355-3383 |
| **Security-Token-Rotation** | Chef kann Tisch-Security-Token mit einem Klick rotieren | Bei QR-Code-Missbrauch sofort entziehbar | main.py:10390 |
| **Rotierender Tisch-Security-Token** | `security_token` pro Tisch, separat vom QR-Token | Mehrschichtige Sicherheit, kein Single-Point-of-Failure | database.py:255 |
| **PostgreSQL Advisory Locks** | Cross-Worker-Sperre verhindert Race-Conditions bei gleichzeitigen Updates | Skalierbar auf 100+ parallele Anfragen ohne Datenkorruption | main.py:480, 630 |
| **Security-Headers** | HTTP-Header (CSP, HSTS, etc.) über Middleware | Schutz vor XSS, Clickjacking, MITM | main.py:747 |
| **POS-/KDS-Geräte-Isolation** | Geräte-Cookies (`pos_token`, `kds_session`) dürfen keine Admin-Routen | Tablet darf nur anzeigen, nicht konfigurieren | main.py:2504, 417 |

## 10. Multi-Tenant & Plattform

| Feature | Beschreibung | Benefit | Datei:Zeile |
|---|---|---|---|
| **Slug-basierte Tenant-Trennung** | `tenant.slug` ist Primary Key, alle Daten isoliert | Mehrere Restaurants pro digi-gastro-Installation | database.py:75 |
| **Super-Admin-Bereich** | `/digi-gastro-admin` mit Tenant-Übersicht, Umsätzen, Aktionen | Plattform-Betreiber sieht alle Kunden auf einen Blick | main.py:2757 |
| **Tenant erstellen/aktivieren/deaktivieren** | Kunden anlegen, sperren bei Nicht-Zahlung | SaaS-Monetarisierung, Zugriffskontrolle | main.py:4062, 4133 |
| **Tenant-Passwort-Reset** | Super-Admin kann Passwort zurücksetzen | Support-Fälle schnell lösbar | main.py:4096 |
| **Tenant-Name ändern** | Restaurant-Name nachträglich editierbar | Rebranding/Übernahme abbildbar | main.py:4115 |
| **Tenant-Umsatz-Anpassung (Gott-Modus)** | Super-Admin kann Tagesumsatz korrigieren, wird geloggt | Notfall-Korrekturen möglich, voll transparent | main.py:4157, database.py:335 |
| **Tenant-Bestell-Cleanup** | Alte Bestellungen aufräumen pro Tenant | Datenbank schlank halten, Performance | main.py:4215 |
| **Live-Tagesumsatz-Übersicht** | Pro Tenant: heutiger Umsatz aus bezahlten Bons live berechnet | Plausibilitätskontrolle, ohne einloggen zu müssen | main.py:2784-2797 |
| **Zweites Logo pro Tenant** | `logo_url_2` für Betreiber mit 2 Läden | Cross-Branding bei Mehrmarken-Betrieben | database.py:103 |
| **Tenant-Branding (Theme, Adresse, Social-Links)** | Eigene Identität pro Restaurant | Jeder Kunde fühlt sich individuell betreut | database.py:94-104, main.py:8591 |
| **Logo-Upload** | Eigene Logo-Datei pro Tenant, automatisch WebP | Professionelle Optik ohne Designer | main.py:11840 |

## 11. Shisha-Modus (spezifisch)

| Feature | Beschreibung | Benefit | Datei:Zeile |
|---|---|---|---|
| **Shisha-Bar-Modus Toggle** | Schalter im Setup, aktiviert Shisha-spezifische Features | Nur einschalten wenn relevant, sonst deaktiviert | main.py:9689, database.py:85 |
| **Kohle-Ruf (Gast)** | Gast drückt "💨 Kohle bestellen" im Service-Modal | Schluss mit lautem Rufen quer durch die Bar | menu.html:1328, 1395 |
| **Kellner-Ruf (Gast)** | Gast drückt "🛎️ Kellner rufen" im Service-Modal | Diskreter Service-Ruf ohne Gestik | menu.html:1327 |
| **Service-Call-Modal (Custom-Typ)** | Auswahl zwischen Kellner/Kohle/Custom im Modal | Flexibel erweiterbar auf weitere Service-Typen | menu.html:1302 |
| **Service-Cooldown (Anti-Spam)** | Blockiert wiederholte Rufe innerhalb kurzer Zeit | Verhindert "Spam-Kohle-Rufe" durch nervige Gäste | menu.html:1610 `_serviceCooldownUntil` |
| **Auto-Kategorie-Zuweisung (Shisha-Keywords)** | Keywords wie "shisha", "wasserpfeife", "pfeife", "head", "kohle" → Kategorie-Typ "shisha" | Setup-Erleichterung, kein manuelles Taggen nötig | main.py:7500 |
| **Service-Call-Typ-Routing** | Kohle-Ruf → Kohlemeister-Monitor, Shisha-Bestellung → Shisha-Monitor, Küche → Küche | Bestellungen automatisch ans richtige Stationsteam | main.py:8351 |
| **Service-Call-Erledigt-Markierung** | Kellner markiert Service-Ruf als erledigt | Saubere Workflow-Abarbeitung, keine vergessenen Rufe | main.py:5598 |
| **Service-Call-Status-Farbe "calling"** | Tisch leuchtet in Spezialfarbe bei offenem Service-Ruf | Sofort sichtbar, welcher Tisch Service braucht | admin.html:1174 |
| **MwSt 19% für Shisha** | Automatisch 19% MwSt (im Gegensatz zu Küche 7%) | Korrekte Steuer-Verbuchung ohne manuelles Eingreifen | main.py:6800 |
| **Auto-Shisha-Kategorien beim Setup** | Beim Aktivieren des Shisha-Modus wird Kategorie "Shisha" automatisch angelegt | Sofort startklar, kein manuelles Setup | main.py:7186, 11898 |
| **Service-Call-Live-Broadcast** | Service-Rufe gehen über WebSocket an alle Geräte | Kohlemeister sieht Anfrage in Echtzeit auf seinem Monitor | main.py:7760 |

## 12. Reports & Auswertungen

| Feature | Beschreibung | Benefit | Datei:Zeile |
|---|---|---|---|
| **Dashboard mit Tages-/Monats-/Gesamtumsatz** | Perioden-Filter: heute / monat / letzter_monat / alle | Chef sieht sofort, wie der Laden läuft | main.py:6713, 6761-6775 |
| **Brutto/Netto-Split-Anzeige** | Getrennt 7% und 19% auf dem Dashboard | Steuer-Quick-Check ohne Vollreport | main.py:6788-6806 |
| **Trinkgeld-Summe** | Summe aller Trinkgelder im Zeitraum | Lohn-Abrechnung Servicepersonal | main.py:6808 |
| **Bestell-Anzahl & Status-Verteilung** | Wie viele Bons bezahlt/storniert/offen | KPI-Dichte auf einen Blick | main.py:6809 |
| **Ø-Bon-Wert** | Durchschnittlicher Warenwert pro Bon | Upselling-Erfolg messbar | main.py:6811 |
| **Bestellhistorie mit Filter** | Such-/Filter-Tabelle (Tisch, Status, Datum, Suchbegriff) | Schnelle Recherche bei Reklamationen | admin.html:7003, main.py:10805 |
| **Bestell-PDF-Report** | Vollständiger PDF-Export der gefilterten Bestellungen | Buchhaltung-Übergabe mit einem Klick | main.py:10826 |
| **Bestell-XLSX-Report** | Derselbe Report als Excel, mit SUM-Formel-fähigen Zahlen | Steuerberater kann direkt weiterarbeiten | main.py:11493 |
| **Monatsreport PDF (von-bis)** | Profesisoneller Umsatzreport mit Top-Produkten, Tagen, Ø-Bon-Wert, MwSt-Split | Management-Auswertung mit Profi-Optik | main.py:11087 |
| **CSV-Produkt-Export** | Alle Produkte als CSV für Migration/Backup | Schnelle Datensicherung | main.py:7269 |
| **CSV-Produkt-Import** | Produkte aus Excel/CSV importieren (Update oder Neu) | Bulk-Pflege ohne Klick-Orgien | main.py:7319 |
| **Super-Admin-Tenant-Vergleich** | Alle Tenants mit Tagesumsatz auf einer Seite | Plattform-Betreiber sieht Wachstum/Muster | main.py:2757, 2799 |
| **Top-Produkte-Statistik** | Bestseller im Monatsreport | Menu-Optimierung datenbasiert | main.py:11195 |

## 13. WhatsApp / SMS / Service-Ruf

| Feature | Beschreibung | Benefit | Datei:Zeile |
|---|---|---|---|
| **Browser-Service-Ruf (keine App)** | Gäste rufen Service direkt im Browser | Keine Drittanbieter-Kosten (keine SMS-API nötig) | menu.html:1302, main.py:7653 |
| **Rechnung-Anfordern-Taste** | Gast bittet aus dem Menü heraus um Bezahlung | Beschleunigter Abrechnungs-Flow, mehr Tisch-Umschlag | menu.html:933 |
| **Service-Call-Live-Übertragung** | WebSocket-Broadcast an alle Tablets/KDS | Service-Team reagiert sofort | main.py:7760 |
| **Social-Links (Instagram, Facebook, TikTok)** | Direktlinks im Impressum sichtbar | Gäste finden Social-Media-Kanäle, Marketing-Kick | database.py:99-101, main.py:1287 |
| **Google-Rating-Link** | CTA im Landingpage-Editor auf Google-Reviews | Mehr 5-Sterne-Bewertungen | admin.html:5242, main.py:8865 |
| **Service-Call-Verlauf** | Alle Service-Rufe im Dashboard sichtbar | Quality-Management, Engpass-Erkennung | main.py:1113, 8124 |

## 14. Sprachen & Mehrsprachigkeit

| Feature | Beschreibung | Benefit | Datei:Zeile |
|---|---|---|---|
| **DE/EN-Sprachumschaltung Gästemenü** | Toggle-Buttons oben rechts (DE/EN) | Internationale Gäste direkt bedienen | menu.html:322, 367 |
| **Vollständige UI-i18n-Tabelle** | Alle UI-Strings übersetzt (Warenkorb, Service, Filter, etc.) | Keine "Denglisch"-Mischformen | menu.html:1302-1411 |
| **Mehrsprachige Produktnamen** | `name_en` und `description_en` pro Produkt | Speisekarte automatisch in Englisch | database.py:181-182 |
| **Sprach-Preference im LocalStorage** | Gewählte Sprache wird gespeichert | Wiederkehrende Gäste müssen nicht jedes Mal umschalten | menu.html:1700 |
| **Lang-Attribut dynamisch** | `<html lang>` passt sich an | SEO-Korrekt für beide Sprachen | menu.html:2 |

---

## 15. Setup & Onboarding

| Feature | Beschreibung | Benefit | Datei:Zeile |
|---|---|---|---|
| **Setup-Wizard (Küche? Shisha? Auto-Tabellen?)** | Erstinrichtung mit Profil-Fragen | Sofort startklar in 2 Minuten | main.py:6583, 6600, 11810 |
| **Auto-Kategorien-Erstellung** | Beim Setup werden Standardkategorien (Drinks/Desserts/Burger/Salads/Shisha) angelegt | Leer-System direkt nutzbar | main.py:6631, 11894 |
| **Auto-Chef-Staff-Eintrag** | Beim Setup wird Chef als Staff-Eintrag angelegt | Kein manuelles Anlegen nötig | main.py:6641, 11907 |
| **Auto-Impressum & Datenschutz** | Generiert automatisch rechtssichere Standardtexte mit Tenant-Daten | Sofort rechtssicher online | main.py:6622, 6627 |
| **Branding-Einstellungen** | Adresse, PLZ, Ort, USt-ID, Social-Links, Theme | Vollständige Identität konfigurierbar | main.py:8591 |

## 16. Performance & Infrastruktur

| Feature | Beschreibung | Benefit | Datei:Zeile |
|---|---|---|---|
| **PostgreSQL + SQLite Dual-Mode** | Auto-Switch je nach `DATABASE_URL` | Lokal schnell startbar, Production-ready | database.py:22-39 |
| **Connection-Pool 50/100** | 50 warme + 100 Overflow-Connections | Skaliert für 100+ gleichzeitige Gäste | database.py:35-39 |
| **Redis-Verteilungs-Cache & Lock** | Optionaler Redis für Multi-Worker, Cache & Pub/Sub | Horizontale Skalierung ohne Race-Conditions | main.py:17-49 |
| **WebSocket-Manager** | Per-tenant aktive Connections, Stale-Cleanup | Live-Updates ohne Polling-Overhead | main.py:217, 798 |
| **Auto-DB-Migration** | Schema-Evolution ohne Downtime, für SQLite & Postgres | Updates ohne manuelle SQL-Skripte | database.py:349-785 |
| **WebP-Auto-Konvertierung** | Alle Uploads werden automatisch als WebP ausgeliefert | Bis zu 80% kleinere Bilder, schneller Ladezeit | main.py:11860, 10459 |
| **Cache-Control-Strategien** | Static assets `immutable, max-age=1y`, dynamic `no-store` | Optimale Performance + immer aktuelle Daten | main.py:743 |
| **Sitemap.xml & robots.txt** | Auto-generiert für SEO | Bessere Google-Indexierung | main.py:908, 883 |
| **Open-Graph & Twitter-Cards** | Social-Share-Meta-Tags | Saubere Vorschau bei WhatsApp/Facebook/Telegram | landing.html:28-45 |
| **FAQ-Schema (JSON-LD)** | Strukturierte Daten für Google-FAQ | Rich-Snippets in Suchergebnissen | landing.html:62-90 |
| **Demo-Modus auf Landingpage** | Interaktive Demo-Bestellung direkt auf der Marketing-Seite | Höhere Conversion-Rate durch "Try-before-buy" | landing.html:1289 |

---

## Zusammenfassung nach Kategorie

| Kategorie | Anzahl Features |
|---|---:|
| 1. Bestellwesen | 17 |
| 2. Küche/KDS | 9 |
| 3. Sitzplan | 9 |
| 4. Produktverwaltung | 15 |
| 5. Marketing & Upselling | 19 |
| 6. Kassensystem (POS) | 9 |
| 7. Personal & Rollen | 7 |
| 8. PWA | 8 |
| 9. Compliance & Sicherheit | 17 |
| 10. Multi-Tenant & Plattform | 11 |
| 11. Shisha-Modus | 12 |
| 12. Reports & Auswertungen | 13 |
| 13. WhatsApp/SMS/Service-Ruf | 6 |
| 14. Sprachen | 5 |
| 15. Setup & Onboarding | 5 |
| 16. Performance & Infrastruktur | 11 |
| **TOTAL** | **≈ 173 Features** |

---

## Highlight-Features für Landingpage-Redesign

**USP 1 — Shisha-First:** Einzige Gastro-SaaS mit speziellem Shisha-Modus (Kohle-Ruf, Kohlemeister-Monitor, Auto-Routing) — main.py:9689, 8351

**USP 2 — 3-Schicht-Upselling:** Manuelle Empfehlungen + Event-Combos + KI-Co-Occurrence-Engine (lernt aus echten Bons) — main.py:10081

**USP 3 — GoBD-Sicherheit:** Lückenloses Audit-Log, PIN-Pflicht bei Storno, GoBD-PDF/Excel-Export, Monatsreport — main.py:10826, 11493, 11087

**USP 4 — Universal-POS-Integration:** Lightspeed, SumUp, Tillhub oder Custom via Webhook, kein Vendor-Lock-in — main.py:8781

**USP 5 — PWA ohne App-Store:** Installierbar wie App, funktioniert offline, automatische Updates — main.py:951

**USP 6 — Live-Sitzplan:** Drag-Drop-Editor mit Live-Status-Farben, offen-Artikel-Badges, Service-Ruf-Farbcode — admin.html:1063, 1158

**USP 7 — Teilzahlung & Split-Pay:** Einzelne Artikel auszahlbar, ganze Bestellung splitten, zwischen Tischen transferieren — main.py:5749, 12407

**USP 8 — Multi-Tenant-SaaS:** Mehrere Restaurants pro Account, Super-Admin-Gott-Modus, Tenant-Vergleich — main.py:2757

**USP 9 — Landingpage-Editor mit Live-Vorschau:** Drag-Drop-Sektionen, Markdown, Videos bis 41s, Google-Rating-CTA — admin.html:5196

**USP 10 — AI-Bildauto-Auswahl:** Speisekarte sofort produktiv ohne eigene Fotos — main.py:10631, 10673
