/**
 * Brackets Themse Copyright (c) 2014 Miguel Castillo.
 * @author Brad Gearon
 *
 * Licensed under MIT
 */


define(function (require) {
    "use strict";

    var settings = require("settings"),
        defaults = require("defaults"),
        ViewCommandHandlers = brackets.getModule("view/ViewCommandHandlers"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager");

    function viewCommandsManager () {
        var fontSize = settings.getValue("fontSize"),
            fontSizeNumeric = Number(fontSize.replace("px", "")),
            fontSizeOffset = fontSizeNumeric - defaults.FONT_SIZE;

        if(!isNaN(fontSizeOffset)) {
            PreferencesManager.setViewState("fontSizeAdjustment", fontSizeOffset);
            PreferencesManager.setViewState("fontSizeStyle", fontSize);
        }

        $(ViewCommandHandlers).on("fontSizeChange", viewCommandsManager.handleFontSizeChange);
    }

    viewCommandsManager.handleFontSizeChange = function (evt, adjustment, fontSize /*, lineHeight*/) {
        settings.setValue("fontSize", fontSize);
    };

    return viewCommandsManager;
});
