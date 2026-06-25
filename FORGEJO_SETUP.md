# ElegantChart → HA-Addons Forgejo Push

Diese Datei beschreibt genau, wie du ElegantChart zu deinem Forgejo hochlädst.

## Deine Konfiguration

```
Forgejo Host:  git.pfeiffer-privat.de
ORG:           HA-Addons
Repository:    ElegantChart
SSH User:      git
Git User:      ppfeiffer
API Token:     eb09ba228a3da4a31df25bd83907b9b11d7ff7d1 (für CI/CD)
```

## Schnellstart (5 Minuten)

```bash
cd /home/claude/ElegantChart

# 1. Git initialisieren
git init
git config user.name "ppfeiffer"
git config user.email "your@email.com"

# 2. Remote hinzufügen (SSH empfohlen)
git remote add origin ssh://git@git.pfeiffer-privat.de/HA-Addons/ElegantChart.git

# 3. Alle Dateien hinzufügen
git add .

# 4. Commit
git commit -m "Initial: ElegantChart v1.0.0"

# 5. Main branch
git branch -M main

# 6. Hochladen
git push -u origin main

# 7. Release Tag erstellen
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin --tags
```

## Detaillierte Schritte

### Schritt 1: Repository auf Forgejo erstellen

1. Gehe zu: https://git.pfeiffer-privat.de/HA-Addons
2. Klicke **+ New Repository**
3. Fülle aus:
   - **Repository name:** ElegantChart
   - **Description:** Professional Chart.js Card for Home Assistant
   - **Visibility:** Public
   - **.gitignore:** None (wir haben schon einen)
   - **License:** MIT
4. Klicke **Create Repository**

Deine neue Repo ist jetzt unter:
```
https://git.pfeiffer-privat.de/HA-Addons/ElegantChart
```

### Schritt 2: Lokales Git Setup

```bash
cd /home/claude/ElegantChart

git init
```

```bash
git config user.name "ppfeiffer"
git config user.email "your-email@example.com"
```

**Oder global (empfohlen):**
```bash
git config --global user.name "ppfeiffer"
git config --global user.email "your-email@example.com"
```

### Schritt 3: Remote konfigurieren

#### Via SSH (optimal für Automatisierung)

```bash
git remote add origin ssh://git@git.pfeiffer-privat.de/HA-Addons/ElegantChart.git
```

Stelle sicher, dass dein SSH-Key in Forgejo hochgeladen ist:
1. https://git.pfeiffer-privat.de/user/settings/keys
2. **Add Key**
3. Gebe deinen Public Key ein: `cat ~/.ssh/id_rsa.pub`

#### Via HTTPS (mit Token)

```bash
git remote add origin https://git.pfeiffer-privat.de/HA-Addons/ElegantChart.git
```

Beim ersten Push wirst du aufgefordert:
- Username: `ppfeiffer`
- Password: Dein Forgejo API Token (siehe oben)

### Schritt 4: Dateien zum Staging hinzufügen

```bash
git add .

# Überprüfe
git status
```

### Schritt 5: Commit erstellen

```bash
git commit -m "Initial commit: ElegantChart v1.0.0

- Add main card component with WebSocket LiveUpdate
- Add Editor UI for visual configuration
- Add WebSocket Manager for real-time updates
- Add comprehensive documentation (README, SETUP, INSTALL)
- Add example dashboard and configuration
- Add Forgejo Actions CI/CD workflow
- Add package.json and build scripts"
```

### Schritt 6: Branch umbenennen

```bash
git branch -M main
```

### Schritt 7: Zum Remote pushen

```bash
git push -u origin main
```

**SSH:** Keine Authentifizierung nötig (Key wird benutzt)
**HTTPS:** Du wirst nach Token gefragt

### Schritt 8: Release Tag erstellen

```bash
git tag -a v1.0.0 -m "Release v1.0.0: Initial ElegantChart release"

git push origin --tags
```

## Verifizierung

Nach dem Push sollte dein Repository auf Forgejo verfügbar sein:

### 1. Hauptseite
```
https://git.pfeiffer-privat.de/HA-Addons/ElegantChart
```

Prüfe:
- ✅ Alle Dateien sind da
- ✅ README.md wird angezeigt
- ✅ License ist MIT

### 2. Releases
```
https://git.pfeiffer-privat.de/HA-Addons/ElegantChart/releases
```

Sollte zeigen:
- ✅ v1.0.0 Release
- ✅ Tags sind korrekt

### 3. Actions (CI/CD)
```
https://git.pfeiffer-privat.de/HA-Addons/ElegantChart/actions
```

Falls Forgejo Actions aktiviert sind, sollte hier ein Workflow sichtbar sein.

## HACS-Integration

Damit HACS dein Repository findet und installieren kann:

1. Gehe zu Home Assistant HACS
2. Frontend
3. ⋮ → Custom repositories
4. Hinzufügen:
   ```
   Repository: https://git.pfeiffer-privat.de/HA-Addons/ElegantChart
   Kategorie: Frontend
   ```
5. Erstellen
6. "Elegant Chart Card" sollte jetzt installierbar sein

## Updates für zukünftige Versionen

Wenn du eine neue Version releassen möchtest:

```bash
# 1. Code ändern...

# 2. Version in package.json & manifest.json erhöhen
#    z.B. 1.0.0 → 1.0.1

# 3. Commit
git add .
git commit -m "v1.0.1: Improvements and fixes"

# 4. Tag und Push
git tag v1.0.1
git push origin main
git push origin --tags
```

Forgejo Actions wird dann automatisch:
- Code minifizieren
- Release erstellen
- Dateien hochladen

## Troubleshooting

### "Permission denied (publickey)"
SSH-Key ist nicht konfiguriert oder nicht hochgeladen.

```bash
# SSH-Key generieren (falls nicht vorhanden)
ssh-keygen -t ed25519 -C "your@email.com"

# Public Key kopieren
cat ~/.ssh/id_ed25519.pub

# Zu Forgejo hinzufügen:
# Settings → SSH Keys → Add Key
```

### "fatal: 'origin' does not appear to be a 'git' repository"
Remote existiert nicht.

```bash
git remote add origin ssh://git@git.pfeiffer-privat.de/HA-Addons/ElegantChart.git

# Oder überprüfen
git remote -v
```

### "Repository not found"
Repository existiert noch nicht auf Forgejo.

Gehe zu https://git.pfeiffer-privat.de/HA-Addons und erstelle es.

### HTTPS Token funktioniert nicht
Token hat falsche Scopes oder ist abgelaufen.

Erstelle neuen Token:
1. Forgejo Settings
2. Applications
3. Personal Access Tokens
4. Generate New Token
5. Scopes: `api`, `write:repository`, `read:repository`

## Empfohlene Workflow

1. **Entwicklung lokal**
   ```bash
   git add .
   git commit -m "feature: description"
   ```

2. **Pushing zum main branch**
   ```bash
   git push origin main
   ```

3. **Release**
   ```bash
   # Version erhöhen
   # Changelog updaten
   
   git add .
   git commit -m "Release v1.0.1"
   git tag v1.0.1
   git push origin --tags
   ```

4. **HACS nutzer erhalten automatisch Update**
   - Im Forgejo Release werden Binaries hochgeladen
   - HACS erkennt neue Version
   - Nutzer können upgraden

## Weitere Ressourcen

- 📖 [Forgejo Docs](https://forgejo.org/docs/)
- 🚀 [Forgejo Actions Docs](https://forgejo.org/docs/3.0/admin/actions/)
- 📦 [HACS Docs](https://hacs.xyz/)
- 🎓 [Git Basics](https://git-scm.com/book/de/v2)

---

**Bereit?** Führe das Schnellstart-Skript aus: `bash setup.sh`

Oder führe die Schritte manuell aus wie oben beschrieben. 🚀
