/**
 * Brackets Themse Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function() {

    var FileUtils = brackets.getModule("file/FileUtils"),
        cm_path   = FileUtils.getNativeBracketsDirectoryPath() + "/thirdparty/CodeMirror2/addon/";


    function initAddons( ) {
        // Set some default value for codemirror...
        CodeMirror.defaults.highlightSelectionMatches = true;
        CodeMirror.defaults.styleSelectedText = true;
    }


    function init() {
        /**
        *  This is where is all starts to load up...
        */
        var promises = [
            // Load up codemirror addon for active lines
            //$.getScript(cm_path + "selection/mark-selection.js").promise(),
            //$.getScript(cm_path + "search/match-highlighter.js").promise()
        ];

        return $.when.apply($, promises).done(initAddons).promise();
    }


    return {
        ready: init().done
    };
});

