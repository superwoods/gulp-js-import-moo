'use strict'
const gutil = require('gulp-util')
const through = require('through2')
const fs = require('fs')
const dateFormat = require('dateformat');
const colors = require('colors');

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});


module.exports = function (options) {
  options = options || {};

  let importStack = {};
  let _path = '';

  const getTime = (formats) => {
    return dateFormat(new Date(), formats);
  };


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

      !options.hideConsole && console.log('[' + `${getTime("HH:MM:ss")}`.input + '] ' + 'import: \'' + fileName + '\'');
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


    // console.log('[' + `${now}`.input + ']' + `\nGulp Finish build ==//==>`.green + ` ${pkg.name}`.grey + ` Update v${pkg.version}`.error);
    _path && console.log('[' + `${getTime("HH:MM:ss")}`.input + ']   |---> \'' + _path + '\'');

    !options.hideConsole && console.log('[' + `${getTime("HH:MM:ss")}`.input + '] ' + 'gulp-js-import finished.');
    cb(null, file);
  });
};
