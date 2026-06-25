# Elegant Chart Card

Professional Chart.js HACS Card für Home Assistant mit WebSocket LiveUpdate und vollständiger Editor UI.

## Features

✨ **Elegantes Design** — Modern, responsive und dunkelmoduskompatibel
📊 **Chart.js 4** — 6 verschiedene Diagrammtypen (Linie, Balken, Fläche, Scatter, Radar, Ring)
⚡ **WebSocket LiveUpdate** — Echtzeit-Updates mit automatischem Fallback auf Polling
🎛️ **Editor UI** — Visuelle Konfiguration im Home Assistant UI
🔄 **Sensor-Validierung** — Fehlerbehandlung und Live-Feedback
- **Historisierung** — 3 Tage Sensor-Historisierung (864 Datenpunkte)
🎨 **5-Sensor Support** — Mit intelligenter Farbzuordnung
🧹 **Cleanup** — Automatisches Unsubscribe und Ressourcen-Management

## Installation

### Via HACS (empfohlen) ⭐

1. Öffne **HACS** in Home Assistant
2. Gehe zu **Frontend**
3. Klicke auf **⋮ (drei Punkte)** oben rechts
4. Wähle **"Custom repositories"**
5. Füge ein:
   - **Repository:** `https://github.com/ppfeiffer63/ElegantChart`
   - **Kategorie:** `Frontend`
6. Klicke **"Erstellen"**
7. Finde und installiere **"Elegant Chart Card"**
8. Starte Home Assistant neu

### Manuelle Installation

```bash
cd config/www
git clone https://github.com/ppfeiffer63/ElegantChart.git
```

Dann in `configuration.yaml`:

```yaml
frontend:
  extra_module_url:
    - /local/ElegantChart/src/elegant-chart-card.js
```

Home Assistant neu starten.

## Konfiguration

### Über UI (empfohlen)

1. Dashboard öffnen
2. "Karte hinzufügen"
3. "Elegant Chart Card" auswählen
4. Sensoren und Einstellungen auswählen

### YAML Konfiguration

```yaml
type: custom:elegant-chart-card
title: "Garten Live Monitoring"
chart_type: line
height: 350
update_interval: 1000
show_legend: true
show_grid: true
use_websocket: true
entities:
  - sensor.gartensensor_temperature
  - sensor.gartensensor_humidity
  - sensor.solar_power
  - sensor.tracer_load_state
min: 0
max: 100
```

### Konfigurationsoptionen

| Option | Typ | Standard | Beschreibung |
|--------|-----|---------|-------------|
| `title` | string | "Chart" | Kartentitel |
| `entities` | list | [] | Liste der Sensoren (max. 5) |
| `chart_type` | string | "line" | Diagrammtyp: line, bar, area, scatter, radar, doughnut |
| `height` | number | 300 | Diagrammhöhe in Pixeln (200-800) |
| `update_interval` | number | 1000 | Update Interval in Millisekunden |
| `min` | number | 0 | Minimaler Y-Wert |
| `max` | number | 100 | Maximaler Y-Wert |
| `show_legend` | boolean | true | Legende anzeigen |
| `show_grid` | boolean | true | Gitternetz anzeigen |
| `use_websocket` | boolean | true | WebSocket für Updates nutzen |

## Beispiele

### Temperatur & Luftfeuchte

```yaml
type: custom:elegant-chart-card
title: "Klimasensor"
chart_type: area
height: 300
entities:
  - sensor.living_room_temperature
  - sensor.living_room_humidity
min: 0
max: 100
```

### Solaranlage

```yaml
type: custom:elegant-chart-card
title: "Solar Leistung"
chart_type: bar
height: 280
entities:
  - sensor.solar_power
  - sensor.solar_voltage
  - sensor.solar_current
show_grid: true
```

### Mehrere Räume

```yaml
type: custom:elegant-chart-card
title: "Temperaturvergleich"
chart_type: line
height: 350
entities:
  - sensor.living_room_temperature
  - sensor.bedroom_temperature
  - sensor.kitchen_temperature
  - sensor.garage_temperature
min: 10
max: 30
show_legend: true
```

## WebSocket vs. Polling

- **WebSocket (empfohlen)**: Echtzeitupdates, spart Bandbreite, automatisches Fallback
- **Polling**: Manuelles Polling wenn WebSocket nicht verfügbar, `use_websocket: false`

## Fehlerbehandlung

Die Karte validiert automatisch:
- Sensoren müssen existieren
- Maximum 5 Sensoren
- Alle Werte müssen numerisch sein
- Ungültige Sensoren werden ignoriert

Fehler werden in der Editor UI angezeigt.

## Performance

- WebSocket-basiert (statt Polling) = niedrige CPU/Netzwerk-Last
- **Automatisches Buffer-Management** (3 Tage Historisierung = 864 Datenpunkte pro Sensor)
- Smart deduplication (nur alle 5 Minuten speichern)
- Lazy Loading für Chart.js (via CDN)
- Automatisches Cleanup beim Entfernen

## Entwicklung

```bash
git clone https://git.pfeiffer-privat.de/HA-Addons/ElegantChart.git
cd ElegantChart

npm install

npm run build

npm run watch
```

### Release

```bash
git tag v1.0.1
git push origin main --tags
```

Forgejo Actions baut und released automatisch.

## Support

Issues und Feature Requests: https://github.com/ppfeiffer63/ElegantChart/issues

## Lizenz

MIT © 2024 PPfeiffer & HA-Addons

## Changelog

### v1.0.0 (2024)
- Initial Release
- Chart.js 4 Integration
- WebSocket LiveUpdate
- Editor UI
- 5-Sensor Support
- Validierung und Fehlerbehandlung

---

**Erstellt von**: PPfeiffer (@ppfeiffer)  
**Repo**: https://github.com/ppfeiffer63/ElegantChart  
**Community**: MeshDresden / Home Assistant Dresden
