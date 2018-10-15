import { of } from 'rxjs'
import { delay, map, reduce } from 'rxjs/operators'

import { overlapMap } from '../index'

test('should output 1, 5', function(done) {
  const input$ = of(3, 1, 5).pipe(
    map(val => of(val).pipe(delay(val * 1000)))
  )

  input$
    .pipe(
      overlapMap(stream => stream),
      reduce((acc, value) => acc.concat([value]), [])
    )
    .subscribe(
      values => {
        expect(values).toEqual([1, 5])
      },
      null,
      done
    )
})
