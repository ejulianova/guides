describe('Guide class tests', function() {
    var $element,
        $container = $('<div></div>', {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            height: window.innerHeight,
            width: window.innerWidth
        }).appendTo('body'),
        options = {
            color: '#fff',
            cssClass: '',
            distance: 100
        };

    beforeEach(function () {
        $element = $('<div>Test</div>', {position: 'absolute'}).appendTo('body');
    });

    afterEach(function () {
        $element.remove();
    });

    it('auto positions - right', function() {
        $element.width(20);
        $element.height(window.innerHeight);
        $element.offset({top: 0, left: 0});
        guide = new Guide({
            element: $element,
            html: 'Magna esse aliquet laborum et felis euismod'
        }, $container, options);
        expect(guide.position).toBe('right');
    });

    it('auto positions - bottom', function() {
        $element.width(window.innerWidth);
        $element.height(20);
        $element.offset({top: 0, left: 0});
        guide = new Guide({
            element: $element,
            html: 'Magna esse aliquet laborum et felis euismod'
        }, $container, options);
        expect(guide.position).toBe('bottom');
    }); 

    it('auto positions - left', function() {
        $element.width(20);
        $element.height(window.innerHeight);
        $element.offset({
            top: 0,
            left: $(document).width() - $element.width()
        });
        guide = new Guide({
            element: $element,
            html: 'Magna esse aliquet laborum et felis euismod'
        }, $container, options);
        expect(guide.position).toBe('left');
    });

    it('auto positions - top', function() {
        $element.width(window.innerWidth);
        $element.height(20);
        $element.offset({
            top: $(document).height() - $element.height(),
            left: 0
        });
        guide = new Guide({
            element: $element,
            html: 'Magna esse aliquet laborum et felis euismod'
        }, $container, options);
        expect(guide.position).toBe('top');
    });

    it('creates an svg with a curve that fits the container (top)', function() {
        $element.width(window.innerWidth);
        $element.height(20);
        $element.offset({
            top: $(document).height() - $element.height(),
            left: 0
        });
        guide = new Guide({
            element: $element,
            html: 'Magna esse aliquet laborum et felis euismod'
        }, $container, options);

        var coord = guide._verticalAlign();
        expect(coord.x1 < 0).toBe(false);
        expect(coord.x1 > this._width).toBe(false);
        expect(coord.y1 < 0).toBe(false);
        expect(coord.y1 > this._distance).toBe(false);
        expect(coord.dx1 < 0).toBe(false);
        expect(coord.dx1 > this._width).toBe(false);
        expect(coord.dy1 < 0).toBe(false);
        expect(coord.dy1 > this._distance).toBe(false);
    });

    it('creates an svg with a curve that fits the container (bottom)', function() {
        $element.width(window.innerWidth);
        $element.height(20);
        $element.offset({top: 0, left: 0});
        guide = new Guide({
            element: $element,
            html: 'Magna esse aliquet laborum et felis euismod'
        }, $container, options);

        var coord = guide._verticalAlign();
        expect(coord.x1 < 0).toBe(false);
        expect(coord.x1 > this._width).toBe(false);
        expect(coord.y1 < 0).toBe(false);
        expect(coord.y1 > this._distance).toBe(false);
        expect(coord.dx1 < 0).toBe(false);
        expect(coord.dx1 > this._width).toBe(false);
        expect(coord.dy1 < 0).toBe(false);
        expect(coord.dy1 > this._distance).toBe(false);
    });

    it('creates an svg with a curve that fits the container (left)', function() {
        $element.width(20);
        $element.height(window.innerHeight);
        $element.offset({
            top: 0,
            left: $(document).width() - $element.width()
        });
        guide = new Guide({
            element: $element,
            html: 'Magna esse aliquet laborum et felis euismod'
        }, $container, options);

        var coord = guide._verticalAlign();
        expect(coord.x1 < 0).toBe(false);
        expect(coord.x1 > this._width).toBe(false);
        expect(coord.y1 < 0).toBe(false);
        expect(coord.y1 > this._distance).toBe(false);
        expect(coord.dx1 < 0).toBe(false);
        expect(coord.dx1 > this._width).toBe(false);
        expect(coord.dy1 < 0).toBe(false);
        expect(coord.dy1 > this._distance).toBe(false);
    });

    it('creates an svg with a curve that fits the container (right)', function() {
        $element.width(20);
        $element.height(window.innerHeight);
        $element.offset({top: 0, left: 0});
        guide = new Guide({
            element: $element,
            html: 'Magna esse aliquet laborum et felis euismod'
        }, $container, options);

        var coord = guide._verticalAlign();
        expect(coord.x1 < 0).toBe(false);
        expect(coord.x1 > this._width).toBe(false);
        expect(coord.y1 < 0).toBe(false);
        expect(coord.y1 > this._distance).toBe(false);
        expect(coord.dx1 < 0).toBe(false);
        expect(coord.dx1 > this._width).toBe(false);
        expect(coord.dy1 < 0).toBe(false);
        expect(coord.dy1 > this._distance).toBe(false);
    });     

});