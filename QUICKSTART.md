# 🚀 ElegantChart - QUICKSTART

**Du hast eine vollständige, produktionsreife HACS-Karte für Home Assistant!**

## Wo ist der Code?

```
/home/claude/ElegantChart/
```

oder

```
/mnt/user-data/outputs/ElegantChart/
```

## 3 Schritte zu Forgejo

### 1️⃣ **Repository auf Forgejo erstellen** (2 Minuten)

Öffne: https://git.pfeiffer-privat.de/HA-Addons

- Klicke **+ New Repository**
- Name: `ElegantChart`
- Visibility: **Public**
- Klicke **Create**

### 2️⃣ **Code hochladen** (1 Minute)

```bash
cd /home/claude/ElegantChart
bash setup.sh
```

Das Skript führt dich interaktiv durch:
- Git konfigurieren
- Remote hinzufügen (SSH oder HTTPS)
- Code pushen
- Release Tag erstellen

### 3️⃣ **In HACS installieren** (1 Minute)

Home Assistant → HACS → Frontend → ⋮ → Custom repositories

```
Repository: https://git.pfeiffer-privat.de/HA-Addons/ElegantChart
Kategorie: Frontend
```

Dann "Elegant Chart Card" installieren und HA neustarten.

---

## 📦 Was ist enthalten?

### Hauptkomponenten
- ✅ `elegant-chart-card.js` — Hauptkarte mit WebSocket LiveUpdate
- ✅ `editor.js` — Editor UI für visuelle Konfiguration
- ✅ `websocket-manager.js` — WebSocket mit Fallback-Mechanismen

### Features
- 📊 6 Diagrammtypen (Line, Bar, Area, Scatter, Radar, Doughnut)
- ⚡ WebSocket LiveUpdate für Echtzeitechtzeit-Daten
- 🎛️ Editor UI im Home Assistant
- 🔄 Support für bis zu 5 Sensoren
- 📈 Historisierung (100 Datenpunkte gepuffert)
- ✅ Sensor-Validierung
- 🌙 Dark Mode Support
- 🚀 Forgejo Actions CI/CD

### Dokumentation
- 📖 `README.md` — Hauptdokumentation
- 📖 `INSTALL.md` — Home Assistant Installation + Beispiele
- 📖 `SETUP.md` — Detailliertes Forgejo Setup
- 📖 `FORGEJO_SETUP.md` — SSH/HTTPS Konfiguration
- 📖 `examples/dashboard.yaml` — Beispiel-Dashboard

---

## 🛠️ Manuelle Schritte (falls nicht automatisiert)

```bash
cd /home/claude/ElegantChart

# 1. Git initialisieren
git init
git config user.name "ppfeiffer"
git config user.email "your@email.com"

# 2. Remote hinzufügen (SSH empfohlen)
git remote add origin ssh://git@git.pfeiffer-privat.de/HA-Addons/ElegantChart.git

# 3. Dateien hinzufügen & Commit
git add .
git commit -m "Initial: ElegantChart v1.0.0"

# 4. Main branch & Push
git branch -M main
git push -u origin main

# 5. Release Tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin --tags
```

---

## 📝 Beispiel-Konfiguration

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
update_interval: 1000
use_websocket: true
```

---

## 🐛 Häufige Probleme

### "Repository not found"
→ Erstelle das Repository auf Forgejo ORG HA-Addons zuerst

### SSH Key Error
→ Generiere Key: `ssh-keygen -t ed25519`
→ Hochladen zu: https://git.pfeiffer-privat.de/user/settings/keys

### HTTPS Token
→ Erstelle Token: Settings → Applications → Personal Access Tokens
→ Scopes: `api`, `write:repository`, `read:repository`

---

## 📚 Weitere Infos

| Frage | Antwort |
|-------|--------|
| Wie updaten? | Version erhöhen → `git tag` → `git push --tags` |
| Funktioniert offline? | Nein, WebSocket/MQTT benötigt Verbindung |
| Maximal Sensoren? | 5 pro Karte (Validierung im Editor) |
| Browser Support? | Modern browsers (Chrome, Firefox, Safari, Edge) |
| Home Assistant Version? | 2024.1.0+ |

---

## 🎯 Nächste Schritte nach Installation

1. **Dashboard aufbauen**
   - Verschiedene Diagrammtypen testen
   - Farben & Größen anpassen
   - Mit anderen Karten kombinieren

2. **Sensoren konfigurieren**
   - Template Sensoren für berechnete Werte
   - History Stats für historische Daten
   - MQTT Integration für externe Daten

3. **Automatisierung**
   - Alerts basierend auf Sensor-Werten
   - Dashboard Automationen
   - Statistics für Trends

---

## 💡 Pro-Tipps

### Performance
- Update Interval höher setzen für weniger CPU-Last
- WebSocket aktiviert lassen (spart Bandbreite)
- Max. 5 Sensoren pro Karte verwenden

### Design
- Unterschiedliche Diagrammtypen pro Karte
- Legende oben oder unten positionieren
- Konsistente Farbgebung verwenden

### Features
- Kombiniere mit anderen HACS-Karten
- Nutze Custom Sensors für Berechnungen
- Exportiere Daten via History Stats

---

## 📞 Support

**Alle Dateien dokumentieren alles ausführlich:**

1. Frage zur **Installation**? → Lese `INSTALL.md`
2. Frage zum **Forgejo Setup**? → Lese `FORGEJO_SETUP.md` oder `SETUP.md`
3. Frage zur **Verwendung**? → Lese `README.md`
4. Frage zu **Konfiguration**? → Schau `examples/dashboard.yaml`
5. Technische Frage? → Lese Source Code in `src/`

---

## 🎉 Herzlichen Glückwunsch!

Du hast soeben eine professionelle, produktionsreife HACS-Karte erstellt!

**Nächster Schritt:** `bash setup.sh` ausführen und hochladen!

```bash
cd /home/claude/ElegantChart
bash setup.sh
```

**Viel Erfolg!** 🚀

---

*ElegantChart v1.0.0 — Erstellt von ppfeiffer für HA-Addons*  
*Repo: https://git.pfeiffer-privat.de/HA-Addons/ElegantChart*
