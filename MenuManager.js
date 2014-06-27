/**
 * Brackets Themes Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require, exports, module) {
    "use strict";

    var _               = brackets.getModule("thirdparty/lodash"),
        Menus           = brackets.getModule("command/Menus"),
        CommandManager  = brackets.getModule("command/CommandManager"),
        SettingsManager = require("SettingsManager");

    var prefs = SettingsManager.getPreferences(),
        menu = Menus.addMenu("Themes", "editortheme", Menus.BEFORE, Menus.AppMenuBar.HELP_MENU),
        SETTINGS_COMMAND_ID = "theme.settings",
        loadedThemes = {},
        allCommands = {};

    // Register menu event...
    CommandManager.register("Settings", SETTINGS_COMMAND_ID, SettingsManager.openDialog);


    // Load in the settings menu
    function init() {
        // Add theme menu item
        menu.addMenuItem(SETTINGS_COMMAND_ID);
        prefs.on("change", "themes", function() {
            selectThemes(prefs.get("themes"));
        });
    }


    function registerCommand(theme) {
        // Create the command id used by the menu
        var THEME_COMMAND_ID = "theme." + theme.name;

        var command = {
            id: THEME_COMMAND_ID,
            name: theme.name,
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
    function loadThemes(themes, group) {
        var currentThemes = prefs.get("themes");
        var addDivider    = !allCommands[group];
        var commands      = allCommands[group] || (allCommands[group] = {});
        var lastEntry     = commands[_.keys(commands)[0]];

        // Filter out themes that have already been loaded
        themes = _.filter(themes, function(theme) {
            return !loadedThemes[theme.name];
        });

        if (themes.length !== 0 && addDivider) {
            menu.addMenuDivider();
        }

        /*
        * Really wish we could add menu items relative to dividers
        * https://github.com/adobe/brackets/issues/8240
        */
        /*
        var divider;
        if (themes.length !== 0 && addDivider) {
            if (settingsManager.customPath === group) {
                divider = menu.addMenuDivider(Menus.AFTER, SETTINGS_COMMAND_ID);
                lastEntry = {
                    id: divider.dividerId
                };
            }
            else {
                divider = menu.addMenuDivider();
                lastEntry = {
                    id: divider.dividerId
                };
            }
        }
        */

        //
        // Iterate through each name in the themes and make them theme objects
        //
        _.each(themes, function (theme) {
            // Create the command id used by the menu
            var command = registerCommand(theme);

            if (lastEntry) {
                // Add theme menu item
                if (theme.name > lastEntry.name || !lastEntry.name) {
                    menu.addMenuItem(command.id, "", Menus.AFTER, lastEntry.id);
                }
                else {
                    menu.addMenuItem(command.id, "", Menus.BEFORE, lastEntry.id);
                }
            }
            else {
                // Add theme menu item
                menu.addMenuItem(command.id);
            }

            loadedThemes[theme.name] = theme;
            commands[theme.name] = command;

            // Keep track of last menu entry to make sure we have the right place for
            // the next menu item
            lastEntry = command;

            // Make sure to init the menu entry when loading the themes.
            if (currentThemes.indexOf(theme.name) !== -1) {
                syncMenuSelection(true, [theme.name]);
            }
        });
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
