/**
 * Brackets Themes Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require, exports, module) {
    "use strict";

    var _               = brackets.getModule("thirdparty/lodash"),
        FileSystem      = brackets.getModule("filesystem/FileSystem"),
        FileUtils       = brackets.getModule("file/FileUtils"),
        _ThemeManager   = brackets.getModule("view/ThemeManager"),
        SettingsManager = require("SettingsManager"),
        validExtensions = ["css", "less"];


    /**
    * @private
    * Verifies that the file passed in is a valid theme file type.
    *
    * @param {File} file is object to verify if it is a valid theme file type
    * @return {boolean} to confirm if the file is a valid theme file type
    */
    function isFileTypeValid(file) {
        return file.isFile &&
            validExtensions.indexOf(FileUtils.getFileExtension(file.name)) !== -1;
    }


    /**
     * Load css/less files from a directory to be treated as themes
     *
     * @param {string} path where theme files are to be loaded from
     * @return {$.Deferred} promise object resolved with the themes to be loaded from the directory
     */
    function loadDirectory(path) {
        var result = new $.Deferred();

        if (!path) {
            return result.reject({
                path: path,
                error: "Path not defined"
            });
        }

        function readContent(err, entries) {
            var i, files = [];
            entries = entries || [];

            for (i = 0; i < entries.length; i++) {
                if (isFileTypeValid(entries[i])) {
                    files.push(entries[i].name);
                }
            }

            if (err) {
                result.reject({
                    path: path,
                    error: err
                });
            }
            else {
                result.resolve({
                    files: files,
                    path: path
                });
            }
        }

        function loadThemesFiles(themes) {
            // Iterate through each name in the themes and make them theme objects
            var deferred = _.map(themes.files, function (themeFile) {
                return _ThemeManager.loadFile(themes.path + "/" + themeFile);
            });

            return $.when.apply(undefined, deferred);
        }

        FileSystem.getDirectoryForPath(path).getContents(readContent);
        return result.then(loadThemesFiles);
    }


    exports.loadDirectory = loadDirectory;
});
