/*
 * Brackets Themes Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, CodeMirror */

define(function (require, exports, module) {
    "use strict";

    require("string");

    var EditorManager   = brackets.getModule("editor/EditorManager"),
        ExtensionUtils  = brackets.getModule("utils/ExtensionUtils"),
        AppInit         = brackets.getModule("utils/AppInit");

    var themeManager     = require("themeManager"),
        codeMirrorAddons = require("codeMirrorAddons");

    // Load up reset.css to override brackground settings from brackets because
    // they make the themes look really bad.
    ExtensionUtils.loadStyleSheet(module, "reset.css");
    ExtensionUtils.loadStyleSheet(module, "views/settings.css");

    codeMirrorAddons.ready(function () {
        // Once the app is fully loaded, we will proceed to check the theme that
        // was last set
        AppInit.appReady(function () {
            themeManager.applyThemes();
            $(EditorManager).on("activeEditorChange", themeManager.applyThemes);
        });
    });
});
