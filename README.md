# Stellwerk Tycoon 2.4

Eigenständiges Eisenbahn-Infrastruktur- und Verkehrsunternehmen-Spiel. Der Tycoon ist aus [stellwerk.sim](https://github.com/jktzhitrl/stellwerk.sim) hervorgegangen; das ursprüngliche Stellwerk-Spiel und der Baumodus bleiben getrennte Anwendungen.

## Starten

`index.html` im Browser öffnen. Das Spiel benötigt keine zusätzlichen Bibliotheken oder einen Webserver. Lokale Spielstände werden mit dem bisherigen Schlüssel `stw_tycoon_v2` gespeichert. Bereits vorhandene Spielstände aus demselben Browser-Ursprung bleiben kompatibel; bei einer neuen Domain/einem neuen GitHub-Pages-Ursprung werden lokale Daten **nicht automatisch übertragen**.

## Spielprinzip

- **Farbige OpenFreeMap-Karte** wie in Railway Empire Deutschland, mit OSM-Raster-Fallback und zuschaltbarer OpenRailwayMap-Gleisebene
- Strecken zwischen zehn Orten bauen, elektrifizieren und mit Signalen ausrüsten
- Bahnhöfe entwickeln und Züge kaufen, warten sowie einsetzen
- Personen- und Güterlinien betreiben, Fahrkartenpreise und Fahrtenzahl anpassen
- **Regionale Ausschreibungen gewinnen**, um Gebietskacheln dauerhaft freizuschalten (Karte zeigt gesperrt, beworben und gewonnen)
- Individuelle Fahrpläne festlegen: erste Abfahrt und Taktabstand pro Linie
- Finanzen, Ansehen, Ausfälle und Meilensteine verfolgen

**Kartendarstellung:** Der Hintergrund zeigt echte OpenStreetMap-/OpenFreeMap-Geografie. Die zehn Gebietskacheln sind fiktive Tycoon-Planungsfelder, keine realen Gebietskörperschaften. Die schematischen Spielbahnhöfe und ihre Verbindungen liegen nur illustrativ über der Karte; es wird **keine echte befahrbare Gleisroute** behauptet. Mit der OpenRailwayMap-Ebene können reale Gleise zur Orientierung angezeigt werden. Bei fehlender Kartenbibliothek erscheint weiterhin die alte schematische Ersatzkarte. Online-Kartendienste können ausfallen.

**Gebietskacheln und Ausschreibungen:** Zwei Startregionen (Neustadt und Teutschenthal) sind zu Beginn freigeschaltet. Acht weitere Gebiete sind gesperrt. Unter „Ausschreibungen & Kacheln“ kannst du ein Gebot abgeben (900 € Teilnahmegebühr); über den Zuschlag entscheidet das Spiel beim nächsten Betriebstag. Höhere Gebote erhöhen die Wahrscheinlichkeit, ein Zuschlag ist nicht garantiert. Bei einem Gewinn wird der gebotene Betrag abgezogen und die Region dauerhaft freigeschaltet. Für neue Strecken müssen **beide** Endgebiete gewonnen und der Anschluss an das vorhandene Netz vorhanden sein. Bereits gebaute Bahnhöfe und Strecken in älteren Spielständen werden automatisch als freigeschaltet übernommen, damit nichts verloren geht.

**Fahrpläne:** Eine einzelne Fahrzeugeinheit muss für die Rückfahrt inklusive Wendezeit verfügbar sein. Der Editor verhindert zu kurze Umläufe und Abfahrten nach 22:00 Uhr. Bei zu eng definierten, importierten Fahrplänen werden nicht fahrbare Fahrten im Tagesabschluss als Ausfälle erfasst. Der Zugverkehr wird als schematische Vorschau gezeigt; keine vollständige Signal- oder Fahrstraßen-Simulation.

## Tests

Voraussetzung: Node.js 22 oder neuer.

```sh
node --test tests/tycoon.test.cjs
```

GitHub Actions testet außerdem Pull Requests automatisch. Für die Kacheln werden Gebote, Zuschläge, Ablehnungen, Bausperren, SVG-Kachelanzeige sowie die Übernahme alter Spielstände geprüft. Die automatisierten Tests ersetzen **keine** Abnahme auf Tablet und Desktop im echten Browser.

## Veröffentlichung

Änderungen werden auf Entwicklungsbranches in Pull Requests vorbereitet. Die GitHub-Pages-Konfiguration des neuen Repositories muss gesondert aktiviert werden, bevor eine öffentliche Spieladresse garantiert werden kann.
