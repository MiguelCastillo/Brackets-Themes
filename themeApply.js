/**
 * Brackets Themse Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require) {

    var EditorManager  = brackets.getModule("editor/EditorManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        FileSystem     = brackets.getModule("filesystem/FileSystem"),
        _              = brackets.getModule("thirdparty/lodash"),
        settings       = require("settings");


    /**
    *  Handles updating codemirror with the current selection of themes.
    */
    function themeApply (themeManager) {
        var editor = EditorManager.getActiveEditor();
        if (!editor || !editor._codeMirror) {
            return;
        }

        var cm            = editor._codeMirror,
            newThemes     = themeManager._selected.join(" "),
            currentThemes = cm.getOption("theme");

        setDocumentMode(cm, themeManager);

        // Check if the editor already has the theme applied...
        if (currentThemes === newThemes) {
            var mainEditor = EditorManager.getCurrentFullEditor();
            if (editor !== mainEditor) {
                setTimeout(function(){
                    EditorManager.resizeEditor(EditorManager.REFRESH_FORCE);
                }, 100);
            }
            return;
        }

        // Setup current and further documents to get the new theme...
        CodeMirror.defaults.theme = newThemes;
        cm.setOption("theme", newThemes);

        return loadThemes(themeManager).done(function(themes) {
            // Make sure we update the settings when a new theme is selected.
            settings.setValue("theme", themeManager._selected);

            $("html").removeClass(currentThemes.replace(' ', ',')).addClass(newThemes.replace(' ', ','));
            cm.refresh();
            $(ExtensionUtils).trigger("Themes.themeChanged", [themes]);
        });
    }


    function setDocumentMode(cm, themeManager) {
        var mode = cm.getDoc().getMode();
        mode = mode && (mode.helperType || mode.name);

        // Add the document mode to the body so that we can actually style based on document type
        $("body").removeClass("doctype-" + themeManager._mode).addClass("doctype-" + mode);
        themeManager._mode = mode;
    }


    function loadThemes(themeManager) {
        // If the css has not yet been loaded, then we load it so that
        // styling is properly applied to codemirror
        var themes = _.map(themeManager._selected.slice(0), function (item, index) {
            var _theme = themeManager._themes[item] || {},
                deferred = $.Deferred();

            if (_theme.css) {
                return _theme;
            }

            return readFile(_theme.fileName, _theme.path)
                .then(function(content) {
                    return lessify(content, _theme);
                })
                .then(function(style) {
                    return ExtensionUtils.addEmbeddedStyleSheet(style);
                })
                .then(function(styleNode) {
                    _theme.css = styleNode;
                    return _theme;
                })
                .promise();
        });

        return $.when.apply((void 0), themes);
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


    function lessify(content, theme) {
        var deferred = $.Deferred();
        var parser = new less.Parser();

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


    return themeApply;

});
