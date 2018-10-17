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
    const shared = next.pipe(share())
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
      map(shareReplay()),
      scan((prev, curr) =>
        prev.pipe(
          takeUntil(curr),
          concat(curr)
        )
      ),
      switchMap(stream => stream)
    )
}
