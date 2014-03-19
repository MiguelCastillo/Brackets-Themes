/**
 * Brackets Themse Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require) {
    "use strict";

    var settings = require("settings"),
        ViewCommandHandlers = brackets.getModule('view/ViewCommandHandlers');

    var viewCommandsManager = function(themeManager) {
        $(ViewCommandHandlers)
            .on('fontSizeChange', this.handleFontSizeChange)
            .bind(this);
    };

    viewCommandsManager.prototype.handleFontSizeChange = function (evt, adjustment, fontSize, lineHeight) {
        settings.setValue('fontSize', fontSize);
        settings.setValue('lineHeight', lineHeight);
    };
    
    return viewCommandsManager;
});