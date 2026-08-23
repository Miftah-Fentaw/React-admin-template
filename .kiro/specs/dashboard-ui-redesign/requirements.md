# Requirements: Dashboard UI Redesign

## Introduction

The current Vantage Admin dashboard shows a generic e-commerce overview (KPI tiles, revenue chart, orders-per-day bar chart, recent orders, traffic sources, quick actions, activity feed). The goal is to update the dashboard layout and its supporting data to match a reference design that shows a richer, more visually distinct layout used by a childcare/education administration context — with a calendar widget, schedule section, program cards with imagery, messages panel, student list, and a stacked children-count chart.

All changes must stay within the existing architecture:
- UI renders data only from TanStack Query hooks
- Hooks call feature services
- Services call `apiClient`
- Mock handlers serve the data via MSW
- Styling uses only the existing CSS custom property tokens; new classes go in `pages.css`

---

## Glossary

| Term | Definition |
|---|---|
| KPI card | A compact metric tile showing a label, numeric value, percentage change badge, and a mini sparkline chart |
| Sparkline | A small inline area chart (no axes) embedded inside a KPI card showing trend over ~6 data points |
| Top Programs (donut) | A donut chart showing the share of enrollment across program categories, with total count in the center |
| Stacked area chart | An SVG chart rendering multiple overlapping filled series (Infant, Toddler, School Age) on one canvas |
| Program card | A card containing a cover image, program name, category, session details (session count, date range, time, price) |
| Calendar widget | A fully rendered monthly calendar grid (Sun–Sat headers, day cells, today highlighted, events dots) |
| Schedule item | An upcoming event entry showing a colored date badge, time, title, and age-group tag |
| Recent Activity | A time-ordered list of system events with an icon, title, short description, and timestamp |
| Messages panel | A list of recent staff/parent messages with avatar, sender, timestamp, and message preview |
| Student list table | A compact table of students with columns: Name, Parent, Contract End date, and action icons |

---

## Requirements

### Requirement 1: KPI Cards with Sparklines

**User Story:** As an admin, I want each KPI card to show a mini trend sparkline alongside the metric value and change badge, so that I can assess trajectory at a glance without opening a separate chart.

#### Acceptance Criteria

1. WHERE the dashboard KPI grid is rendered, WHEN the overview data loads successfully, THEN each KPI card SHALL display: a label, a large numeric value, a percentage-change badge (green for positive, red for negative), and a mini sparkline SVG to the right of the text content.
2. WHEN the sparkline data is unavailable or the series is empty, THEN the sparkline area SHALL be hidden and only the label, value, and change badge are shown.
3. WHEN the overview is loading, THEN each KPI slot SHALL display a skeleton placeholder that covers the label, value, and sparkline areas.
4. The KPI grid SHALL render three tiles: Students, Teachers, and Programs — each with its own series data and change percentage.
5. The sparkline SVG SHALL be a minimal area chart (no axes, no labels, no gridlines) drawn with `var(--chart-1)` (or the appropriate chart token per tile) and a semi-transparent gradient fill.
6. WHEN the viewport is ≤ 520 px wide, THEN the KPI grid SHALL collapse to a single column.

---

### Requirement 2: Top Programs Donut Chart

**User Story:** As an admin, I want to see a donut chart that breaks enrollment down by program category (Early Learning, Creative Arts, Physical Dev), so I can understand the distribution at a glance.

#### Acceptance Criteria

1. WHERE the "Top Programs" card is displayed, WHEN overview data loads, THEN the donut chart SHALL render three segments using `var(--chart-1)`, `var(--chart-2)`, `var(--chart-3)` respectively.
2. The center of the donut SHALL display the label "Total Programs" and the total program count as a large number.
3. Below the donut chart a legend SHALL list each category with its color swatch and percentage share.
4. WHEN data is loading, THEN a skeleton placeholder SHALL occupy the donut area.
5. WHEN data fails to load, THEN an inline `<ErrorState>` SHALL appear inside the card.

---

### Requirement 3: Total Children Stacked Area Chart

**User Story:** As an admin, I want to see the trend in total enrolled children broken down by age group (Infant, Toddler, School Age) over months, so I can spot enrollment patterns across age cohorts.

#### Acceptance Criteria

1. WHERE the "Total Children" card is displayed, WHEN overview data loads, THEN a stacked area chart SHALL render three series (Infant, Toddler, School Age) layered as filled areas over a shared time axis (monthly labels).
2. The card header SHALL show the total children count prominently and a "This Month" period label.
3. A legend row SHALL appear above or below the chart, showing a color swatch and label for each series.
4. Loading states for the stacked area chart MAY occur without a skeleton placeholder (no skeleton is required).
5. Each series SHALL use a distinct chart token color: Infant → `var(--chart-1)`, Toddler → `var(--chart-2)`, School Age → `var(--chart-3)`.

---

### Requirement 4: Program Cards with Cover Images

**User Story:** As an admin, I want to see cards for active programs with their cover image, so I can quickly identify programs without reading names.

#### Acceptance Criteria

1. WHERE the "Programs" section card is displayed, WHEN data loads, THEN at least two program cards SHALL be shown in a grid layout.
2. Each program card SHALL include: a cover image (falling back to a colored placeholder if the image fails to load), program name, category badge, age range label, a session count, date range, start time, and price.
3. The program card images SHALL be rendered with an accessible `alt` attribute set to the program name.
4. WHEN the image fails to load, THEN a muted-background placeholder with the first letter of the program name SHALL be displayed in its place.
5. WHEN data is loading, THEN skeleton placeholders SHALL fill each card slot.

---

### Requirement 5: Revenue Bar Chart with Period Toggle

**User Story:** As an admin, I want to see the revenue bar chart with a half-year period selector (1st Biannually / 2nd Biannually), so I can compare the two halves of the year.

#### Acceptance Criteria

1. WHERE the "Revenue" card is displayed, WHEN data loads, THEN a bar chart SHALL render monthly revenue bars.
2. The card header SHALL show the total annual revenue figure prominently.
3. A tab toggle ("1st Biannually" / "2nd Biannually") SHALL filter the visible data to the selected half of the year.
4. WHEN switching periods, THEN the bar chart SHALL update immediately to show only the relevant 6 months of data.
5. WHEN data is loading, THEN a skeleton placeholder SHALL occupy the chart area.

---

### Requirement 6: Messages Panel

**User Story:** As an admin, I want to see a messages panel on the dashboard so I can preview recent staff/parent messages without navigating away.

#### Acceptance Criteria

1. WHERE the "Messages" panel card is displayed, WHEN data loads, THEN a list of recent messages SHALL be shown, each entry displaying: sender avatar (initials fallback), sender name, relative timestamp, and a truncated message preview.
2. An "Add Message" button SHALL appear in the card header.
3. WHEN clicking "Add Message", THEN a toast notification SHALL appear confirming the action (placeholder — no actual form yet).
4. WHEN the message list is empty, THEN an `<EmptyState>` component SHALL be displayed.
5. WHEN data is loading, THEN skeleton rows SHALL occupy the message list area.

---

### Requirement 7: Student List Table

**User Story:** As an admin, I want a compact student list table on the dashboard so I can see recent students and quickly access their details.

#### Acceptance Criteria

1. WHERE the "Student List" section is displayed, WHEN data loads, THEN a table SHALL render with columns: Name, Parent, Contract End, and Actions.
2. The Actions column SHALL contain icon buttons for edit and delete actions (placeholder handlers that show a toast).
3. A search input SHALL appear in the card header and filter the displayed list client-side by student name or parent name.
4. A "See All" button SHALL appear in the card header, linking to the Users page (`/users`).
5. WHEN data is loading, THEN skeleton rows SHALL occupy the table area.
6. WHEN the filtered list is empty, THEN an `<EmptyState>` component SHALL be displayed.

---

### Requirement 8: Calendar Widget

**User Story:** As an admin, I want a monthly calendar widget in the right sidebar so I can see the current date and upcoming events at a glance.

#### Acceptance Criteria

1. WHERE the calendar widget is displayed in the right sidebar, THEN it SHALL render a full monthly grid (Sun–Sat columns, 6 rows) for the current month.
2. The calendar header SHALL display the current month and year (e.g. "June, 2026") with previous/next month navigation buttons.
3. WHEN navigating to a different month, THEN the grid SHALL update to show the correct days for that month.
4. Today's date SHALL be highlighted with a distinct filled circle using `var(--primary)` background.
5. Days from the previous/next month that fill the grid edges SHALL be displayed in a muted color.
6. Days that have scheduled events SHALL display a small dot indicator below the day number.

---

### Requirement 9: Schedule Section

**User Story:** As an admin, I want a schedule section below the calendar showing upcoming events this week, so I can see what's happening soon.

#### Acceptance Criteria

1. WHERE the schedule section is displayed, WHEN data loads, THEN a list of upcoming events SHALL be rendered, each showing: a colored date badge (day number + month abbreviation), event time, event title, and an age-group/category tag.
2. The section header SHALL include a "This Week" label.
3. Date badges SHALL use different accent colors per event to visually distinguish entries (use chart tokens).
4. WHEN no events are scheduled, THEN a short empty-state message SHALL be displayed.
5. WHEN data is loading, THEN skeleton rows SHALL fill the section.

---

### Requirement 10: Recent Activity Feed

**User Story:** As an admin, I want a recent activity feed in the right sidebar showing the latest system events with descriptions, so I can monitor workspace activity.

#### Acceptance Criteria

1. WHERE the "Recent Activity" section is displayed, WHEN data loads, THEN a list of activity events SHALL be shown, each displaying: a colored icon badge, event title (bold), description text, and a relative timestamp.
2. The section SHALL group events under a "Today" label for same-day events.
3. WHEN data is loading, THEN skeleton placeholders SHALL fill the activity list.
4. WHEN data fails to load, THEN an inline `<ErrorState>` SHALL be displayed.

---

### Requirement 11: Three-Column Dashboard Layout

**User Story:** As an admin, I want the dashboard to use a three-column layout with a content area, a charts/programs area, and a right sidebar for calendar/schedule/activity, so that all panels are visible without excessive scrolling.

#### Acceptance Criteria

1. WHEN the viewport is ≥ 1280 px wide, THEN the dashboard SHALL render in a three-column grid: left content column, center/main column, and a right sidebar (calendar + schedule + activity).
2. WHEN the viewport is between 900 px and 1280 px, THEN the layout SHALL collapse to two columns (main content + right sidebar hidden or stacked below).
3. WHEN the viewport is < 900 px, THEN all sections SHALL stack in a single column.
4. All new CSS classes SHALL follow the BEM-ish convention used in `pages.css` and use only CSS custom property tokens — no hardcoded hex values.

---

### Requirement 12: Mock API Data for New Sections

**User Story:** As a developer, I want the mock API to serve data for all new dashboard sections (KPI sparklines, programs, messages, students, schedule, activity) so that the dashboard is fully functional without a real backend.

#### Acceptance Criteria

1. The `GET /dashboard/overview` response SHALL include sparkline series data for each KPI (6 monthly data points per metric).
2. A new `GET /dashboard/programs` endpoint SHALL return a list of program objects with: id, name, category, ageRange, sessionCount, dateRange, startTime, price, and imageUrl.
3. A new `GET /dashboard/messages` endpoint SHALL return a list of message objects with: id, senderName, avatarInitials, timestamp, and preview text.
4. A new `GET /dashboard/schedule` endpoint SHALL return a list of schedule events with: id, date (ISO string), time, title, category, and colorToken.
5. All new endpoints SHALL return `401` IF the `Authorization` header is completely absent from the request.
6. All new endpoints SHALL apply an artificial latency via `latency()` consistent with existing handlers.
