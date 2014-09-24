var Guide = function (guide, $container, options) {
    this.guide = guide;
    this._distance = guide.distance || options.distance;
    this._color = guide.color || options.color;
    this._class = guide.cssClass || options.cssClass || '';
    this._origElWidth = this.guide.element.outerWidth();
    this._origElHeight = this.guide.element.outerHeight();  
    this.$container = $container;
    this.init();
};

Guide.prototype._arrowSize = 10;
// Mx1,y1, Cdx1,dy1,dx2,dy2,x2,y2
// (x1,y1) - start point
// (dx1,dy1) - curve control point 1
// (dx2,dy2) - curve control point 2
// (x2,y2) - end point
Guide.prototype._path = 'M{0},{1} C{2},{3},{4},{5},{6},{7}';
Guide.prototype._arrowTemplate = '<svg width="{0}" height="{1}">\
    <defs>\
        <marker id="arrow" markerWidth="13" markerHeight="13" refX="2" refY="6" orient="auto">\
            <path d="M2,1 L2,{3} L{3},6 L2,2" style="fill:{4};"></path>\
        </marker>\
    </defs>\
    <path id="line" d="{2}" style="stroke:{4}; stroke-width: 1.25px; fill: none; marker-end: url(#arrow);"></path>\
</svg>';

Guide.prototype.init = function() {
    this.$element = $('<div />', {
        'class': 'guides-fade-in guides-guide ' + this._class,
        'html': '<span>' + this.guide.html + '</span>'
    });
    this._position();
    this.$element.appendTo(this.$container);
    this._renderArrow();
    this._scrollIntoView();
    return this;
};

Guide.prototype._position = function () {
    var elOffset = this.guide.element.offset(),
        docWidth = $(document).width(),
        docHeight = $(document).height(),
        leftSpace = elOffset.left,
        rightSpace = docWidth - elOffset.left - this._origElWidth,
        topSpace = elOffset.top,
        bottomSpace = docHeight - elOffset.top - this._origElHeight,
        css = {
            color: this._color,
            top: docHeight / 2 > elOffset.top ? elOffset.top : 'auto',
            left: docWidth / 2 > elOffset.left ? elOffset.left : 'auto',
            right: docWidth / 2 > elOffset.left ? 'auto' : docWidth - elOffset.left - this._origElWidth,
            bottom: docHeight / 2 > elOffset.top ? 'auto' : elOffset.bottom
        };

    switch (Math.max(leftSpace, rightSpace, topSpace, bottomSpace)) {
    case leftSpace:
        this.position = 'left';
        css.paddingRight = this._distance;
        css.right = $(document).width() - elOffset.left;
        break;
    case topSpace:
        this.position = 'top';
        css.paddingBottom = this._distance;
        css.bottom = $(document).height() - elOffset.top;    
        break;
    case rightSpace:
        this.position = 'right';
        css.paddingLeft = this._distance;
        css.left = elOffset.left + this._origElWidth;        
        break;
    default:
        this.position = 'bottom';
        css.paddingTop = this._distance;
        css.top = elOffset.top + this._origElHeight;        
        break;
    }
    this.$element.addClass('guides-' + this.position).css(css);
};

Guide.prototype._renderArrow = function() {
    this._width = this.$element.outerWidth();
    this._height = this.$element.outerHeight();
    this.$element.append(format(this._arrowTemplate,
        this._width, this._distance, this[this.position](), this._arrowSize, this._color));
};

Guide.prototype.top = function () {
    var coord = this._verticalAlign();
    return this._getPath(coord);
};

Guide.prototype.bottom = function () {
    var coord = this._verticalAlign(true);
    return this._getPath(coord);
};

Guide.prototype.left = function () {
    var coord = this._horizontalAlign();
    return this._getPath(coord);
};

Guide.prototype.right = function () {     
    var coord = this._horizontalAlign(true);
    return this._getPath(coord);
};

Guide.prototype._getPath = function (coord) {
    return format(this._path, coord.x1, coord.y1, coord.dx1, coord.dy1, coord.dx2, coord.dy2, coord.x2, coord.y2);
};

Guide.prototype._getFluctuation = function () {
    return Math.floor(Math.random() * 20) + 10;
};

Guide.prototype._verticalAlign = function (bottom) {
    var x1 = this._width / 2,
        y1 = bottom ? this._distance : 0,
        x2 = Math.max(
                Math.min(
                    this.guide.element.offset().left + (this._origElWidth / 2) - this.$element.offset().left,
                    this._width - this._arrowSize),
                this._arrowSize),
        y2 = bottom ? this._arrowSize : this._distance - this._arrowSize;
    return {
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,
        dx1: Math.max(0, Math.min(Math.abs((2 * x1) - x2) / 3, this._width) + this._getFluctuation()),
        dy1: bottom
            ? Math.max(0, y2 + (Math.abs(y1 - y2) * 3 / 4))
            : Math.max(0, y1 + (Math.abs(y1 - y2) * 3 / 4)),
        dx2: Math.max(0, Math.min(Math.abs(x1 - (x2 * 3)) / 2, this._width) - this._getFluctuation()),
        dy2: bottom
            ? Math.max(0, y2 + (Math.abs(y1 - y2) * 3 / 4))
            : Math.max(0, y1 + (Math.abs(y1 - y2) * 3 / 4))
    }
};

Guide.prototype._horizontalAlign = function (right) {
    var x1 = right ? this._distance : this._width - this._distance,
        y1 = this._height / 2,
        x2 = right ? this._arrowSize : this._width - this._arrowSize,
        y2 = Math.max(
                Math.min(
                    this.guide.element.offset().top + (this._origElHeight / 2) - this.$element.offset().top,
                    this._height - this._arrowSize),
                this._arrowSize);
    return {
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2,
        dx1: right
            ? Math.max(0, x2 + (Math.abs(x1 - x2) * 3 / 4))
            : Math.max(0, x1 + Math.abs(x1 - x2) * 3 / 4),
        dy1: Math.max(0, Math.min(Math.abs((2 * y1) - y2) / 3, this._height) + this._getFluctuation()),
        dx2: right
            ? Math.max(0, x2 + (Math.abs(x1 - x2) * 3 / 4))
            : Math.max(0, x1 + Math.abs(x1 - x2) * 3 / 4),
        dy2: Math.max(0, Math.min(Math.abs(y1 - (y2 * 3)) / 2, this._height) + this._getFluctuation())
    }
};

Guide.prototype._scrollIntoView = function () {
    //scroll vertically to element if it is not visible in the view port
    if ($(document).scrollTop() > this.guide.element.offset().top
        || $(document).scrollTop() + $(window).height() < this.guide.element.offset().top) {
        $('html,body').animate({
          scrollTop: this.guide.element.offset().top
        }, 500);
    }
    //scroll horizontally to element if it is not visible in the view port
    if ($(document).scrollLeft() > this.guide.element.offset().left
        || $(document).scrollLeft() + $(window).height() < this.guide.element.offset().left) {
        $('html,body').animate({
          scrollLeft: this.guide.element.offset().left
        }, 500);
    }
};

Guide.prototype.destroy = function() {
    this.$element.remove();
};