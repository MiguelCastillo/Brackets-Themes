/**
 * Brackets Themse Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require) {
    "use strict";

    var _ = brackets.getModule("thirdparty/lodash");
    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils");

    /**
    *  Handles updating codemirror with the current selection of themes.
    */
    function themeApply (themeManager, cm) {
        var newThemes     = themeManager.selected.join(" "),
            currentThemes = cm.getOption("theme");

        // Check if the editor already has the theme applied...
        if (currentThemes === newThemes) {
            return;
        }

        // Setup current and further documents to get the new theme...
        CodeMirror.defaults.theme = newThemes;
        cm.setOption("theme", newThemes);
        $(ExtensionUtils).trigger("Themes.themeChanged", themeManager.getThemes());
    }

    return themeApply;
});
