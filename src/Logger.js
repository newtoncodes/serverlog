'use strict';

const Stream = require('./Stream');


class Logger {
    /**
     * @param {object} [options]
     * @param {string|Array.<string>} [options.style]
     * @param {string} [options.file]
     * @param {boolean} [options.silent]
     * @param {boolean} [options.date]
     * @param {boolean} [options.time]
     */
    constructor(options = {}) {
        this.__default = new Stream(options);
    }

    /**
     * @param {boolean|*} assertion
     * @param {string|*} msg
     * @param {...*} [param]
     */
    assert(assertion, msg, param) {
        this.__default.assert.apply(this.__default, arguments);
    }

    /**
     *
     */
    clear() {
        this.__default.clear.apply(this.__default, arguments);
    }

    /**
     * @param {...*} [param]
     */
    write(param) {
        this.__default.write.apply(this.__default, arguments);
    }

    /**
     * @param {...*} [param]
     */
    log(param) {
        this.__default.log.apply(this.__default, arguments);
    }

    /**
     * @param {...*} [param]
     */
    info(param) {
        this.__default.info.apply(this.__default, arguments);
    }

    /**
     * @param {...*} [param]
     */
    debug(param) {
        this.__default.debug.apply(this.__default, arguments);
    }

    /**
     * @param {*} object
     * @param {string} title
     * @param {object} [options]
     */
    dir(object, title, options) {
        this.__default.dir.apply(this.__default, arguments);
    }

    /**
     * @param {...*} [param]
     */
    table(param) {
        this.__default.table.apply(this.__default, arguments);
    }

    /**
     * @param {...*} [error]
     */
    error(error) {
        this.__default.error.apply(this.__default, arguments);
    }

    /**
     * @param {...*} [warning]
     */
    warn(warning) {
        this.__default.warn.apply(this.__default, arguments);
    }

    /**
     *
     */
    trace(text) {
        this.__default.trace.apply(this.__default, arguments);
    }

    /**
     * @param {...*} [param]
     */
    group(param) {
        this.__default.group.apply(this.__default, arguments);
    }

    /**
     * @param {...*} [param]
     */
    groupCollapsed(param) {
        this.__default.groupCollapsed.apply(this.__default, arguments);    }

    /**
     *
     */
    groupEnd() {
        this.__default.groupEnd.apply(this.__default, arguments);
    }

    /**
     * @param {string} key
     */
    count(key) {
        this.__default.count.apply(this.__default, arguments);
    }

    /**
     * @param {string} key
     */
    time(key) {
        this.__default.time.apply(this.__default, arguments);
    }

    /**
     * @param {string} key
     */
    timeEnd(key) {
        this.__default.timeEnd.apply(this.__default, arguments);
    }

    /**
     * Not implemented
     * @deprecated
     */
    profile() {
        //noinspection JSDeprecatedSymbols
        this.__default.profile.apply(this.__default, arguments);
    }

    /**
     * Not implemented
     * @deprecated
     */
    profileEnd() {
        //noinspection JSDeprecatedSymbols
        this.__default.profileEnd.apply(this.__default, arguments);
    }

    /**
     * Not implemented
     * @deprecated
     */
    timeStamp() {
        //noinspection JSDeprecatedSymbols
        this.__default.timeStamp.apply(this.__default, arguments);
    }

    /**
     * @param {string} name
     * @param {Object} options
     * @param {string|Array.<string>} [options.style]
     * @param {string} [options.file]
     * @param {boolean} [options.silent]
     * @param {boolean} [options.useStderr]
     */
    add(name, options) {
        this[name] = new Stream(options);
    }

    /**
     * @param {string} name
     */
    remove(name) {
        if (this[name] && (this[name] instanceof Stream)) delete this[name];
    }

    /**
     * @param {boolean} silent
     */
    set silent(silent) {
        this.__default.silent = silent;
    }

    /** @return {string} */
    get file() {
        return this.__default.file;
    }

    /** @return {boolean} */
    get silent() {
        return this.__default.silent;
    }

    /** @return {Array.<string>} */
    get style() {
        return this.__default.style;
    }
}


module.exports = Logger;