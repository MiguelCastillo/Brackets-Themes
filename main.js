/*
 * Brackets Themes Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require, exports, module) {
    "use strict";

    var ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        AppInit        = brackets.getModule("utils/AppInit");

    // Load up reset.css to override brackground settings from brackets because
    // they make the themes look really bad.
    ExtensionUtils.loadStyleSheet(module, "reset.css");
    ExtensionUtils.loadStyleSheet(module, "views/settings.css");

    function init() {
        require([
            "SettingsManager",
            "ThemeManager",
            "MenuManager",
            "codeMirrorAddons"
        ], function(settingsManager, themeManager, menuManager, codeMirrorAddons) {

            codeMirrorAddons.ready(function() {
                settingsManager.init();
                themeManager.init();
                menuManager.init();

                // Get paths so that we load the themes in them
                var paths = settingsManager.getValue("paths");

                paths.forEach(function(path) {
                    themeManager.loadDirectory(path.path).done(function() {
                        var themes = Array.prototype.slice.call(arguments);
                        if (themes.length) {
                            menuManager.loadThemes(themes, path === paths[paths.length - 1]);
                        }
                    });
                });
            });
        });
    }

    // Init when app is ready
    AppInit.appReady(init);
});

