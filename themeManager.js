/**
 * Brackets Themse Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require) {
    "use strict";

    var _ = brackets.getModule("thirdparty/lodash");
    var EditorManager  = brackets.getModule("editor/EditorManager"),
        CommandManager = brackets.getModule("command/CommandManager");

    var settings        = require("settings"),
        Theme           = require("theme"),
        themeFiles      = require("themeFiles"),
        themeApply      = require("themeApply"),
        scrollbarsApply = require("scrollbarsApply"),
        menu            = require("menu");

    var themeManager = {
        selected: settings.getValue("theme") || ["default"],
        docMode: "",
        themes: {}
    };


    function loadThemes(themes) {
        // Iterate through each name in the themes and make them theme objects
        return _.map(themes.files, function (themeFile, index) {
            var theme = new Theme({fileName: themeFile, path: themes.path});
            return (themeManager.themes[theme.name] = theme);
        });
    }


    /**
    *  Create theme objects and add them to the global themes container.
    */
    function loadThemesMenu(themes, lastItem) {
        //
        // Iterate through each name in the themes and make them theme objects
        //
        $.each(themes, function (index, theme) {
            // Create the command id used by the menu
            var COMMAND_ID = "theme." + theme.name;

            // Register menu event...
            CommandManager.register(theme.displayName, COMMAND_ID, function () {
                syncSelection(false); // Clear selection
                themeManager.selected = [theme.name];
                themeManager.update(true);
            });

            // Add theme menu item
            menu.addMenuItem(COMMAND_ID);
        });

        if (themes.length !== 0 && !lastItem) {
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
        _.each(themeManager.selected, function (item) {
            var command = CommandManager.get("theme." + item);
            if (command) {
                command.setChecked(val);
            }
        });
    }


    function setDocumentMode(cm) {
        var mode = cm.getDoc().getMode();
        var docMode = mode && (mode.helperType || mode.name);
        $("body").removeClass("doctype-" + themeManager.docMode).addClass("doctype-" + mode);
        themeManager.docMode = docMode;
    }


    themeManager.update = function(sync) {
        var editor = EditorManager.getActiveEditor();
        if (!editor || !editor._codeMirror) {
            return;
        }

        var cm = editor._codeMirror;

        if (sync === true) {
            syncSelection(true);
            settings.setValue("theme", themeManager.selected);
        }

        setDocumentMode(cm);
        themeApply(themeManager, cm);
        scrollbarsApply(themeManager, cm);
    };


    themeManager.getThemes = function() {
        return _.map(themeManager.selected.slice(0), function (item) {
            return themeManager.themes[item] || {};
        });
    };


    themeManager.init = function() {
        themeManager.update(true);
        $(EditorManager).on("activeEditorChange", themeManager.update);
    };


    /**
    * Update Themes when all the files have been loaded
    */
    themeFiles.ready(function() {
        loadSettingsMenu();

        var i, length, themes;
        var args = Array.prototype.slice.call(arguments);
        for ( i = 0, length = args.length; i < length; i++ ) {
            themes = loadThemes(args[i]);
            loadThemesMenu( themes, i + 1 === length );
        }

        themeManager.update(true);
    });


    return themeManager;
});

