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
    var SETTINGS_COMMAND_ID = "theme.settings";
    var settingsManager = require("SettingsManager");
    var loadedThemes = {}, allCommands = {};

    // Register menu event...
    CommandManager.register("Settings", SETTINGS_COMMAND_ID, settingsManager.openDialog);


    // Load in the settings menu
    function init() {
        // Add theme menu item
        menu.addMenuItem(SETTINGS_COMMAND_ID);
        menu.addMenuDivider();

        prefs.on("change", "themes", function() {
            selectThemes(prefs.get("themes"));
        });
    }


    function registerCommand(theme) {
        // Create the command id used by the menu
        var THEME_COMMAND_ID = "theme." + theme.name;

        var command = {
            id: THEME_COMMAND_ID,
            theme: theme,
            fn: function() {
                prefs.set("themes", [theme.name]);
            }
        };

        // Register menu event...
        CommandManager.register(theme.displayName, THEME_COMMAND_ID, command.fn);
        return command;
    }


    /**
    *  Create theme objects and add them to the global themes container.
    */
    function loadThemes(themes, lastItem, group) {
        var currentThemes = prefs.get("themes");
        var addDivider    = !allCommands[group];
        var commands      = allCommands[group] || (allCommands[group] = {});
        var lastEntry     = commands[_.keys(commands)[0]];

        //
        // Iterate through each name in the themes and make them theme objects
        //
        _.each(themes, function (theme) {
            // Create the command id used by the menu
            var command = commands[theme.name] || registerCommand(theme);

            // Make sure we dont load themes that have already been laoded in the menu
            if (!commands[theme.name]) {

                if (lastEntry) {
                    // Add theme menu item
                    if (theme.name > lastEntry.theme.name) {
                        menu.addMenuItem(command.id, false, Menus.AFTER, lastEntry.id);
                    }
                    else {
                        menu.addMenuItem(command.id, false, Menus.BEFORE, lastEntry.id);
                    }
                }
                else {
                    // Add theme menu item
                    menu.addMenuItem(command.id);
                }

                loadedThemes[theme.name] = theme;
                commands[theme.name] = command;
            }

            // Keep track of last menu entry to make sure we have the right place for
            // the next menu item
            lastEntry = command;

            // Make sure to init the menu entry when loading the themes.
            if (currentThemes.indexOf(theme.name) !== -1) {
                syncMenuSelection(true, [theme.name]);
            }
        });

        if (themes.length !== 0 && !lastItem && addDivider) {
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


    function clear() {
        Menus.removeMenu("editortheme");
        loadedThemes = {};
    }


    function selectThemes(themes) {
        syncMenuSelection(false);
        syncMenuSelection(true, themes);
    }


    exports.init = init;
    exports.loadThemes = loadThemes;
    exports.clear = clear;
});
