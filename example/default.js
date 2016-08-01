'use strict';

const Logger = require('../index');

let console = new Logger({
    file: __dirname + '/test.txt',
    //style: ['blue'],
    // date: 'file',
    // time: true,
    useStderr: false
});

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

console.groupCollapsed('Group test #3');
console.assert(false, 'Test assert #3');
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
console.groupEnd();

console.info('Info', {test: 1});
console.debug('Debug', {test: 1});
console.error('Error', {test: 1});

console.count('Counter');
console.count('Counter');
console.count('Counter');
console.count('Counter');
console.count('Counter');

console.time('Timer #1');
console.timeEnd('Timer #1');

console.time('Timer #2');
setTimeout(() => {
    console.timeEnd('Timer #2');
}, 1000);