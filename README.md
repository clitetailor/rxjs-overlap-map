# RxJS overlapMap

## Motivation

RxJS switchMap operator switch to new inner Observable everytime it receives new value from source Observable. Meanwhile, when making multiple HTTP requests for searching or fetching data, we usually want to switch to the latest emitted inner Observable than waiting for the latest inner Observable to emit:

```js
clicks.pipe(overlapMap(() => ajax.get('/api')))
```

## Example

Given the following input Observable:

```jsx
const input$ = of(3, 1, 5).pipe(
  map(val => of(val).pipe(delay(val * 1000)))
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
//  1s -> 1
//  3s -> 3
//  5s -> 5
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
//  3s -> 3
//  4s -> 1
//  9s -> 9
```

But a new stream always have to wait for the previous stream to finish to move to the next stream. Furthermore, late comming response cannot be omitted.

Using `overlapMap`, we will get expected output:

```jsx
input$
  .pipe(overlapMap(stream => stream))
  .subscribe(val => console.log(val))
// Output:
//  1s -> 1
//  5s -> 5
```

## API Reference

### overlap

Flattens multiple Observables, previous values that being overlapped by the the next Observable will be ignored.

```ts
overlap(...observables: Array<ObservableInput<any>>): Observable<any>
```

### overlapMap

Overlap previous streams with new comming stream.

```jsx
clicks.pipe(overlapMap(() => interval(1000)))
```

### sequentialMap

Give a full control of new comming stream over previous projected streams.

```jsx
const overlapMap = sequentialMap((prev, next, index) =>
  overlap(prev, next)
)
const mergeMap = sequentialMap((prev, next, index) =>
  merge(prev, next)
)
```
