'use strict';

const Fs = require('fs');
const Util = require('util');
const Colors = require('chalk');

const original = {
    assert: console.assert.bind(console),
    log: console.log.bind(console),
    info: console.info.bind(console),
    dir: console.dir.bind(console),
    table: console.table ? console.table.bind(console) : console.dir.bind(console),
    error: console.error.bind(console),
    warn: console.warn.bind(console),
    trace: console.trace.bind(console),
    time: console.time.bind(console),
    timeEnd: console.timeEnd.bind(console)
};

let _consoleDepth = 0;


class Stream {
    /**
     * @param {Logger} [logger]
     * @param {object} [options]
     * @param {string|Array.<string>} [options.style]
     * @param {boolean} [options.silent]
     * @param {string} [options.file]
     * @param {boolean} [options.saveLogger]
     * @param {boolean} [options.fileDate]
     * @param {boolean} [options.fileTime]
     * @param {boolean} [options.colors]
     * @param {boolean} [options.colorsFull]
     * @param {boolean} [options.consoleDate]
     * @param {boolean} [options.consoleTime]
     * @param {boolean} [options.consoleStderr]
     * @param {string} [options.label]
     */
    constructor(logger, options) {
        if (arguments.length === 1) {
            if (logger.log && logger.assert && (typeof logger.error === 'function')) options = {};
            else {
                options = arguments[0];
                logger = null;
            }
        } else if (arguments.length === 0) {
            options = {};
            logger = null;
        }

        let {
            style,
            silent,
            file,
            saveLogger,
            fileDate,
            fileTime,
            colors,
            colorsFull,
            consoleDate,
            consoleTime,
            consoleStderr,
            label
        } = options;

        if (typeof fileDate === 'undefined') fileDate = true;
        if (typeof fileTime === 'undefined') fileTime = true;
        if (typeof colors === 'undefined') colors = true;
        if (typeof consoleDate === 'undefined') consoleDate = false;
        if (typeof consoleTime === 'undefined') consoleTime = true;
        if (typeof colorsFull === 'undefined') colorsFull = (colors && !label);

        /**
         * @type {Logger}
         * @protected
         */
        this._logger = logger;

        /**
         * @type {string}
         * @protected
         */
        this._file = file;

        /**
         * @type {boolean}
         * @protected
         */
        this._saveLogger = !!saveLogger;

        /**
         * @type {boolean}
         * @protected
         */
        this._silent = !!silent;

        /**
         * @type {boolean}
         * @protected
         */
        this._colors = !!colors;

        /**
         * @type {boolean}
         * @protected
         */
        this._colorsFull = !!colorsFull;

        /**
         * @type {Array.<string>}
         * @protected
         */
        this._style = [];

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
        this._consoleDate = !!consoleDate;

        /**
         * @type {boolean}
         * @protected
         */
        this._consoleTime = !!consoleTime;

        /**
         * @type {boolean}
         * @protected
         */
        this._fileDate = !!fileDate;

        /**
         * @type {boolean}
         * @protected
         */
        this._fileTime = !!fileTime;

        /**
         * @type {string}
         * @protected
         */
        this._label = label || '';

        /**
         * @type {boolean}
         * @protected
         */
        this._consoleStderr = !!consoleStderr;

        /**
         * @type {boolean}
         * @protected
         */
        this._nlFile = true;

        this.style = style;
        this.colors = colors;
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

        this.writeConsole('[ERROR] ', ['red', 'bold'], this._consoleStderr ? 'stderr' : 'stdout', false, true);
        this.writeFile('[ERROR] ');
        this.writeConsole(text + '\n', this._style, this._consoleStderr ? 'stderr' : 'stdout');
        this.writeFile(text + '\n');
    }

    /**
     * @param {...*} [warning]
     */
    warn(warning) {
        let stack = '';

        let text = Util.format.apply(this, arguments);

        this.writeConsole('[WARN] ', ['magenta', 'bold'], this._consoleStderr ? 'stderr' : 'stdout', false, true);
        this.writeFile('[WARN] ');
        this.writeConsole(text + '\n', this._style, this._consoleStderr ? 'stderr' : 'stdout');
        this.writeFile(text + '\n');
    }

    /**
     *
     */
    trace(text) {
        let stack = ((new Error()).stack || '').replace(/Error[^\w]+/, '').replace(/(?:\s*at\s+[A-Z]\w+\.trace\s*\(.*\.js.?:\d+:\d+\))+/, '');

        this.writeConsole('[TRACE] ', ['bold'], 'stdout', false, true);
        this.writeFile('[TRACE]');

        this.log(stack);
    }

    /**
     * @param {...*} [param]
     */
    group(param) {
        let text = Util.format.apply(this, arguments) + '\n';

        this.writeConsole(text, this._style, 'stdout', true);
        this.writeFile(text, true);

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
     * @param {string} text
     * @param {boolean} [startGroup]
     * @protected
     */
    writeFile(text, startGroup) {
        if (!this._file && !this._saveLogger) return;

        let nl = (text.slice(-1) === '\n');
        text = text.replace(/\n$/, '');

        if (!this._nlFile) {
            text = indentGroup(text, this._depth, null, true);

            if (text.indexOf('\n') !== -1) {
                text = indentLabel(text, this._label);
                text = indentDate(text, this._fileDate, this._fileTime);
            }
        } else {
            if (startGroup) text = appendGroup(text, this._depth + 1);
            text = indentGroup(text, this._depth);
            text = appendLabel(text, this._label);
            text = appendDate(text, this._fileDate, this._fileTime);
        }

        if (nl) text += '\n';
        this._nlFile = nl;

        if (this._file) Fs.appendFileSync(this._file, text, 'utf8');
        if (this._logger && this._saveLogger) this._logger.__addLog(text);
    }

    /**
     * @param {string} text
     * @param {Array.<string>} [style]
     * @param {string} [stream='stdout']
     * @param {boolean} [startGroup]
     * @param {boolean} [isLabel]
     * @protected
     */
    writeConsole(text, style = null, stream = 'stdout', startGroup, isLabel) {
        if (this._silent) return;

        let nl = (text.slice(-1) === '\n');
        text = text.replace(/\n$/, '');

        let originalStyle = this._style;
        if (!this._colors) style = originalStyle = null;
        if (!isLabel && !this._colorsFull) style = null;

        if (style) {
            let f = buildStyle(style);
            text = text.split(/\n/).map(t => f(t)).join('\n');
        }

        if (!this._nlConsole) {
            text = indentGroup(text, _consoleDepth, ['grey'], true);

            if (text.indexOf('\n') !== -1) {
                text = indentLabel(text, this._label, originalStyle);
                text = indentDate(text, this._consoleDate, this._consoleTime);
            }
        } else {
            if (startGroup) text = appendGroup(text, _consoleDepth + 1, ['grey']);
            text = indentGroup(text, _consoleDepth, ['grey']);
            text = appendLabel(text, this._label, originalStyle);
            text = appendDate(text, this._consoleDate, this._consoleTime, ['grey', 'italic']);
        }

        if (nl) text += '\n';
        this._nlConsole = nl;

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

    /**
     *
     */
    __addLog(text) {
        Fs.appendFileSync(this._file, text, 'utf8');
    }

    /**
     * @param {Array.<string>|string} style
     */
    set style(style) {
        if (style) {
            if (typeof style === 'string') style = [style].filter(s => STYLES.indexOf(s) !== -1);
            else if (Array.isArray(style)) style = style.filter(s => STYLES.indexOf(s) !== -1);
            else style = [];
        }

        this._style = style || [];

        //if (this._style.length && this._style[0] !== 'reset') this._style.unshift('reset');
    }

    /**
     * @param {boolean} silent
     */
    set silent(silent) {
        this._silent = !!silent;
    }

    /**
     * @param {string} file
     */
    set file(file) {
        return this._file = file;
    }

    /**
     * @param {boolean} save
     */
    set saveLogger(save) {
        this._saveLogger = !!saveLogger;
    }

    /**
     * @param {boolean} date
     */
    set fileDate(date) {
        this._fileDate = !!date;
    }

    /**
     * @param {boolean} time
     */
    set fileTime(time) {
        this._fileTime = !!time;
    }

    /**
     * @param {boolean} colors
     */
    set colors(colors) {
        this._colors = !!colors;
    }

    /**
     * @param {boolean} colorsFull
     */
    set colorsFull(colorsFull) {
        this._colorsFull = !!colorsFull;
    }

    /**
     * @param {boolean} consoleDate
     */
    set consoleDate(consoleDate) {
        this._consoleDate = !!consoleDate;
    }

    /**
     * @param {boolean} consoleTime
     */
    set consoleTime(consoleTime) {
        this._consoleTime = !!consoleTime;
    }

    /**
     * @param {boolean} consoleStderr
     */
    set consoleStderr(consoleStderr) {
        this._consoleStderr = !!consoleStderr;
    }

    /**
     * @param {string} label
     */
    set label(label) {
        this._label = label;
    }

    /** @return {Array.<string>|string} */
    get style() {
        return this._style;
    }

    /** @return {boolean} */
    get silent() {
        return this._silent;
    }

    /** @return {string} */
    get file() {
        return this._file;
    }

    /** @return {boolean} */
    get saveLogger() {
        return this._saveLogger;
    }

    /** @return {boolean} */
    get fileDate() {
        return this._fileDate;
    }

    /** @return {boolean} */
    get fileTime() {
        return this._fileTime;
    }

    /** @return {boolean} */
    get colors() {
        return this._colors;
    }

    /** @return {boolean} */
    get colorsFull() {
        return this._colorsFull;
    }

    /** @return {boolean} */
    get consoleDate() {
        return this._consoleDate;
    }

    /** @return {boolean} */
    get consoleTime() {
        return this._consoleTime;
    }

    /** @return {boolean} */
    get consoleStderr() {
        return this._consoleStderr;
    }

    /** @return {string} */
    get label() {
        return this._label;
    }

    /**
     * @returns {{assert: function, clear, log: function, info: function, debug: function, dir: function, table: function, error: function, warn: function, trace: function, group: function, groupCollapsed: function, groupEnd: function, count: function, time: function, timeEnd: function, profile: function, profileEnd: function, timeStamp: function}}
     */
    get original() {
        return original;
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
    return (text || '').replace(/^(.|$)/gm, (s, a) => str + a);
}

function appendDate(text, date, time, styles) {
    let d = getDate(date, time);
    if (d) d = ' ' + d + '  ';
    else d = ' ';
    let r = ' '.repeat(d.length);

    let style = (styles && styles.length) ? buildStyle(styles) : s => s;

    return (text || '').replace(/^(.|$)/gm, (s, a) => r + a).replace(r, d.length > 1 ? style(d) : d);
}

function indentDate(text, date, time) {
    let d = getDate(date, time);
    if (d) d = ' ' + d + '  ';
    else d = ' ';
    let r = ' '.repeat(d.length);

    return indent(text || '', r).replace(r, '');
}

function appendLabel(text, label, styles) {
    if (!label) return text;

    label = '[' + label + ']';
    let r = ' '.repeat(label.length + 1);

    let style = (styles && styles.length) ? buildStyle(styles) : s => s;
    label = style(label) + ' ';

    return (text || '').replace(/^(.|$)/gm, (s, a) => r + a).replace(r, label);
}

function appendGroup(text, depth, styles) {
    if (depth <= 0) return text;

    let r = '  '.repeat(depth);
    let style = (styles && styles.length) ? buildStyle(styles) : s => s;

    return (text || '').replace(/^(.|$)/gm, (s, a) => r + a).replace(r, style('+ '));
}

function indentLabel(text, label) {
    if (!label) return text;

    label = '[' + label + '] ';
    let r = ' '.repeat(label.length);

    return indent(text, r).replace(r, '');
}

function indentGroup(text, depth, styles, cut) {
    if (depth <= 0) return text;

    let r = ':  '.repeat(depth);
    let style = (styles && styles.length) ? buildStyle(styles) : s => s;
    r = style(r);

    let t = (text || '').replace(/^(.|$)/gm, (s, a) => r + a);
    if (cut) t = t.replace(r, '');

    return t;
}

function buildStyle(styles) {
    return (styles || []).reduce((current, style) => current[style] || Colors[style], s => s);
}


module.exports = Stream;