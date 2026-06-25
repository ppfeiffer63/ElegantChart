# ElegantChart - Home Assistant Installation

Schritt-für-Schritt Anleitung zur Installation und Konfiguration der ElegantChart Card in Home Assistant.

## Option 1: Installation via HACS (empfohlen)

### Voraussetzung
- HACS muss installiert sein
- Home Assistant 2024.1.0 oder neuer

### Schritte

1. **HACS öffnen**
   - Home Assistant Dashboard
   - HACS (in der linken Sidebar)

2. **Zum Frontend gehen**
   - Klicke auf "Frontend"

3. **Custom Repository hinzufügen**
   - Klicke auf die drei Punkte (⋮) oben rechts
   - Wähle "Custom repositories"

4. **Repository-Details eingeben**
   ```
   Repository URL: https://git.pfeiffer-privat.de/HA-Addons/ElegantChart
   Kategorie: Frontend
   ```

5. **Erstellen und installieren**
   - Klicke "Erstellen"
   - Suche nach "Elegant Chart Card"
   - Klicke "Installieren"
   - Home Assistant neu starten (optional, aber empfohlen)

### Verifizierung

Nach dem Neustarten sollte die Karte verfügbar sein:
- Dashboard öffnen
- "Karte hinzufügen"
- Suche "Elegant Chart"
- Sie sollte in der Liste auftauchen

---

## Option 2: Manuelle Installation

### Schritt 1: Dateien herunterladen

```bash
cd config/www
git clone https://git.pfeiffer-privat.de/HA-Addons/ElegantChart.git elegant-chart
cd elegant-chart
```

Oder mit SSH:
```bash
git clone git@git.pfeiffer-privat.de:HA-Addons/ElegantChart.git elegant-chart
```

### Schritt 2: configuration.yaml anpassen

Öffne `configuration.yaml` und füge hinzu:

```yaml
frontend:
  extra_module_url:
    - /local/elegant-chart/src/elegant-chart-card.js
```

### Schritt 3: Home Assistant neu starten

Gehe zu:
- Settings → System → Restart Home Assistant

### Schritt 4: Verifikation

Nach dem Neustart:
- Dashboard öffnen
- "Karte hinzufügen"
- Scrolle nach unten zu "Custom"
- "Elegant Chart Card" sollte verfügbar sein

---

## Konfiguration im Dashboard

### Via UI (einfach)

1. Dashboard öffnen (im Bearbeitungsmodus)
2. Klicke "Karte hinzufügen"
3. Suche "Elegant Chart Card"
4. Wähle die Karte aus
5. Klicke auf die Karte zum Bearbeiten
6. Konfiguriere Sensoren und Einstellungen über die UI

### Via YAML (fortgeschritten)

Erstelle eine neue Karte mit YAML:

```yaml
type: custom:elegant-chart-card
title: "Garten Live"
chart_type: line
height: 350
entities:
  - sensor.gartensensor_temperature
  - sensor.gartensensor_humidity
  - sensor.solar_power
min: 0
max: 100
show_legend: true
show_grid: true
```

---

## Beispiel-Dashboards

### Einfaches Temperatur-Diagramm

```yaml
type: grid
columns: 1
cards:
  - type: custom:elegant-chart-card
    title: "Temperatur"
    chart_type: area
    height: 300
    entities:
      - sensor.living_room_temperature
    min: 10
    max: 30
```

### Multi-Sensor Dashboard

```yaml
type: grid
columns: 2
cards:
  - type: custom:elegant-chart-card
    title: "Klima"
    chart_type: line
    height: 300
    entities:
      - sensor.temperature
      - sensor.humidity

  - type: custom:elegant-chart-card
    title: "Solar"
    chart_type: bar
    height: 300
    entities:
      - sensor.solar_power
      - sensor.solar_voltage

  - type: custom:elegant-chart-card
    title: "Vergleich"
    chart_type: radar
    height: 300
    entities:
      - sensor.room1_temp
      - sensor.room2_temp
      - sensor.room3_temp
```

### Garten-Monitoring

```yaml
type: custom:elegant-chart-card
title: "Garten Live Monitoring"
chart_type: line
height: 400
entities:
  - sensor.gartensensor_temperature
  - sensor.gartensensor_humidity
  - sensor.gartensensor_soil_moisture
  - sensor.solar_power
min: 0
max: 100
show_legend: true
show_grid: true
update_interval: 1000
```

---

## Fehlerbehandlung

### "Card not found"

```bash
# Überprüfe die Datei-Struktur
ls -la config/www/elegant-chart/src/
```

Sollte anzeigen:
- `elegant-chart-card.js`
- `editor.js`
- `websocket-manager.js`

### Karte wird nicht angezeigt

1. Browser-Cache leeren (Ctrl+Shift+Del)
2. Home Assistant komplett neu laden (Ctrl+Shift+R)
3. Developer Tools öffnen (F12)
4. Gibt es Fehler in der Konsole?

### "Entities not found"

- Überprüfe Entity-IDs in Developer Tools → States
- Achte auf Groß-/Kleinschreibung
- `sensor.temperature` ist nicht das gleiche wie `sensor.Temperature`

### WebSocket funktioniert nicht

- WebSocket sollte automatisch fallback auf Polling verwenden
- Falls nicht, deaktiviere WebSocket:

```yaml
type: custom:elegant-chart-card
title: "Chart"
use_websocket: false
entities:
  - sensor.temperature
```

---

## Performance-Tipps

- **Update Interval**: Höher (z.B. 5000 ms statt 1000 ms) = weniger CPU
- **Diagrammhöhe**: Nicht zu hoch, 300-400px ist ideal
- **Sensoren**: Max. 5 Sensoren pro Karte
- **WebSocket**: Lassen Sie es aktiviert für beste Performance

---

## Update auf neue Version

### Via HACS

1. HACS öffnen
2. Frontend
3. "Elegant Chart Card" suchen
4. Falls Update verfügbar: "Upgrade" klicken
5. Home Assistant neu starten

### Manuell

```bash
cd config/www/elegant-chart
git pull origin main
```

---

## Support & Probleme

Wenn etwas nicht funktioniert:

1. **Logs überprüfen**
   - Settings → System → Logs

2. **Browser Console**
   - F12 → Console Tab
   - Gibt es Fehler?

3. **Issue auf Forgejo erstellen**
   - https://git.pfeiffer-privat.de/HA-Addons/ElegantChart/issues

4. **Deinstallieren & Neuinstallieren**
   ```bash
   # Manuell:
   rm -rf config/www/elegant-chart
   git clone https://git.pfeiffer-privat.de/HA-Addons/ElegantChart.git elegant-chart
   ```

---

## Weitere Ressourcen

- 📚 [Home Assistant Docs](https://www.home-assistant.io/)
- 📚 [HACS Docs](https://hacs.xyz/)
- 📚 [Chart.js Docs](https://www.chartjs.org/)
- 💬 [HA Discord](https://discord.gg/home-assistant)
- 🐛 [Issues auf Forgejo](https://git.pfeiffer-privat.de/HA-Addons/ElegantChart/issues)

---

## Changelog

### v1.0.0
- ✨ Initial Release
- 📊 Chart.js 4 Integration
- ⚡ WebSocket LiveUpdate
- 🎛️ Editor UI
- 🔄 5-Sensor Support
- 🧹 Automatic Cleanup

---

**Viel Spaß mit ElegantChart!** 🎉
