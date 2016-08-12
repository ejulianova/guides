var format = require('../src/modules/format');

describe("format string function tests", function() {

    it("keeps the string the same if there are no placeholders", function() {
        expect(format('ala bala', 'portokala')).toBe('ala bala');
    });

    it("keeps the string the same if there are no placeholders and no arguments", function() {
        expect(format('ala bala')).toBe('ala bala');
    });

    it("keeps the string the same if there are no arguments", function() {
        expect(format('ala {0} bala')).toBe('ala {0} bala');
    });

	it("formats correcly {0} {1}", function() {
		expect(format('{0} {1}', 'ala', 'bala')).toBe('ala bala');
	});

	it("formats correcly {1} {0}", function() {
		expect(format('{1} {0}', 'ala', 'bala')).toBe('bala ala');
	});

	it("formats correcly {1} {1} {0}", function() {
		expect(format('{1} {1} {0}', 'ala', 'bala')).toBe('bala bala ala');
	});

});