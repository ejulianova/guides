'use strict';

var Guides = require('./modules/Guides');

$.fn.guides = function (option, optionData) {
    return this.each(function () {
        var $this = $(this),
            data = $this.data('guides'),
            options = typeof option === 'object' && option;

        if (!data && typeof options == 'string') return;
        if (!data) $this.data('guides', (data = new Guides(this, options)));
        if (typeof option == 'string') data[option](optionData);
    });
};

$.guides = function (options) {
    return new Guides(null, options);
};

$.fn.guides.Constructor = Guides;