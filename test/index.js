var helper = require('./helper');
var test = helper.test;

describe('#cloudant-toolkit', function (done) {
    this.timeout(2 * 60000);
    test('@EXTENSION-TEST', './extension-test');
})