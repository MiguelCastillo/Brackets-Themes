/**
 * Brackets Themse Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require) {
    "use strict";

    var _ = brackets.getModule("thirdparty/lodash");
    var EditorManager  = brackets.getModule("editor/EditorManager"),
        CommandManager = brackets.getModule("command/CommandManager"),
        FileSystem     = brackets.getModule("filesystem/FileSystem");

    var settings        = require("settings"),
        Theme           = require("theme"),
        themeFiles      = require("themeFiles"),
        themeApply      = require("themeApply"),
        scrollbarsApply = require("scrollbarsApply"),
        generalSettings = require("generalSettings"),
        viewCommandsManager = require("viewCommandsManager"),
        menu            = require("menu");

    var themeManager = {
        selected: settings.getValue("theme") || ["default"],
        docMode: "",
        themes: {}
    };


    function loadThemesFiles(themes) {
        // Iterate through each name in the themes and make them theme objects
        return _.map(themes.files, function (themeFile) {
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
        _.each(themes, function (theme) {
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
        $("body").removeClass("doctype-" + themeManager.docMode).addClass("doctype-" + docMode);
        themeManager.docMode = docMode;
    }


    function loadThemes(themes, refresh) {
        var pending = _.map(themes, function (theme) {
            return theme.load(refresh);
        });

        return $.when.apply((void 0), pending);
    }


    function refresh(cm) {
        setTimeout(function(){
            cm.refresh();
            EditorManager.resizeEditor();
        }, 100);
    }


    themeManager.update = function(sync, refreshTheme) {
        var cm = getCM();

        if (sync === true) {
            syncSelection(true);
        }

        if ( cm ) {
            settings.setValue("theme", themeManager.selected);
            setDocumentMode(cm);
            generalSettings(themeManager);
            loadThemes(themeManager.getThemes(), refreshTheme === true).done(function() {
                scrollbarsApply(themeManager);
                themeApply(themeManager, cm);
                refresh(cm);
            });
        }
    };


    themeManager.getThemes = function() {
        return _.map(themeManager.selected.slice(0), function (item) {
            return themeManager.themes[item] || {};
        });
    };


    themeManager.init = function() {
        themeManager.update(true);
        $(EditorManager).on("activeEditorChange", function() {
            themeManager.update(false);
        });
    };


    function getCM() {
        var editor = EditorManager.getActiveEditor();
        if (!editor || !editor._codeMirror) {
            return;
        }
        return editor._codeMirror;
    }


    /**
    * Update Themes when all the files have been loaded
    */
    themeFiles.ready(function() {
        loadSettingsMenu();

        function returnTrue() {return true;}

        var i, length, themes;
        var args = Array.prototype.slice.call(arguments);
        for ( i = 0, length = args.length; i < length; i++ ) {
            themes = loadThemesFiles(args[i]);
            loadThemesMenu( themes, i + 1 === length );
            FileSystem.watch({
                fullPath: args[i].path
            }, returnTrue, returnTrue);
        }

        // Preload the scrollbar handler
        loadThemes(themeManager.getThemes()).done(function() {
            scrollbarsApply(themeManager);
            viewCommandsManager(themeManager);
        });

        themeManager.update(true);
    });



    FileSystem.on("change", function(evt, file) {
        var name = (file.name || "").substring(0, file.name.lastIndexOf('.')),
            theme = themeManager.themes[name];

        if ( theme && theme.getFile().parentPath === file.parentPath ) {
            themeManager.update(false, true);
        }
    });


    $(settings).on("change:fontSize", function() {
        themeManager.update();
    });


    return themeManager;
});

