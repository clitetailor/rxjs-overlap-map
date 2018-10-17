import { of, merge } from 'rxjs'
import { delay, map, reduce, concat } from 'rxjs/operators'

import { overlapMap, sequentialMap } from '../index'

const reduceAll = () =>
  reduce((acc, value) => acc.concat([value]), [])

const reportError = e => expect(e).not.toBeDefined()

describe('overlapMap', () => {
  it('should output 1, 5', done => {
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

  it('should execute in parallel', done => {
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
})

describe('sequentialMap', () => {
  it('should work the same with `mergeMap`', done => {
    const origin = Date.now()

    const mergeMap = callback => source =>
      source.pipe(
        map(callback),
        sequentialMap((prev, next) => merge(prev, next))
      )

    of(3, 1, 5, 6)
      .pipe(
        map(val => of(val).pipe(delay(val * 100))),
        mergeMap(stream => stream),
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
            },
            {
              time: 6,
              value: 6
            }
          ])
        },
        reportError,
        done
      )
  })

  it('should work the same with `concatMap`', done => {
    const origin = Date.now()

    const concatMap = callback => source =>
      source.pipe(
        map(callback),
        sequentialMap((prev, next) => prev.pipe(concat(next)))
      )

    of(3, 1, 5, 6)
      .pipe(
        map(val => of(val).pipe(delay(val * 100))),
        concatMap(stream => stream),
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
              time: 3,
              value: 3
            },
            {
              time: 4,
              value: 1
            },
            {
              time: 9,
              value: 5
            },
            {
              time: 15,
              value: 6
            }
          ])
        },
        reportError,
        done
      )
  })
})
