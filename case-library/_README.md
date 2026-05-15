# Case Library

The case library is a curated collection of consulting interview practice cases, used for student self-serve practice (solo or with partners) and as source material for Case Academy course videos on frameworks, exhibits, and case math.

## Folder structure

```
case-library/
├── README.md              # This file
├── _TEMPLATE.md           # Schema template for new cases
├── _sources/              # Source casebook PDFs (gitignored)
│   ├── Wharton_2025.pdf
│   └── ...
├── _exhibits/             # Screenshot exhibits per case
│   ├── CA-001/
│   │   ├── exhibit_1.png
│   │   └── exhibit_2.png
│   └── ...
├── CA-001.md              # Individual case files
├── CA-002.md
└── ...
```

## File naming convention

- Case files: `CA-XXX.md` where XXX is a zero-padded sequential ID (001-999)
- Exhibit folders: `_exhibits/CA-XXX/` matching the case ID
- Exhibit images: `exhibit_1.png`, `exhibit_2.png`, etc.

## Per-source cap

To respect copyright and stay legally defensible, no more than **5 cases** from any single source casebook. Firm-published cases (McKinsey, BCG, Bain, Deloitte, etc.) have no cap since they are publicly published by the firms themselves.

## Free vs. paywalled

The `free_preview: true` frontmatter flag designates a case as free to view without subscription. Target: ~7 cases free (one of each major case type) to act as a B2C conversion funnel.

## Attribution

Every case must credit its source in the `attribution` field. Format:
- MBA casebook: "Adapted from [School] Consulting Club Casebook, [Year]"
- Firm-published: "Published by [Firm] for candidate practice. See [URL]."

## Source legitimacy mix

Target distribution across the library:
- **Firm-published (65%):** McKinsey, BCG, Bain, Deloitte, Oliver Wyman, A.T. Kearney, Roland Berger, L.E.K., Simon-Kucher, Strategy&
- **MBA casebooks (35%):** Wharton, Kellogg, Booth, Columbia, Duke, Yale, Tuck, Ross, MIT Sloan, Darden

## Schema

See `_TEMPLATE.md` for the full schema. Each case includes:
- Frontmatter (case_id, source, type, industry, difficulty, exhibit/math tags, video flags)
- Prompt (interviewer reads aloud)
- Clarifying Questions (expected Qs + answers)
- Framework / Structure (recommended approach)
- Exhibits (screenshots with descriptions + insights)
- Quantitative Analysis (math worked step-by-step)
- Recommendation (final answer + risks + next steps)
- Interviewer Notes (good vs. great behaviors + pitfalls)
