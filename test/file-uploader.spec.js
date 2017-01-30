describe('module: file-uploader', function () {
	describe('#extend', function () {
		it('extends keys of second param into the first', function () {
			var a = {abc: 'def'}, b = {def: 'ghi'}
			var c = extend(a, b)

			expect(c).toBe(a)
			expect(a).toEqual({abc: 'def', def: 'ghi'})
			expect(b).toEqual({def: 'ghi'})
		})

		it('extends keys of all params into the first and leaves the other object unchanged', function () {
			var a = {abc: 'def'}, b = {def: 'ghi'}, c = {ghi: 'jkl'}
			var d = extend(a, b, c)

			expect(d).toBe(a)
			expect(a).toEqual({abc: 'def', def: 'ghi', ghi: 'jkl'})
			expect(b).toEqual({def: 'ghi'})
			expect(c).toEqual({ghi: 'jkl'})
		})

		it('only extends shallowly, by reference', function () {
			var a = {abc: 'def'}, b = {def: 'ghi', a: a}, c = {ghi: 'jkl', b: b}
			c = extend(a, b, c)

			expect(c).toBe(a)
			expect(a.a).toBe(a)
			expect(a.b).toBe(b)
		})
	})

	describe('#forEach', function () {
		var obj = {hello: 'world', hello2: 'world2', hello3: 'world3'}
		var arr = [20, 40, 100, 200, 500]

		it('executes a function for each key in an object or array', function () {
			var spy1 = jasmine.createSpy(), spy2 = jasmine.createSpy()

			forEach(obj, spy1)

			expect(spy1.calls.argsFor(0)).toEqual(['world', 'hello', obj])
			expect(spy1.calls.argsFor(1)).toEqual(['world2', 'hello2', obj])
			expect(spy1.calls.argsFor(2)).toEqual(['world3', 'hello3', obj])

			forEach(arr, spy2)

			expect(spy2.calls.argsFor(0)).toEqual([20, 0, arr])
			expect(spy2.calls.argsFor(1)).toEqual([40, 1, arr])
			expect(spy2.calls.argsFor(2)).toEqual([100, 2, arr])
			expect(spy2.calls.argsFor(3)).toEqual([200, 3, arr])
			expect(spy2.calls.argsFor(4)).toEqual([500, 4, arr])
		})

		it('stops execution if any call returns true', function () {
			var spy1 = jasmine.createSpy().and.returnValue(true), spy2 = jasmine.createSpy().and.returnValue(true)

			forEach(obj, spy1)

			expect(spy1.calls.argsFor(0)).toEqual(['world', 'hello', obj])
			expect(spy1.calls.count()).toEqual(1)

			forEach(arr, spy2)

			expect(spy2.calls.argsFor(0)).toEqual([20, 0, arr])
			expect(spy2.calls.count()).toEqual(1)
		})
	})

	describe('FileUploader', function () {
		var container, previewContainer

		beforeEach(function () {
			container = document.createElement('div')
			previewContainer = document.createElement('div')

			document.body.appendChild(container)
			document.body.appendChild(previewContainer)
		})

		// From http://stackoverflow.com/questions/14967647/encode-decode-image-with-base64-breaks-image
		function fixBinary (bin) {
			var length = bin.length
			var buf = new ArrayBuffer(length)
			var arr = new Uint8Array(buf)
			for (var i = 0; i < length; i++) {
				arr[i] = bin.charCodeAt(i)
			}
			return buf
		}

		function mockImageFile() {
			var base64 =
				'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB1klEQVR42n2TzytEURTHv3e8N1joRhZG' +
				'zJsoCjsLhcw0jClKWbHwY2GnLGUlIfIP2IjyY2djZTHSMJNQSilFNkz24z0/Ms2MrnvfvMu8mcfZvPvu' +
				'Pfdzz/mecwgKLNYKb0cFEgXbRvwV2s2HuWazCbzKA5LvNecDXayBjv9NL7tEpSNgbYzQ5kZmAlSXgsGG' +
				'XmS+MjhKxDHgC+quyaPKQtoPYMQPOh5U9H6tBxF+Icy/aolqAqLP5wjWd5r/Ip3YXVILrF4ZRYAxDhCO' +
				'J/yCwiMI+/xgjOEzmzIhAio04GeGayIXjQ0wGoAuQ5cmIjh8jNo0GF78QwNhpyvV1O9tdxSSR6PLl51F' +
				'nIK3uQ4JJQME4sCxCIRxQbMwPNSjqaobsfskm9l4Ky6jvCzWEnDKU1ayQPe5BbN64vYJ2vwO7CIeLIi3' +
				'ciYAoby0M4oNYBrXgdgAbC/MhGCRhyhCZwrcEz1Ib3KKO7f+2I4iFvoVmIxHigGiZHhPIb0bL1bQApFS' +
				'9U/AC0ulSXrrhMotka/lQy0Ic08FDeIiAmDvA2HX01W05TopS2j2/H4T6FBVbj4YgV5+AecyLk+Ctvms' +
				'QWK8WZZ+Hdf7QGu7fobMuZHyq1DoJLvUqQrfM966EU/qYGwAAAAASUVORK5CYII='

			var blob = new Blob([fixBinary(atob(base64))], {type: 'image/png'})
			blob.name = 'supermario.png'

			return blob
		}

		function mockFile() {
			var debug = {hello: 'world'}
			var blob = new Blob([JSON.stringify(debug)], {type : 'application/json'})
			blob.name = 'myfile.json'

			return blob
		}

		afterEach(function () {
			document.body.removeChild(container)
			document.body.removeChild(previewContainer)
		})

		describe('#constructor', function () {
			it('calls appendTo on config.container', function () {
				spyOn(FileUploader.prototype, 'appendTo')

				var fileUploader = new FileUploader({
					container: container,
					previewContainer: previewContainer
				})

				expect(fileUploader.appendTo).toHaveBeenCalledWith(container)
			})
		})

		describe('#createInput', function () {
			it('creates an input tag based on the given config', function () {
				// ignore the call from constructor function for unit test
				spyOn(FileUploader.prototype, 'appendTo').and.callFake(function () {})

				var fileUploader = new FileUploader({})

				// no attributes
				fileUploader.createInput({})
				expect(fileUploader.input.outerHTML).toEqual('<input type="file" style="display:none">')

				// multiple: true
				fileUploader.createInput({multiple: true})
				expect(fileUploader.input.hasAttribute('multiple')).toBe(true)

				// accept is array
				fileUploader.createInput({accept: ['image/png', 'image/jpeg']})
				expect(fileUploader.input.getAttribute('accept')).toBe('image/png, image/jpeg')

				// accept is string
				fileUploader.createInput({accept: 'image/*, application/json'})
				expect(fileUploader.input.getAttribute('accept')).toBe('image/*, application/json')
			})
		})

		describe('#appendTo', function () {
			it('creates an input and appends it to the given container', function () {

				var fileUploader = new FileUploader({
					container: container,
					previewContainer: previewContainer
				}) // constructor calls appendTo

				expect(container.firstChild).toEqual(fileUploader.input)
			})
		})

		describe('#clearPreviews', function () {
			it('empties the preview container', function () {
				previewContainer.innerHTML = 'hello world'

				var fileUploader = new FileUploader({
					container: container,
					previewContainer: previewContainer
				})

				expect(previewContainer.innerHTML).toBe('hello world')
				fileUploader.clearPreviews()
				expect(previewContainer.innerHTML).toBe('')
			})
		})

		describe('#showPreviews', function () {
			it('creates and appends img previews for images contained in the file list, and shows description for the rest', function () {
				var fileUploader = new FileUploader({
					container: container,
					previewContainer: previewContainer
				})

				// mock files
				fileUploader.files = [
					mockImageFile(),
					mockFile()
				]

				fileUploader.showPreviews()

				expect(previewContainer.firstChild.firstChild.tagName).toEqual('IMG')
				expect(previewContainer.firstChild.firstChild.nextSibling.innerHTML).toEqual('supermario.png: 527 bytes')

				expect(previewContainer.firstChild.nextSibling.firstChild.tagName).toEqual('DIV')
				expect(previewContainer.firstChild.nextSibling.firstChild.innerHTML).toEqual('myfile.json: 17 bytes')
			})
		})

		describe('#browse', function () {
			it('triggers a click event on the input', function () {
				var fileUploader = new FileUploader({
					container: container,
					previewContainer: previewContainer
				})

				spyOn(fileUploader.input, 'click').and.callFake(function () {})

				fileUploader.browse()

				expect(fileUploader.input.click).toHaveBeenCalled()
			})
		})

		describe('#upload', function () {
			function serializeFile(file) {
				return {
					name: file.name,
					size: file.size
				}
			}

			var config
			beforeEach(function() {
				config = {
					container: container,
					previewContainer: previewContainer,
					uploadURL: 'someurl.php',
					filesParam: 'fileslist'
				}

				jasmine.Ajax.install()

				// naive FormData parser
				jasmine.Ajax.addCustomParamParser({
					test: function (xhr) {
						return true
					},
					parse: function (params) {
						return params
					}
				})
			})

			afterEach(function() {
				jasmine.Ajax.uninstall()
			})

			it('uploads the selected files as attachemnts to the given url and param name', function () {
				var fileUploader = new FileUploader(config)
				fileUploader.files = [
					mockImageFile(),
					mockFile()
				]

				spyOn(window, 'alert').and.callFake(function () {})

				fileUploader.upload()

				var filesList = jasmine.Ajax.requests.mostRecent().data().getAll('fileslist[]')
				expect(serializeFile(filesList[0])).toEqual({ name: 'supermario.png', size: 527 })
				expect(serializeFile(filesList[1])).toEqual({ name: 'myfile.json', size: 17 })

				jasmine.Ajax.requests.mostRecent().respondWith({
					status: 200,
					statusText: 'HTTP/1.1 200 OK',
					responseText: 'File uploaded successfully'
				})

				expect(window.alert).toHaveBeenCalledWith('Upload successful!')
			})

			it('alerts an error if server responds with error', function () {
				var fileUploader = new FileUploader(config)
				fileUploader.files = [
					mockImageFile(),
					mockFile()
				]

				spyOn(window, 'alert').and.callFake(function () {})

				fileUploader.upload()

				jasmine.Ajax.requests.mostRecent().respondWith({
					status: 400,
					statusText: 'HTTP/1.1 400 Bad request',
					responseText: { error: 'Request is malformed' }
				})

				expect(window.alert).toHaveBeenCalledWith('An error occurred!')
			})

			it('sends extra data to server as well (as defined in config)', function () {
				config.extraData = {
					userId: 35366
				}

				var fileUploader = new FileUploader(config)
				fileUploader.files = [
					mockImageFile(),
					mockFile()
				]

				spyOn(window, 'alert').and.callFake(function () {})

				fileUploader.upload()

				expect(jasmine.Ajax.requests.mostRecent().data().get('userId')).toEqual('35366')
			})
		})
	})
})