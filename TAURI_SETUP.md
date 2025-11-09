# Tauri Desktop App Setup

## Voraussetzungen

Für Windows benötigst du:
- **Rust**: https://rustup.rs/
- **Microsoft Visual Studio C++ Build Tools**: https://visualstudio.microsoft.com/visual-cpp-build-tools/
- **WebView2**: (normalerweise bereits auf Windows 10/11 installiert)

## Installation

```bash
# Rust installieren (falls noch nicht vorhanden)
# Besuche: https://rustup.rs/

# Projekt Dependencies installieren
yarn install
```

## Development

```bash
# Desktop App im Dev-Modus starten
yarn tauri:dev
```

## Build

```bash
# Production Build erstellen
yarn tauri:build
```

Die fertige App findest du dann in `src-tauri/target/release/bundle/`

## Features

- ✅ Custom Title Bar (transparent, draggable)
- ✅ Window Controls (Minimize, Maximize, Close)
- ✅ Optimierte Bundle-Größe (~600KB)
- ✅ Native Performance
- ✅ Auto-Updates möglich
- ✅ System Tray Support möglich

## Konfiguration

Die Tauri-Konfiguration findest du in `src-tauri/tauri.conf.json`:
- Window-Größe und -Verhalten
- App-Identifier
- Bundle-Einstellungen
- Security-Policies

## Weitere Anpassungen

### Title Bar anpassen
Bearbeite `src/components/TitleBar.tsx` für Design-Änderungen.

### Window-Einstellungen
Bearbeite `src-tauri/tauri.conf.json` unter `app.windows[0]`.

### Icons
Ersetze die Icons in `src-tauri/icons/` mit deinen eigenen.
