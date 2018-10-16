import { of } from 'rxjs'
import { delay, map, reduce } from 'rxjs/operators'
import { syncReplay } from 'rxjs-sync-operator'

import { overlapMap } from '../index'

const reduceAll = () =>
  reduce((acc, value) => acc.concat([value]), [])

const reportError = e => expect(e).not.toBeDefined()

test('should output 1, 5', done => {
  of(3, 1, 5)
    .pipe(
      map(val => of(val).pipe(delay(val * 100))),
      overlapMap(stream => stream),
      reduceAll()
    )
    .subscribe(
      values => {
        expect(values).toEqual([1, 5])
      },
      reportError,
      done
    )
})

test('should execute sequentially', done => {
  const origin = Date.now()

  of(3, 1, 5, 6, 7, 3, 8, 9, 5)
    .pipe(
      map(val => of(val).pipe(delay(val * 100))),
      overlapMap(stream => stream),
      map(value => ({
        time: Math.round((Date.now() - origin) / 100),
        value
      })),
      reduceAll()
    )
    .subscribe(
      values => {
        expect(values).toEqual([
          {
            time: 2,
            value: 1
          },
          {
            time: 10,
            value: 5
          }
        ])
      },
      reportError,
      done
    )
})

test('should execute in parallel', done => {
  const origin = Date.now()

  of(3, 1, 5, 6, 7, 3, 8, 9, 5)
    .pipe(
      map(val => of(val).pipe(delay(val * 100))),
      overlapMap(syncReplay()),
      map(value => ({
        time: Math.round((Date.now() - origin) / 100),
        value
      })),
      reduceAll()
    )
    .subscribe(
      values => {
        expect(values).toEqual([
          {
            time: 1,
            value: 1
          },
          {
            time: 3,
            value: 3
          },
          {
            time: 5,
            value: 5
          }
        ])
      },
      reportError,
      done
    )
})
