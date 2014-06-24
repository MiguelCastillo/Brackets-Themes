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

            function initMenu() {
                var paths = settingsManager.getValue("paths");

                paths.forEach(function(path) {
                    themeManager.loadDirectory(path.path).done(function() {
                        var themes = Array.prototype.slice.call(arguments);
                        if (themes.length) {
                            menuManager.loadThemes(themes, path === paths[paths.length - 1], path.path);
                        }
                    });
                });
            }

            function initAll() {
                settingsManager.init();
                themeManager.init();
                menuManager.init();
                initMenu();
            }

            $(settingsManager).on("imported", function(evt, imported) {
                initMenu();
            });


            codeMirrorAddons.ready(initAll);
        });
    }

    // Init when app is ready
    AppInit.appReady(init);
});

