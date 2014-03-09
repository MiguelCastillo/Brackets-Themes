/**
 * Brackets Themse Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require) {
    "use strict";

    var FileUtils   = brackets.getModule("file/FileUtils"),
        FileSystem  = brackets.getModule("filesystem/FileSystem"),
        settings    = require("settings"),
        paths       = settings.getValue("paths");

    // Root directory for CodeMirror themes
    var cm_path = FileUtils.getNativeBracketsDirectoryPath() + "/thirdparty/CodeMirror2";
    var validExtensions = ["css", "less"];

    // Default paths
    if ( !paths ) {
        paths = [
            {path:require.toUrl("./") + "../../themes"},
            {path:require.toUrl("./theme/")},
            {path:cm_path + "/theme"}
        ];

        settings.setValue("paths", paths);
    }


    function loadFile(file) {

    }


    /**
    *  Return all the files in the specified path
    */
    function loadDirectory (path) {
        var result = $.Deferred();

        if ( ! path ) {
            return result.reject("Path is null");
        }

        function readContent(err, entries) {
            if ( err && err !== "NotFound" ) {
                result.reject(err);
            }

            var i, files = [];
            entries = entries || [];

            for (i = 0; i < entries.length; i++) {
                if (entries[i].isFile && validExtensions.indexOf(getExtension(entries[i].name)) !== -1) {
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


    function getExtension(file) {
        var lastIndexOf = file.lastIndexOf(".") + 1;
        return file.substr(lastIndexOf);
    }


    function init() {
        var i, length, directories = [];

        for ( i = 0, length = paths.length; i < length; i++ ) {
            directories[i] = loadDirectory( paths[i].path );
        }

        return $.when.apply( $, directories ).promise();
    }


    $(settings).on("change:paths", function(evt, value) {
    });


    return {
        ready: init().done,
        loadFile: loadFile,
        loadDirectory: loadDirectory
    };

});

