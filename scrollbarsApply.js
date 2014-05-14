/**
 * Brackets Themse Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require) {
    "use strict";

    var settings = require("settings");
    var enableScrollbars = settings.getValue("enableScrollbars");
    var $scrollbars = $("<style id='scrollbars'>").appendTo("head");
    var theme;


    if ( enableScrollbars === undefined ) {
        settings.setValue("enableScrollbars", true);
    }


    function scrollbarsApply(themeManager) {
        scrollbarsApply.update(themeManager);
    }


    scrollbarsApply.update = function(themeManager) {
        theme = themeManager ? themeManager.getThemes()[0] : (theme || {});
        if ( settings.getValue("enableScrollbars") ) {
            var scrollbar = ((theme && theme.scrollbar) || []).join(" ");
            $scrollbars.text(scrollbar || "");
        }
        else {
            $scrollbars.text("");
        }
    };


    scrollbarsApply.enable = function(themeManager) {
        settings.setValue("enableScrollbars", true);
        scrollbarsApply.update(themeManager);
    };


    scrollbarsApply.disable = function(themeManager) {
        settings.setValue("enableScrollbars", true);
        scrollbarsApply.update(themeManager);
    };


    $(settings).on("change:enableScrollbars", function() {
        scrollbarsApply.update();
    });


    return scrollbarsApply;
});

