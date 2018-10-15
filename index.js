import { map, scan, switchMap } from 'rxjs/operators'

export function overlapMap(source) {
  return source.pipe(
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
  )
}
