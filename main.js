/*
 * Brackets Themes Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require, exports, module) {
    "use strict";

    require("string");

    var ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),
        AppInit         = brackets.getModule("utils/AppInit");

    var themeManager     = require("themeManager"),
        codeMirrorAddons = require("codeMirrorAddons");

    // Load up reset.css to override brackground settings from brackets because
    // they make the themes look really bad.
    ExtensionUtils.loadStyleSheet(module, "reset.css");
    ExtensionUtils.loadStyleSheet(module, "views/settings.css");

    AppInit.appReady(function(){
        codeMirrorAddons.ready(themeManager.init);
    });
});

