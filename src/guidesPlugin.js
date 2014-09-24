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

$.fn.guides.Constructor = Guides;