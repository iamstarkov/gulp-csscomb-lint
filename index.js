'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var fs = require('fs');
var Comb = require('csscomb');
var _ = require('lodash');

module.exports = function (config) {
    var out = [];

    log = log.bind(null, options.verbose);

    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        if (file.isStream()) {
            this.emit('error', new gutil.PluginError('gulp-csscomb-lint', 'Streaming not supported!'));
            return cb();
        }

        if (invalidExtension(file)) {
            this.push(file);
            return cb();
        }

        log('Processing ' + gutil.colors.magenta(file.path));

        var comb = new Comb(getConfig(config, file, cb) || 'csscomb');

        try {
            var processed = comb.processString(file.contents.toString('utf8'), { filename: file.path });

            if (processed !== file.contents.toString('utf8')) {
                out.push('! ' + file.path);
            }
            this.push(file);
            return cb();
        } catch (err) {
            this.emit('error', new gutil.PluginError('gulp-csscomb-lint', err));
        }

        this.push(file);
        return cb();
    }, function(cb) {

        if (out.length > 0) {
            this.emit('error', new gutil.PluginError('gulp-csscomb-lint', [
                gutil.colors.red('\nCSScomb linting failed for these files:'),
                out.join('\n')
            ].join('\n')));
        }
        cb();
    });
};

function log(verbose, string) {
    if (verbose) {
        gutil.log('gulp-csscomb-lint', string);
    }
}

function invalidExtension(file) {
    var validExtensions = ['.css', '.sass', '.scss', '.less'];
    var fileExtension = path.extname(file.path);

    return validExtensions.indexOf(fileExtension) === -1;
}

function getConfig(config, file, cb) {
    var configFile;

    if ((typeof config === 'undefined' &&
        (fs.existsSync(configFile = (path.join(path.dirname(file.path), '.csscomb.json'))) ||
            fs.existsSync(configFile = (path.join(process.cwd(), '.csscomb.json'))))) ||
        (typeof config === 'string' && config.indexOf('.') !== -1 && fs.existsSync(configFile = (config)))) {

        try {
            config = require(configFile);
        } catch (err) {
            this.emit('error', new gutil.PluginError('gulp-csscomb-lint', 'Failed to load configuration from ' + configFile + '. ' + err.message));
            return cb();
        }

        log('Using configuration file ' + gutil.colors.magenta(configFile));
    }

    return config;
}
