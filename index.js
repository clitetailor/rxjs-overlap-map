import {
  map,
  scan,
  switchMap,
  takeUntil,
  concat
} from 'rxjs/operators'

export const overlapMap = callback => source =>
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
