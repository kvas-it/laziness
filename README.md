# General purpose lazy evaluation library.

Status: completely experimental.


## Getting Started

Install the module with: `npm install laziness`

```js
var L = require('laziness');

var lazyFunc = L.func(function () {
    // expensive computation returning value.
});
var lazyValue = lazyFunc();

lazyValue.then(function (value) { // The computation will start here.
    console.log(value);
});
```


## Documentation

_(Coming soon)_


## Examples

_(Coming soon)_


## Contributing

In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com).


## License

Copyright (c) 2014 Vasily Kuznetsov  
Licensed under the MIT license.
