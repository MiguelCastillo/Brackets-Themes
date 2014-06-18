/**
 * Brackets Themes Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require, exports, module) {
    "use strict";

    var spromise  = require("lib/spromise");

    function initAddons(CodeMirror) {
        // Set some default value for codemirror...
        CodeMirror.defaults.highlightSelectionMatches = true;
        CodeMirror.defaults.styleSelectedText = true;
    }

    function init() {
        /**
        *  This is where it all starts to load up...
        */
        return spromise(function(resolve) {
            brackets.getModule([
                "thirdparty/CodeMirror2/lib/codemirror",
                "thirdparty/CodeMirror2/addon/selection/mark-selection",
                "thirdparty/CodeMirror2/addon/search/match-highlighter"
            ], resolve);
        }).done(initAddons);
    }

    return {
        ready: init().done
    };
});

