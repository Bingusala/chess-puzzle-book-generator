<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class PgnPdfController extends Controller
{
    public function convert(Request $request)
    {
        $request->validate(['file' => 'required|file|max:51200']);

        $text = file_get_contents($request->file('file')->getRealPath());
        $text = mb_convert_encoding($text, 'UTF-8', 'UTF-8,ISO-8859-1');

        $games = $this->splitGames($text);
        if (empty($games)) {
            return response()->json(['error' => 'No valid games found in the PGN file'], 422);
        }

        $parsed = array_map(fn($pgn) => $this->parseGame($pgn), $games);

        $pdf = Pdf::loadView('pdf.games', ['games' => $parsed])
            ->setPaper('a4', 'portrait');

        $filename = count($parsed) === 1
            ? ($parsed[0]['white'] . '_vs_' . $parsed[0]['black'] . '.pdf')
            : 'chess_games.pdf';
        $filename = preg_replace('/[^a-zA-Z0-9_\-.]/', '_', $filename);

        return $pdf->download($filename, ['X-Game-Count' => count($parsed)]);
    }

    private function splitGames(string $text): array
    {
        $text   = str_replace(["\r\n", "\r"], "\n", $text);
        $blocks = preg_split('/\n{2,}/', $text, -1, PREG_SPLIT_NO_EMPTY);

        $games   = [];
        $headers = '';
        $moves   = '';

        foreach ($blocks as $block) {
            $block = trim($block);
            if ($block === '') continue;

            if (str_starts_with($block, '[')) {
                if ($headers !== '' && $moves !== '') {
                    $games[]  = $headers . "\n\n" . $moves;
                    $headers  = $moves = '';
                }
                $headers .= ($headers ? "\n" : '') . $block;
            } else {
                $moves .= ($moves ? "\n" : '') . $block;
            }
        }
        if ($headers !== '') {
            $games[] = $headers . "\n\n" . $moves;
        }

        return array_filter($games);
    }

    private function parseGame(string $pgn): array
    {
        preg_match_all('/\[(\w+)\s+"([^"]*)"\]/', $pgn, $m, PREG_SET_ORDER);
        $h = [];
        foreach ($m as $match) $h[$match[1]] = $match[2];

        $moves    = $this->extractMoves($pgn);
        $pairs    = [];
        for ($i = 0; $i < count($moves); $i += 2) {
            $pairs[] = ['num' => intdiv($i, 2) + 1, 'white' => $moves[$i], 'black' => $moves[$i + 1] ?? null];
        }

        return [
            'white'      => $h['White']    ?? '?',
            'black'      => $h['Black']    ?? '?',
            'whiteElo'   => isset($h['WhiteElo']) && $h['WhiteElo'] !== '?' ? $h['WhiteElo'] : null,
            'blackElo'   => isset($h['BlackElo']) && $h['BlackElo'] !== '?' ? $h['BlackElo'] : null,
            'result'     => $h['Result']   ?? '*',
            'event'      => ($h['Event'] ?? '?') !== '?' ? $h['Event'] : null,
            'site'       => ($h['Site']  ?? '?') !== '?' ? $h['Site']  : null,
            'date'       => ($h['Date']  ?? '?') !== '?' ? $h['Date']  : null,
            'eco'        => $h['ECO']      ?? null,
            'opening'    => $h['Opening']  ?? null,
            'totalMoves' => (int) ceil(count($moves) / 2),
            'movePairs'  => $pairs,
        ];
    }

    private function extractMoves(string $pgn): array
    {
        $text = preg_replace('/^\[.*?\]\s*/ms', '', $pgn);
        $text = preg_replace('/\$\d+/', '', $text);
        $text = preg_replace('/\{[^}]*\}/', '', $text);
        for ($i = 0; $i < 20; $i++) {
            $new = preg_replace('/\([^()]*\)/', '', $text);
            if ($new === $text) break;
            $text = $new;
        }
        $text = preg_replace('/\d+\.+\s*/', '', $text);
        $text = preg_replace('/(?:1-0|0-1|1\/2-1\/2|\*)\s*$/', '', $text);
        return array_values(array_filter(preg_split('/\s+/', trim($text))));
    }
}
