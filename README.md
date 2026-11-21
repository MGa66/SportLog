# SportLog – Trainings-Tracker (PWA)

Installierbare Web-App für Krafttraining, Laufen und Radfahren. Alle Daten bleiben lokal auf dem Handy.

## Funktionen (v1.3)
- **Krafttraining:** Trainingspläne mit Übungen, Sätzen, Wiederholungen und Pausenzeit. Im Training pro Satz kg und Wdh. eintragen und abhaken, Vorschläge vom letzten Mal, Pausen-Timer mit Vibration, Bestwert-Erkennung.
- **Übungen & Fortschritt:** eigene Übungen anlegen, Verlauf pro Übung mit Diagramm (Max. Gewicht, geschätztes 1RM, Volumen).
- **Ausdauer:** Live-Aufzeichnung per GPS (Laufen, Rad, Gehen), manuelles Nachtragen, Import von GPX/TCX-Dateien aus Garmin Connect, Abschnittszeiten, Höhen- und Pulsprofil, GPX-Export.
- **Verlauf:** Wochen-Statistik der letzten 12 Wochen, Monatsübersicht, filterbare Liste.
- **Supersätze:** Übungen im Plan oder Training verbinden; Pause erst nach jeder Runde.
- **Fortschritt:** Trend je Übung, neue Bestwerte, bewegtes Gewicht, Vergleich mit dem letzten Training.
- **Piktogramme:** 42 Übungs-Piktogramme (pictos.js), automatisch über den Namen zugeordnet oder im Übungsdialog wählbar.
- **Rolle / Indoor:** FIT-Import (Zwift, Garmin, Wahoo; auch ZIP), Leistung (Ø, NP, max, kJ), Trittfrequenz, Watt-Verlauf je Fahrt.
- **Backup:** Export/Import als JSON (Zusammenführen oder Ersetzen).

## Veröffentlichen über GitHub Pages
1. Neues Repository auf GitHub anlegen (z. B. `sportlog`).
2. Alle Dateien aus diesem Ordner hochladen (inkl. `icons/`).
3. Settings → Pages → Branch `main`, Ordner `/ (root)` → Save.
4. Nach 1–2 Minuten die Adresse `https://<dein-name>.github.io/sportlog/` am Handy in Chrome öffnen → Menü → „App installieren".

## Updates
Nach Änderungen in `sw.js` die Versionsnummer in `CACHE` erhöhen, damit Handys die neue Version laden (zweimal öffnen).

## Hinweise
- Live-GPS läuft nur bei eingeschaltetem Bildschirm mit geöffneter App (Einschränkung von Web-Apps).
- Zwift: zwift.com/feed → JUST ME → Fahrt → Zahnrad → DOWNLOAD FIT FILE, dann in der App unter Ausdauer importieren.

## Piktogramme bearbeiten
`tools/picto.py` enthält die Zeichnungen (Python, erzeugt SVG). `tools/export.py` schreibt daraus `pictos.js` und die Styles in `styles.css` (Pfade im Skript anpassen).
