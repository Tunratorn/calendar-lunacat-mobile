# Lunacat Calendar Mobile UI

A modern flat mobile calendar prototype built with React, TypeScript, Vite, and Tailwind CSS.

## Stack

- **React 19** + **TypeScript** — component structure lives in `src/components/`
- **Vite** — dev server and build
- **Tailwind CSS v4** — utility-first styling, theme tokens defined in `src/index.css`

## Run

```
npm install
npm run dev
```

Open the printed local URL in a browser. `npm run build` produces a static production build in `dist/`.

## Project structure

- `src/App.tsx` — top-level state (selected day, filters, sheets) and layout
- `src/components/` — presentational pieces (calendar grid, agenda list, bottom sheets, nav)
- `src/hooks/useEvents.ts` — event state persisted to `localStorage`
- `src/lib/` — date formatting and category color helpers
- `src/data/mockEvents.ts` — seed events
- `legacy-static/` — the original static HTML/CSS/JS prototype, kept for reference

## Included

- Month calendar view
- Daily agenda rendered from mock data
- Live filtering by calendar category (via the hamburger menu)
- Event creation bottom sheet that adds events to the selected date
- Clickable event detail sheet with edit and delete
- Hamburger menu with calendar filters and reset action
- Profile sheet with mock account settings
- Mobile bottom navigation with Tasks and Stats mock views
- Smooth micro-interactions, sheet transitions, and reduced-motion support
- Responsive full-screen mobile layout

## Playable mock data steps

1. Click any date in the month grid to load that day's agenda.
2. Use the hamburger menu to filter by Work, Personal, or Focus.
3. Use the month arrows to move between months.
4. Click `Today` to jump back to July 8, 2026.
5. Click `+`, fill the event form, and save it.
6. The new event appears immediately and is saved in `localStorage`.
7. Click any agenda event to view its details, edit it, or delete it.
8. Open the hamburger menu to switch calendars or reset mock data.
9. Open the profile avatar to view mock account settings.
10. Tap `Tasks` or `Stats` in the bottom navigation to show presentation-ready mock panels.
