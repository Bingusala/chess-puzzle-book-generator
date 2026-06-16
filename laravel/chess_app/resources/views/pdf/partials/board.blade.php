@php $sideText = $pos['side'] === 'b' ? 'Black' : 'White'; @endphp

{{-- Single bordered table: header + board + file labels all inside one box --}}
<table class="board-box" width="{{ $boardW }}" style="width:{{ $boardW }}px;">

  {{-- Explicit column widths: colspan in the header row makes DomPDF's
       table-layout:fixed unreliable when it has to infer widths from
       cell widths alone, so declare every column here instead. --}}
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
        style="background:{{ $dark ? $darkColor : $lightColor }}; width:{{ $cellW }}px; height:{{ $cellW }}px; font-size:{{ $piece ? $pieceF.'px' : '1px' }}; color:{{ $piece ? '#111' : 'transparent' }};">{!! $piece ?: '&nbsp;' !!}</td>
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
  $gap  = 10;
  $segW = max(20, intdiv($boardW - ($answerCount - 1) * $gap, $answerCount));
@endphp
<div class="ans-row">
  @for($i = 0; $i < $answerCount; $i++)
  <div class="ans" style="width:{{ $segW }}px;{{ $i < $answerCount - 1 ? ' margin-right:'.$gap.'px;' : '' }}"></div>
  @endfor
</div>
@endif
