# gulp-csscomb-lint

[![Greenkeeper badge](https://badges.greenkeeper.io/iamstarkov/gulp-csscomb-lint.svg)](https://greenkeeper.io/)

> Lint CSS coding style with [CSScomb](https://npmjs.org/package/csscomb).

## Installation

Install via [npm](https://npmjs.org/package/gulp-csscomb-lint):

```
npm i --save-dev gulp-csscomb-lint
```

## Usage

```js
var gulp = require('gulp');
var csscombLint = require('gulp-csscomb-lint');

gulp.task('lint', function() {
    return gulp.src(['/css/*.css'])
        .pipe(csscombLint());
});
```

## Options

If there is `.csscomb.json` file present in the same folder as the source file(s),
or in the project root folder, `gulp-csscomb-lint` will read config settings from it
instead of default config.

You can also specify a pre-defined configuration. Ex.: `csscomb('zen')`

## License

MIT (c) 2014 Vladimir Starkov.
