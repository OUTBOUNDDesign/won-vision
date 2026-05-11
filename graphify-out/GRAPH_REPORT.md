# Graph Report - won-vision  (2026-05-10)

## Corpus Check
- 62 files · ~82,373 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 211 nodes · 189 edges · 70 communities (62 shown, 8 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7d121cdd`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]

## God Nodes (most connected - your core abstractions)
1. `Wordmark()` - 14 edges
2. `createDraft()` - 9 edges
3. `submitProperty()` - 9 edges
4. `attachPhoto()` - 8 edges
5. `isStylePreset()` - 6 edges
6. `add_para()` - 5 edges
7. `handleClientBlobUpload()` - 5 edges
8. `requireEditor()` - 5 edges
9. `add_eyebrow()` - 4 edges
10. `add_section_title()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `ensureDraft()` --calls--> `createDraft()`  [INFERRED]
  app/admin/editor/new/IntakeForm.tsx → lib/intake/actions.ts
- `onCreateDraft()` --calls--> `createDraft()`  [INFERRED]
  app/admin/editor/new/Stepper.tsx → lib/intake/actions.ts
- `handleSubmit()` --calls--> `attachPhoto()`  [INFERRED]
  app/admin/editor/new/ReviewScreen.tsx → lib/intake/actions.ts
- `handleSubmit()` --calls--> `submitProperty()`  [INFERRED]
  app/admin/editor/new/ReviewScreen.tsx → lib/intake/actions.ts
- `onSubmit()` --calls--> `attachPhoto()`  [INFERRED]
  app/admin/editor/new/Stepper.tsx → lib/intake/actions.ts

## Communities (70 total, 8 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.15
Nodes (8): attachPhoto(), createDraft(), requireEditor(), submitProperty(), isStylePreset(), handleSubmit(), onCreateDraft(), onSubmit()

### Community 1 - "Community 1"
Cohesion: 0.12
Nodes (3): BookPage(), WonVisionMark(), Wordmark()

### Community 2 - "Community 2"
Cohesion: 0.13
Nodes (7): onTilt(), open(), schedule(), setHidden(), step(), update(), __wvBoot()

### Community 3 - "Community 3"
Cohesion: 0.15
Nodes (6): onTilt(), open(), schedule(), setHidden(), step(), update()

### Community 4 - "Community 4"
Cohesion: 0.15
Nodes (6): onTilt(), open(), schedule(), setHidden(), step(), update()

### Community 5 - "Community 5"
Cohesion: 0.17
Nodes (3): formatAddress(), ensureDraft(), handleContinue()

### Community 6 - "Community 6"
Cohesion: 0.35
Nodes (10): add_eyebrow(), add_para(), add_section_title(), hr(), page_break(), Generates Won Vision Brand Book.docx — a designer-facing brand document with the, Fill a table cell with a flat colour., remove_table_borders() (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.6
Nodes (3): esc(), handler(), inject()

## Knowledge Gaps
- **1 isolated node(s):** `Fill a table cell with a flat colour.`
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `createDraft()` connect `Community 0` to `Community 5`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `createDraft()` (e.g. with `ensureDraft()` and `onCreateDraft()`) actually correct?**
  _`createDraft()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `submitProperty()` (e.g. with `handleSubmit()` and `onSubmit()`) actually correct?**
  _`submitProperty()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `attachPhoto()` (e.g. with `handleSubmit()` and `onSubmit()`) actually correct?**
  _`attachPhoto()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Fill a table cell with a flat colour.` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.12 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._