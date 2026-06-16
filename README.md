# Chess Puzzle Book Generator

Generate printable PDF chess puzzle books from PGN or FEN files. Upload a file, customize the layout, and download a ready-to-print booklet of diagrams.

## Features

- Parses PGN files (`[FEN "..."]` tags) or plain FEN lists (one position per line)
- Renders each position as a chess diagram with rank/file coordinates
- Configurable boards per page (1, 2, or 4)
- Custom board colors (presets + color pickers) with a live preview
- Custom header, footer, and answer-line count per diagram
- Custom output PDF filename

## Tech Stack

- **Backend**: Laravel 11 (PHP 8.2), [barryvdh/laravel-dompdf](https://github.com/barryvdh/laravel-dompdf) for PDF rendering
- **Frontend**: React 18 + Vite (via `laravel-vite-plugin`)

## Project Structure

```
laravel/chess_app/   Laravel app (backend API + React frontend)
```

## Setup

```bash
cd laravel/chess_app
composer install
npm install
cp .env.example .env
php artisan key:generate
```

## Running locally

```bash
# Terminal 1 — Laravel server
php artisan serve

# Terminal 2 — Vite dev server
npm run dev
```

Then open `http://localhost:8000`.

## API

`POST /api/fen/book` — accepts a multipart form with:

| Field | Description |
|---|---|
| `file` | PGN or FEN file (required) |
| `header` / `footer` | Optional page header/footer text |
| `answer_count` | Number of answer-line segments per board (0–10) |
| `per_page` | Boards per page: `1`, `2`, or `4` |
| `dark_color` / `light_color` | Hex colors for board squares |

Returns a streamed PDF.
