# Graph Report - document-rag  (2026-05-31)

## Corpus Check
- 3 files · ~824 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 34 nodes · 31 edges · 4 communities (3 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]

## God Nodes (most connected - your core abstractions)
1. `root_redirect()` - 2 edges
2. `health_check()` - 2 edges
3. `Project` - 2 edges
4. `Redirect incoming root requests directly to interactive OpenAPI docs.` - 1 edges
5. `Lightweight health check returning static ok status.` - 1 edges
6. `Constraints` - 1 edges
7. `Technology Stack` - 1 edges
8. `Languages` - 1 edges
9. `Runtime` - 1 edges
10. `Frameworks` - 1 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (4 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (25): Architecture, Code Style, Comments, Configuration, Conventions, Cross-Cutting Concerns, Data Flow, Developer Profile (+17 more)

### Community 1 - "Community 1"
Cohesion: 0.40
Nodes (4): health_check(), Redirect incoming root requests directly to interactive OpenAPI docs., Lightweight health check returning static ok status., root_redirect()

## Knowledge Gaps
- **26 isolated node(s):** `Constraints`, `Technology Stack`, `Languages`, `Runtime`, `Frameworks` (+21 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Project` connect `Community 2` to `Community 0`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **What connects `Redirect incoming root requests directly to interactive OpenAPI docs.`, `Lightweight health check returning static ok status.`, `Constraints` to the rest of the system?**
  _28 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07692307692307693 - nodes in this community are weakly interconnected._