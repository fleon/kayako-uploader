describe('module: flatten-array', function () {
	describe('#flatten', function () {
		it('flattens a given array into a single array', function () {
			expect(flatten([[1, 2, 3, [4], [5, [6]]]])).toEqual([1, 2, 3, 4, 5, 6])

			// does not arrays in values of nested object keys
			expect(flatten(["hello", undefined, null, [[], []], null, {a: [1, 2]}])).toEqual(['hello', undefined, null, null, {a: [1, 2]}])
		})
	})
})