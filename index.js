'use strict'
const gutil = require('gulp-util')
const through = require('through2')
const fs = require('fs')
const colors = require('colors');

module.exports = function (options) {
  options = options || {};

  let importStack = {};
  let _path = '';

  const importJS = (path) => {
    if (!path) {
      return '';
    }

    const fileReg = /@import\s["'](.*\.js)["']/gi;


    if (!fs.existsSync(path)) {
      throw new Error('file ' + path + ' no exist')
    }

    let content = fs.readFileSync(path, {
      encoding: 'utf8'
    })

    importStack[path] = path;

    content = content.replace(fileReg, (match, fileName) => {
      let importPath = path.replace(/[^\/]*\.js$/, fileName);

      if (importPath in importStack) {
        return '';
      }

      !options.hideConsole && console.log('import: ' + colors.magenta(fileName));
      // _path = _path !== path ? ;
      if (_path !== path) {
        _path = path;
      }
      let importContent = importJS(importPath) || '';

      return importContent;
    });
    return content;
  }


  return through.obj(function (file, enc, cb) {
    if (file.isNull()) {
      cb(null, file);
      return;
    }

    if (file.isStream()) {
      cb(new gutil.PluginError('gulp-js-import', 'Streaming not supported'));
      return;
    }

    let content;
    try {
      content = importJS(file.path)
    } catch (e) {
      cb(new gutil.PluginError('gulp-js-import', e.message));
      return;
    }

    file.contents = new Buffer(content);
    file.path = gutil.replaceExtension(file.path, '.js');

    !options.hideConsole && _path && console.log('   |--> '.gray + colors.magenta.bold(_path));
    console.log('gulp-js-import finished.'.rainbow);


    cb(null, file);
  });
};
