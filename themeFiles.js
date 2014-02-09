/**
 * Brackets Themse Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require) {
    "use strict";

    var FileUtils   = brackets.getModule("file/FileUtils"),
        FileSystem  = brackets.getModule("filesystem/FileSystem"),
        preferences = require("preferences"),
        paths       = preferences.getValue("paths");

    // Root directory for CodeMirror themes
    var cm_path = FileUtils.getNativeBracketsDirectoryPath() + "/thirdparty/CodeMirror2";
    var i, length, pathContents = [];

    // Default paths
    if ( !paths ) {
        paths = [
            require.toUrl("./") + "../../themes",
            require.toUrl("./theme/"),
            cm_path + "/theme"
        ];

        preferences.setValue("paths", paths);
    }


    function loadFile(file) {

    }


    /**
    *  Return all the files in the specified path
    */
    function loadContent (path) {
        var result = $.Deferred();

        function readContent(err, entries) {
            if ( err && err !== "NotFound" ) {
                result.reject(err);
            }

            var i, files = [];
            entries = entries || [];

            for (i = 0; i < entries.length; i++) {
                if (entries[i].isFile && entries[i].name.endsWith(".css")) {
                    files.push(entries[i].name);
                }
            }

            result.resolve({
                files: files,
                path: path
            });
        }

        FileSystem.getDirectoryForPath(path).getContents(readContent);
        return result.promise();
    }


    function init() {
        for ( i = 0, length = paths.length; i < length; i++ ) {
            pathContents[i] = loadContent( paths[i] );
        }

        return $.when.apply( $, pathContents ).promise();
    }


    return {
        ready: init().done,
        loadFile: loadFile
    };

});

