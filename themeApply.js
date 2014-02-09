/**
 * Brackets Themse Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require) {

    var EditorManager  = brackets.getModule("editor/EditorManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
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
            currentThemes = cm.getOption("theme"),
            mode          = cm.getDoc().getMode().name;

        // CodeMirror treats json as javascript, so we gotta do
        // an extra check just to make we are not feeding json
        // into jshint/jslint.  Let's leave that to json linters
        if ( cm.getDoc().getMode().jsonMode ) {
            mode = "json";
        }

        // Add the document mode to the body so that we can actually style based on document type
        $("body").removeClass("doctype-" + themeManager._mode).addClass("doctype-" + mode);
        themeManager._mode = mode;

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

        var themes = {},
            styleDeferred = [];

        // Setup current and further documents to get the new theme...
        CodeMirror.defaults.theme = newThemes;
        cm.setOption("theme", newThemes);

        // If the css has not yet been loaded, then we load it so that
        // styling is properly applied to codemirror
        $.each(themeManager._selected.slice(0), function (index, item) {
            var _theme = themeManager._themes[item];
            themes[item] = _theme;

            if (!_theme.css) {
                var deferred = $.Deferred();
                _theme.css = ExtensionUtils.addLinkedStyleSheet(_theme.path + "/" + _theme.fileName, deferred);
                styleDeferred.push(deferred);
            }
        });


        return $.when.apply($, styleDeferred).always(function() {
            // Make sure we update the settings when a new theme is selected.
            settings.setValue("theme", themeManager._selected);

            $("body").removeClass(currentThemes.replace(' ', ',')).addClass(newThemes.replace(' ', ','));
            cm.refresh();
            $(ExtensionUtils).trigger("Themes.themeChanged", [themes]);
        });
    }


    return themeApply;

});
