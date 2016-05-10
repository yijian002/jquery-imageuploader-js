/* global jQuery FormData FileReader */
(function ($) {
    $.fn.uploader = function (options, testMode) {
        var $uploaderBox = this;

        options = $.extend({
            submitButtonCopy: 'Upload Files',
            instructionsCopy: 'Drag and Drop files, or',
            selectButtonCopy: 'Select Files',
            dropZone: $('body'),
            fileTypeWhiteList: ['jpg', 'png', 'jpeg', 'gif'],
            maxUploadLimit: 50,
            badFileTypeMessage: 'We\'re unable to process this file type.',
            noFilesSelectedError: 'Select some files.',
            ajaxUrl: '/ajax/upload',
            testMode: false
        }, options);

        var state = {
            niceBatch: [],
            naughtyBatch: [],
            isUploading: false,
            isOverLimit: false,
            listIndex: 0
        };

        // create DOM elements
        var dom = {
            submitButton: $('<button class="js-uploader__submit-button">' + options.submitButtonCopy + '</button>'),
            instructions: $('<p class="js-uploader__instructions">' + options.instructionsCopy + '</p>'),
            selectButton: $('<label for="fileinput" style="cursor: pointer;" class="js-uploader__file-label">' + options.selectButtonCopy +
                '</label><input style="height: 0; width: 0;" id="fileinput" type="file" multiple class="js-uploader__file-input">'),
            generalErrorText: $('<p class="js-uploader__general-error-text"></p>'),
            usageBarContainer: $('<div class="js-uploader__usage-bar-container"></div>'),
            successMessage: $('<p class="js-uploader__success-message"></p>'),
            niceList: $('<ul class="js-uploader__nice-list"></ul>'),
            naughtyList: $('<ul class="js-uploader__naughty-list"></ul>')
        };

        // set it all up
        init();

        function init () {
            // empty out whatever is in there
            $uploaderBox.empty();

            // create and attach UI elements
            setupDOM();

            // set up event handling
            bindUIEvents();
        }

        function setupDOM () {
            $uploaderBox
                .append(dom.successMessage)
                .append(dom.niceList)
                .append(dom.naughtyList)
                .append(dom.instructions)
                .append(dom.selectButton)
                .append(dom.usageBarContainer)
                .append(dom.generalErrorText)
                .after(dom.submitButton);
        }

        function bindUIEvents () {
            // handle drag and drop
            options.dropZone.on('dragover dragleave', function (e) {
                e.preventDefault();
                e.stopPropagation();
            });
            $.event.props.push('dataTransfer'); // jquery bug hack
            options.dropZone.on('drop', selectFilesHandler);

            // hack for being able selecting the same file name twice
            dom.selectButton.on('click', function () { this.value = null; });
            dom.selectButton.on('change', selectFilesHandler);

            // handle the submit click
            dom.submitButton.on('click', uploadSubmitHandler);

            // remove link handler
            options.dropZone.on('click', '.js-upload-remove-link', removeItemHandler);

            // render the initial usage bar
            renderUsageBar();

            // expose handlers for testing
            if (options.testMode) {
                options.dropZone.on('uploaderTestEvent', function (e) {
                    switch (e.functionName) {
                    case 'selectFilesHandler':
                        selectFilesHandler(e);
                        break;
                    case 'uploadSubmitHandler':
                        uploadSubmitHandler(e);
                        break;
                    default:
                        break;
                    }
                });
            }
        }

        function addNiceItem (file) {
            var fileName = cleanName(file.name);
            var fileSize = file.size;
            var id = state.listIndex;
            state.listIndex++;

            // add to the batch
            state.niceBatch.push({file: file, id: id, fileName: fileName, fileSize: fileSize});

            // add to the DOM
            var listItem = $('<li class="l-stack-split" data-index="' + id + '"></li>');
            var thumbnail = $('<img style="height: auto; max-width: 50px; max-height: 50px;" class="thumbnail">');
            if (window.FileReader && file.type.indexOf('image') !== -1) {
                var reader = new FileReader();
                reader.onloadend = function () {
                    thumbnail.attr('src', reader.result);
                };
                reader.onerror = function () {
                    thumbnail.remove();
                };
                reader.readAsDataURL(file);
                listItem.append(thumbnail);
            } else if (file.type.indexOf('image') === -1) {
                thumbnail = $('<svg class="icon icon--huge icon--inline" viewBox="0 0 100 100"><use xlink:href="#file-text-o" /></svg>');
                listItem.append(thumbnail);
            }
            var fileNameWrapper = $('<span class="l-stack-split__item file-list__text">' + fileName + '</span>');
            listItem.append(fileNameWrapper);

            var detailsWrapper = $('<span class="l-stack-split__item file-list__details"></span>');
            var sizeWrapper = $('<span class="file-list__size">' + formatBytes(fileSize) + '</span>');
            var removeLink = $('<a href="#nogo" class="link js-upload-remove-link" data-index="' + id + '">Remove</a>');
            detailsWrapper.append(sizeWrapper);
            detailsWrapper.append(removeLink);
            listItem.append(detailsWrapper);
            dom.niceList.append(listItem);
        }

        function removeNiceItem (id) {
            // remove from the batch
            for (var i = 0; i < state.niceBatch.length; i++) {
                if (state.niceBatch[i].id === parseInt(id)) {
                    state.niceBatch.splice(i, 1);
                    break;
                }
            }
            // remove from the DOM
            dom.niceList.find('li[data-index="' + id + '"]').remove();
            // update the usage bar
            renderUsageBar();
        }

        function addNaughtyItem (fileName, errorMessage) {
            // add to the DOM
            var listItem = $('<li class="l-stack-split"></li>');
            var fileNameWrapper = $('<span class="l-stack-split__item file-list__text">' + fileName + '</span>');
            listItem.append(fileNameWrapper);
            var detailsWrapper = $('<span class="l-stack-split__item file-list__details error">' + errorMessage + '</span>');
            listItem.append(detailsWrapper);
            dom.naughtyList.append(listItem);
        }

        function getExtension (path) {
            var basename = path.split(/[\\/]/).pop();
            var pos = basename.lastIndexOf('.');

            if (basename === '' || pos < 1) {
                return '';
            }
            return basename.slice(pos + 1);
        }

        function getPercentageUsed () {
            var limit = options.maxUploadLimit * 1024 * 1024;
            var totalSize = getTotalSize(state.niceBatch);
            return Math.round((totalSize / limit) * 100);
        }

        function formatBytes (bytes, decimals) {
            if (bytes === 0) return '0 Bytes';
            var k = 1024;
            var dm = decimals + 1 || 3;
            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            var i = Math.floor(Math.log(bytes) / Math.log(k));
            return (bytes / Math.pow(k, i)).toPrecision(dm) + ' ' + sizes[i];
        }

        function getTotalSize (files) {
            var totalSize = 0;
            for (var i = 0; i < files.length; i++) {
                totalSize += files[i].fileSize;
            }
            return totalSize;
        }

        function cleanName (name) {
            name = name.replace(/\s+/gi, '-'); // Replace white space with dash
            return name.replace(/[^a-zA-Z0-9.\-]/gi, ''); // Strip any special characters
        }

        function renderUsageBar () {
            var percentageUsed = getPercentageUsed();
            var totalSizeInBytes = formatBytes(getTotalSize(state.niceBatch));
            var isOverLimit = '';

            if (percentageUsed >= 100) {
                isOverLimit = 'usage-bar--over-limit';
                state.isOverLimit = true;
                dom.generalErrorText
                    .empty()
                    .text(options.overLimitError);
            } else {
                state.isOverLimit = false;
                dom.generalErrorText.empty();
            }

            var usageBar = $(
                '<div class="usage-bar__filling ' + isOverLimit + '" style="width: ' + percentageUsed + '%"></div>' +
                '<div class="usage-bar__text">' +
                'Using <span class="js-batch-size-percentage">' + percentageUsed +
                '%</span> (<span class="js-batch-size">' + totalSizeInBytes + '</span>) of ' +
                options.maxUploadLimit + 'MB' +
                '</div>'
            );

            dom.usageBarContainer
                .empty()
                .append(usageBar);
        }

        function uploadSubmitHandler () {
            dom.generalErrorText.empty();
            if (state.niceBatch.length === 0) {
                dom.generalErrorText.text(options.noFilesSelectedError);
            } else {
                var data = new FormData();
                for (var i = 0; i < state.niceBatch.length; i++) {
                    data.append('files[]', state.niceBatch[i].file, state.niceBatch[i].fileName);
                }
                $.ajax({
                    type: 'POST',
                    url: options.ajaxUrl,
                    data: data,
                    cache: false,
                    contentType: false,
                    processData: false
                });
            }
        }

        function selectFilesHandler (e) {
            e.preventDefault();
            e.stopPropagation();

            state.naughtyBatch = [];
            dom.naughtyList.empty();
            dom.generalErrorText.empty();
            dom.successMessage.empty();

            if (!state.isUploading) {
                // files come from the input or a drop
                var files = e.target.files || e.dataTransfer.files || e.dataTransfer.getData;

                // process each incoming file
                for (var i = 0; i < files.length; i++) {
                    // test the file extension against allowed types
                    if (options.fileTypeWhiteList.indexOf(getExtension(files[i].name).toLowerCase()) !== -1) {
                        // if file is ok, add to the nice list
                        addNiceItem(files[i]);
                    } else {
                        // else add to the naughty list
                        addNaughtyItem(files[i].name, options.badFileTypeMessage);
                    }
                }
            }

            renderUsageBar();
        }

        function removeItemHandler (e) {
            e.preventDefault();
            if (!state.isUploading) {
                var removeIndex = e.target.getAttribute('data-index');
                removeNiceItem(removeIndex);
            }
        }

        return this;
    };
}(jQuery));
