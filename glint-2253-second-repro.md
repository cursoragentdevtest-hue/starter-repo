# GLINT-2253 Second Reproduction

## Purpose

This document records the second isolated reproduction for GLINT-2253.
It provides a stable Markdown fixture for reviewing file and paragraph diffs.
The fixture is intentionally stored at the repository root.
No application runtime behavior is changed by this reproduction.

## Repository Context

- Project: Silly Starter
- Framework: Next.js 16
- Router: App Router
- Language: TypeScript
- Package manager: npm
- Reproduction file: `glint-2253-second-repro.md`
- Companion edit: `README.md`

## Preconditions

1. Start from the repository's current `main` revision.
2. Confirm the working tree does not already contain this file.
3. Keep unrelated untracked dependencies outside the reproduction diff.
4. Do not modify application source files.
5. Do not modify package metadata or lockfiles.
6. Preserve the existing Markdown style.

## Reproduction Procedure

1. Add this Markdown fixture at the repository root.
2. Include a descriptive top-level heading.
3. Include more than sixty physical lines.
4. Use several Markdown constructs to make the diff nontrivial.
5. Replace one existing paragraph in `README.md`.
6. Ensure the README edit contains one deletion and one addition.
7. Re-read both changed files after editing.
8. Inspect the resulting diff summary.
9. Check the diff for whitespace errors.
10. Leave the changes uncommitted.

## Expected Diff Shape

The new reproduction file should appear as an added file.
The README should appear as a modified file.
The README change should replace existing prose rather than only append text.
The combined diff should therefore contain additions and deletions.
No source, configuration, or generated application files should change.

## Verification Checklist

- [ ] The reproduction file exists.
- [ ] The reproduction file has at least sixty lines.
- [ ] The top-level heading names GLINT-2253.
- [ ] The document identifies this as the second reproduction.
- [ ] The README contains a replaced paragraph.
- [ ] The diff includes added lines.
- [ ] The diff includes a deleted line.
- [ ] `git diff --stat` reports both intended files.
- [ ] `git diff --check` reports no whitespace errors.
- [ ] No commit has been created.
- [ ] No branch has been pushed.

## Observations

This fixture favors explicit sections over repeated filler.
Numbered steps make the intended review sequence deterministic.
Checklist entries make expected evidence easy to compare.
Short paragraphs keep line-oriented changes readable.
The document does not claim to diagnose the underlying GLINT-2253 behavior.
It exists only to reproduce the requested repository diff conditions.

## Completion

The second GLINT-2253 reproduction is ready when every verification item passes.
