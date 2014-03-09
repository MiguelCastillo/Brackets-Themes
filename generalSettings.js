/**
 * Brackets Themse Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require) {
    "use strict";

    var settings = require("settings");
    var $fontSize = $("<style type='text/css' id='fontSize'>").appendTo("head");
    var $fontType = $("<style type='text/css' id='fontType'>").appendTo("head");

    var fontSize = settings.getValue("fontSize"),
        fontType = settings.getValue("fontType");

    if ( fontSize === undefined ) {
        settings.setValue("fontSize", "12px");
    }

    if ( fontType === undefined ) {
        settings.setValue("fontType", "'SourceCodePro-Medium', ＭＳ ゴシック, 'MS Gothic', monospace");
    }


    function generalSettings() {
        generalSettings.update();
    }

    generalSettings.updateFontSize = function() {
        var value = settings.getValue("fontSize");
        $fontSize.text(".CodeMirror{" + "font-size: " + value + " !important;}");
    };

    generalSettings.updateFontType = function() {
        var value = settings.getValue("fontType");
        $fontType.text(".CodeMirror{" + "font-family: " + value + " !important;}");
    };

    generalSettings.update = function() {
        // Remove this tag that is intefering with font settings set in this module
        $("#codemirror-dynamic-fonts").remove();

        generalSettings.updateFontSize();
        generalSettings.updateFontType();
    };


    $(settings).on("change:fontSize", generalSettings.updateFontSize);
    $(settings).on("change:fontType", generalSettings.updateFontType);
    return generalSettings;
});

