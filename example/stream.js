'use strict';

const Stream = require('../index').Stream;

let stream = new Stream({
    file: __dirname + '/test.txt',
    //style: ['blue'],
    time: false,
    // date: 'file',
    // time: true,
});

stream.assert(false, 'Test assert #1');

stream.write('Test write on single line', '... ');
stream.write('D');
stream.write('O');
stream.write('N');
stream.write('E\n');

stream.log('MULTI\nLINE\nTEXT\nLOG');

stream.group('Group test #1');
stream.log('Normal log behavior:', 2, {test: 1});
stream.table({test: 1}, 'Some compatibility fns.');
stream.debug({test: 1}, 'Some alias fns.');

stream.groupCollapsed('Group test #2');
stream.assert(false, 'Test assert #2');
stream.log('In-group log...', {test: 2});
stream.dir({test: 2}, 'Inspect');

stream.groupCollapsed('Group test #3');
stream.assert(false, 'Test assert #3');
stream.log('In-group log...', {test: 2});
stream.dir({test: 2}, 'Inspect');

// stream.clear();
stream.groupEnd();

function someFunction() {
    stream.trace();
    throw new Error('Test error');
}

function someFunction2() {
    someFunction();
}

try {
    someFunction();
} catch (e) {
    stream.error(e);
    stream.warn(e);
}

stream.groupEnd();
stream.groupEnd();

stream.info('Info', {test: 1});
stream.debug('Debug', {test: 1});
stream.error('Error', {test: 1});

stream.count('Counter');
stream.count('Counter');
stream.count('Counter');
stream.count('Counter');
stream.count('Counter');

stream.time('Timer #1');
stream.timeEnd('Timer #1');

stream.time('Timer #2');
setTimeout(() => {
    stream.timeEnd('Timer #2');
}, 1000);