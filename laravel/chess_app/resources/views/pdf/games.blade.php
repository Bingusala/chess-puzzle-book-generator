<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #111; background: #fff; }

  .game { padding: 28px 32px; page-break-after: always; }
  .game:last-child { page-break-after: auto; }

  .game-header { border-bottom: 3px solid #1a1a2e; padding-bottom: 10px; margin-bottom: 14px; }
  .game-title  { font-size: 18px; font-weight: bold; color: #1a1a2e; }
  .game-sub    { font-size: 11px; color: #666; margin-top: 3px; }

  table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
  td    { padding: 5px 10px; border: 1px solid #ddd; vertical-align: top; }
  td.label { font-weight: bold; background: #f5f5f5; width: 28%; white-space: nowrap; }

  .badge { display: inline-block; padding: 2px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; color: #fff; }
  .win  { background: #2e7d32; }
  .loss { background: #c62828; }
  .draw { background: #b45309; }
  .other { background: #555; }

  .section { font-size: 12px; font-weight: bold; color: #1a1a2e; border-bottom: 1px solid #ccc; padding-bottom: 3px; margin-bottom: 8px; }

  .moves { line-height: 2; word-spacing: 2px; }
  .mn  { color: #999; font-size: 10px; margin-right: 1px; }
  .mv  { font-family: DejaVu Sans Mono, monospace; margin-right: 6px; }

  .footer { margin-top: 20px; padding-top: 8px; border-top: 1px solid #eee; font-size: 9px; color: #aaa; text-align: center; }
</style>
</head>
<body>

@foreach($games as $g)
<div class="game">

  <div class="game-header">
    <div class="game-title">{{ $g['white'] }} vs {{ $g['black'] }}</div>
    <div class="game-sub">
      @if($g['event']) {{ $g['event'] }} @endif
      @if($g['site'])  &nbsp;·&nbsp; {{ $g['site'] }} @endif
      @if($g['date'])  &nbsp;·&nbsp; {{ $g['date'] }} @endif
    </div>
  </div>

  <table>
    <tr>
      <td class="label">White</td>
      <td>{{ $g['white'] }}@if($g['whiteElo']) &nbsp;<em>({{ $g['whiteElo'] }})</em>@endif</td>
      <td class="label">Black</td>
      <td>{{ $g['black'] }}@if($g['blackElo']) &nbsp;<em>({{ $g['blackElo'] }})</em>@endif</td>
    </tr>
    <tr>
      <td class="label">Result</td>
      <td>
        @php
          $cls = match($g['result']) { '1-0' => 'win', '0-1' => 'loss', '1/2-1/2' => 'draw', default => 'other' };
        @endphp
        <span class="badge {{ $cls }}">{{ $g['result'] }}</span>
      </td>
      <td class="label">Moves</td>
      <td>{{ $g['totalMoves'] }}</td>
    </tr>
    @if($g['eco'])
    <tr>
      <td class="label">Opening</td>
      <td colspan="3">{{ $g['eco'] }}@if($g['opening']) &nbsp;·&nbsp; {{ $g['opening'] }}@endif</td>
    </tr>
    @endif
  </table>

  <div class="section">Moves</div>
  <div class="moves">
    @foreach($g['movePairs'] as $pair)
      <span class="mn">{{ $pair['num'] }}.</span><span class="mv">{{ $pair['white'] }}</span>@if($pair['black'])<span class="mv">{{ $pair['black'] }}</span>@endif
    @endforeach
    &nbsp;<strong>{{ $g['result'] }}</strong>
  </div>

  <div class="footer">ChessBase Modern &nbsp;·&nbsp; Generated {{ now()->format('d M Y, H:i') }}</div>

</div>
@endforeach

</body>
</html>
