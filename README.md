# RxJS overlapMap

## Motivation

RxJS switchMap operator switch to new inner Observable everytime it receives new value from source Observable. Meanwhile, when making multiple HTTP requests for searching or fetching data, we usually want to switch to the latest emitted inner Observable than waiting for the latest inner Observable to emit (\*):

```js
clicks.pipe(overlapMap(() => ajax.get('/api')))
```

> (\*): For example purpose, you should use `overlapMap` with `syncReplay` to archive the expected behavior. See [Optimization](#optimization) section for more information.

## Example

Given the following input Observable:

```jsx
const input$ = of(3, 1, 5).pipe(
  map(val => of(val).pipe(delay(val)))
)
// Expected output: 1, 5
```

The given Observable contains three inner Observables. The first emits 3 after 3ms, the second emits 1 after 1ms and the third emits 5 after 5ms. Our expected behavior is to make the application output 1 and 5.

Using `switchMap` the output will be 5 only:

```jsx
input$
  .pipe(switchMap(stream => stream))
  .subscribe(val => console.log(val))
// Output: 5
```

It means that even 1 and 3 has been emitted, we still have to wait until the last stream emits 5 to receive the output.

If we use `mergeMap`, the output is mandatory:

```jsx
input$
  .pipe(mergeMap(stream => stream))
  .subscribe(val => console.log(val))
// Output: 1, 3, 5
```

But the order is not preserved, the data may become stale.

Using `concatMap` we can preserve the stream order:

```jsx
input$
  .pipe(concatMap(stream => stream))
  .subscribe(val => console.log(val))
// Output: 3, 1, 5
//         ^
//         Late comming response
```

But a new stream always have to wait for the previous stream to finish to move to the next stream. Furthermore, late comming response cannot be omitted.

Using `overlapMap`, we will get expected output:

```jsx
input$
  .pipe(overlapMap(stream => stream))
  .subscribe(val => console.log(val))
// Output: 1, 5
```

## Optimization

If you inspect streams with `tap` you may realize unexpected behavior:

```jsx
const origin = Date.now()

const stream1 = of(1).pipe(
  delay(100),
  tap(() =>
    console.log(`1: ${Math.round((Date.now() - origin) / 100)}`)
  )
)
const stream3 = of(2).pipe(
  delay(300),
  tap(() =>
    console.log(`3: ${Math.round((Date.now() - origin) / 100)}`)
  )
)
const stream5 = of(3).pipe(
  delay(500),
  tap(() =>
    console.log(`5: ${Math.round((Date.now() - origin) / 100)}`)
  )
)

of(stream3, stream1, stream3, stream5)
// Output:
//  1: 1
//  1: 2
//  5: 5
//  5: 10
```

It means each stream if lazy will be called twice. To optimize it you should use `overlapMap` with `syncReplay` (\*):

> (\*): https://www.npmjs.com/package/rxjs-sync-operator

The result will be expected:

```jsx
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
  .subscribe(values => console.log(values))

// Ouput:
// [ { time: 1, value: 1 },
//   { time: 3, value: 3 },
//   { time: 5, value: 5 } ]
```
