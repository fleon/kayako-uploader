function FileUploader(input, config) {

}

if (typeof jQuery !== 'undefined') {
	jQuery.fn.fileUploader = function (config) {
		return new FileUploader(this, config);
	}
}