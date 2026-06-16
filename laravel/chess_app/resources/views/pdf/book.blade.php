@php
/**
 * DomPDF A4: 794px × 1123px at 96dpi
 * Page padding: 22px top / 18px bottom / 25px sides → content 744px × ~1083px
 *
 * perPage=4 (2 cols × 2 rows): cellW=42, boardW=350   [table layout]
 * perPage=2 (1 col × 2 rows): cellW=48, boardW=400   [div layout — avoids DomPDF td-stretch]
 * perPage=1 (1 col × 1 row):  cellW=80, boardW=666   [div layout]
 *
 * Height budget for perPage=2 (header 35 + footer 26 + padding 40):
 *   2 × (board 426px + div-margin 14px + answer-lines 46px) + 101 = 1073 < 1123 ✓
 *
 * IMPORTANT: single-column layouts must use <div> wrappers, NOT a <table> cell.
 * DomPDF stretches nested tables to fill parent <td> width even with explicit px widths,
 * which inflates cellW from 48→88 and causes single-board-per-page overflow.
 */
if ($perPage >= 4) {
    $cols = 2; $colW = 372; $cellW = 42; $coordW = 14; $pieceF = 28; $coordF = 9;
} elseif ($perPage == 2) {
    $cols = 1; $colW = 744; $cellW = 48; $coordW = 16; $pieceF = 32; $coordF = 11;
} else {
    $cols = 1; $colW = 744; $cellW = 80; $coordW = 26; $pieceF = 54; $coordF = 16;
}
$boardW = $coordW + 8 * $cellW;   // 350 | 400 | 666
$tableW = 744;
@endphp
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: DejaVu Sans, sans-serif; color: #111; background: #fff; font-size: 10px; }

.page  { padding: 22px 25px 18px 25px; page-break-after: always; }
.page:last-child { page-break-after: auto; }

.p-header {
  font-size: 13px; font-weight: bold;
  border-bottom: 1.5px solid #111;
  padding-bottom: 5px; margin-bottom: 14px;
  width: {{ $tableW }}px;
}

.grid { border-collapse: collapse; table-layout: fixed; }

.bcell { vertical-align: top; padding: 5px 6px 10px 6px; }

/* ── The board outer box ── */
.board-box {
  border: 1.5px solid #333;
  border-collapse: collapse;
  table-layout: fixed;
  empty-cells: show;
}

/* header inside the board box */
.bh-no   { font-size: 11px; font-weight: bold; padding: 5px 7px; border-bottom: 1px solid #ccc; }
.bh-side { font-size: 11px; font-weight: bold; padding: 5px 7px; border-bottom: 1px solid #ccc; text-align: right; }

/* board squares — colors injected via inline styles */
.sq { text-align: center; vertical-align: middle; }

/* coordinate labels */
.co-rank { text-align: center; vertical-align: middle; color: #444; border-right: 1px solid #ccc; }
.co-file { text-align: center; vertical-align: middle; color: #444; border-top: 1px solid #ccc; }

/* answer lines below board: short segments placed side by side in one row */
.ans-row { margin-top: 8px; white-space: nowrap; }
.ans { display: inline-block; border-bottom: 1px solid #888; height: 14px; }

/* page footer */
.p-footer { border-collapse: collapse; table-layout: fixed; margin-top: 10px; }
.p-footer td { font-size: 10px; border-top: 1.5px solid #111; padding-top: 4px; }
</style>
</head>
<body>

@foreach($pages as $pgIdx => $pagePositions)
<div class="page">

  @if($header)
  <div class="p-header">{{ $header }}</div>
  @endif

  {{-- 2-column layout (perPage=4): table keeps boards side-by-side at fixed widths --}}
  @if($cols === 2)
  <table class="grid" width="{{ $tableW }}" style="width:{{ $tableW }}px;">
    @foreach(array_chunk($pagePositions, 2) as $rowItems)
    <tr>
      @foreach($rowItems as $pos)
      <td class="bcell" width="{{ $colW }}" style="width:{{ $colW }}px;">
        @include('pdf.partials.board', compact('pos','cellW','coordW','pieceF','coordF','boardW','answerCount','darkColor','lightColor'))
      </td>
      @endforeach
      @if(count($rowItems) < 2)
      <td class="bcell" width="{{ $colW }}" style="width:{{ $colW }}px;"></td>
      @endif
    </tr>
    @endforeach
  </table>

  {{-- Single-column layout (perPage=1 or perPage=2): divs prevent DomPDF td-stretch --}}
  @else
  @foreach($pagePositions as $pos)
  <div style="margin-bottom:14px;">
    @include('pdf.partials.board', compact('pos','cellW','coordW','pieceF','coordF','boardW','answerCount','darkColor','lightColor'))
  </div>
  @endforeach
  @endif

  @if($footer)
  <table class="p-footer" width="{{ $tableW }}" style="width:{{ $tableW }}px;">
    <tr>
      <td style="width:{{ $tableW - 40 }}px;">{{ $footer }}</td>
      <td style="width:40px; text-align:right;">{{ $pgIdx + 1 }}</td>
    </tr>
  </table>
  @endif

</div>
@endforeach

</body>
</html>
