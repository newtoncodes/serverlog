# Server file/console log utility

This logger is compatible with the known console api of chrome and firefox.

Supports timers, counters and groups. Also colors.


### Default logger
~~~js
'use strict';

const Logger = require('../index');

// All options are optional!

let console = new Logger({
    file: __dirname + '/test.txt', // - save file path
    style: ['blue'],               // - list of all styles
    date: 'file',                  // - true means both file and console, false means none
    time: true,                    // - true means both file and console, false means none
    useStderr: false               // - use stderr to print errors in console
});

console.log('Test.');
~~~


### Multiple streams
~~~js
'use strict';

const Logger = require('../index');

let console = new Logger({
    file: __dirname + '/test.txt',
    useStderr: false
});

console.add('stream1', {
    file: __dirname + '/test1.txt',
    style: ['blue'],
    useStderr: false
});

console.log('Test default.');
console.stream1.log('Test stream.');
~~~


### Multiple streams singleton (IntelliSense support)
~~~js
'use strict';

const Logger = require('../index');
const Stream = Logger.Stream;

let logger = new Logger({
    file: __dirname + '/test.txt',
    useStderr: false
});

logger.test1 = new Stream({
    file: __dirname + '/test1.txt',
    style: ['blue'],
    useStderr: false
});

logger.test2 = new Stream({
    file: __dirname + '/test2.txt',
    style: ['green'],
    useStderr: false
});

module.exports = logger;

// Now we import the logger from other files. It can replace console:
const console = require('./LocalLogger.js');

console.log('Test default.');
console.stream1.log('Test stream.');
~~~

### Examples
```js
console.assert(false, 'Test assert #1');

console.write('Test write on single line', '... ');
console.write('D');
console.write('O');
console.write('N');
console.write('E\n');

console.log('MULTI\nLINE\nTEXT\nLOG');

console.group('Group test #1');
console.log('Normal log behavior:', 2, {test: 1});
console.table({test: 1}, 'Some compatibility fns.');
console.debug({test: 1}, 'Some alias fns.');

console.groupCollapsed('Group test #2');
console.assert(false, 'Test assert #2');
console.log('In-group log...', {test: 2});
console.dir({test: 2}, 'Inspect');

// console.clear();
console.groupEnd();

function someFunction() {
    console.trace();
    throw new Error('Test error');
}

function someFunction2() {
    someFunction();
}

try {
    someFunction();
} catch (e) {
    console.error(e);
    console.warn(e);
}

console.groupEnd();

console.info('Info', {test: 1});
console.debug('Debug', {test: 1});
console.error('Error', {test: 1});

console.count('Counter');
console.count('Counter');
console.count('Counter');

console.time('Timer #1');
console.timeEnd('Timer #1');

console.time('Timer #2');
setTimeout(() => {
    console.timeEnd('Timer #2');
}, 1000);
```