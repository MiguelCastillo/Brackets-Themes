/**
 * Brackets Themse Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require, exports, module) {
    "use strict";

    var spromise  = require("lib/spromise");

    function initAddons() {
        // Set some default value for codemirror...
        CodeMirror.defaults.highlightSelectionMatches = true;
        CodeMirror.defaults.styleSelectedText = true;
    }

    function init() {
        /**
        *  This is where is all starts to load up...
        */
        var promises = [
            // Load up codemirror addon for active lines
            spromise(function(resolve) {
                brackets.getModule(["thirdparty/CodeMirror2/addon/selection/mark-selection"], resolve);
            }),
            spromise(function(resolve) {
                brackets.getModule(["thirdparty/CodeMirror2/addon/search/match-highlighter"], resolve);
            })
        ];

        return spromise.when.apply((void 0), promises).done(initAddons);
    }

    return {
        ready: init().done
    };
});

