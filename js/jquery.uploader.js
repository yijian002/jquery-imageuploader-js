(function ($) {
    $.fn.uploader = function (options) {
        var $uploaderBox = this;
        
        $.extend({
            submitButtonCopy: 'Upload Files',
            instructionsHTML: '<p>Drag and Drop</p><p>Or</p>',
            selectButtonCopy: 'Select Files'
        }, options);
         
        // create DOM elements
        var submitButton = $('<button>' + submitButtonCopy + '</button>');
        var instructions = $(instructionsHTML);
        var selectButton = $('<label for="fileinput">' + selectButtonCopy + 
            '</label><input id="fileinput" type="file" multiple>');
        var fileList = $('ul');
       
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
                .append(instructions)
                .append(selectButton)
                .after(submitButton);
        }
        
        function bindUIEvents () {
            
        }
        
        init();
        return this;
    };
})(jQuery);
