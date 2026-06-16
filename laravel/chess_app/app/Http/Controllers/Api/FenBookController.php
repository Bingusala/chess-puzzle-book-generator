<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class FenBookController extends Controller
{
    private const SYMBOLS = [
        'K' => '♔', 'Q' => '♕', 'R' => '♖', 'B' => '♗', 'N' => '♘', 'P' => '♙',
        'k' => '♚', 'q' => '♛', 'r' => '♜', 'b' => '♝', 'n' => '♞', 'p' => '♟',
    ];

    public function create(Request $request)
    {
        $request->validate([
            'file'         => 'required|file|max:10240',
            'header'       => 'nullable|string|max:200',
            'footer'       => 'nullable|string|max:200',
            'answer_count' => 'nullable|integer|min:0|max:10',
            'per_page'     => 'nullable|integer|in:1,2,4,8',
            'dark_color'   => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'light_color'  => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'bg_color'     => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
        ]);

        $text = file_get_contents($request->file('file')->getRealPath());
        $text = mb_convert_encoding($text, 'UTF-8', 'UTF-8,ISO-8859-1');

        $fens = $this->parseFenLines($text);
        if (empty($fens)) {
            return response()->json(['error' => 'No valid FEN positions found in file'], 422);
        }

        $positions = [];
        foreach ($fens as $i => $fen) {
            $positions[] = [
                'number' => $i + 1,
                'board'  => $this->fenToBoard($fen),
                'side'   => $this->sideToMove($fen),
            ];
        }

        $perPage = (int)$request->input('per_page', 4);
        $pages   = array_chunk($positions, $perPage);

        $pdf = Pdf::loadView('pdf.book', [
            'pages'       => $pages,
            'header'      => trim($request->input('header', '')),
            'footer'      => trim($request->input('footer', '')),
            'answerCount' => max(0, (int)$request->input('answer_count', 1)),
            'perPage'     => $perPage,
            'darkColor'   => $request->input('dark_color',  '#6b8bc3'),
            'lightColor'  => $request->input('light_color', '#ffffff'),
            'bgColor'     => $request->input('bg_color',    '#ffffff'),
        ])->setPaper('a4', 'portrait');

        return $pdf->stream('chess_book.pdf');
    }

    private function parseFenLines(string $text): array
    {
        // Priority 1: PGN files — extract every [FEN "..."] tag value
        if (preg_match_all('/\[FEN\s+"([^"]+)"\]/i', $text, $matches)) {
            return array_values(array_filter($matches[1], fn($f) => $this->isValidFen($f)));
        }

        // Priority 2: plain FEN file — one position per line
        $fens = [];
        foreach (preg_split('/\r?\n/', $text) as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) continue;
            if ($this->isValidFen($line)) {
                $fens[] = $line;
            }
        }
        return $fens;
    }

    private function isValidFen(string $fen): bool
    {
        $placement = explode(' ', trim($fen))[0];
        return substr_count($placement, '/') === 7;
    }

    private function sideToMove(string $fen): string
    {
        $parts = explode(' ', $fen);
        return ($parts[1] ?? 'w') === 'b' ? 'b' : 'w';
    }

    private function fenToBoard(string $fen): array
    {
        $placement = explode(' ', $fen)[0];
        $ranks     = explode('/', $placement);

        $board = [];
        for ($r = 0; $r < 8; $r++) {
            $rank  = $ranks[$r] ?? '8';
            $cells = [];
            foreach (str_split($rank) as $ch) {
                if (ctype_digit($ch)) {
                    for ($i = 0; $i < (int)$ch; $i++) $cells[] = '';
                } else {
                    $cells[] = self::SYMBOLS[$ch] ?? '';
                }
            }
            while (count($cells) < 8) $cells[] = '';
            $board[] = array_slice($cells, 0, 8);
        }
        return $board;
    }
}
