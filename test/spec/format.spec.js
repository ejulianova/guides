describe("format string function tests", function() {

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