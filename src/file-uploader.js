/**
 * config options:
 *
 * previewContainer:
 * container:
 * multiple:
 * accept: ['image/png', 'image/jpeg']
 * extraData: {},
 * filesParam: 'files'
 */

function forEach(obj, fn, ctx) {
	if (obj === null || typeof obj === 'undefined') {
		return
	}

	if (obj instanceof Array) {
		for (var i = 0; i < obj.length; i++)
			if (fn.call(ctx, obj[i], i, obj))
				break

		return
	}

	var keys = Object.keys(obj), key
	while ((key = keys.shift()))
		if (fn.call(ctx, obj[key], key, obj))
			break
}

function extend(a, b) {
	if (arguments.length > 2)
		return extend.apply(null, [extend(a, b)].concat([].slice.call(arguments, 2)))

	forEach(b, function (value, key) {
		a[key] = value
	})

	return a
}

function FileUploader(config) {
	this.config = extend({}, FileUploader.defaultConfig, config)
	this.appendTo(this.config.container)
}

FileUploader.defaultConfig = {
	previewContainer: null,
	container: null,
	multiple: false,
	accept: null,
	extraData: null,
	filesParam: 'files'
}

FileUploader.prototype = {
	appendTo: function (container) {
		var markup = '<input type="file" style="display:none"'
		if (this.config.multiple)
			markup += ' multiple'
		if (this.config.accept instanceof Array)
			markup += ' accept="' + this.config.accept.join(', ') + '"'
		else if (typeof this.config.accept === 'string')
			markup += ' accept="' + this.config.accept + '"'
		markup += '>'

		var div = document.createElement('div')
		div.innerHTML = markup

		var input = this.input = div.firstChild
		var self = this

		input.addEventListener('change', function () {
			self.files = this.files
			self.showPreviews()
		})

		container.appendChild(this.input)
	},

	clearPreviews: function () {
		var previewContainer = this.config.previewContainer
		if (!previewContainer) return

		previewContainer.innerHTML = ''
	},

	showPreviews: function () {
		var previewContainer = this.config.previewContainer
		if (!previewContainer) return

		this.clearPreviews()

		forEach(this.files, function (file) {
			var previewDiv = document.createElement('div')

			if (/^image\//.test(file.type)) {
				var img = document.createElement('img');
				img.src = window.URL.createObjectURL(file);
				img.height = 60;
				img.onload = function() {
					window.URL.revokeObjectURL(this.src);
				}
				previewDiv.appendChild(img)
			}

			var metaDiv = document.createElement('div')
			metaDiv.innerHTML = file.name + ': ' + file.size + ' bytes'

			previewDiv.appendChild(metaDiv)
			previewContainer.appendChild(previewDiv)
		}, this)
	},

	browse: function () {
		return this.input.click()
	},

	upload: function () {
		var data = new FormData()
		forEach(this.files, function (file) {
			data.append(this.config.filesParam + '[]', file, file.name);
		}, this)

		forEach(this.config.extraData, function (value, key) {
			data.append(key, value)
		})

		var xhr = new XMLHttpRequest()
		xhr.open('POST', this.config.uploadURL, true)
		xhr.onload = function () {
			if (xhr.status === 200) {
				alert('Upload successful!')
			} else {
				alert('An error occurred!')
			}
		}

		xhr.send(data)
	}
}