/**
 * Brackets Themse Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require) {
    "use strict";

    var settings = require("settings"),
        defaults = require("defaults"),
        ViewCommandHandlers = brackets.getModule("view/ViewCommandHandlers"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager");

    var viewCommandsManager = function (themeManager) {
        var fontSize = settings.getValue("fontSize"),
            fontSizeNumeric = new Number(fontSize.replace("px", "")),
            fontSizeOffset = fontSizeNumeric - defaults.FONT_SIZE;
        
        if(fontSizeOffset > 0) {
            PreferencesManager.setViewState("fontSizeAdjustment", fontSizeOffset);
            // this should work post spring 37 (as of 3/18/2014)
            PreferencesManager.setViewState("fontSizeStyle", fontSize);
        }
        $(ViewCommandHandlers)
            .on("fontSizeChange", this.handleFontSizeChange).bind(this);
    };

    viewCommandsManager.prototype.handleFontSizeChange = function (evt, adjustment, fontSize, lineHeight) {
        settings.setValue("fontSize", fontSize);
    };

    return viewCommandsManager;
});