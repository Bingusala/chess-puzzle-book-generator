@php
/**
 * All pixel constants below are tuned for DomPDF A4 (794px × 1123px at 96dpi,
 * content 744px × ~1083px after page padding). For A5 — exactly an A4 sheet
 * folded in half, same aspect ratio — every constant is scaled down by the
 * same linear factor (~0.705 ≈ 1/√2) so the whole layout shrinks uniformly
 * instead of needing a second hand-tuned set of values per perPage tier.
 *
 * Header/footer bands are fixed at 1 cm (38 px at 96 dpi) on both A4 and A5.
 * Available for boards on A4: 1083 − 52 (header+margin) − 48 (footer+margin) = 983 px.
 *
 * perPage=8 (2 cols × 4 rows) @ A4: cellW=22, boardW=183   [table layout — height-constrained]
 * perPage=4 (2 cols × 2 rows) @ A4: cellW=43, boardW=358   [table layout — width-constrained]
 * perPage=2 (1 col × 2 rows)  @ A4: cellW=51, boardW=424   [div layout — height-constrained]
 * perPage=1 (1 col × 1 row)   @ A4: cellW=89, boardW=738   [div layout — width-constrained]
 *
 * Height budget for perPage=2: 2×(22+408+16+22+14) = 964 px ≤ 983 ✓
 *
 * IMPORTANT: single-column layouts must use <div> wrappers, NOT a <table> cell.
 * DomPDF stretches nested tables to fill parent <td> width even with explicit px widths,
 * which inflates cellW from 48→88 and causes single-board-per-page overflow.
 */
$scale = ($pageSize ?? 'A4') === 'A5' ? 0.705 : 1.0;
$px = fn($n) => max(1, (int) round($n * $scale));

if ($perPage >= 8) {
    $cols = 2; $cellW = $px(22); $coordW = $px(7);  $pieceF = $px(14); $coordF = $px(7);
} elseif ($perPage == 4) {
    $cols = 2; $cellW = $px(43); $coordW = $px(14); $pieceF = $px(29); $coordF = $px(9);
} elseif ($perPage == 2) {
    $cols = 1; $cellW = $px(51); $coordW = $px(16); $pieceF = $px(34); $coordF = $px(11);
} else {
    $cols = 1; $cellW = $px(89); $coordW = $px(26); $pieceF = $px(60); $coordF = $px(16);
}
$boardW = $coordW + 8 * $cellW;
$tableW = $px(744);
$colW   = intdiv($tableW, 2);

$padTop = $px(22); $padSide = $px(25); $padBot = $px(18);
$bhFont = $px(11);
$hdrMargin = $px(14);
$bcellPadTop = $px(5); $bcellPadX = $px(6); $bcellPadBot = $px(10);
$bhPadY = $px(5); $bhPadX = $px(7);
$ansRowMarginTop = $px(8); $ansHeight = $px(14);
$divMarginBottom = $px(14);
$footerMarginTop = $px(10); $footerNumColW = $px(40);
// 1 cm header/footer bands — NOT scaled; 1 cm ≈ 38 px at DomPDF's 96 dpi on both A4 and A5
$bandH = 38; $hdrFont = 14; $ftrFont = 11;
$hdrPadV = (int) floor(($bandH - $hdrFont - 2) / 2);  // 11 px — vertical centering
$ftrPadV = (int) floor(($bandH - $ftrFont - 2) / 2);  // 12 px — vertical centering

// Space-fill: compute board-box height so per-page leftover can be distributed as extra padding
$boardBoxH = ($bhPadY + $bhFont + $bhPadY + 1) + 8 * $cellW + $coordW;
$ansH      = $answerCount > 0 ? ($ansRowMarginTop + $ansHeight) : 0;
$contentH  = $px(1083);                  // A4 = 1083 px; A5 ≈ 764 px via $px()
$hdrOvhd   = $bandH + $hdrMargin;        // header band + gap-below (52 px for A4)
$ftrOvhd   = $footerMarginTop + $bandH;  // gap-above + footer band (48 px for A4)
// DomPDF renders borders outside the stated px dims ($boardBoxH, $bandH exclude the 1.5px table borders).
// 0.7-factor on header/footer: use a 30px safety so xPad never over-packs the page.
$safetyH   = 30;
@endphp
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: DejaVu Sans, sans-serif; color: {{ $fontColor }}; background: {{ $bgColor }}; font-size: 10px; }

.page  { padding: {{ $padTop }}px {{ $padSide }}px {{ $padBot }}px {{ $padSide }}px; page-break-after: always; }
.page:last-child { page-break-after: auto; }

.p-header {
  font-size: {{ $hdrFont }}px; font-weight: bold;
  border-bottom: 1.5px solid #111;
  padding: {{ $hdrPadV }}px 0; margin-bottom: {{ $hdrMargin }}px;
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
.p-footer td { font-size: {{ $ftrFont }}px; border-top: 1.5px solid #111; padding: {{ $ftrPadV }}px 0; }
</style>
</head>
<body>

@foreach($pages as $pgIdx => $page)
@php
$pagePositions = $page['positions'];
$pageHeader    = $page['header'];
$pageFooter    = $page['footer'];

// Leftover vertical space for this page → distribute as extra padding so boards fill the column
$numBoards  = count($pagePositions);
$numRows    = $cols === 2 ? (int)ceil($numBoards / 2) : $numBoards;
$pageAvailH = $contentH
              - ($pageHeader ? $hdrOvhd : 0)
              - ($pageFooter ? $ftrOvhd : 0)
              - $safetyH;

if ($cols === 2) {
    $rowH      = $bcellPadTop + $boardBoxH + $ansH + $bcellPadBot;
    $xPad      = (int) floor(max(0, $pageAvailH - $numRows * $rowH) / $numRows / 2);
    $dynPadTop = $bcellPadTop + $xPad;
    $dynPadBot = $bcellPadBot + $xPad;
} else {
    $unitH        = $boardBoxH + $ansH + $divMarginBottom;
    $xPad         = (int) floor(max(0, $pageAvailH - $numBoards * $unitH) / $numBoards / 2);
    $dynMarginTop = $xPad;
    $dynMarginBot = $divMarginBottom + $xPad;
}
@endphp
<div class="page">

  @if($pageHeader)
  <div class="p-header">{{ $pageHeader }}</div>
  @endif

  {{-- 2-column layout (perPage=4): table keeps boards side-by-side at fixed widths --}}
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

  {{-- Single-column layout (perPage=1 or perPage=2): divs prevent DomPDF td-stretch --}}
  @else
  @foreach($pagePositions as $pos)
  <div style="margin-top:{{ $dynMarginTop }}px; margin-bottom:{{ $dynMarginBot }}px;">
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
