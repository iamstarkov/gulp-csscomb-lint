'use strict';
var path = require('path');
var gutil = require('gulp-util');
var through = require('through2');
var fs = require('fs');
var Comb = require('csscomb');

module.exports = function (config, verbose) {
    var badFiles = [];

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

        var comb = new Comb(getConfig(config, file, cb) || 'csscomb');
        var content = file.contents.toString('utf8');
        var filename = path.relative(file.cwd, file.path)

        try {
            if (content !== comb.processString(content, { filename: file.path })) {
                badFiles.push(filename);
            }
        } catch (e) {
            badFiles.push(filename);
        }


        this.push(file);
        return cb();
    }, function(cb) {

        if (badFiles.length) {
            var message = gutil.colors.red([
                '\nCSScomb linting failed for these files:',
                badFiles.map(function(filename) { return '• ' + filename; })
            ].join('\n'));

            this.emit('error', new gutil.PluginError('gulp-csscomb-lint', message));
        }
        cb();
    });
};

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
    }

    return config;
}
