# ElegantChart - Forgejo Setup Anleitung

Dies ist eine Schritt-für-Schritt-Anleitung zum Hochladen der ElegantChart Card zu Forgejo unter der ORG `HA-Addons`.

## Voraussetzungen

- Forgejo Account mit Zugriff auf ORG `HA-Addons`
- SSH-Key in Forgejo konfiguriert (empfohlen) oder HTTPS Token
- Git installiert

## Schritt 1: Repository auf Forgejo erstellen

Gehe zu: https://git.pfeiffer-privat.de/HA-Addons

1. Klicke auf **"+ New Repository"**
2. Repository Name: `ElegantChart`
3. Beschreibung: `Professional Chart.js Card for Home Assistant`
4. Visibility: **Public**
5. Initialisiere mit README: **Nein** (wir haben schon einen)
6. Klicke **"Create Repository"**

## Schritt 2: Lokales Git-Repo initialisieren

```bash
cd /home/claude/ElegantChart

git init
git config user.name "ppfeiffer"
git config user.email "your-email@example.com"

# oder global:
git config --global user.name "ppfeiffer"
git config --global user.email "your-email@example.com"
```

## Schritt 3: Dateien zum Staging hinzufügen

```bash
git add .
git status
```

Sollte anzeigen:
```
On branch master
Changes to be committed:
  new file:   .forgejo/workflows/release.yml
  new file:   .gitignore
  new file:   README.md
  new file:   examples/dashboard.yaml
  new file:   manifest.json
  new file:   package.json
  new file:   src/editor.js
  new file:   src/elegant-chart-card.js
  new file:   src/websocket-manager.js
```

## Schritt 4: Erster Commit

```bash
git commit -m "Initial commit: ElegantChart v1.0.0

- Add main card component with WebSocket LiveUpdate
- Add Editor UI for visual configuration
- Add WebSocket Manager for real-time updates
- Add comprehensive README and examples
- Add Forgejo Actions workflow for automated releases"
```

## Schritt 5: Remote hinzufügen und hochladen

### Via SSH (empfohlen)

```bash
git remote add origin ssh://git@git.pfeiffer-privat.de/HA-Addons/ElegantChart.git

git branch -M main

git push -u origin main
```

### Via HTTPS (mit Token)

```bash
git remote add origin https://git.pfeiffer-privat.de/HA-Addons/ElegantChart.git

git branch -M main

# Du wirst nach Username und Password gefragt
# Username: ppfeiffer
# Password: Dein Forgejo Token (Settings → Applications → Personal Access Tokens)

git push -u origin main
```

## Schritt 6: Tags erstellen für Release

```bash
git tag -a v1.0.0 -m "Release v1.0.0: Initial ElegantChart release"

git push origin --tags
```

## Schritt 7: Verifizierung

Öffne: https://git.pfeiffer-privat.de/HA-Addons/ElegantChart

Du solltest sehen:
- ✅ Main Branch mit allen Dateien
- ✅ v1.0.0 Tag
- ✅ README.md in der Vorschau
- ✅ Forgejo Actions Workflow (falls konfiguriert)

## Schritt 8: HACS registrieren

Im Home Assistant:

1. HACS öffnen
2. Frontend
3. ⋮ (drei Punkte) → "Custom repositories"
4. Hinzufügen:
   - Repository: `https://git.pfeiffer-privat.de/HA-Addons/ElegantChart`
   - Kategorie: `Frontend`
5. "Erstellen"
6. "Elegant Chart Card" sollte installierbar sein

## Zukünftige Updates

Für neue Versionen:

```bash
# Änderungen machen, dann:

git add .
git commit -m "v1.0.1: Bug fixes and improvements"

# Version in package.json erhöhen
# z.B. 1.0.0 → 1.0.1

git tag v1.0.1
git push origin main --tags

# Forgejo Actions baut und released automatisch!
```

## Troubleshooting

### "fatal: not a git repository"

```bash
cd /home/claude/ElegantChart
git init
```

### SSH-Key Fehler

```bash
# Generiere neuen SSH-Key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Kopiere Public Key zu Forgejo
cat ~/.ssh/id_ed25519.pub

# Settings → SSH Keys → Add Key
```

### HTTPS Token

Settings → Applications → Personal Access Tokens
- Name: `git-cli`
- Scopes: `api`, `write:repository`, `read:repository`
- Kopiere Token

```bash
git config --global credential.helper store
git push
# Dein Token wird dann gespeichert
```

### Forgejo Actions funktioniert nicht

Stelle sicher, dass:
1. `.forgejo/workflows/release.yml` im `main` Branch ist
2. Repository ist nicht archiviert
3. Actions sind in Repository-Settings aktiviert (Settings → Actions)

## Weitere Ressourcen

- Forgejo Docs: https://forgejo.org/
- HACS: https://hacs.xyz/
- Chart.js: https://www.chartjs.org/
- Lit: https://lit.dev/

---

**Fertig!** 🎉 ElegantChart ist jetzt auf Forgejo verfügbar und installierbar via HACS.
