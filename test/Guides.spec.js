var Guides = require('../src/modules/Guides');

describe("Guides class tests", function() {

    var $element = $('<div>Test</div>', {position: 'fixed'}).appendTo('body'),
        guides;

    $element.width(window.innerWidth);
    $element.height(20);
    $element.offset({top: 0, left: 0});

    beforeEach(function (done) {
        guides = new Guides($element, {
            guides: [{
                element: $element,
                html: 'Welcome to Guides.js'
            }, {
                element: $element,
                html: 'Navigate through guides.js website'
            }, {
                element: $element,
                html: 'See how it works'
            }, {
                element: $element,
                html: 'Download guides.js'
            }, {
                element: $element,
                html: 'Check out how to get started with guides.js'
            }, {
                element: $element,
                html: 'Read the docs'
            }]
        });
        done();
    });

    afterEach(function (done) {
        guides.destroy();
        done();
    });

    it('only one element is created if start is called twice', function() {
        guides.start().start();
        expect($('.guides-canvas').length).toBe(1);
    });

    it('does not throw an error if a method other than start is called before start', function() {
        expect(guides.next).not.toThrow(Error);
        expect(guides.prev).not.toThrow(Error);
        expect(guides.end).not.toThrow(Error);
        expect(guides.destroy).not.toThrow(Error);
    });

    it('sets the correct step when the start method is called', function() {
        guides.start();
        expect(guides._current).toBe(0);
    });

    it('sets the correct step when the next method is called', function() {
        guides.start().next();
        expect(guides._current).toBe(1);
    });

    it('sets the correct step when the prev method is called', function() {
        guides.start().next().prev();
        expect(guides._current).toBe(0);
    });

    it('removes dom elements when the end method is called', function() {
        guides.start().end();
        expect(guides.$canvas).toBe(null);
        expect($('.guides-canvas').length).toBe(0);
    });

    it('sets the new options correctly when setOptions method is called', function() {
        guides.setOptions({
            start: function () {}
        });
        expect(typeof guides.options.guides).toBe('object');
        expect(typeof guides.options.start).toContain('function');
    });

    it('calls event handlers', function() {
        var test = 0;
        guides.setOptions({
            start: function () {
                test = 1;
            }
        });
        guides.start();
        expect(test).toBe(1);
    });

    it('uses guide color setting', function() {
        guides.options.color = 'red';
        guides.options.guides[0].color = 'blue';
        guides.start();
        expect(guides._currentGuide._color).toBe('blue');
    });

    it('falls back to global color setting', function() {
        guides.setOptions({
            color: 'red'
        });
        guides.start();
        expect(guides._currentGuide._color).toBe('red');
    });

    it('removes dom elements when destroy method is called', function() {
        guides.start().destroy();
        expect(guides.$canvas).toBe(null);
        expect($('.guides-canvas').length).toBe(0);
    });
});