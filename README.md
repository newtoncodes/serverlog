# serverlog

Server file/console log utility.

## Installation

`npm install --save serverlog`

## Description

This logger is 99% compatible with the known console api of chrome and firefox.

Supports timers, counters and groups. Also colors.

**Twin brother for the browser - browserlog:**

https://www.npmjs.com/package/browserlog

https://github.com/newtoncodes/browserlog


### Default logger
~~~js
'use strict';

const Logger = require('../index');

// All options are optional!

let console = new Logger({
    file: __dirname + '/test.txt', // Save file path
    saveLogger: false,             // Save current log to the main logger too
    style: ['blue'],               // List of all styles
    silent: false,                 // Mute console output
    fileDate: true,                // Display date in saved file
    fileTime: true,                // Display time in saved file
    colors: true,                  // Display colors and styles in console
    colorsFull: false,             // If label is set, only it will be colorful
                                   // To make the whole log colorful, set this to true
    consoleDate: false,            // Display date in console output
    consoleTime: true,             // Display time in console output
    consoleStderr: false,          // Use stderr instead of stdout to print errors in console
    label: ''                      // Label to be displayed next to each message
});

console.log('Test.');
~~~


### Multiple streams
~~~js
'use strict';

const Logger = require('../index');

let console = new Logger({
    file: __dirname + '/test.txt',
    label: 'APP'
    consoleStderr: false
});

console.add('stream1', {
    file: __dirname + '/test1.txt',
    style: ['blue'],
    label: 'STREAM 1',
    consoleStderr: false
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
    consoleStderr: false
});

logger.test1 = new Stream({
    file: __dirname + '/test1.txt',
    style: ['blue'],
    consoleStderr: false,
    label: 'TEST 2'
});

logger.test2 = new Stream({
    file: __dirname + '/test2.txt',
    style: ['green'],
    consoleStderr: false,
    label: 'TEST 2'
});

module.exports = logger;

// Now we import the logger from other files. It can replace console:
const console = require('./LocalLogger.js');

console.log('Test default.');
console.test1.log('Test stream 1.');
console.test2.log('Test stream 2.');
~~~

### Examples
```javascript
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