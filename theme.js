/*
 * Brackets Themes Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require, exports, module) {
    "use strict";

    var FileSystem     = brackets.getModule("filesystem/FileSystem"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

    var commentRegex = /\/\*([\s\S]*?)\*\//mg,
        scrollbarsRegex = /(?:[^}|,]*)::-webkit-scrollbar(?:[\s\S]*?){(?:[\s\S]*?)}/mg;

    /**
    *  Theme object to encasulate all the logic in one pretty bundle.
    *  The theme will self register when it is created.
    *
    *  * Required settings are fileName and path
    *
    * @constructor
    */
    function Theme(options) {
        var _self = this;
        $.extend(_self, options);

        // Create a display and a theme name from the file name
        _self.displayName = toDisplayName(_self.fileName);
        _self.name = _self.fileName.substring(0, _self.fileName.lastIndexOf('.'));
    }


    Theme.prototype.load = function(force) {
        var theme = this;

        if (theme.css && !force) {
            return theme;
        }

        return readFile(theme.fileName, this.path)
            .then(function(content) {
                return lessify(content, theme);
            })
            .then(function(style) {
                return ExtensionUtils.addEmbeddedStyleSheet(style);
            })
            .then(function(styleNode) {
                theme.css = styleNode;
                return theme;
            })
            .promise();
    };


    /**
    *  Takes all dashes and converts them to white spaces...
    *  Then takes all first letters and capitalizes them.
    */
    function toDisplayName (name) {
        name = name.substring(0, name.lastIndexOf('.')).replace(/-/g, ' ');
        var parts = name.split(" ");

        $.each(parts.slice(0), function (index, part) {
            parts[index] = part[0].toUpperCase() + part.substring(1);
        });

        return parts.join(" ");
    }


    function readFile(fileName, filePath) {
        var deferred = $.Deferred();

        try {
            var file = FileSystem.getFileForPath (filePath + "/" + fileName);
            file.read(function( err, content /*, stat*/ ) {
                if ( err ) {
                    deferred.reject(err);
                    return;
                }

                deferred.resolve(content);
            });
        }
        catch(ex) {
            deferred.reject(false);
        }

        return deferred.promise();
    }


    function extractScrollbars(content) {
        var scrollbars = [];

        // Go through and extract out scrollbar customizations so that we can
        // enable/disable via settings.
        content = content
            .replace(commentRegex, "")
            .replace(scrollbarsRegex, function(match) {
                scrollbars.push(match);
                return "";
            });

        return {
            content: content,
            scrollbars: scrollbars
        };
    }


    function lessify(content, theme) {
        var deferred = $.Deferred(),
            parser = new less.Parser();

        parser.parse("." + theme.name + "{" + content + "}", function (err, tree) {
            if (err) {
                deferred.reject(err);
            }
            else {
                deferred.resolve(tree.toCSS());
            }
        });

        return deferred.promise();
    }


    return Theme;
});

