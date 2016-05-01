(function ($) {
    $.fn.uploader = function (options) {
        var $uploaderBox = this;
        
        options = $.extend({
            submitButtonCopy: 'Upload Files',
            instructionsHTML: '<p>Drag and Drop</p><p>Or</p>',
            selectButtonCopy: 'Select Files',
            dropZone: $('body'),
            fileTypeWhiteList: ['jpg', 'png', 'jpeg'],
            maxUploadLimit: 50,
	    badFileTypeMessage: 'We\'re unable to process this file type.'
        }, options);

        state = {
            niceBatch: [],
            naughtyBatch: [],
            isUploading: false,
            isOverLimit: false
	};
         
        // create DOM elements
        dom = {
	    submitButton: $('<button>' + options.submitButtonCopy + '</button>'),
	    instructions: $(options.instructionsHTML),
	    selectButton: $('<label for="fileinput">' + options.selectButtonCopy + 
		'</label><input id="fileinput" type="file" multiple>'),
	    fileList: $('ul'),
            generalErrorText: $('<p></p>'),
            usageBarContainer: $('<div></div>'),
            successCountMessage: $('<p></p>'),
            niceList: $('<ul></ul>'),
            naughtyList: $('<ul></ul>')
	};

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
                .append(dom.instructions)
                .append(dom.selectButton)
                .append(dom.usageBarContainer)
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
        }

        function addNiceItem () {
            console.log('add nice');
	}
 
        function addNaughtyItem () {
            console.log('add naughty');
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
            return Math.round((totalSize / limit) * 100) ;
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

        function removeItemHandler () {

	}

        function uploadSubmitHandler () {
            console.log('submit');
	}

        function selectFilesHandler (e) {
            e.preventDefault();
            e.stopPropagation();

            state.naughtyBatch = [];
            dom.naughtyList.empty();
            dom.generalErrorText.empty();
            dom.successCountMessage.empty();

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
        
        init();
        return this;
    };
}(jQuery));
