/**
 * Brackets Themes Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require, exports, module) {
    "use strict";
    
    var tinycolor = require("lib/tinycolor");


    //http://regex101.com/r/yI2wL5/1
    var bgColor = /\.CodeMirror[\s]*\{[\s\S]*?(?:background(?:-color)?[\s:]+([^;]+))/gmi;

    //http://regex101.com/r/gQ4yO9/1
    var fontColor = /\.CodeMirror[\s]*\{[\s\S]*?(?:color[\s:]+([^;]+))/gmi;


    function getColor(content, expression) {
        var color = expression.exec(content);
        if (color) {
            color = color[1];
        }

        return color;
    }


    function getBackgroundColor(content) {
        return getColor(content, /\.CodeMirror[\s]*\{[\s\S]*?(?:background(?:-color)?[\s:]+([^;]+))/gmi);
    }


    function getFontColor(content) {
        return getColor(content, /\.CodeMirror[\s]*\{[\s\S]*?(?:color[\s:]+([^;]+))/gmi);
    }


    function isDark(content) {
        var backgroundColor = getBackgroundColor(content);
        return backgroundColor ? tinycolor(backgroundColor).isDark() : false;
    }


    return {
        getBackgroundColor: getBackgroundColor,
        getFontColor: getFontColor,
        isDark: isDark
    };
});
