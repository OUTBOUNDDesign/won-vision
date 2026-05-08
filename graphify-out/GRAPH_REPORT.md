# Graph Report - won-media  (2026-05-08)

## Corpus Check
- 24 files · ~53,753 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 78 nodes · 68 edges · 19 communities (18 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `19eec140`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]

## God Nodes (most connected - your core abstractions)
1. `Wordmark()` - 7 edges
2. `WonVisionMark()` - 2 edges
3. `setHidden()` - 2 edges
4. `update()` - 2 edges
5. `schedule()` - 2 edges
6. `onTilt()` - 2 edges
7. `open()` - 2 edges
8. `step()` - 2 edges
9. `setHidden()` - 2 edges
10. `update()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Communities (19 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.14
Nodes (6): onTilt(), open(), schedule(), setHidden(), step(), update()

### Community 1 - "Community 1"
Cohesion: 0.15
Nodes (6): onTilt(), open(), schedule(), setHidden(), step(), update()

### Community 2 - "Community 2"
Cohesion: 0.15
Nodes (6): onTilt(), open(), schedule(), setHidden(), step(), update()

## Knowledge Gaps
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._