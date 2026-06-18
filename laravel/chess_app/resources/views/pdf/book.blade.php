@php
/**
 * Slot-based layout — 0.5 cm header/footer bands, remaining height divided
 * equally among board rows so content is guaranteed to fit on one PDF page.
 *
 * perPage=8 (2 cols × 4 rows) — table layout, height-constrained
 * perPage=4 (2 cols × 2 rows) — table layout, width-constrained
 * perPage=2 (1 col  × 2 rows) — div layout,   height-constrained
 * perPage=1 (1 col  × 1 row)  — div layout,   width-constrained
 *
 * IMPORTANT: single-column layouts must use <div> wrappers, NOT a <table> cell.
 * DomPDF stretches nested tables to fill parent <td> width even with explicit px widths,
 * which inflates single-board layouts and causes overflow.
 */
$scale = ($pageSize ?? 'A4') === 'A5' ? 0.705 : 1.0;
$px = fn($n) => max(1, (int) round($n * $scale));

// 0.5 cm header/footer bands — NOT scaled; 0.5 cm ≈ 19 px at 96 dpi on A4 and A5
$bandH   = 19;  $hdrFont = 16;  $ftrFont = 14;
$hdrPadV = max(1, (int) floor(($bandH - $hdrFont - 2) / 2));
$ftrPadV = max(1, (int) floor(($bandH - $ftrFont - 2) / 2));

// Page geometry
$padTop  = $px(22); $padSide = $px(25); $padBot = $px(18);
$tableW  = $px(744);
$colW    = intdiv($tableW, 2);
$contentH = $px(1083);   // A4 = 1083 px; A5 ≈ 764 px via $px()

// Header/footer overhead (band + gap to first/last board)
$hdrGap  = $px(8);
$ftrGap  = $px(6);
$hdrOvhd = $bandH + $hdrGap;   // 27 px on A4
$ftrOvhd = $ftrGap + $bandH;   // 25 px on A4

// Grid shape
if     ($perPage >= 8) { $cols = 2; $numRows = 4; }
elseif ($perPage == 4) { $cols = 2; $numRows = 2; }
elseif ($perPage == 2) { $cols = 1; $numRows = 2; }
else                   { $cols = 1; $numRows = 1; }

// Safety buffer: DomPDF renders elements 2–3 px taller than stated sizes
// (line-height > font-size; outer table borders extend outside declared dims).
// Baked into slot sizing so boards are guaranteed to leave this much slack on the page.
// 80 px gives ~35 px headroom even when DomPDF still applies a 1.2 cm @page margin.
// A5 8-board needs more room than A4 8-board: the scaled ansHeight (8 px) is
// smaller than the default 12 px line-height, inflating each row more than A4.
$safetyH    = 80;

// Slot height: total rows-area divided equally (worst-case: header + footer both present)
$rowsAvailH = $contentH - $hdrOvhd - $ftrOvhd - $safetyH;
$slotH      = (int) floor($rowsAvailH / $numRows);

// Fixed per-slot overhead
$bcellPadTop = $px($cols === 2 ? 3 : 5);
$bcellPadBot = $px($cols === 2 ? 5 : 7);
$bcellPadX   = $px(6);
$bhPadY  = $px(3);
$bhPadX  = $px(5);
$bhFont  = $px(9);
// DomPDF renders text at lineheight ≈ 1.2× font-size; +2 for border-bottom + rounding
$boardHdrH = $bhPadY * 2 + (int) round($bhFont * 1.2) + 2;

$ansRowMarginTop = $px(10);
$ansHeight       = $px(28);
$footerNumColW   = $px(40);
$ansH = $answerCount > 0 ? ($ansRowMarginTop + $ansHeight) : 0;

// Derive cellW from slot height
// Slot budget: bcellPadTop + boardHdrH + 8×cellW + coordW + ansH + bcellPadBot = slotH
// coordW ≈ 0.30 × cellW  →  (8.30) × cellW = slotH − fixed overhead
// +4: DomPDF renders board-box outer border outside stated px dims (~3 px)
$headroom = $bcellPadTop + $bcellPadBot + $boardHdrH + $ansH + 4;
$cellW_h  = max(6, (int) floor(max(1, $slotH - $headroom) / 8.30));

// Width constraint: board must fit in its column (or full tableW for 1-col)
$freeW   = ($cols === 2) ? ($colW - 2 * $bcellPadX) : $tableW;
$cellW_w = max(6, (int) floor($freeW / 8.30));

$cellW  = min($cellW_h, $cellW_w);
$coordW = max(4, (int) round($cellW * 0.30));
$boardW = $coordW + 8 * $cellW;
$pieceF = max(6, (int) round($cellW * 0.67));
$coordF = max(5, (int) round($cellW * 0.22));

// Board-box calculated height (outer border excluded — DomPDF renders it outside stated dims)
$boardBoxH = $boardHdrH + 8 * $cellW + $coordW;

// Gap between boards in single-column layout (NOT applied after the last board)
$divGap = $px(10);

@endphp
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
@page { margin-top: 0; margin-right: 0; margin-bottom: 0; margin-left: 0; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: DejaVu Sans, sans-serif; color: {{ $fontColor }}; background: {{ $bgColor }}; font-size: 10px; }

.page  { padding: {{ $padTop }}px {{ $padSide }}px {{ $padBot }}px {{ $padSide }}px; page-break-after: always; }
.page:last-child { page-break-after: auto; }

.p-header {
  font-size: {{ $hdrFont }}px; font-weight: bold;
  border-bottom: 1.5px solid #111;
  padding: {{ $hdrPadV }}px 0; margin-bottom: {{ $hdrGap }}px;
  width: {{ $tableW }}px;
  background: {{ $hfBgColor }};
}

.grid { border-collapse: collapse; table-layout: fixed; }

.bcell { vertical-align: top; padding: {{ $bcellPadTop }}px {{ $bcellPadX }}px {{ $bcellPadBot }}px {{ $bcellPadX }}px; }

/* ── The board outer box ── */
.board-box {
  border: 1.5px solid #333;
  border-collapse: collapse;
  table-layout: fixed;
  empty-cells: show;
}

/* header inside the board box */
.bh-no   { font-size: {{ $bhFont }}px; font-weight: bold; padding: {{ $bhPadY }}px {{ $bhPadX }}px; border-bottom: 1px solid #ccc; }
.bh-side { font-size: {{ $bhFont }}px; font-weight: bold; padding: {{ $bhPadY }}px {{ $bhPadX }}px; border-bottom: 1px solid #ccc; text-align: right; }

/* board squares — colors injected via inline styles */
.sq { text-align: center; vertical-align: middle; }

/* coordinate labels */
.co-rank { text-align: center; vertical-align: middle; color: #444; border-right: 1px solid #ccc; }
.co-file { text-align: center; vertical-align: middle; color: #444; border-top: 1px solid #ccc; }

/* answer lines below board */
.ans-row { margin-top: {{ $ansRowMarginTop }}px; white-space: nowrap; }
.ans { display: inline-block; border-bottom: 1px solid #888; height: {{ $ansHeight }}px; }

/* page footer */
.p-footer { border-collapse: collapse; table-layout: fixed; margin-top: {{ $ftrGap }}px; background: {{ $hfBgColor }}; }
.p-footer td { font-size: {{ $ftrFont }}px; border-top: 1.5px solid #111; padding: {{ $ftrPadV }}px 0; }
</style>
</head>
<body>

@foreach($pages as $pgIdx => $page)
@php
$pagePositions = $page['positions'];
$pageHeader    = $page['header'];
$pageFooter    = $page['footer'];

$numBoards  = count($pagePositions);
$numRowsAct = $cols === 2 ? (int)ceil($numBoards / 2) : $numBoards;
$pageAvailH = $contentH
              - ($pageHeader ? $hdrOvhd : 0)
              - ($pageFooter ? $ftrOvhd : 0)
              - $safetyH;

if ($cols === 2) {
    $rowH      = $bcellPadTop + $boardBoxH + $ansH + $bcellPadBot;
    $xPad      = (int) floor(max(0, $pageAvailH - $numRowsAct * $rowH) / $numRowsAct / 2);
    $dynPadTop = $bcellPadTop + $xPad;
    $dynPadBot = $bcellPadBot + $xPad;
} else {
    // Single-column: exclude trailing gap after last board so footer never overflows
    $totalBoardH = $numBoards * ($boardBoxH + $ansH) + ($numBoards - 1) * $divGap;
    $xPad        = (int) floor(max(0, $pageAvailH - $totalBoardH) / $numBoards / 2);
    $dynMarginTop = $xPad;
    $dynMarginBot = $divGap + $xPad;   // between boards; last board gets only $xPad
}
@endphp
<div class="page">

  @if($pageHeader)
  <div class="p-header">{{ $pageHeader }}</div>
  @endif

  {{-- 2-column layout (perPage=8 or 4): table keeps boards side-by-side --}}
  @if($cols === 2)
  <table class="grid" width="{{ $tableW }}" style="width:{{ $tableW }}px;">
    @foreach(array_chunk($pagePositions, 2) as $rowItems)
    <tr>
      @foreach($rowItems as $pos)
      <td class="bcell" width="{{ $colW }}" style="width:{{ $colW }}px; padding-top:{{ $dynPadTop }}px; padding-bottom:{{ $dynPadBot }}px;">
        @include('pdf.partials.board', compact('pos','cellW','coordW','pieceF','coordF','boardW','answerCount','darkColor','lightColor','scale','fontColor'))
      </td>
      @endforeach
      @if(count($rowItems) < 2)
      <td class="bcell" width="{{ $colW }}" style="width:{{ $colW }}px; padding-top:{{ $dynPadTop }}px; padding-bottom:{{ $dynPadBot }}px;"></td>
      @endif
    </tr>
    @endforeach
  </table>

  {{-- Single-column layout (perPage=1 or 2): divs prevent DomPDF td-stretch --}}
  @else
  @foreach($pagePositions as $pos)
  <div style="margin-top:{{ $dynMarginTop }}px; margin-bottom:{{ $loop->last ? $xPad : $dynMarginBot }}px;">
    @include('pdf.partials.board', compact('pos','cellW','coordW','pieceF','coordF','boardW','answerCount','darkColor','lightColor','scale','fontColor'))
  </div>
  @endforeach
  @endif

  @if($pageFooter)
  <table class="p-footer" width="{{ $tableW }}" style="width:{{ $tableW }}px;">
    <tr>
      <td style="width:{{ $tableW - $footerNumColW }}px;">{{ $pageFooter }}</td>
      <td style="width:{{ $footerNumColW }}px; text-align:right;">{{ $pgIdx + 1 }}</td>
    </tr>
  </table>
  @endif

</div>
@endforeach

</body>
</html>
