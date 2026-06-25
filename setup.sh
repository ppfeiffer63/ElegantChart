#!/bin/bash

set -e

echo "🚀 ElegantChart - Forgejo Setup Script"
echo "========================================"
echo ""

REPO_NAME="ElegantChart"
ORG="HA-Addons"
GIT_USER="ppfeiffer"
FORGEJO_HOST="git.pfeiffer-privat.de"

cd "$(dirname "$0")"

echo "📝 Schritt 1: Git konfigurieren"
if ! git config user.name > /dev/null 2>&1; then
    echo "Git User nicht konfiguriert. Bitte eingeben:"
    read -p "Git Name [ppfeiffer]: " GIT_NAME
    GIT_NAME=${GIT_NAME:-ppfeiffer}
    
    read -p "Git Email: " GIT_EMAIL
    
    git config user.name "$GIT_NAME"
    git config user.email "$GIT_EMAIL"
    echo "✅ Git konfiguriert"
else
    echo "✅ Git bereits konfiguriert: $(git config user.name)"
fi

echo ""
echo "📝 Schritt 2: Git Repo initialisieren"
if [ ! -d ".git" ]; then
    git init
    echo "✅ Git Repository initialisiert"
else
    echo "✅ Git Repository bereits initialisiert"
fi

echo ""
echo "📝 Schritt 3: Remote konfigurieren"
if git remote get-url origin > /dev/null 2>&1; then
    echo "Remote existiert bereits:"
    git remote -v
else
    echo "Wähle Git Protocol:"
    echo "1) SSH (empfohlen)"
    echo "2) HTTPS"
    read -p "Wahl [1]: " PROTOCOL
    PROTOCOL=${PROTOCOL:-1}
    
    if [ "$PROTOCOL" = "2" ]; then
        REMOTE_URL="https://${FORGEJO_HOST}/${ORG}/${REPO_NAME}.git"
    else
        REMOTE_URL="ssh://git@${FORGEJO_HOST}/${ORG}/${REPO_NAME}.git"
    fi
    
    git remote add origin "$REMOTE_URL"
    echo "✅ Remote konfiguriert: $REMOTE_URL"
fi

echo ""
echo "📝 Schritt 4: Dateien zum Index hinzufügen"
git add .
echo "✅ Dateien hinzugefügt"
git status --short | head -10

echo ""
echo "📝 Schritt 5: Erster Commit"
if git commit -m "Initial commit: ElegantChart v1.0.0

- Add main card component with WebSocket LiveUpdate
- Add Editor UI for visual configuration  
- Add WebSocket Manager for real-time updates
- Add comprehensive README and examples
- Add Forgejo Actions workflow for automated releases" 2>/dev/null; then
    echo "✅ Commit erstellt"
else
    echo "✅ Keine neuen Commits nötig (alles ist aktuell)"
fi

echo ""
echo "📝 Schritt 6: Branch umbenennen auf 'main'"
if git symbolic-ref --short HEAD | grep -q "^master$"; then
    git branch -M main
    echo "✅ Branch umbenannt zu 'main'"
else
    echo "✅ Branch ist bereits 'main'"
fi

echo ""
echo "📝 Schritt 7: Zum Remote pushen"
read -p "Push zu origin/main durchführen? (y/n) [y]: " PUSH_CONFIRM
PUSH_CONFIRM=${PUSH_CONFIRM:-y}

if [ "$PUSH_CONFIRM" = "y" ] || [ "$PUSH_CONFIRM" = "Y" ]; then
    git push -u origin main
    echo "✅ Code auf Forgejo gepusht"
else
    echo "⏭️  Push übersprungen. Manuell durchführen mit: git push -u origin main"
fi

echo ""
echo "📝 Schritt 8: Version Tag erstellen"
VERSION="v1.0.0"
read -p "Version für Tag [$VERSION]: " VERSION_INPUT
VERSION=${VERSION_INPUT:-$VERSION}

if git tag -a "$VERSION" -m "Release $VERSION: Initial ElegantChart release" 2>/dev/null; then
    echo "✅ Tag erstellt: $VERSION"
    
    read -p "Tags zu Forgejo pushen? (y/n) [y]: " TAG_CONFIRM
    TAG_CONFIRM=${TAG_CONFIRM:-y}
    
    if [ "$TAG_CONFIRM" = "y" ] || [ "$TAG_CONFIRM" = "Y" ]; then
        git push origin --tags
        echo "✅ Tags auf Forgejo gepusht"
    else
        echo "⏭️  Tag Push übersprungen. Manuell: git push origin --tags"
    fi
else
    echo "✅ Tag existiert bereits: $VERSION"
fi

echo ""
echo "========================================"
echo "✅ Setup abgeschlossen!"
echo "========================================"
echo ""
echo "🎉 ElegantChart ist jetzt verfügbar unter:"
echo "   https://${FORGEJO_HOST}/${ORG}/${REPO_NAME}"
echo ""
echo "📦 Installation via HACS:"
echo "   1. HACS öffnen"
echo "   2. Frontend"
echo "   3. ⋮ → Custom repositories"
echo "   4. Hinzufügen:"
echo "      - Repository: https://${FORGEJO_HOST}/${ORG}/${REPO_NAME}"
echo "      - Kategorie: Frontend"
echo "   5. Elegant Chart Card installieren"
echo ""
echo "📚 Weitere Infos: cat SETUP.md"
echo ""
