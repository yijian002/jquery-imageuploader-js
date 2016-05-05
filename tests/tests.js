/* global describe it */
var should = require('should');
var jsdom = require('jsdom');
var fs = require('fs');

var htmlSource = fs.readFileSync('./tests/html-stub.html', 'utf8');

var document = jsdom.jsdom(htmlSource);
var window = document.defaultView;
require('jquery')(window);

var scriptEl = window.document.createElement('script');
scriptEl.innerHTML = fs.readFileSync('./js/jquery.uploader.js', 'utf8');
window.document.body.appendChild(scriptEl);

global.document = document;
global.window = window;

// for when people don't write window in front of browser code
propagateToGlobal(window);
function propagateToGlobal (window) {
    for (var key in window) {
        if (!window.hasOwnProperty(key)) continue;
        if (key in global) continue;
        global[key] = window[key];
    }
}

describe('Setup', function () {
    describe('#clearout', function () {
        // set up the uploader
        window.$('.js-uploader-box').uploader();
        it('should have the required container still', function () {
            should.equal(1, window.$('.js-uploader-box').size());
        });
        it('should not have the stuff that was in there at first', function () {
            should.equal(0, window.$('.js-fallback-form').size());
        });
    });
    describe('#dom-elements', function () {
        it('should have added one submit button', function () {
            should.equal(1, window.$('.js-uploader__submit-button').size());
        });
        it('should have added the select button (label and input)', function () {
            should.equal(1, window.$('.js-uploader__file-input').size());
            should.equal(1, window.$('.js-uploader__file-label').size());
        });
        it('should have added general error text', function () {
            should.equal(1, window.$('.js-uploader__general-error-text').size());
        });
        it('should have added success text', function () {
            should.equal(1, window.$('.js-uploader__success-message').size());
        });
        it('should have added the nice list', function () {
            should.equal(1, window.$('.js-uploader__nice-list').size());
        });
        it('should have added the naughty list', function () {
            should.equal(1, window.$('.js-uploader__naughty-list').size());
        });
        it('should have added the usage bar container', function () {
            should.equal(1, window.$('.js-uploader__usage-bar-container').size());
        });
    });
});

describe('Drag and Drop', function () {
    describe('#drop', function () {
        it('should add a nice list item if a good file is dropped', function () {});
        it('should add a naughty list item if a bad file is dropped', function () {});
        it('should add a nice list item for each, if a set of good files is dropped', function () {});
        it('should add a naughty list item for each,  if a bad files is dropped', function () {});
    });
});

describe('File Select', function () {
    describe('#selectbutton', function () {
        it('should add a nice list item if a good file is selected', function () {});
        it('should add a naughty list item if a bad file is selected', function () {});
        it('should add a nice list item for each, if a set of good files is selected', function () {});
        it('should add a naughty list item for each,  if a bad files is selected', function () {});
    });
});

describe('Usage Bar', function () {
    describe('#usagebar', function () {
        it('should start in its zero state', function () {});
        it('should acurately show the percentage of limit used (rounded)', function () {});
        it('should acurately show the size of files selected', function () {});
        it('should have the overLimit class if more than the limit is selected', function () {});
        it('should remove the overLimit class if it was over the limit and then enough files are removed to go below it', function () {});
    });
});

describe('Upload Submit', function () {
    describe('#uploadsubmit', function () {
        it('should make an ajax request with the files as formdata', function () {});
        it('should add a spinner on submit', function () {});
        it('should display an error if submitted with no files selected', function () {});
        it('should not allow submit if isUploading state is active', function () {});
        it('should not allow removing items from the nice list if isUploading state is active', function () {});
    });
});
