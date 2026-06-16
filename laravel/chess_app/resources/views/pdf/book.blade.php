@php
/**
 * All pixel constants below are tuned for DomPDF A4 (794px × 1123px at 96dpi,
 * content 744px × ~1083px after page padding). For A5 — exactly an A4 sheet
 * folded in half, same aspect ratio — every constant is scaled down by the
 * same linear factor (~0.705 ≈ 1/√2) so the whole layout shrinks uniformly
 * instead of needing a second hand-tuned set of values per perPage tier.
 *
 * perPage=8 (2 cols × 4 rows) @ A4: cellW=20, boardW=167   [table layout]
 * perPage=4 (2 cols × 2 rows) @ A4: cellW=42, boardW=350   [table layout]
 * perPage=2 (1 col × 2 rows)  @ A4: cellW=48, boardW=400   [div layout — avoids DomPDF td-stretch]
 * perPage=1 (1 col × 1 row)   @ A4: cellW=80, boardW=666   [div layout]
 *
 * Height budget for perPage=2 (header 35 + footer 26 + padding 40):
 *   2 × (board 426px + div-margin 14px + answer-lines 46px) + 101 = 1073 < 1123 ✓
 *
 * IMPORTANT: single-column layouts must use <div> wrappers, NOT a <table> cell.
 * DomPDF stretches nested tables to fill parent <td> width even with explicit px widths,
 * which inflates cellW from 48→88 and causes single-board-per-page overflow.
 */
$scale = ($pageSize ?? 'A4') === 'A5' ? 0.705 : 1.0;
$px = fn($n) => max(1, (int) round($n * $scale));

if ($perPage >= 8) {
    $cols = 2; $cellW = $px(20); $coordW = $px(7);  $pieceF = $px(13); $coordF = $px(7);
} elseif ($perPage == 4) {
    $cols = 2; $cellW = $px(42); $coordW = $px(14); $pieceF = $px(28); $coordF = $px(9);
} elseif ($perPage == 2) {
    $cols = 1; $cellW = $px(48); $coordW = $px(16); $pieceF = $px(32); $coordF = $px(11);
} else {
    $cols = 1; $cellW = $px(80); $coordW = $px(26); $pieceF = $px(54); $coordF = $px(16);
}
$boardW = $coordW + 8 * $cellW;
$tableW = $px(744);
$colW   = intdiv($tableW, 2);

$padTop = $px(22); $padSide = $px(25); $padBot = $px(18);
$hdrFont = $px(13); $ftrFont = $px(10); $bhFont = $px(11);
$hdrPad = $px(5); $hdrMargin = $px(14);
$bcellPadTop = $px(5); $bcellPadX = $px(6); $bcellPadBot = $px(10);
$bhPadY = $px(5); $bhPadX = $px(7);
$ansRowMarginTop = $px(8); $ansHeight = $px(14);
$divMarginBottom = $px(14);
$footerMarginTop = $px(10); $footerPadTop = $px(4); $footerNumColW = $px(40);
@endphp
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: DejaVu Sans, sans-serif; color: #111; background: {{ $bgColor }}; font-size: 10px; }

.page  { padding: {{ $padTop }}px {{ $padSide }}px {{ $padBot }}px {{ $padSide }}px; page-break-after: always; }
.page:last-child { page-break-after: auto; }

.p-header {
  font-size: {{ $hdrFont }}px; font-weight: bold;
  border-bottom: 1.5px solid #111;
  padding-bottom: {{ $hdrPad }}px; margin-bottom: {{ $hdrMargin }}px;
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

/* answer lines below board: short segments placed side by side in one row */
.ans-row { margin-top: {{ $ansRowMarginTop }}px; white-space: nowrap; }
.ans { display: inline-block; border-bottom: 1px solid #888; height: {{ $ansHeight }}px; }

/* page footer */
.p-footer { border-collapse: collapse; table-layout: fixed; margin-top: {{ $footerMarginTop }}px; background: {{ $hfBgColor }}; }
.p-footer td { font-size: {{ $ftrFont }}px; border-top: 1.5px solid #111; padding-top: {{ $footerPadTop }}px; }
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
        @include('pdf.partials.board', compact('pos','cellW','coordW','pieceF','coordF','boardW','answerCount','darkColor','lightColor','scale'))
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
  <div style="margin-bottom:{{ $divMarginBottom }}px;">
    @include('pdf.partials.board', compact('pos','cellW','coordW','pieceF','coordF','boardW','answerCount','darkColor','lightColor','scale'))
  </div>
  @endforeach
  @endif

  @if($footer)
  <table class="p-footer" width="{{ $tableW }}" style="width:{{ $tableW }}px;">
    <tr>
      <td style="width:{{ $tableW - $footerNumColW }}px;">{{ $footer }}</td>
      <td style="width:{{ $footerNumColW }}px; text-align:right;">{{ $pgIdx + 1 }}</td>
    </tr>
  </table>
  @endif

</div>
@endforeach

</body>
</html>
