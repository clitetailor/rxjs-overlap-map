import {
  map,
  scan,
  switchMap,
  takeUntil,
  concat,
  shareReplay
} from 'rxjs/operators'

export function overlap(...sources) {
  return sources.reduce((acc, next) => {
    const shared = next.pipe(shareReplay())
    return acc.pipe(
      takeUntil(shared),
      concat(shared)
    )
  })
}

export function overlapMap(callback) {
  return source =>
    source.pipe(
      map(callback),
      sequentialMap((prev, next) => overlap(prev, next))
    )
}

export function sequentialMap(callback) {
  return source =>
    source.pipe(
      scan(callback),
      switchMap(stream => stream)
    )
}
