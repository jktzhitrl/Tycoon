# Stellwerk Tycoon 2.2

Eigenständiges Eisenbahn-Infrastruktur- und Verkehrsunternehmen-Spiel. Der Tycoon ist aus [stellwerk.sim](https://github.com/jktzhitrl/stellwerk.sim) hervorgegangen; das ursprüngliche Stellwerk-Spiel und der Baumodus bleiben getrennte Anwendungen.

## Starten

`index.html` im Browser öffnen. Das Spiel benötigt keine zusätzlichen Bibliotheken oder einen Webserver. Lokale Spielstände werden mit dem bisherigen Schlüssel `stw_tycoon_v2` gespeichert. Bereits vorhandene Spielstände aus demselben Browser-Ursprung bleiben kompatibel; bei einer neuen Domain/einem neuen GitHub-Pages-Ursprung werden lokale Daten **nicht automatisch übertragen**.

## Spielprinzip

- Strecken zwischen zehn Orten bauen, elektrifizieren und mit Signalen ausrüsten
- Bahnhöfe entwickeln und Züge kaufen, warten sowie einsetzen
- Personen- und Güterlinien betreiben, Fahrkartenpreise und Fahrtenzahl anpassen
- Individuelle Fahrpläne festlegen: erste Abfahrt und Taktabstand pro Linie
- Finanzen, Ansehen, Ausfälle und Meilensteine verfolgen

**Fahrpläne:** Eine einzelne Fahrzeugeinheit muss für die Rückfahrt inklusive Wendezeit verfügbar sein. Der Editor verhindert zu kurze Umläufe und Abfahrten nach 22:00 Uhr. Bei zu eng definierten, importierten Fahrplänen werden nicht fahrbare Fahrten im Tagesabschluss als Ausfälle erfasst. Der Zugverkehr wird als schematische Vorschau gezeigt; keine vollständige Signal- oder Fahrstraßen-Simulation.

## Tests

Voraussetzung: Node.js 22 oder neuer.

```sh
node --test tests/tycoon.test.cjs
```

GitHub Actions testet außerdem Pull Requests automatisch. Die automatisierten Tests ersetzen **keine** Abnahme auf Tablet und Desktop im echten Browser.

## Veröffentlichung

Änderungen werden auf Entwicklungsbranches in Pull Requests vorbereitet. Die GitHub-Pages-Konfiguration des neuen Repositories muss gesondert aktiviert werden, bevor eine öffentliche Spieladresse garantiert werden kann.
