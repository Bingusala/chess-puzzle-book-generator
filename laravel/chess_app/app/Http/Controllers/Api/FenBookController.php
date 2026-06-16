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
            'hf_bg_color'  => ['nullable', 'regex:/^#[0-9a-fA-F]{6}$/'],
            'page_size'    => 'nullable|in:A4,A5',
            'range_rules'  => 'nullable|string',
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

        $perPage       = (int)$request->input('per_page', 4);
        $pageSize      = $request->input('page_size', 'A4');
        $defaultHeader = trim($request->input('header', ''));
        $defaultFooter = trim($request->input('footer', ''));
        $rangeRules    = $this->parseRangeRules($request->input('range_rules'));

        $pages = [];
        foreach (array_chunk($positions, $perPage) as $chunk) {
            [$pageHeader, $pageFooter] = $this->resolveHeaderFooter(
                $chunk[0]['number'], $rangeRules, $defaultHeader, $defaultFooter
            );
            $pages[] = ['positions' => $chunk, 'header' => $pageHeader, 'footer' => $pageFooter];
        }

        $pdf = Pdf::loadView('pdf.book', [
            'pages'       => $pages,
            'answerCount' => max(0, (int)$request->input('answer_count', 1)),
            'perPage'     => $perPage,
            'darkColor'   => $request->input('dark_color',  '#6b8bc3'),
            'lightColor'  => $request->input('light_color', '#ffffff'),
            'bgColor'     => $request->input('bg_color',    '#ffffff'),
            'hfBgColor'   => $request->input('hf_bg_color', '#ffffff'),
            'pageSize'    => $pageSize,
        ])->setPaper(strtolower($pageSize), 'portrait');

        return $pdf->stream('chess_book.pdf');
    }

    private function parseRangeRules(?string $raw): array
    {
        if (!$raw) return [];
        $decoded = json_decode($raw, true);
        if (!is_array($decoded)) return [];

        $rules = [];
        foreach ($decoded as $r) {
            $from = (int)($r['from'] ?? 0);
            $to   = (int)($r['to'] ?? 0);
            if ($from > 0 && $to >= $from) {
                $rules[] = [
                    'from'   => $from,
                    'to'     => $to,
                    'header' => trim((string)($r['header'] ?? '')),
                    'footer' => trim((string)($r['footer'] ?? '')),
                ];
            }
        }
        return $rules;
    }

    private function resolveHeaderFooter(int $firstNumber, array $rangeRules, string $defaultHeader, string $defaultFooter): array
    {
        foreach ($rangeRules as $rule) {
            if ($firstNumber >= $rule['from'] && $firstNumber <= $rule['to']) {
                return [
                    $rule['header'] !== '' ? $rule['header'] : $defaultHeader,
                    $rule['footer'] !== '' ? $rule['footer'] : $defaultFooter,
                ];
            }
        }
        return [$defaultHeader, $defaultFooter];
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
