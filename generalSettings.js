/**
 * Brackets Themse Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require) {
    "use strict";

    var settings = require("settings"),
        defaults = require("defaults"),
        fontSize = settings.getValue("fontSize"),
        fontType = settings.getValue("fontType"),
        lineHeight = settings.getValue("lineHeight"),
        $lineHeight = $("<style type='text/css' id='lineHeight'>").appendTo("head"),
        $fontSize = $("<style type='text/css' id='fontSize'>").appendTo("head"),
        $fontType = $("<style type='text/css' id='fontType'>").appendTo("head");

    if (fontSize === undefined) {
        settings.setValue("fontSize", defaults.FONT_SIZE + "px");
    }
    
    if (lineHeight === undefined) {
        settings.setValue("lineHeight", defaults.LINE_HEIGHT);
    }

    if (fontType === undefined) {
        settings.setValue("fontType", "'SourceCodePro-Medium', ＭＳ ゴシック, 'MS Gothic', monospace");
    }


    function generalSettings() {
        generalSettings.update();
    }

    generalSettings.updateLineHeight = function () {
        var value = settings.getValue("lineHeight");
        $lineHeight.text(".CodeMirror{" + "line-height: " + value + ";}");
    };

    generalSettings.updateFontSize = function () {
        var value = settings.getValue("fontSize");
        $fontSize.text(".CodeMirror{" + "font-size: " + value + " !important; }");
    };
    generalSettings.updateFontType = function () {
        var value = settings.getValue("fontType");
        $fontType.text(".CodeMirror{" + "font-family: " + value + " !important; }");
    };

    generalSettings.update = function () {
        // Remove this tag that is intefering with font settings set in this module
        $("#codemirror-dynamic-fonts").remove();

        generalSettings.updateLineHeight();
        generalSettings.updateFontSize();
        generalSettings.updateFontType();
    };

    $(settings).on("change:lineHeight", generalSettings.updateLineHeight);
    $(settings).on("change:fontSize", generalSettings.updateFontSize);
    $(settings).on("change:fontType", generalSettings.updateFontType);
    return generalSettings;
});