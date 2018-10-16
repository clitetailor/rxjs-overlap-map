import {
  map,
  scan,
  switchMap,
  takeUntil,
  concat
} from 'rxjs/operators'

export function overlap(...sources) {
  return sources.reduce((acc, next) =>
    acc.pipe(
      takeUntil(next),
      concat(next)
    )
  )
}

export function overlapMap(callback) {
  return source =>
    source.pipe(
      map(callback),
      scan((prev, curr) =>
        prev.pipe(
          takeUntil(curr),
          concat(curr)
        )
      ),
      switchMap(stream => stream)
    )
}
