# Chess Puzzle Book Generator

Generate printable PDF chess puzzle books from PGN or FEN files. Upload a file, customize the layout and colors, and download a ready-to-print booklet of chess diagrams.

## Features

- Parses **PGN** files (`[FEN "..."]` tags) or plain **FEN** lists (one position per line)
- Renders each position as a chess diagram with rank/file coordinates and piece labels
- **1, 2, 4, or 8 boards per page** — auto-scales board size to fill the page
- **A4 or A5** page size
- Custom **board square colors** (dark/light) with built-in presets and color pickers
- Custom **background color** and **header/footer background color**
- Custom **font color** for piece glyphs, board labels, and page header/footer
- Per-page **header and footer text** with automatic page numbering
- **Range-based header/footer rules** — set different text for page ranges (e.g. page 1–5: "Opening Puzzles", page 6–10: "Endgame Puzzles")
- Configurable **answer-line count** per board (blank lines for students to write moves)
- **Live preview** in the browser before generating the PDF

## Tech Stack

- **Backend**: Laravel 11 (PHP 8.2), [barryvdh/laravel-dompdf](https://github.com/barryvdh/laravel-dompdf) for PDF rendering
- **Frontend**: React 18 + Vite (via `laravel-vite-plugin`)

## Project Structure

```
chess_base/
└── laravel/
    └── chess_app/   Laravel app (backend API + React frontend)
```

## Setup

```bash
cd laravel/chess_app
composer install
npm install
cp .env.example .env
php artisan key:generate
```

## Running Locally

```bash
# Terminal 1 — Laravel server
php artisan serve

# Terminal 2 — Vite dev server
npm run dev
```

Open `http://localhost:8000`.

For production, build the frontend assets first:

```bash
npm run build
php artisan serve
```

## API

### `POST /api/fen/book`

Accepts `multipart/form-data`. Returns a streamed PDF file (`chess_book.pdf`).

| Field | Type | Description |
|---|---|---|
| `file` | file | PGN or FEN file **(required)** |
| `per_page` | int | Boards per page: `1`, `2`, `4`, or `8` (default `4`) |
| `page_size` | string | `A4` or `A5` (default `A4`) |
| `header` | string | Default page header text |
| `footer` | string | Default page footer text |
| `answer_count` | int | Answer-line segments below each board (0–10) |
| `dark_color` | hex | Dark square color (default `#769656`) |
| `light_color` | hex | Light square color (default `#eeeed2`) |
| `bg_color` | hex | Page background color (default `#ffffff`) |
| `hf_bg_color` | hex | Header/footer band background color (default `#ffffff`) |
| `font_color` | hex | Text color for pieces, labels, header/footer (default `#000000`) |
| `range_rules` | JSON | Array of `{from, to, header, footer}` objects for per-section text |

#### `range_rules` example

```json
[
  { "from": 1, "to": 5,  "header": "Opening Puzzles",  "footer": "Beginner" },
  { "from": 6, "to": 10, "header": "Endgame Puzzles",  "footer": "Advanced" }
]
```

Pages outside any rule fall back to the default `header` / `footer` values.

## Board Dimensions Reference

Approximate board sizes (square cell width × 8) at each layout:

| Layout | A4 cell | A4 board | A5 cell | A5 board |
|--------|---------|---------|---------|---------|
| 1 board/page | 82 px | 656 px | 58 px | 464 px |
| 2 boards/page | 82 px | 656 px | 58 px | 464 px |
| 4 boards/page | 39 px | 312 px | 27 px | 216 px |
| 8 boards/page | 27 px | 216 px | 19 px | 152 px |

*(Actual values are computed at render time and may vary by ±1 px due to rounding.)*
