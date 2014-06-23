/**
 * Brackets Themes Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require, exports, module) {
    "use strict";

    var _                  = brackets.getModule("thirdparty/lodash"),
        Menus              = brackets.getModule("command/Menus"),
        CommandManager     = brackets.getModule("command/CommandManager"),
        PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        prefs              = PreferencesManager.getExtensionPrefs("brackets-themes-extension");

    var menu = Menus.addMenu("Themes", "editortheme", Menus.BEFORE, Menus.AppMenuBar.HELP_MENU);
    var settingsManager = require("SettingsManager");
    var loadedThemes = {};


    // Load in the settings menu
    function init() {
        // Create the command id used by the menu
        var COMMAND_ID = "theme.settings";

        // Register menu event...
        CommandManager.register("Settings", COMMAND_ID, settingsManager.openDialog);

        // Add theme menu item
        menu.addMenuItem(COMMAND_ID);
        menu.addMenuDivider();

        prefs.on("change", "themes", function() {
            selectThemes(prefs.get("themes"));
        });
    }


    /**
     *  Create theme objects and add them to the global themes container.
     */
    function loadThemes(themes, lastItem) {
        var currentThemes = prefs.get("themes");

        //
        // Iterate through each name in the themes and make them theme objects
        //
        _.each(themes, function (theme) {
            // Create the command id used by the menu
            var COMMAND_ID = "theme." + theme.name;
            loadedThemes[theme.name] = theme;

            // Register menu event...
            CommandManager.register(theme.displayName, COMMAND_ID, function () {
                prefs.set("themes", [theme.name]);
            });

            // Add theme menu item
            menu.addMenuItem(COMMAND_ID);

            // Make sure to init the menu entry when loading the themes.
            if (currentThemes.indexOf(theme.name) !== -1) {
                syncMenuSelection(true, [theme.name]);
            }
        });

        if (themes.length !== 0 && !lastItem) {
            menu.addMenuDivider();
        }
    }


    function syncMenuSelection(val, themes) {
        _.each(themes || Object.keys(loadedThemes), function (theme) {
            var command = CommandManager.get("theme." + theme);
            if (command) {
                command.setChecked(val);
            }
        });
    }


    function selectThemes(themes) {
        syncMenuSelection(false);
        syncMenuSelection(true, themes);
    }


    exports.init = init;
    exports.loadThemes = loadThemes;
});
