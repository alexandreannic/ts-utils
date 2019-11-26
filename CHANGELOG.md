# 2.1.0 

- Add `filterUndefined`, `toPromise`, `throwIfUndefined`, `throwIf` functions
- Add type `Index<T>`
- remove `fs-extra` dependency

# 2.2.0

- Add functions `queryStringToObject` and `objectToQueryString`

# 2.2.1

- Fix an issue when `queryStringToObject` function was receiving an empty string

# 2.3.0

### Features

##### Progress
- `linesPerSecond` and `remainingTime` are now respectively named `linesPerSecondAvg` and `remainingTimeAvg`.
- `linesPerSecond` and `remainingTime` now contains the value related to the previous computed snapshot.

##### FileSplitter
- Implement based on existing mics version but fixing asynchronous issue.
