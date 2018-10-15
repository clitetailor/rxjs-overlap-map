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

Using `overlapMap`, we will get expected output:

```jsx
input$
  .pipe(overlapMap(stream => stream))
  .subscribe(val => console.log(val))
// Output: 1, 5
```
