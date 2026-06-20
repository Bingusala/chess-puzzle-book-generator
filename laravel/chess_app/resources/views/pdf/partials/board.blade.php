@php
$sideText = $pos['side'] === 'b' ? 'Black' : 'White';

// Professional SVG chess pieces (cburnett-style Staunton, viewBox 0 0 45 45)
$svgPieces = [
  '♙' => '<circle cx="22.5" cy="9" r="5.5" fill="white" stroke="#222" stroke-width="1.5"/><path fill="white" stroke="#222" stroke-width="1.5" stroke-linejoin="round" d="M17 14.5Q13 19 13 25Q13 32 17 34.5H28Q32 32 32 25Q32 19 28 14.5Z"/><path fill="white" stroke="#222" stroke-width="1.5" stroke-linejoin="round" d="M10 34.5H35V40.5H10Z"/>',
  '♖' => '<path fill="white" stroke="#222" stroke-width="1.5" stroke-linejoin="round" d="M9 39.5H36V36H9Z"/><path fill="white" stroke="#222" stroke-width="1.5" stroke-linejoin="round" d="M12.5 36V32.5H32.5V36Z"/><path fill="white" stroke="#222" stroke-width="1.5" stroke-linejoin="round" d="M13.5 17H31.5V32.5H13.5Z"/><path fill="white" stroke="#222" stroke-width="1.5" stroke-linejoin="round" d="M10 8.5H15V14H19.5V8.5H25.5V14H30V8.5H35V14L32 17H13L10 14Z"/>',
  '♗' => '<circle cx="22.5" cy="8" r="3.5" fill="white" stroke="#222" stroke-width="1.5"/><line x1="22.5" y1="4.5" x2="22.5" y2="11.5" stroke="#222" stroke-width="1.5"/><line x1="19.5" y1="8" x2="25.5" y2="8" stroke="#222" stroke-width="1.5"/><path fill="white" stroke="#222" stroke-width="1.5" stroke-linejoin="round" d="M16 33C14 31 13.5 28 15.5 25L22.5 12L29.5 25C31.5 28 31 31 29 33Z"/><path fill="white" stroke="#222" stroke-width="1.5" d="M12 33H33V37H12Z"/><path fill="white" stroke="#222" stroke-width="1.5" d="M9 37H36V40.5H9Z"/>',
  '♘' => '<path fill="white" stroke="#222" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M22 10C32.5 11 38.5 18 38 39L15 39C15 30 25 32.5 23 18"/><path fill="white" stroke="#222" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M24 18C24.4 20.9 18.5 25.4 16 27C13 29 13.2 31.3 11 31C10 30.1 12.4 28 11 28C10 28 11.2 29.2 10 30C9 30 6 31 6 26C6 24 12 14 12 14C12 14 13.9 12.1 14 10.5C13.3 9.5 13.5 8.5 13.5 7.5C14.5 6.5 16.5 10 16.5 10L18.5 10C18.5 10 19.3 8 21 7C22 7 22 10 22 10"/><circle cx="9.5" cy="25.5" r="0.75" fill="#222"/>',
  '♕' => '<circle cx="6" cy="12" r="2" fill="white" stroke="#222" stroke-width="1.5"/><circle cx="14" cy="9" r="2" fill="white" stroke="#222" stroke-width="1.5"/><circle cx="22.5" cy="8" r="2" fill="white" stroke="#222" stroke-width="1.5"/><circle cx="31" cy="9" r="2" fill="white" stroke="#222" stroke-width="1.5"/><circle cx="39" cy="12" r="2" fill="white" stroke="#222" stroke-width="1.5"/><path fill="white" stroke="#222" stroke-width="1.5" stroke-linecap="butt" stroke-linejoin="round" d="M9 26C17.5 24.5 30 24.5 36 26L38.5 13.5L31 25L30.7 10.9L25.5 24.5L22.5 10L19.5 24.5L14.3 10.9L14 25L6.5 13.5Z"/><path fill="white" stroke="#222" stroke-width="1.5" stroke-linecap="butt" d="M9 26C9 28 10.5 28 11.5 30C12.5 31.5 12.5 31 12 33.5C10.5 34.5 10.5 36 10.5 36C9 37.5 11 38.5 11 38.5C17.5 39.5 27.5 39.5 34 38.5C34 38.5 35.5 37.5 34 36C34 36 34.5 34.5 33 33.5C32.5 31 32.5 31.5 33.5 30C34.5 28 36 28 36 26C27.5 24.5 17.5 24.5 9 26Z"/><path fill="none" stroke="#222" stroke-width="1" d="M11.5 30C15 29 30 29 33.5 30M12 33.5C18 32.5 27 32.5 33 33.5"/>',
  '♔' => '<line x1="22.5" y1="11.6" x2="22.5" y2="6" stroke="#222" stroke-width="1.5" stroke-linecap="round"/><line x1="20" y1="8" x2="25" y2="8" stroke="#222" stroke-width="1.5" stroke-linecap="round"/><path fill="white" stroke="#222" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M22.5 25C22.5 25 27 17.5 25.5 14.5C25.5 14.5 24.5 12 22.5 12C20.5 12 19.5 14.5 19.5 14.5C18 17.5 22.5 25 22.5 25"/><path fill="white" stroke="#222" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M11.5 37C17 40.5 27 40.5 32.5 37L32.5 30C32.5 30 41.5 25.5 38.5 19.5C34.5 13 25 16 22.5 23.5L22.5 27L22.5 23.5C20 16 10.5 13 6.5 19.5C3.5 25.5 11.5 30 11.5 30Z"/><path fill="none" stroke="#222" stroke-width="1.5" d="M11.5 30C17 27 27 27 32.5 30M11.5 33.5C17 30.5 27 30.5 32.5 33.5M11.5 37C17 34 27 34 32.5 37"/>',
  '♟' => '<circle cx="22.5" cy="9" r="5.5" fill="#111" stroke="#111" stroke-width="1.5"/><path fill="#111" stroke="#111" stroke-width="1.5" stroke-linejoin="round" d="M17 14.5Q13 19 13 25Q13 32 17 34.5H28Q32 32 32 25Q32 19 28 14.5Z"/><path fill="#111" stroke="#111" stroke-width="1.5" stroke-linejoin="round" d="M10 34.5H35V40.5H10Z"/>',
  '♜' => '<path fill="#111" stroke="#111" stroke-width="1.5" stroke-linejoin="round" d="M9 39.5H36V36H9Z"/><path fill="#111" stroke="#111" stroke-width="1.5" stroke-linejoin="round" d="M12.5 36V32.5H32.5V36Z"/><path fill="#111" stroke="#111" stroke-width="1.5" stroke-linejoin="round" d="M13.5 17H31.5V32.5H13.5Z"/><path fill="#111" stroke="#111" stroke-width="1.5" stroke-linejoin="round" d="M10 8.5H15V14H19.5V8.5H25.5V14H30V8.5H35V14L32 17H13L10 14Z"/>',
  '♝' => '<circle cx="22.5" cy="8" r="3.5" fill="#111" stroke="#111" stroke-width="1.5"/><path fill="#111" stroke="#111" stroke-width="1.5" stroke-linejoin="round" d="M16 33C14 31 13.5 28 15.5 25L22.5 12L29.5 25C31.5 28 31 31 29 33Z"/><path fill="#111" stroke="#111" stroke-width="1.5" d="M12 33H33V37H12Z"/><path fill="#111" stroke="#111" stroke-width="1.5" d="M9 37H36V40.5H9Z"/>',
  '♞' => '<path fill="#111" stroke="#111" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M22 10C32.5 11 38.5 18 38 39L15 39C15 30 25 32.5 23 18"/><path fill="#111" stroke="#111" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M24 18C24.4 20.9 18.5 25.4 16 27C13 29 13.2 31.3 11 31C10 30.1 12.4 28 11 28C10 28 11.2 29.2 10 30C9 30 6 31 6 26C6 24 12 14 12 14C12 14 13.9 12.1 14 10.5C13.3 9.5 13.5 8.5 13.5 7.5C14.5 6.5 16.5 10 16.5 10L18.5 10C18.5 10 19.3 8 21 7C22 7 22 10 22 10"/><circle cx="9.5" cy="25.5" r="0.75" fill="white"/>',
  '♛' => '<circle cx="6" cy="12" r="2" fill="#111" stroke="#111" stroke-width="1.5"/><circle cx="14" cy="9" r="2" fill="#111" stroke="#111" stroke-width="1.5"/><circle cx="22.5" cy="8" r="2" fill="#111" stroke="#111" stroke-width="1.5"/><circle cx="31" cy="9" r="2" fill="#111" stroke="#111" stroke-width="1.5"/><circle cx="39" cy="12" r="2" fill="#111" stroke="#111" stroke-width="1.5"/><path fill="#111" stroke="#111" stroke-width="1.5" stroke-linecap="butt" stroke-linejoin="round" d="M9 26C17.5 24.5 30 24.5 36 26L38.5 13.5L31 25L30.7 10.9L25.5 24.5L22.5 10L19.5 24.5L14.3 10.9L14 25L6.5 13.5Z"/><path fill="#111" stroke="#111" stroke-width="1.5" stroke-linecap="butt" d="M9 26C9 28 10.5 28 11.5 30C12.5 31.5 12.5 31 12 33.5C10.5 34.5 10.5 36 10.5 36C9 37.5 11 38.5 11 38.5C17.5 39.5 27.5 39.5 34 38.5C34 38.5 35.5 37.5 34 36C34 36 34.5 34.5 33 33.5C32.5 31 32.5 31.5 33.5 30C34.5 28 36 28 36 26C27.5 24.5 17.5 24.5 9 26Z"/>',
  '♚' => '<path fill="#111" stroke="#111" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M22.5 25C22.5 25 27 17.5 25.5 14.5C25.5 14.5 24.5 12 22.5 12C20.5 12 19.5 14.5 19.5 14.5C18 17.5 22.5 25 22.5 25"/><path fill="#111" stroke="#111" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" d="M11.5 37C17 40.5 27 40.5 32.5 37L32.5 30C32.5 30 41.5 25.5 38.5 19.5C34.5 13 25 16 22.5 23.5L22.5 27L22.5 23.5C20 16 10.5 13 6.5 19.5C3.5 25.5 11.5 30 11.5 30Z"/><line x1="22.5" y1="11.6" x2="22.5" y2="6" stroke="white" stroke-width="1.5" stroke-linecap="round"/><line x1="20" y1="8" x2="25" y2="8" stroke="white" stroke-width="1.5" stroke-linecap="round"/>',
];

$svgImg = function(string $piece, int $sz) use ($svgPieces): string {
  $inner = $svgPieces[$piece] ?? '';
  if ($inner === '') return '';
  $svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45" width="'.$sz.'" height="'.$sz.'">'.$inner.'</svg>';
  return 'data:image/svg+xml;base64,'.base64_encode($svg);
};
@endphp

{{-- Single bordered table: header + board + file labels all inside one box --}}
<table class="board-box" width="{{ $boardW }}" style="width:{{ $boardW }}px;">

  {{-- Explicit column widths --}}
  <colgroup>
    <col style="width:{{ $coordW }}px;">
    @for($i = 0; $i < 8; $i++)
    <col style="width:{{ $cellW }}px;">
    @endfor
  </colgroup>

  {{-- ── Header row: No.X / White inside the border ── --}}
  <tr>
    <td class="bh-no"   style="width:{{ $coordW }}px;">No.{{ $pos['number'] }}</td>
    <td class="bh-side" style="width:{{ 8 * $cellW }}px;" colspan="8">{{ $sideText }}</td>
  </tr>

  {{-- ── 8 board ranks (8 → 1) ── --}}
  @for($r = 0; $r < 8; $r++)
  <tr>
    {{-- rank number --}}
    <td class="co-rank"
        style="width:{{ $coordW }}px; height:{{ $cellW }}px; font-size:{{ $coordF }}px;">{{ 8 - $r }}</td>

    @for($c = 0; $c < 8; $c++)
    @php
      $dark  = ($r + $c) % 2 !== 0;
      $piece = $pos['board'][$r][$c];
    @endphp
    <td class="sq"
        style="background:{{ $dark ? $darkColor : $lightColor }}; width:{{ $cellW }}px; height:{{ $cellW }}px;">{!! $piece ? '<img src="'.$svgImg($piece,$cellW).'" width="'.$cellW.'" height="'.$cellW.'"/>' : '&nbsp;' !!}</td>
    @endfor
  </tr>
  @endfor

  {{-- ── File labels row (a–h) ── --}}
  <tr>
    <td class="co-file" style="width:{{ $coordW }}px; height:{{ $coordW }}px;"></td>
    @foreach(['a','b','c','d','e','f','g','h'] as $f)
    <td class="co-file"
        style="width:{{ $cellW }}px; height:{{ $coordW }}px; font-size:{{ $coordF }}px;">{{ $f }}</td>
    @endforeach
  </tr>

</table>

{{-- ── Short answer-line segments, side by side in one row ── --}}
@if($answerCount > 0)
@php
  $gap  = max(1, (int) round(10 * ($scale ?? 1.0)));
  $minSegW = max(1, (int) round(20 * ($scale ?? 1.0)));
  $segW = max($minSegW, intdiv($boardW - ($answerCount - 1) * $gap, $answerCount));
@endphp
<div class="ans-row">
  @for($i = 0; $i < $answerCount; $i++)
  <div class="ans" style="width:{{ $segW }}px;{{ $i < $answerCount - 1 ? ' margin-right:'.$gap.'px;' : '' }}"></div>
  @endfor
</div>
@endif
