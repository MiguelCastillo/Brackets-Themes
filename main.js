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
        ], function(SettingsManager, ThemeManager, MenuManager, codeMirrorAddons) {

            function initMenu() {
                var paths = SettingsManager.getValue("paths");

                paths.forEach(function(path) {
                    ThemeManager.loadDirectory(path.path).done(function() {
                        var themes = Array.prototype.slice.call(arguments);
                        if (themes.length) {
                            MenuManager.loadThemes(themes, path.path);
                        }
                    });
                });
            }

            function initAll() {
                SettingsManager.init();
                ThemeManager.init();
                MenuManager.init();
                initMenu();
            }

            $(SettingsManager).on("imported", initMenu);
            codeMirrorAddons.ready(initAll);
        });
    }

    // Init when app is ready
    AppInit.appReady(init);
});

