import { Observable, OperatorFunction } from 'rxjs'

declare function overlap<R>(
  ...sources: Array<Observable<any>>
): Observable<R>

declare function overlap<T extends Array<Observable<any>>, R>(
  ...sources: T
): Observable<R>

declare function overlapMap<T, R>(
  project: (value: T, index: number) => Observable<R>
): OperatorFunction<T, R>

declare function overlapMap<T, R>(
  project: (value: T, index: number) => Observable<R>
): OperatorFunction<T, R>

declare function sequentialMap<R>(
  project: (
    acc: Observable<R>,
    next: Observable<any>,
    index: number
  ) => Observable<R>
): OperatorFunction<Observable<any>, R>

declare function sequentialMap<T extends Observable<any>, R>(
  project: (
    acc: Observable<R>,
    next: T,
    index: number
  ) => Observable<R>
): OperatorFunction<T, R>
