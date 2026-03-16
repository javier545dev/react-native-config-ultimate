# Roadmap

Estado actual y futuro de react-native-config-ultimate.

---

## Completado

### Core Features
- [x] Parsing de archivos `.env` (KEY=VALUE)
- [x] Parsing de archivos `.env.yaml` (tipos, per-platform values)
- [x] Merge de múltiples archivos env (`npx rncu .env.base .env.staging`)
- [x] Variable expansion (`$VAR` y `${VAR}`)
- [x] Schema validation con `.rncurc.js`
- [x] Hooks API (`on_env`, `on_js`, etc.)
- [x] Watch mode (`--watch`)
- [x] TypeScript types auto-generados (`index.d.ts`)

### Platform Support
- [x] iOS - Objective-C/Swift access
- [x] iOS - Info.plist variables
- [x] iOS - Build Settings via xcconfig
- [x] Android - Kotlin/Java access via BuildConfig
- [x] Android - Manifest placeholders
- [x] Android - Gradle access
- [x] Android - String resources
- [x] Web - Vite support
- [x] Web - Webpack support
- [x] Web - React Native Web

### Architecture
- [x] New Architecture (TurboModules)
- [x] Old Architecture (Bridge)
- [x] React Native 0.73+
- [x] React 18 support
- [x] React 19 support

### Developer Experience
- [x] CLI con yargs
- [x] Monorepo support (pnpm, yarn, npm workspaces)
- [x] Path resolution para hoisted dependencies
- [x] Error messages claros

### Documentation
- [x] README con badges y comparison table
- [x] Mermaid diagrams (flow + tech stack)
- [x] Quick Start guide
- [x] API Reference
- [x] Cookbook con recipes
- [x] Migration guide (from react-native-config)
- [x] Testing guide
- [x] Monorepo tips
- [x] Troubleshooting guide
- [x] Alternatives comparison
- [x] Contributor notes

### Infrastructure
- [x] Monorepo con pnpm + Turborepo
- [x] Jest tests (136 tests passing)
- [x] ESLint 9 (flat config)
- [x] TypeScript strict mode
- [x] react-native-builder-bob
- [x] release-please automation
- [x] Example app (RN 0.83)
- [x] Example079 app (RN 0.79 + Web)
- [x] example-web (Vite standalone)

---

## En Progreso

### v0.3.0 - CLI Enhancements

#### `rncu init` - Auto-setup nativo
- [ ] **Phase 1: Foundation**
  - [ ] 1.1 Add @bacons/xcode dependency
  - [ ] 1.2 Create src/init/ types
  - [ ] 1.3 Modify cli.ts for subcommands
- [ ] **Phase 2: Detection**
  - [ ] 2.1 Project detection logic
  - [ ] 2.2 Detection tests
- [ ] **Phase 3: Android**
  - [ ] 3.1 build.gradle modification
  - [ ] 3.2 Android tests
- [ ] **Phase 4: iOS**
  - [ ] 4.1 pbxproj configuration with @bacons/xcode
  - [ ] 4.2 iOS tests
- [ ] **Phase 5: Integration**
  - [ ] 5.1 Orchestrator (init/index.ts)
  - [ ] 5.2 Wire up CLI
  - [ ] 5.3 Integration tests
  - [ ] 5.4 Documentation

**Estimado:** 3-4 días

#### `rncu validate` - Validación para CI
- [ ] 1.1 Create validate.ts
- [ ] 1.2 Add validate subcommand
- [ ] 1.3 --json output format
- [ ] 1.4 --quiet flag
- [ ] 1.5 Unit tests
- [ ] 1.6 Integration tests
- [ ] 1.7 Documentation

**Estimado:** 1-2 días

---

## Backlog (Futuro)

### CLI Features
- [ ] `rncu diff .env.old .env.new` - Comparar archivos env
- [ ] `rncu doctor` - Diagnosticar problemas de configuración
- [ ] `rncu encrypt` / `rncu decrypt` - Secrets encryption
- [ ] Interactive mode (`rncu init -i`)

### Core Features
- [ ] Soporte para `.env.local` (override automático, gitignored)
- [ ] Soporte para `.env.${NODE_ENV}` (auto-detect environment)
- [ ] Remote config (fetch from URL)
- [ ] Secrets manager integration (AWS, GCP, Azure)
- [ ] Comments preservation en archivos .env

### Platform Features
- [ ] macOS support (Catalyst)
- [ ] tvOS support
- [ ] Windows support (React Native Windows)

### Tooling
- [ ] VSCode extension (autocomplete, validation)
- [ ] ESLint plugin (detect missing env vars)
- [ ] Babel plugin (compile-time replacement)
- [ ] GitHub Action para CI/CD

### Testing
- [ ] E2E tests con Detox
- [ ] Performance benchmarks
- [ ] Fuzz testing para parser

### Documentation
- [ ] Video tutorial
- [ ] GitHub Pages site (activar)
- [ ] Ejemplos de CI/CD (GitHub Actions, Bitrise, CircleCI)
- [ ] Changelog detallado por versión

---

## Ideas (Evaluando)

| Idea | Valor | Esfuerzo | Status |
|------|-------|----------|--------|
| TypeScript config file (`.rncurc.ts`) | Medio | Bajo | Evaluando |
| JSON Schema para .env.yaml | Bajo | Bajo | Evaluando |
| Config inheritance (`extends: ./base.yaml`) | Medio | Medio | Evaluando |
| Env variables groups/namespaces | Bajo | Alto | Descartado |
| GUI app para editar configs | Bajo | Alto | Descartado |

---

## Versiones

| Versión | Estado | Highlights |
|---------|--------|------------|
| **0.2.0** | ✅ Released | Primera versión estable. New Arch, React 19, Web support |
| **0.3.0** | 🚧 Planned | `rncu init`, `rncu validate` |
| **0.4.0** | 📋 Backlog | Secrets encryption, remote config |
| **1.0.0** | 🎯 Goal | API estable, feature complete |

---

## Contribuir

¿Querés ayudar? Revisa los [issues abiertos](https://github.com/javier545dev/react-native-config-ultimate/issues) o propone nuevas ideas.

Para contribuir código, lee [contributor-notes.md](./docs/contributor-notes.md).
