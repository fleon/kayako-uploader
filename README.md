# FileUploader

A simple and easy to use file uploader that supports:

- Ajax based file upload
- Uploading multiple files
- Showing meta info of selected files (file name and file size)
- Showing preview of image files
- Customizing what kind of files can be selected for upload
- Sending any additional data with the upload request.

## Installation

Install as a npm module

```
npm install fleon/kayako-uploader
```

## Usage

See `example/index.html` file in the repository for a usage example.

## Supported options

- **container** (`Element`): The container element node to append the uploader in.
- **previewContainer** (`Element`) The container element node to append the preview images and text of selected files to.
- **accept** (`Array|String`): An array or string containing list of accepted mime types. Example: `image/*, image/png, application/json`.
- **multiple** (`Boolean`): (Default `false`) Set `true` to allow uploading of multiple files.
- **uploadURL** (`String`): Where to upload the files to.
- **filesParam** (`String`): Param name under which files are sent to the server. (Default `files`.)
- **extraData** (`Object`): Any extra data that needs to be sent with the request.
