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

        // We gotta prefix theme names with "theme" because themes that start with a number
        // will not render correctly.  Class names that start with a number is invalid
        newThemes     = _.map(themeManager.selected, function(theme){ return "theme-" + theme; }).join(" ");
        currentThemes = _.map(currentThemes.split(" "), function(theme){ return "theme-" + theme; }).join(" ");

        $("html").removeClass(currentThemes.replace(' ', ',')).addClass(newThemes.replace(' ', ','));
        $(ExtensionUtils).trigger("Themes.themeChanged", themeManager.getThemes());
    }

    return themeApply;
});
