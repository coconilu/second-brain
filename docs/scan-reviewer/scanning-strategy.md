# Scanning Strategy

> Related reading: [Comparison with community approaches](comparison.md) explains how this strategy differs from repo maps, RAG, code graphs, and tool-driven exploration.

## What Counts as "Reusable"?

The scanner looks for **exported code artifacts that are imported by other files** — this is the strongest signal of reusability. The scanner also flags items in dedicated directories (`components/`, `utils/`, `hooks/`) as "designed for reuse" even if they haven't been imported yet.

## Two-Phase Scanning

### Phase 1: Symbol Extraction

Extract all exported symbols with **full signatures** (not just names):

```
// NOT just: formatDate
// Extract full signature:
export function formatDate(date: Date, format: string = "YYYY-MM-DD"): string
export const Button: React.FC<ButtonProps>
export async function fetchUser(id: string): Promise<User>
export interface User { id: string; name: string; email: string }
```

Full signatures enable the reviewer to do **signature-level comparison**: same param names, same types, same return type → strong duplication signal.

### Phase 2: Dependency Graph Construction

For each symbol, record not just "how many files import it" but **which files import it**:

```
cn (src/utils/cn.ts)
  ← imported by: [src/components/Button.tsx, src/components/Modal.tsx, src/layout/Header.tsx, ...]
  ← total: 15 files
  ← tier: Hot (> 10 imports)

useAuth (src/hooks/useAuth.ts)
  ← imported by: [src/pages/Login.tsx, src/pages/Dashboard.tsx, src/guard/AuthGuard.tsx]
  ← total: 3 files
  ← tier: Hot (imported by guard/infrastructure modules)
```

This allows ranking by **centrality** — a utility imported by 3 core/module files is more important than one imported by 5 leaf components.

## Tiered Catalog (Token Budget)

Large projects can have hundreds of reusable items. The catalog uses a **three-tier system** to keep it compact and useful:

| Tier | Condition | Priority |
|------|-----------|----------|
| **Hot** | Imported by >5 files OR imported by infrastructure/core modules | Always visible in catalog |
| **Mid** | Imported by 2-5 files | Visible if token budget allows |
| **Low** | Imported by 1 file OR no imports (in utils/components dir) | Collapsed, expandable on demand |

A typical catalog stays within ~200 lines for a 100K-line project, preventing reviewer attention dilution.

## Symbol Relevance Ranking

Not all symbols are equally important. The scanner applies these heuristics to rank relevance:

### High Relevance (always Hot tier)
- Imported by 5+ distinct files
- Imported by infrastructure modules (auth, routing, state management, config)
- Located in dedicated shared directories (`components/`, `hooks/`, `utils/`, `services/`)
- Has a generic name suggesting wide applicability (e.g., `apiClient`, `formatDate`, `cn`)

### Medium Relevance (Mid or Hot depending on context)
- Imported by 2-4 files, all in related domain
- In a feature module but exported as public API
- Tested independently (has its own `.test.*` file — signals it's a standalone unit)

### Low Relevance (Low tier, collapsed)
- Imported by only 1 file (might be a coincidence, not intentional reuse)
- In a shared directory but never imported (new addition, not yet adopted)
- Re-exported from a barrel file but never used directly

## Directory Heuristics

| Directory Pattern | Category | Confidence |
|-------------------|----------|------------|
| `components/`, `ui/`, `widgets/` | Component | High |
| `hooks/`, `composables/` | Hook | High |
| `utils/`, `lib/`, `helpers/` | Utility | High |
| `api/`, `services/`, `client/` | API Client | High |
| `types/`, `interfaces/`, `@types/` | Type | High |
| `stores/`, `state/`, `contexts/` | State/Context | Medium |
| `middleware/`, `guards/`, `interceptors/` | Infrastructure | Medium |
| `constants/`, `config/` | Constants | Low (rarely a "reuse" concern) |
| `pages/`, `routes/`, `screens/` | Not reusable | Skip |
| `__tests__/`, `*.test.*`, `*.spec.*` | Test | Skip |

## Language-agnostic Detection

### Function Exports (all languages)
```
Grep for: /export (const|function|class|default|async function)/
```
- Capture: **full line** with name, parameters (including types), return type annotation

### Component Detection (framework-agnostic)
- **React**: PascalCase functions returning JSX, files in `components/`
- **Vue**: `.vue` files, `defineComponent()`, `composables/` directory
- **Svelte**: `.svelte` files
- **Angular**: `@Component()` decorator, `@Injectable()` decorator in `services/`
- **General**: Files in `components/` or `ui/` directories

### Hook / Composable Detection
```
Grep for: /export.*function use[A-Z]/
```
Also detects:
- Vue composables: `export function use*` in files under `composables/`
- Angular services: `@Injectable()` class exports in `services/`

Skip library hooks: `useState`, `useEffect`, `useContext`, `useReducer`, `useCallback`, `useMemo`, `useRef` (React built-ins).

### API Client Detection
```
Grep for: /(fetch|axios|graphql|query|mutation)/
```
Flagged only when wrapped in a named exported function, indicating an intentional API layer.

### Type Detection
Files in `types/`, `interfaces/`, or containing `export (interface|type|enum)`.

## What the Scanner Ignores

- **Test files**: `*.test.*`, `*.spec.*`, `__tests__/`
- **Generated code**: `*.generated.*`, `dist/`, `build/`, `.next/`
- **Dependencies**: `node_modules/`, `vendor/`
- **Config files**: `.config.*`, `*.config.*` (unless exporting utilities)
- **Barrel exports** (`index.ts` re-exporting everything): Follow the chain to actual definitions
- **Private/internal items**: Non-exported functions
- **One-liner re-exports**: `export { default as X } from './Y'` (count the original, not the re-export)

## Catalog Maintenance

### When to Re-scan

- After adding new reusable components
- After major refactors that change component APIs
- After merging a feature branch with new shared utilities
- Before starting a large new feature
- Weekly (to catch newly adopted patterns)

### Catalog Hygiene

- The scanner overwrites the catalog on each run (not incremental)
- Stale items (deleted source files) are automatically removed
- New items are automatically added
- The catalog is designed to be committed to git

### Team Usage

```
# One team member scans initially
/scan-index
git add .scan-review/catalog.md
git commit -m "Add reusable component catalog"

# Others pull and reuse
git pull
# catalog.md is now available for /review-gen
```

## Inspiration

This strategy draws from:

- **Aider's repo map**: Tree-sitter-based AST extraction, dependency graph ranking, token budget management. We adopt the dependency graph and token budget concepts without requiring tree-sitter native dependencies.
- **Anthropic SWE agent**: Search-as-context approach — understanding the codebase before generating. We pre-build this understanding into a persistent catalog.
- **OpenCode Explore agent**: Specialized sub-agent for codebase discovery. Our scanner is essentially a more structured, output-oriented Explore.
