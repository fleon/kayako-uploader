function flatten(array, outArray) {
	outArray = outArray || [];
	for (var i = 0; i < array.length; i++) {
		if (array[i] instanceof Array) {
			flatten(array[i], outArray);
		} else {
			outArray.push(array[i]);
		}
	}

	return outArray;
}