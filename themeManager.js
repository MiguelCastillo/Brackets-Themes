/**
 * Brackets Themse Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require) {
    "use strict";

    var CommandManager = brackets.getModule("command/CommandManager");

    var settings    = require("settings"),
        Theme       = require("theme"),
        themeFiles  = require("themeFiles"),
        themeApply  = require("themeApply"),
        menu        = require("menu");

    var themeManager = {
        _selected: settings.getValue("theme") || ["default"],
        _mode: "",
        _themes: {}
    };


    function applyThemes() {
        themeApply(themeManager);
    }


    /**
    *  Create theme objects and add them to the global themes container.
    */
    function loadThemesMenu(themes, lastItem) {
        //
        // Iterate through each name in the themes and make them theme objects
        //
        $.each(themes.files, function (index, themeFile) {
            var _theme = new Theme({fileName: themeFile, path: themes.path});
            themeManager._themes[_theme.name] = _theme;

            // Create the command id used by the menu
            var COMMAND_ID = "theme." + _theme.name;

            // Register menu event...
            CommandManager.register(_theme.displayName, COMMAND_ID, function () {
                syncSelection(false); // Clear selection
                themeManager._selected = [_theme.name];
                //syncSelection(true);  // Set selection

                // Load the theme is needed
                themeApply(themeManager);
                this.setChecked(true);
            });

            // Add theme menu item
            menu.addMenuItem(COMMAND_ID);
        });

        if (themes.files.length !== 0 && !lastItem) {
            menu.addMenuDivider();
        }
    }


    function loadSettingsMenu() {
        // Create the command id used by the menu
        var COMMAND_ID = "theme.settings";

        // Register menu event...
        CommandManager.register("Settings", COMMAND_ID, settings.open);

        // Add theme menu item
        menu.addMenuItem(COMMAND_ID);
        menu.addMenuDivider();
    }


    function syncSelection(val) {
        $.each(themeManager._selected, function (index, item) {
            var command = CommandManager.get("theme." + item);
            if (command) {
                command.setChecked(val);
            }
        });
    }


    themeFiles.ready(function() {
        loadSettingsMenu();

        var i, length;
        var args = Array.prototype.slice.call(arguments);
        for ( i = 0, length = args.length; i < length; i++ ) {
            loadThemesMenu(args[i], i + 1 === length);
        }

        // Let's just make sure we have the theme selected right from the get go.
        syncSelection(true);
        applyThemes();
    });


    themeManager.applyThemes = applyThemes;
    return themeManager;
});

