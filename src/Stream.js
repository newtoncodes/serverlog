'use strict';

const Fs = require('fs'),
    Util = require('util'),
    Colors = require('colors');

let _consoleDepth = 0;


class Stream {
    /**
     * @param {object} [options]
     * @param {string|Array.<string>} [options.style]
     * @param {string} [options.file]
     * @param {boolean} [options.silent]
     * @param {boolean} [options.useStderr]
     */
    constructor(options = {}) {
        let {style, file, silent, date, time, useStderr} = options;

        if (typeof date === 'undefined') date = 'file';
        if (typeof time === 'undefined') time = true;

        /**
         * @type {string}
         * @protected
         */
        this._file = '';

        /**
         * @type {boolean}
         * @protected
         */
        this._silent = false;

        /**
         * @type {Array.<string>}
         * @protected
         */
        this._style = null;

        /**
         * @type {object}
         * @protected
         */
        this._counters = {};

        /**
         * @type {object}
         * @protected
         */
        this._timers = {};

        /**
         * @type {number}
         * @protected
         */
        this._depth = 0;

        /**
         * @type {boolean}
         * @protected
         */
        this._nlConsole = true;

        /**
         * @type {boolean}
         * @protected
         */
        this._dateConsole = true;

        /**
         * @type {boolean}
         * @protected
         */
        this._timeConsole = true;

        /**
         * @type {boolean}
         * @protected
         */
        this._nlFile = true;

        /**
         * @type {boolean}
         * @protected
         */
        this._dateFile = true;

        /**
         * @type {boolean}
         * @protected
         */
        this._timeFile = true;

        if (style) {
            if (typeof style === 'string') style = [style].filter(s => STYLES.indexOf(s) !== -1);
            else if (Array.isArray(style)) style = style.filter(s => STYLES.indexOf(s) !== -1);
            else style = [];
        }


        this._dateConsole = (date === 'console' || date === true);
        this._dateFile = (date === 'file' || date === true);
        this._timeConsole = (time === 'console' || time === true);
        this._timeFile = (time === 'file' || time === true);

        this._file = file || null;
        this._silent = silent || false;
        this._style = style || [];
        this._style.unshift('reset');

        this._useStderr = useStderr || false;

        this._lastDate = null;
    }

    /**
     * @param {boolean|*} assertion
     * @param {string|*} msg
     * @param {...*} [param]
     */
    assert(assertion, msg, param) {
        if (assertion) return;

        let args = [].filter.call(arguments, (arg, i) => i > 0);

        if (typeof args[0] === 'string') args[0] = 'Assertion failed: ' + args[0];
        else args.unshift('Assertion failed:');

        this.error.apply(this, args);
    }

    /**
     *
     */
    clear() {
        this.clearConsole();
        this.clearFile();
        this._depth = 0;
        _consoleDepth = 0;
    }

    /**
     * @param {...*} [param]
     */
    write(param) {
        let text = (arguments.length === 1 && typeof param === 'string') ? param : Util.format.apply(this, arguments);
        this.writeConsole(text, this._style);
        this.writeFile(text);
    }

    /**
     * @param {...*} [param]
     */
    log(param) {
        this.write(Util.format.apply(this, arguments) + '\n');
    }

    /**
     * @param {...*} [param]
     */
    info(param) {
        this.log.apply(this, arguments);
    }

    /**
     * @param {...*} [param]
     */
    debug(param) {
        this.log.apply(this, arguments);
    }

    /**
     * @param {*} object
     * @param {string} title
     * @param {object} [options]
     */
    dir(object, title, options) {
        if (arguments.length === 2) {
            if (typeof arguments[1] === 'object') {
                options = arguments[1];
                title = '';
            }
        }

        title = title ? title + ': ' : '';

        this.log(title + Util.inspect(object, options));
    }

    /**
     * @param {...*} [param]
     */
    table(param) {
        this.dir.apply(this, arguments);
    }

    /**
     * @param {...*} [error]
     */
    error(error) {
        let stack = '';
        let text = Util.format.apply(this, arguments);

        this.writeConsole('[ERROR] ', ['red', 'bold'], this._useStderr ? 'stderr' : 'stdout');
        this.writeFile('[ERROR] ');
        this.writeConsole(text + '\n', this._style, this._useStderr ? 'stderr' : 'stdout');
        this.writeFile(text + '\n');
    }

    /**
     * @param {...*} [warning]
     */
    warn(warning) {
        let stack = '';

        let text = Util.format.apply(this, arguments);

        this.writeConsole('[WARN] ', ['magenta', 'bold'], this._useStderr ? 'stderr' : 'stdout');
        this.writeFile('[WARN] ');
        this.writeConsole(text + '\n', this._style, this._useStderr ? 'stderr' : 'stdout');
        this.writeFile(text + '\n');
    }

    /**
     *
     */
    trace(text) {
        let stack = ((new Error()).stack || '').replace(/Error[^\w]+/, '').replace(/(?:\s*at\s+[A-Z]\w+\.trace\s*\(.*\.js.?:\d+:\d+\))+/, '');

        this.writeConsole('[TRACE] ', ['bold']);
        this.writeFile('[TRACE]');

        this.log(stack);
    }

    /**
     * @param {...*} [param]
     */
    group(param) {
        this.write('+ ' + Util.format.apply(this, arguments) + '\n');
        this._depth ++;
        _consoleDepth ++;
    }

    /**
     * @param {...*} [param]
     */
    groupCollapsed(param) {
        this.group.apply(this, arguments);
    }

    /**
     *
     */
    groupEnd() {
        this._depth = Math.max(this._depth - 1, 0);
        _consoleDepth = Math.max(_consoleDepth - 1, 0);
    }

    /**
     * @param {string} key
     */
    count(key) {
        this._counters[key] = this._counters[key] || 0;
        this._counters[key] ++;
        this.log(key + ':', this._counters[key]);
    }

    /**
     * @param {string} key
     */
    time(key) {
        this._timers[key] = this._timers[key] || Date.now();
    }

    /**
     * @param {string} key
     */
    timeEnd(key) {
        let delta = 0;
        if (this._timers[key]) {
            delta = Date.now() - this._timers[key];
            delete this._timers[key];
        }

        this.log(key + ':', delta + 'ms');
    }

    /**
     * Not implemented
     * @deprecated
     */
    profile() {}

    /**
     * Not implemented
     * @deprecated
     */
    profileEnd() {}

    /**
     * Not implemented
     * @deprecated
     */
    timeStamp() {}

    /**
     *
     * @param {string} text
     * @protected
     */
    writeFile(text) {
        if (!this._file) return;

        let d = getDate(this._dateFile, this._timeFile);
        if (d) d = ' ' + d + '  ';
        else d = ' ';

        if (!this._nlFile) {
            if (text.indexOf('\n') !== -1) {
                let first = text.match(/[^\n]*\n/);
                first = first ? first[0] : '';
                if (first) {
                    //noinspection JSCheckFunctionSignatures
                    text = text.replace(first, '');
                }

                if (this._depth) text = indent(text, ':  '.repeat(this._depth));
                text = first + (d ? indent(text, ' '.repeat(d.length)) : '');
            } else {
                if (this._depth) text = indent(text, ':  '.repeat(this._depth));
            }
        } else {
            if (this._depth) text = indent(text, ':  '.repeat(this._depth));

            text = appendDate(text, this._dateFile, this._timeFile);
        }

        this._nlFile = (text.slice(-1) === '\n');

        Fs.appendFileSync(this._file, text, 'utf8');
    }

    /**
     *
     * @param {string} text
     * @param {Array.<string>} [style]
     * @param {string} [stream='stdout']
     * @protected
     */
    writeConsole(text, style = null, stream = 'stdout') {
        if (this._silent) return;

        let d = getDate(this._dateConsole, this._timeConsole);
        if (d) d = ' ' + d + '  ';
        else d = ' ';

        let f = buildStyle(style);
        text = style ? text.split(/\n/).map(text => f(text)).join('\n') : text;

        if (!this._nlConsole) {
            if (text.indexOf('\n') !== -1) {
                let first = text.match(/[^\n]*\n/);
                first = first ? first[0] : '';
                if (first) {
                    //noinspection JSCheckFunctionSignatures
                    text = text.replace(first, '');
                }

                if (_consoleDepth) text = indent(text, ':  '.repeat(_consoleDepth), ['gray']);
                text = first + (d ? indent(text, ' '.repeat(d.length), ['gray']) : '');
            } else {
                if (_consoleDepth) text = indent(text, ':  '.repeat(_consoleDepth), ['gray']);
            }
        } else {
            if (_consoleDepth) text = indent(text, ':  '.repeat(_consoleDepth), ['gray']);

            text = appendDate(text, this._dateConsole, this._timeConsole, ['grey', 'italic']);
        }

        this._nlConsole = (text.slice(-1) === '\n');

        // console.log({}, text.split(/\n/).map(text => f(text)));
        process[stream].write(text);
    }

    /**
     *
     */
    clearFile() {
        if (!this._file) return;
        Fs.writeFileSync(this._file, '', 'utf8');
    }

    /**
     *
     */
    clearConsole() {
        this.writeConsole('\x1B[2J\x1B[0f');
    }

    /** @return {string} */
    get file() {
        return this._file;
    }

    /** @return {boolean} */
    get silent() {
        return this._silent;
    }

    /** @return {Array.<string>} */
    get style() {
        return this._style;
    }
}

const STYLES = [
    'black',
    'red',
    'green',
    'yellow',
    'blue',
    'magenta',
    'cyan',
    'white',
    'gray',
    'grey',
    'bgBlack',
    'bgRed',
    'bgGreen',
    'bgYellow',
    'bgBlue',
    'bgMagenta',
    'bgCyan',
    'bgWhite',
    'styles',
    'reset',
    'bold',
    'dim',
    'italic',
    'underline',
    'inverse',
    'hidden',
    'strikethrough'
];

function getDate(date, time) {
    if (!date && !time) return '';

    let t = new Date();
    let d = t.getFullYear().toString().slice(-2) + '-' + ('0' + t.getMonth()).slice(-2) + '-' + ('0' + t.getDate()).slice(-2);
    let h = ('0' + t.getHours()).slice(-2) + ':' + ('0' + t.getMinutes()).slice(-2) + ':' + ('0' + t.getSeconds()).slice(-2);

    if (date && !time) return d;
    if (!date && time) return h;

    return d + ' ' + h;
}

function indent(text, str, styles) {
    let style = styles ? buildStyle(styles) : s => s;
    str = style(str);
    return (text || '').replace(/^(.)/gm, (s, a) => str + a);
}

function appendDate(text, date, time, styles) {
    let d = getDate(date, time);
    if (d) d = ' ' + d + '  ';
    else d = ' ';
    let r = ' '.repeat(d.length);

    let style = styles ? buildStyle(styles) : s => s;
    return (text || '').replace(/^(.)/gm, (s, a) => r + a).replace(r, d.length > 1 ? style(d) : d);
}

function buildStyle(styles) {
    return styles.reduce((current, style) => current[style] || Colors[style], s => s);
}


module.exports = Stream;