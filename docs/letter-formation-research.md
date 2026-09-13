<!--
Research notes, September 2026. Produced while deciding whether to source or
author letter-formation stroke data for a capital-letter handwriting exercise.

Outcome: we authored our own (see src/components/puzzles/LetterFormation/
letterForms.ts), using the sources below only as cross-checks on stroke order -
never copying their coordinates. See section 5 for why that distinction matters
for KanjiVG's share-alike licence.
-->

# Letter-formation stroke data for the Latin alphabet — findings

Scope: can we source centreline + stroke order + direction data for teaching a child (5–7) to
*form* letters, primarily UPPERCASE? Lowercase and digits are secondary.

Every licence claim below was checked against the actual licence text or package metadata, not
recalled. Confidence is marked per section, and a consolidated confidence table is at the end.

---

## 1. The fonts crux

**Confirmed for outline fonts. Refuted as a blanket claim about "fonts".**

### Confirmed: outline formats cannot carry stroke order — VERIFIED

I read the OpenType `glyf` specification
(<https://learn.microsoft.com/en-us/typography/opentype/spec/glyf>). A glyph is `numberOfContours`
closed contours delimited by `endPtsOfContours`, built from on-curve/off-curve control points. The
spec contains **no field encoding drawing order, pen direction, or stroke sequence** — it never
mentions writing order at all. Contour winding direction exists solely to drive the fill rule
(`OVERLAP_SIMPLE`, non-zero winding); it is fill machinery, not pedagogy.

This carries to TrueType, OpenType, SVG fonts, UFO and WOFF, which all share the outline model.
Skeletonising an outline gives you a centreline with no start point and no sequence — which is the
entire pedagogical content. The brief's working assumption is correct here.

### Refuted: single-line / plotter fonts DO carry ordered strokes — VERIFIED

Single-line (engraving / pen-plotter) fonts are a different data model. Hershey's `.jhf` format
stores, per glyph, a sequence of coordinate pairs in which the token `" R"` means **pen up**. That
is an ordered list of polylines with explicit stroke breaks and direction of travel — structurally
the same thing KanjiVG encodes.

**The catch, stated plainly:** that order is a *plotting/digitising* order, chosen for drawing
convention and pen economy, not for teaching. Any agreement with school convention is coincidence
(both favour top-to-bottom and left-to-right), so every letter must be audited. See §2.

### The "arrows in a font" case — VERIFIED by inspection

There is an OFL font that appears to solve this: **Edu AU VIC WA NT Arrows** (Google Fonts, OFL 1.1,
`OFL.txt` reads "Copyright 2023 The VIC WA NT School Hand Australia Project Authors";
<https://raw.githubusercontent.com/google/fonts/main/ofl/eduauvicwantarrows/OFL.txt>). It renders
hollow tracing capitals with a start dot and direction arrows.

I opened the TTF with fontTools. Tables are all standard (`glyf`, `cmap`, `GPOS`, `GSUB`, `fvar`,
`gvar`, `HVAR`, `MVAR`, `STAT`, `avar`, `vhea`/`vmtx`) — **no custom table, no arrow-named glyphs**,
65 glyphs covering only `0-9 A-Z a-z`. The arrows are extra *contours inside the letter glyph*:

- Capital **B**: 8 contours — 2 large (hollow letter outline) + three 12-point circles (start dots) +
  three arrowheads. One per stroke.
- Capital **E**: only 4 contours — outline + **one** dot + **one** arrow, despite E having four
  strokes.

So the marking is inconsistent decoration baked into the fill. You cannot ask it "which stroke is
second". **Category: a picture of arrows, not queryable stroke data.**

It remains an excellent *rendering* shortcut if all you need is "big letter with a start dot and
arrows" — zero authoring. It cannot drive numbered strokes or progressive reveal.

---

## 2. Hershey fonts

### Licence — VERIFIED

Canonical "USE RESTRICTION" text, found reproduced identically in three independent places:

- <https://raw.githubusercontent.com/tinkerator/hershey/refs/heads/main/jhfdata/README.md>
- <https://raw.githubusercontent.com/kamalmostafa/hershey-fonts/master/COPYING>
- <https://emergent.unpythonic.net/software/hershey>

> This distribution of the Hershey Fonts may be used by anyone for any purpose, commercial or
> otherwise, providing that:
> 1. The following acknowledgements must be distributed with the font data: — The Hershey Fonts were
>    originally created by Dr. A. V. Hershey while working at the U. S. National Bureau of Standards.
>    — The format of the Font data in this distribution was originally created by James Hurt,
>    Cognition, Inc., 900 Technology Park Drive, Billerica, MA 01821.
> 2. The font data in this distribution may be converted into any other format **EXCEPT** the format
>    distributed by the U.S. NTIS (which organization holds the rights to the distribution and use of
>    the font data in that particular format).

**Verdict: usable.** Both conditions are trivial — a credits comment, and don't emit NTIS's
`"xxx yyy:"` format (which nobody would want). Commercial use explicitly permitted.

Two caveats:

- **No SPDX identifier exists.** I downloaded the full SPDX licence list
  (<https://github.com/spdx/license-list-data>, `json/licenses.json`) and searched: **zero** matches
  for "Hershey". You cannot tag it cleanly; you include the notice verbatim. Fedora documents the
  text at <https://fedoraproject.org/wiki/Licensing:HersheyFontLicense> but that page does **not**
  state a free/non-free classification — *could not confirm* Fedora's formal status.
- The underlying work is a US federal government work, and 17 U.S.C. § 105
  (<https://www.law.cornell.edu/uscode/text/17/105>) says "Copyright protection under this title is
  not available for any work of the United States Government". The restriction attaches to James
  Hurt's *distribution format*, not the letterforms. Complying costs one comment line, so comply.
  (Minor discrepancy: the notice says NBS; historical sources place Hershey at the Naval Weapons
  Laboratory. Federal either way.)

### Machine-readable data — VERIFIED, working

Two routes, both tested:

- **`.jhf` source** — e.g. <https://github.com/kamalmostafa/hershey-fonts> (`futural.jhf`, the
  "Sans 1-stroke"/Simplex face, 3.5 KB for the whole ASCII set). I wrote a ~30-line Python parser and
  decoded all 26 capitals successfully. Cleanest provenance.
- **npm `hersheytext@2.0.0`** — MIT, <https://github.com/techninja/hersheytextjs>. Ships
  `hersheytext.json` (477 KB, 23 faces) where each glyph is an SVG `d` string and **each `M` begins a
  new stroke**. Capital B is
  `M4,1 L4,22  M4,1 L13,1 16,2 …  M4,11 L13,11 16,12 …` — three subpaths, ordered, direction
  preserved. Drop-in for `<path d>`.

*Provenance caveat:* `hersheytext` ports data bundled with Evil Mad Scientist's Hershey Text Inkscape
extension, whose **code is GPL-2.0-or-later** (header read at
<https://gitlab.com/inkscape/extensions/-/raw/master/hershey.py>), relicensed MIT by the packager.
The historical Hershey *data* is not GPL, so this is defensible — but for unambiguous provenance,
parse `.jhf` directly and carry the Hershey acknowledgement.

### 26-capital audit: are the letterforms usable for teaching? — VERIFIED

Letterforms: yes. Hershey Simplex capitals are monoline sans-serif with a pointed-apex A and straight
sides — essentially a school-print capital. Suitable.

Stroke order: **mostly, but not blindly.** I audited all 26 against Zaner-Bloser's published
manuscript stroke descriptions (extracted from
<https://www.zaner-bloser.com/sites/default/files/texas/RG0123N_download_strokes.pdf>; same chart
mirrored at
<https://cdnsm5-ss7.sharpschool.com/userfiles/servers/server_92164/file/general%201/zaner-bloserhandwritingmanuscript.pdf>).

| Outcome | Count | Letters |
|---|---|---|
| Correct order **and** direction, usable verbatim | **18** | A C D E F H I J K L O P Q R S T U X |
| One stroke drawn backwards — reverse the point array | 5 | G M N V W |
| Stroke order wrong — reorder the array | 1 | Z |
| Small structural edit | 2 | B, Y |

Representative agreements:

- **A** — Hershey `(9,1)→(1,22)`, `(9,1)→(17,22)`, `(4,15)→(14,15)`. ZB: *"Slant left. Lift. Slant
  right. Lift. Slide right."* Exact match.
- **K** — Hershey draws the upper diagonal *inward* from top-right `(18,1)→(4,15)`, then the leg
  outward. ZB: *"Pull down straight. Lift. Slant left. Slant right."* Exact match — genuinely
  surprising, and easy to get wrong by hand.

The failures, all mechanical:

- **M** stroke 3 is `(20,1)→(12,22)`; ZB says *"Slant up"*. Reverse.
- **N** stroke 3 `(18,1)→(18,22)`; ZB says *"Push up straight"*. Reverse.
- **V** stroke 2, **W** strokes 2 and 4 — same up-diagonal defect. Reverse.
- **G** bar drawn `(13,14)→(18,14)`; ZB says *"slide left"*. Reverse.
- **Z** strokes are `[diagonal, top bar, bottom bar]`; ZB is *"Slide right. Slant left. Slide right."*
  Reorder to `[2,1,3]`.
- **B** top bowl ends at `(13,11)` instead of returning to the stem at `(4,11)`. Append one point.
- **Y** merges left diagonal + stem into one stroke; ZB wants three. Split and reorder.

**One letterform decision, not an error:** Hershey gives a **bare capital I** and a **J with no top
bar**. Zaner-Bloser (US) bars both. *Could not confirm* a citable UK source prescribing either.

Two practical caveats:

- **Faceting.** Hershey curves are polylines. Median segment on the curved capitals is 2.83 units
  against a 21-unit cap height — at 60 mm tall that is roughly **0.3–0.5 mm** deviation from the true
  arc. Invisible under a thick grey trace stroke; slightly polygonal as a thin outline. Fixable with
  `stroke-linejoin="round"` plus a fat stroke, or a ~15-line Catmull-Rom smoother.
- **Digits are worse than capitals.** 9 of 10 have curves. **7** has the same diagonal-first bug as
  Z; **5** is one continuous stroke where schools teach two (body first, hat last). 1 and 4 have
  UK/US letterform variants.

---

## 3. KanjiVG's Latin capitals

**I originally reported, wrongly, that no Latin equivalent of KanjiVG exists. That was wrong, and the
correction is that KanjiVG *itself* carries the Latin alphabet.** Since this is the claim that most
needs to be right, here is exactly how I confirmed it.

### How I verified coverage — VERIFIED

1. I fetched `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/00041.svg` (U+0041 = "A")
   and read the whole file. It contains:

   ```xml
   <g id="kvg:00041" kvg:element="A">
     <path id="kvg:00041-s1" d="M54.46,14.41c-8.67,19.8-31.28,70.81-34.46,78.47"/>
     <path id="kvg:00041-s2" d="M54.46,14.41c5.06,11.27,30.2,68.64,34.54,78.47"/>
     <path id="kvg:00041-s3" d="M32.18,66.14c12.28,0,33.91,0,44.02,0"/>
   </g>
   <g id="kvg:StrokeNumbers_00041" style="font-size:8;fill:#808080">
     <text transform="matrix(1 0 0 1 45.37 18.35)">1</text>
     <text transform="matrix(1 0 0 1 61.92 19.28)">2</text>
     <text transform="matrix(1 0 0 1 39.76 61.19)">3</text>
   </g>
   ```

   `kvg:element="A"`, three ordered stroke paths (apex→bottom-left, apex→bottom-right, crossbar
   left→right), plus a `StrokeNumbers` group with positioned numerals. Canonical teaching order.

2. I then looped codepoints 65–90 (`00041`–`0005a`), downloaded each, and checked for a 404 marker.
   Result: **26 / 26 present.** No misses.

3. Spot-checked beyond capitals: `00030` ("0"), `00031` ("1"), `00061` ("a"), `00067` ("g") — all
   present. So digits and lowercase exist too.

Why my earlier keyword search missed it: the Latin glyphs are filed under Unicode codepoints inside a
repository whose name and description mention only kanji. No search for "latin stroke order" or
"alphabet stroke order" could ever surface them. I inferred absence from keyword absence — a
methodological error worth recording.

### Licence — VERIFIED, and it is viral

Per-file header, read verbatim in `00041.svg`:

> Copyright (C) 2009/2010/2011 Ulrich Apel.
> This work is distributed under the conditions of the Creative Commons **Attribution-Share Alike 3.0**
> Licence… Under the following conditions:
> * **Attribution.** You must attribute the work by stating your use of KanjiVG in your own copyright
>   header and linking to KanjiVG's website (http://kanjivg.tagaini.net)
> * **Share Alike.** If you alter, transform, or build upon this work, you may distribute the
>   resulting work only under the same or similar license to this one.

Full text: <https://github.com/KanjiVG/kanjivg/blob/master/COPYING>. Project site:
<https://kanjivg.tagaini.net/>.

**This is the meaningful difference the brief asked about.** CC BY-SA 3.0's share-alike clause is
viral over derivatives. If you build your stroke dataset *from* these paths, your dataset must ship
under CC BY-SA 3.0 (or compatible), plus attribution in your copyright header and a link to KanjiVG.
That is a real constraint, not a formality — quite different from OFL, MIT, or the Hershey
attribution-only notice.

### 26-capital audit — VERIFIED

I parsed all 26 SVGs and compared stroke counts and endpoint directions against Zaner-Bloser:

**24 / 26 match the ZB stroke decomposition exactly.**

The two misses are **I** (1 stroke, bare vertical vs ZB's 3-stroke barred I) and **J** (1 stroke, no
top bar vs ZB's 2). Notably these resolve in the **UK** direction, not the US one.

Quality highlights versus Hershey:

- **Z** is correct: top bar `(27,17)→(84,17)`, diagonal `(84,17)→(24,91)`, bottom bar `(25,91)→(87,91)`.
  Hershey gets this wrong.
- **Y** correctly decomposes into 3 strokes. Hershey and `letterpaths` both merge it.
- **X** stroke 1 is `(27,15)→(86,93)` — top-left to bottom-right first, matching ZB's *"Slant right"*.
- **B/D/P/R** are stem-then-bowl; **C/G/S** start top-right and run anticlockwise; **E** is stem plus
  three bars.

The same defect Hershey has:

- **M** stroke 3 `(89,16)→(54,92)` — downward where ZB says *"slant up"*.
- **N** stroke 3 `(80,16)→(80,93)` — downward where ZB says *"push up straight"*.
- **V** stroke 2 and **W** strokes 2, 4 — same up-diagonal defect.

**Cross-validated finding worth trusting:** Hershey (1967, US Navy plotter data) and KanjiVG (2009–11,
Japanese kanji project) *independently* draw M, N, V and W's up-diagonals downward. Two unrelated
efforts four decades apart made the same choice, because both follow "everything top-to-bottom". This
is a systematic artefact of digitising convention, not a bug in either, and it is the one thing you
must fix in whatever you adopt.

Other caveats: the canvas is a 109×109 full-width square (CJK metrics, not Latin sidebearings); the
**lowercase is typographic, not handwriting** — I did not verify this glyph-by-glyph, but it is
consistent with the design intent, so treat KanjiVG as an **uppercase-only** proposition and check the
lowercase yourself if you ever want it.

---

## 4. `letterpaths`

### What it is and licence — VERIFIED

- npm: <https://www.npmjs.com/package/letterpaths> — `letterpaths@1.0.2`, published 2026-06-06,
  versions `0.1.0, 1.0.0, 1.0.1, 1.0.2`.
- Repo: <https://github.com/RobinL/letterpaths> — created 2026-04-03, last updated 2026-09-08.
- **Licence: MIT.** I read `LICENSE` on GitHub: *"MIT License / Copyright (c) 2026 Robin Linacre"*.
  GitHub's own API reports `licenseInfo.key = "mit"`.

**Packaging caveat worth flagging:** the published npm tarball contains only
`README.md`, `package.json` and `dist/`. It ships **no LICENSE file** and its `package.json` has **no
`repository` field** — only `"license": "MIT"`. The MIT grant is clear from the repo, but if you
vendor from npm you should copy the LICENSE text across yourself.

### What the data actually is — VERIFIED by loading the published bundle

I required `dist/index.cjs` in Node and introspected it.

- `printLetters` is an array of **52** entries — `abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ`.
  **No digits** (confirmed by regex over the char list).
- `listAvailableLetters()` returns 104 entries (print plus cursive/pre-cursive variants).
- Each entry: `{ schemaVersion, glyph: {char, case, style, name}, guides: {xHeight, baseline,
  leftSidebearing, rightSidebearing}, strokes: [...] }`.
- Each stroke: `{ kind, phase, segment, curves: [{p0, p1, p2, p3, segment}, ...] }` — an **ordered
  chain of cubic Béziers**, where `p0` of the first curve is where the pen lands.

So: **yes to centrelines, yes to stroke order, yes to direction.** It is genuinely the right data
model, and the only one of the three that is a real library rather than a data dump. The exported
types confirm a formation-annotation API: `DrawOrderNumberAnnotation`, `StartArrowAnnotation`,
`MidpointArrowAnnotation`, `DirectionalDashAnnotation`, `TurningPointAnnotation`, with
`compileFormationAnnotations(path: PreparedTracingPath, options?)`. (My direct call errored because it
takes a `PreparedTracingPath` from `compileTracingPath`, not a raw letter object — the API is real, I
simply passed the wrong shape.)

Lowercase `a` print starts at `(732.6, 293.8)`, the top-right of the bowl, running anticlockwise, with
the stem drawn after — i.e. bowl-first, the school order, and single-storey. Better than Hershey,
which draws those stem-first.

### Is it usable as a source for our purpose? — Partly. VERIFIED measurement

**Its capitals use a continuous-pen model that does not match a numbered-stroke exercise.** I compared
all 26 capital stroke counts against Zaner-Bloser:

**Only 15 / 26 match. 11 / 26 have *fewer* strokes** — A(2), B(2), K(2), L(1), M(1), N(1), R(2), V(1),
W(1), Y(2), Z(1).

Concretely: **M, N, V, W, L and Z are each a single unbroken stroke.** Capital A is 2 strokes — an
up-over-down inverted V (`(314,905)→(967,905)`, baseline to baseline) plus the crossbar — not ZB's
"slant left, lift, slant right, lift, slide right".

For an exercise built on numbered strokes, that is a genuine mismatch: **you cannot number a one-stroke
M.** Adopting it means re-authoring 11 capitals, not the small handful it might first appear.

Also: **no digits**, and **provenance is undocumented** — glyph names read `"traced upper A"` /
`"template upper A"` with no statement anywhere of what was traced. The MIT grant is clear and from a
named author, but if the geometry was traced from a proprietary school font that is an unresolved
upstream question. *Could not confirm* the provenance; worth an email to the author before relying on
it commercially. Single-author project, so bus factor 1.

---

## 5. Recommendation

**Author the data by hand, using KanjiVG's capital decomposition as a stroke-order *reference* rather
than as a data *source*.**

Effort is unchanged from a cold start (5–8 h for 26 capitals — see §7), but the risk drops sharply,
because you now have three independent datasets that agree on the decomposition and you can check
yourself against all of them instead of guessing.

### Why "reference not source" keeps the licence clean

The distinction rests on the difference between a **fact** and its **expression**.

- **The fact**: "capital B is written as a downstroke, then a top bowl, then a bottom bowl" — or
  "capital Z runs top bar, diagonal, bottom bar". These are facts about how handwriting is taught.
  They are not anyone's creative expression; Ulrich Apel did not invent them, and KanjiVG is simply
  one place they are written down. Reading a dataset to learn a fact and then writing your own
  coordinates is not creating a derivative work.
- **The expression**: KanjiVG's actual path data —
  `M54.46,14.41c-8.67,19.8-31.28,70.81-34.46,78.47`. Those specific Bézier control points are the
  authored artefact. Copying, transforming, rescaling or re-fitting them **is** creating a derivative
  work, and CC BY-SA 3.0's share-alike clause then requires your derived stroke data to ship under
  CC BY-SA 3.0, with attribution in your copyright header and a link to kanjivg.tagaini.net.

In practice the rule is: **look at KanjiVG to decide how many strokes a letter has and in what order
and direction; never paste, scale or trace its coordinates.** Author your geometry from your own
construction (or from Hershey, whose licence is attribution-only and permits any reuse). If in doubt
about a specific letter, the safe test is: could you have arrived at this stroke list from the
Zaner-Bloser wording alone? For capitals, essentially always yes — ZB's descriptions are prose, and
KanjiVG agrees with them 24/26.

**Caveat: I am not a lawyer, and this is the reasoning, not legal advice.** The fact/expression line
is well-established in principle but the safe operational margin is what matters here. If you want
zero exposure, use ZB's prose descriptions as your only reference and treat KanjiVG purely as a
sanity check you never copy from.

### Alternatives, ranked

1. **Vendor KanjiVG's 26 capital SVGs directly** (~2 h). Fastest path to correct data, numbers
   included, 24/26 right. Cost: attribution plus share-alike on your derived stroke data. Only viable
   if you're content for that data to be CC BY-SA. Uppercase-only (its lowercase is typographic).
2. **Seed from Hershey and correct** (~2–4 h). Attribution-only licence, no share-alike. 18/26
   verbatim, 5 stroke reversals, 1 reorder, 2 structural edits. Includes digits. Accepts ~0.4 mm
   faceting or a smoothing pass.
3. **`letterpaths`** (MIT) if you later want tracing/animation interactions — the only real library
   here. Re-author the 11 merged capitals first; no digits; provenance unresolved.

Whichever you pick, **fix the M/N/V/W up-diagonal direction** — it is wrong in both Hershey and
KanjiVG (§3).

---

## 6. Proposed data format

Designed to fit the existing `Handwriting` component, which already renders SVG on a three-zone rule
(`zone = ruleHeight/3`, baseline at `2*zone`). A glyph box with cap-line `y=0` and baseline `y=100`
maps in with a single `scale = (2*zone)/100`. Lowercase later adds `y=50` (midline) and `y=150`
(descender) without changing the format.

**This type-checks clean under `--strict` with the project's own TypeScript**
(`./node_modules/.bin/tsc --noEmit --strict`, exit 0). The format is proven, not hypothetical.

```ts
export type Vec = readonly [number, number];

export interface FormationArrow {
  readonly at: Vec;    // point on the stroke where the arrowhead sits
  readonly dir: Vec;   // unit vector, direction of travel
}

export interface FormationStroke {
  /**
   * SVG path data in the glyph box. MUST be a single open subpath beginning
   * with `M` and MUST NOT contain `Z` - the direction of travel is the content,
   * and a closed path throws away the start point.
   */
  readonly d: string;
  readonly start: Vec;                         // numbered start dot goes here
  readonly end: Vec;
  readonly arrows: readonly FormationArrow[];  // precomputed
  readonly hint: string;                       // teacher wording + aria-label
}

export interface LetterFormation {
  readonly char: string;
  readonly advance: number;                    // glyph-box units
  readonly strokes: readonly FormationStroke[];
}
```

Three deliberate choices:

- **Never `Z`.** A closed path discards the start point, which is the entire pedagogical content.
  Enforce this in a unit test.
- **Arrows precomputed, not derived.** `getPointAtLength` needs a live DOM node; this has to work in
  a print path and in tests.
- **Stroke order is array order.** No `index` field to drift out of sync.

### Worked example: capital A

```ts
export const CAPITAL_A: LetterFormation = {
  char: 'A',
  advance: 70,
  strokes: [
    { d: 'M 35 0 L 0 100',  start: [35, 0],  end: [0, 100],
      arrows: [{ at: [17.7, 49.5], dir: [-0.33, 0.944] }],
      hint: 'Start at the top. Slide down to the left.' },
    { d: 'M 35 0 L 70 100', start: [35, 0],  end: [70, 100],
      arrows: [{ at: [52.3, 49.5], dir: [0.33, 0.944] }],
      hint: 'Back to the top. Slide down to the right.' },
    { d: 'M 11 68 L 59 68', start: [11, 68], end: [59, 68],
      arrows: [{ at: [34.8, 68], dir: [1, 0] }],
      hint: 'Across the middle.' },
  ],
};
```

### Worked example: capital B

```ts
export const CAPITAL_B: LetterFormation = {
  char: 'B',
  advance: 66,
  strokes: [
    { d: 'M 8 0 L 8 100', start: [8, 0], end: [8, 100],
      arrows: [{ at: [8, 49.5], dir: [0, 1] }],
      hint: 'Start at the top. Pull straight down.' },
    { d: 'M 8 0 L 34 0 C 50 0 58 10 58 25 C 58 40 50 50 34 50 L 8 50',
      start: [8, 0], end: [8, 50],
      arrows: [{ at: [58, 24.8], dir: [0, 1] }, { at: [10.7, 50], dir: [-1, 0] }],
      hint: 'Back to the top. Round the big bump and back to the line.' },
    { d: 'M 8 50 L 38 50 C 56 50 64 61 64 75 C 64 89 56 100 38 100 L 8 100',
      start: [8, 50], end: [8, 100],
      arrows: [{ at: [64, 75], dir: [0, 1] }, { at: [10.8, 100], dir: [-1, 0] }],
      hint: 'Round the second bump, down to the bottom line.' },
  ],
};
```

I rasterised both to ASCII to confirm the coordinates actually draw an A and a B with start dots in
the right places — they do. B's `advance` is 66 rather than 62 because the lower bowl clipped at 62,
which is exactly the kind of thing only rendering catches, and why the format carries an explicit
advance. The arrow arithmetic was verified too: B's top-bowl 50%-along arrow lands at `(58, 24.8)`
pointing `(0, 1)` — the outer bulge, pointing down, where a teacher would draw it.

---

## 7. Effort estimate

### Uppercase — 26 letters, ~61 strokes (primary)

| Route | Effort |
|---|---|
| Hand-author, using KanjiVG/ZB as reference (**recommended**) | **5–8 h** |
| Seed from Hershey and correct | **2–4 h** |
| Vendor KanjiVG directly (accepts CC BY-SA) | **~2 h** |

Hand-authoring breaks down as 15 straight-line letters at ~5 min each, 11 curved at ~15–20 min each.

**Capitals are substantially cheaper than lowercase — confirmed with numbers.** Counting glyphs whose
strokes are all straight segments:

| | Pure straight-line | Curved |
|---|---|---|
| **Uppercase** | **15 / 26** — A E F H I K L M N T V W X Y Z | 11 — B C D G J O P Q R S U |
| Lowercase | **6 / 26** — k l v w x z | 20 |
| Digits | 1 / 10 — 7 | 9 |

The expectation that A E F H I K L M N T V W X Y Z are pure straight lines is exactly right, all
fifteen. Capitals also average 2.3 strokes, most being 2-point lines — often four numbers per stroke.

### Digits — 10 glyphs: 2–3 h

Proportionally the worst case (9/10 curved). Hershey's 7 and 5 need fixing; 1 and 4 have UK/US
variants. Note `letterpaths` has no digits at all.

### Lowercase — 26 letters: 8–14 h (later phase)

Only 6 are straight-line, and you must add x-height/ascender/descender zoning. Hershey gives the
right single-storey `a` and `g` letterforms but draws `a`, `d`, `g`, `q` **stem-first** where schools
teach bowl-first — more reordering than capitals needed. (`letterpaths` gets these right.)

### Renderer component — one-off, shared: 3–5 h

Start dots, numbered badges, arrowheads, progressive reveal (stroke 1 → 1+2 → all), print styling,
config bar.

---

## 8. UK / US stroke-order conventions

### The UK has no national standard — VERIFIED

- The National Curriculum English programmes of study
  (<https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study/national-curriculum-in-england-english-programmes-of-study>)
  requires only that Year 1 pupils *"form capital letters"* and Year 2 *"write capital letters and
  digits of the correct size, orientation and relationship to one another"*. It prescribes **no
  stroke order or formation sequence**. Note it specifies *"in the correct direction, starting and
  finishing in the right place"* for **lower-case only** — capitals get no directional requirement.
- The National Handwriting Association
  (<https://nha-handwriting.org.uk/handwriting/help-for-teachers/handwriting-in-the-national-curriculum-key-stages-1-and-2/>)
  likewise prescribes no stroke order; it recommends a font style (Sassoon-type, no lead-in strokes)
  rather than a sequence.

**Practical consequence: ask the school which scheme it uses.** Nelson, Penpals, Letter-join, Twinkl
and Teach Handwriting are the common UK ones. It is a school-level choice and a one-email answer that
removes all ambiguity. In its absence, use **Zaner-Bloser's manuscript stroke descriptions** as the
concrete spec — published, free to read, described in plain words.

### Are capitals more standardised than lowercase? — Confirmed, with evidence

Yes. Capitals converge because they are almost all "start at the top, work top-to-bottom and
left-to-right". The evidence is not assertion but measurement: **three unrelated datasets independently
agree with an American teaching scheme on capitals.**

| Source | Origin | Capitals matching ZB decomposition |
|---|---|---|
| KanjiVG | Japanese kanji project, 2009–11 | **24 / 26** |
| Hershey | US Navy plotter data, 1967 | 18 / 26 verbatim (+5 reversals, +1 reorder = 24 recoverable) |
| `letterpaths` | UK continuous-pen model, 2026 | 15 / 26 |

Lowercase would not survive that test — the three disagree far more (Hershey draws `a`/`d`/`g`/`q`
stem-first, `letterpaths` bowl-first; KanjiVG's lowercase is typographic rather than handwritten).

### The divergences that do exist for capitals

1. **Barred vs bare I and J** — the only real letterform split. ZB (US) bars both; Hershey and
   KanjiVG both give the bare forms. *Could not confirm* a citable UK position, but both non-US
   sources landing on bare is suggestive.
2. **M / N / W** — whether the up-diagonal is lifted or pushed up continuously. This is also where
   the systematic digitising defect lives (§3).
3. **T** — down-then-across vs across-then-down. ZB says *"Pull down straight. Lift. Slide right."*
   (vertical first) and Hershey agrees; KanjiVG draws the crossbar first. Both are legitimate; pick
   one and be consistent.
4. **X** — which diagonal comes first. ZB and KanjiVG say top-left→bottom-right first;
   `letterpaths` reverses it.

---

## Confidence summary

**VERIFIED — I read the primary source or ran the analysis myself:**
the Hershey licence text and its absence from SPDX; the OpenType `glyf` spec's lack of any
stroke-order field; the full 26-letter Hershey-vs-Zaner-Bloser capital audit; the Zaner-Bloser stroke
descriptions; KanjiVG's 26/26 Latin capital coverage, its per-file CC BY-SA 3.0 header, and its
24/26 capital audit; `letterpaths`' MIT licence, 52-glyph coverage, Bézier stroke structure, absent
digits, and 15/26 capital audit; the Edu AU VIC WA NT Arrows font's internal contour structure via
fontTools and its OFL text; `hersheytext`'s MIT licence and stroke-preserving JSON; the UK National
Curriculum and NHA texts; the faceting arithmetic; the data format type-checking.

**INFERRED:**
that Hershey's 18/26 agreement with teaching order is coincidence rather than intent (the systematic
M/N/V/W defect and the Z ordering strongly support this, but Hershey left no statement of intent);
that KanjiVG's lowercase is typographic rather than handwriting (consistent with design intent, not
verified glyph-by-glyph); that `letterpaths`' geometry is hand-authored.

**COULD NOT CONFIRM:**
Fedora's formal free/non-free classification of the Hershey licence; any citable UK source
prescribing barred vs bare capital I and J; the exact per-letter capital sequences of the UK
commercial schemes (Nelson, Letter-join, Penpals — all paywalled); `letterpaths`' data provenance
(what, if anything, was traced).

**Repository status:** no files in `/Users/doug/src/puzzle-page` were created or modified. All work
was done in the scratchpad. Note that `git status` shows concurrent edits (`Handwriting/`,
`Matching/`, `WordSearch/`, `ColourBySightWord/`, `preview.html`) that appeared during this research
and are **not** mine.
