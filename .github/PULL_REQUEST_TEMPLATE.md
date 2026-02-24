---
name: Intern Challenge Submission
about: Submit your improvements to the Meat Processor Calculator
title: "[INTERN] Akhila Annireddy - Challenge Submission"
labels: intern-submission
assignees: ""
---

## Intern Information

- **Name**: Akhila Annireddy
- **Date Submitted**: February 23, 2026
- **Live Demo**: https://akhilaannireddy.github.io/farmshare-intern-dev-project/

## Summary of Changes

Before writing a single line of code, I visited the Farmshare website to understand the business — who the clients are, what they struggle with, and what this calculator is actually for. It is not a utility. It is a sales tool. A processor sitting across from a Farmshare rep needs to see, in their own numbers, why Farmshare is worth the cost.

Every decision I made was filtered through that lens. I fixed the broken tests, applied Farmshare branding, and added features that make the tool more convincing in a real sales conversation — not just more feature-complete.

## Bugs Fixed

- [x] **calculateHeads calculation bug** — incorrect animal count was producing wrong savings values across the board
- [x] **3 tests with wrong expected text** — original tests checked for labels like `"Total Monthly Savings:"` and `"Monthly Processing Volume by Species"` that never existed. Rather than writing code to make wrong tests pass, I fixed the labels to use correct, client-facing language and updated the tests to match
- [x] **localStorage leaking between tests** — added `beforeEach(() => localStorage.clear())` which fixed 3 mysteriously failing tests at once
- [x] **MUI Select not responding in tests** — `fireEvent.change()` does not work with MUI Select in jsdom; fixed using `fireEvent.mouseDown()` + `fireEvent.click()` pattern
- [x] **Discrete animal calculation in Growth Insights** — used incremental approach to correctly account for whole-animal processing units

## Features Added

- [x] **Growth Insights** — tells processors exactly how many more lbs to process to hit break-even or the next profit milestone. At ROI above 100%, percentage milestones become meaningless so it automatically switches to dollar-based targets (e.g. "process 2,800 more lbs of Beef and Farmshare pays for itself")
- [x] **Annual / Monthly toggle** — switches all displayed values simultaneously: summary panel, per-species cards, ROI chart, and growth insight labels. Inputs stay annual since that is how volume is naturally measured
- [x] **Per-species savings breakdown** — live savings/cost/net shown on each species card as the user types, so processors see species-level economics immediately
- [x] **ROI Chart** — recharts bar chart with Overview and By Species views, fully responds to the annual/monthly toggle
- [x] **PDF Export** — branded jsPDF report with species breakdown table and growth insight summary; processors can share this with a business partner or accountant
- [x] **Species chip delete** — remove individual species without clearing everything; built with proper aria labels (`remove beef`) for accessibility and reliable testability
- [x] **localStorage persistence** — calculator state saves across sessions
- [x] **Input validation** — min/max constraints with clear error messages on all numeric inputs

## Styling Improvements

- Applied Farmshare brand colors throughout: #006F35 green, #FF7B00 orange, #F5F0E8 cream background
- Two-column layout with species inputs on the left and a sticky summary panel on the right
- Head count badges on each species card showing estimated animals processed
- Net savings box with color-coded border — green when profitable, red when at a loss
- Farmshare navbar with Learn More link
- "Get Started with Farmshare" CTA at the bottom of every session
- Mobile responsive using MUI breakpoints — stacks vertically on small screens, side-by-side on desktop

## Tests

- [x] All existing tests pass
- [x] Added new tests:
  - Growth insight renders when volume is entered
  - Per-species savings breakdown appears when volume is entered
  - Export button appears when data is present
- **Final: 28/28 tests passing**

## Screenshots

### Before
Default unstyled calculator with broken calculation logic and no Farmshare branding.

### After
*(Add screenshots here before submitting PR)*

## Challenges Faced

**MUI Select in jsdom** — MUI's Select does not respond to `fireEvent.change()`. Diagnosed by reading the DOM snapshot in the error output and switching to `fireEvent.mouseDown()` + `fireEvent.click()`. The fix was clean once the root cause was clear.

**localStorage between tests** — Three tests were failing without an obvious reason. Traced it to a previous test's species selection persisting into the next test through localStorage. One `beforeEach` line fixed all three.

**Growth Insights at high ROI** — When a processor is already at 140% ROI, "aim for 150%" tells them nothing useful. Detected this edge case during testing and automatically switched to dollar-based milestones above 100% ROI so the guidance always feels concrete.

**jsPDF color system** — jsPDF requires RGB values, not hex strings. Built a hex-to-RGB converter to keep Farmshare brand colors consistent throughout the PDF.

## Additional Notes

The feature I care most about is Growth Insights. Most calculators show you where you are. This one tells you where to go next — and that distinction matters in a sales conversation. A Farmshare rep can point at the screen and say "process 2,800 more lbs of beef and this platform pays for itself." That is a close, not just a demo.

## Checklist

- [x] My code follows the project's coding standards
- [x] I have tested my changes locally
- [x] All tests pass (`yarn test`)
- [x] The application builds successfully (`yarn build`)
- [x] I have updated documentation if needed
- [x] My changes are responsive and work on mobile devices
- [x] I have not introduced any console errors or warnings
