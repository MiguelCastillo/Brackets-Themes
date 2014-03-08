/**
 * Brackets Themse Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require) {
    "use strict";

    var _ = brackets.getModule("thirdparty/lodash");
    var EditorManager  = brackets.getModule("editor/EditorManager");

    /**
    *  Handles updating codemirror with the current selection of themes.
    */
    function themeApply (themeManager, cm) {
        var newThemes     = themeManager.selected.join(" "),
            currentThemes = cm.getOption("theme");

        // Check if the editor already has the theme applied...
        if (currentThemes === newThemes) {
            refresh(cm);
            return;
        }

        // Setup current and further documents to get the new theme...
        CodeMirror.defaults.theme = newThemes;
        cm.setOption("theme", newThemes);

        return loadThemes(themeManager.getThemes()).done(function(themes) {
            $("html").removeClass(currentThemes.replace(' ', ',')).addClass(newThemes.replace(' ', ','));
            $(ExtensionUtils).trigger("Themes.themeChanged", [themes]);
            refresh(cm);
        });
    }


    function loadThemes(themes) {
        var pending = _.map(themes, function (theme) {
            return theme.load();
        });

        return $.when.apply((void 0), pending);
    }


    function refresh(cm) {
        setTimeout(function(){
            EditorManager.resizeEditor(EditorManager.REFRESH_FORCE);
            cm.refresh();
        }, 50);
    }


    return themeApply;
});
