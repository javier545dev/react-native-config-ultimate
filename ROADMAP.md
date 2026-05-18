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
- [x] Hooks API (`on_env`) y `js_override` para overrides per-platform
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
- [x] Jest tests (153 tests, coverage gates en lines:88 / branches:82)
- [x] ESLint 9 (flat config)
- [x] TypeScript strict mode
- [x] react-native-builder-bob
- [x] release-please automation
- [x] Example app (RN 0.83)
- [x] Example079 app (RN 0.79 + Web)
- [x] example-web (Vite standalone)

---

## Planeado

### v0.3.0 - Dependency Hygiene & Watch-mode Fixes

> Esta es la release actual en preparación. No agrega API pública; sube el
> piso de Node y arregla dos bugs de `--watch`.

- [x] **Bump dependencies**
  - [x] `chokidar` 4 → 5
  - [x] `dotenv` 16 → 17
  - [x] `dotenv-expand` 12 → 13
- [x] **Bump Node floor a ≥20.19** (requerido por chokidar v5 ESM)
- [x] **Fix:** watch-mode stale-value leak (`processEnv: {}` isolation)
- [x] **Fix:** chokidar fires `change` mid-write (`awaitWriteFinish`)
- [x] **Test:** integration spec sin mocks que lockea el comportamiento de
      las deps mayores para futuros bumps
- [ ] Tagear y publicar

**Breaking change:** consumidores en Node 18 o Node 20.0–20.18 no soportados.
Ver [`docs/migration.md`](./docs/migration.md#upgrading-from-02x-to-03x).

### v0.4.0 - CLI Enhancements

> Specs y design ya escritos vía SDD (engram). Implementación todavía no comenzada.
> Originalmente planeado para 0.3.0; movido a 0.4.0 cuando 0.3.0 absorbió
> el ciclo de dep hygiene.

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

### Maintenance & Dependencies
- [ ] **`migrate-js-yaml-to-yaml`** — reemplazar `js-yaml` (sin release desde 2022)
      por `yaml` (eemeli/yaml, activamente mantenido, mejor spec YAML 1.2).
      Requiere SDD: verificar parity del comportamiento Date-detection
      (`load-env.ts:26`) y multidoc. Candidato 0.4.x.
- [ ] **`evaluate-node-parseenv`** — evaluar si `node:util.parseEnv`
      (estable en Node 22 LTS) puede reemplazar `dotenv` + `dotenv-expand`.
      Bloqueante: necesitamos una solución de expansión (`$VAR`,
      `${VAR:-default}`) — `parseEnv` no expande. Candidato ≥0.5.0 cuando
      Node 22 sea piso seguro.

---

## v0.5.0 - Secure Keys (JNI/C++)

**KILLER FEATURE** — Secrets protegidos con código nativo compilado.

### ¿Por qué?

Las env vars normales son **inseguras**:
- Android: `BuildConfig.java` se puede decompilar con jadx
- iOS: strings en el binario son extraíbles
- JS Bundle: cualquiera puede leer el código

### ¿Cómo lo solucionamos?

Inspirado en [react-native-keys](https://github.com/numandev1/react-native-keys):

```yaml
# .env.yaml
public:
  API_URL: https://api.example.com
  APP_NAME: MyApp

secure:  # ← NEW: Cifrado con JNI/C++
  API_KEY: sk_live_123456
  STRIPE_KEY: pk_live_abcdef
```

```tsx
import Config from 'react-native-config-ultimate';

// Public (normal)
Config.API_URL  // "https://api.example.com"

// Secure (descifrado en runtime desde código nativo)
Config.secureFor('API_KEY')  // "sk_live_123456"
```

### Arquitectura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   .env.yaml     │ ──▶ │   Build Time     │ ──▶ │    Runtime      │
│                 │     │                  │     │                 │
│ public: {...}   │     │ public → normal  │     │ JS: Config.X    │
│ secure: {...}   │     │ secure → C++/JNI │     │ Native: decrypt │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Tasks

- [ ] Definir formato YAML para `secure` section
- [ ] Android: Implementar JNI/NDK para secrets
- [ ] iOS: Implementar C++ nativo para secrets
- [ ] JSI binding para `secureFor()` method
- [ ] Cifrado AES-256 en build time
- [ ] Key derivation segura (no hardcoded)
- [ ] Tests de seguridad (decompile verification)
- [ ] Documentación de seguridad

### Comparación Final

| Feature | rncu v0.5 | react-native-config | react-native-keys |
|---------|:---------:|:-------------------:|:-----------------:|
| New Architecture | ✅ | ❌ | ✅ |
| YAML + per-platform | ✅ | ❌ | ❌ |
| Multi-env merge | ✅ | ❌ | ❌ |
| Schema validation | ✅ | ❌ | ❌ |
| TypeScript types | ✅ | ❌ | ❌ |
| Web support | ✅ | ❌ | ❌ |
| Secure keys (JNI) | ✅ | ❌ | ✅ |
| Auto-setup (init) | ✅ | ❌ | ❌ |

**Seríamos la ÚNICA librería con TODAS las features.**

**Estimado:** 2-3 semanas

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
| **0.2.x** | ✅ Released | Patches y hardening (audit pre-release, supply chain, iOS warning) |
| **0.3.0** | 🚧 In prep | Bump deps (chokidar 5, dotenv 17, expand 13), Node ≥20.19, fixes de `--watch` |
| **0.4.0** | 📋 Planned | `rncu init`, `rncu validate` (CLI enhancements) |
| **0.5.0** | 📋 Planned | **Secure Keys** — JNI/C++ para secrets protegidos |
| **1.0.0** | 🎯 Goal | API estable, feature complete

---

## Contribuir

¿Querés ayudar? Revisa los [issues abiertos](https://github.com/javier545dev/react-native-config-ultimate/issues) o propone nuevas ideas.

Para contribuir código, lee [contributor-notes.md](./docs/contributor-notes.md).
