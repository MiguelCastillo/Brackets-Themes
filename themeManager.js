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

    var settings            = require("settings"),
        Theme               = require("theme"),
        themeFiles          = require("themeFiles"),
        themeApply          = require("themeApply"),
        scrollbarsApply     = require("scrollbarsApply"),
        generalSettings     = require("generalSettings"),
        viewCommandsManager = require("viewCommandsManager"),
        menu                = require("menu");

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
                syncMenuSelection(false); // Clear selection
                setThemesClass([theme.name]);
                themeManager.update(true, true);
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


    function syncMenuSelection(val) {
        _.each(themeManager.selected, function (item) {
            var command = CommandManager.get("theme." + item);
            if (command) {
                command.setChecked(val);
            }
        });
    }


    function setThemesClass(newThemes) {
        var oldThemes = themeManager.selected;
        newThemes = newThemes || [];
        themeManager.selected = newThemes;

        // We gotta prefix theme names with "theme" because themes that start with a number
        // will not render correctly.  Class names that start with a number are invalid
        newThemes = _.map(newThemes, function(theme){ return "theme-" + theme; }).join(" ");
        oldThemes = _.map(oldThemes, function(theme){ return "theme-" + theme; }).join(" ");
        $("html").removeClass(oldThemes.replace(' ', ',')).addClass(newThemes.replace(' ', ','));
    }


    function setDocumentMode(cm) {
        var mode = cm.getDoc().getMode();
        var docMode = mode && (mode.helperType || mode.name);
        $("html").removeClass("doctype-" + themeManager.docMode).addClass("doctype-" + docMode);
        themeManager.docMode = docMode;
    }


    function loadThemes(themes, refresh) {
        var pending = _.map(themes, function (theme) {
            if ( theme ) {
                return theme.load(refresh);
            }
        });

        return $.when.apply((void 0), pending);
    }


    function refresh(cm) {
        setTimeout(function(){
            cm.refresh();
            EditorManager.resizeEditor();
        }, 100);
    }


    function getCM() {
        var editor = EditorManager.getActiveEditor();
        if (!editor || !editor._codeMirror) {
            return;
        }
        return editor._codeMirror;
    }


    themeManager.update = function(syncMenu, refreshThemes) {
        if (syncMenu === true) {
            syncMenuSelection(true);
        }

        loadThemes(themeManager.getThemes(), refreshThemes === true).done(function() {
            settings.setValue("theme", themeManager.selected);
            setThemesClass(themeManager.selected);
            generalSettings(themeManager);
            scrollbarsApply(themeManager);

            var cm = getCM();
            if ( cm ) {
                setDocumentMode(cm);
                themeApply(themeManager, cm);
                refresh(cm);
            }
        });
    };


    themeManager.getThemes = function() {
        return _.map(themeManager.selected.slice(0), function (item) {
            return themeManager.themes[item];
        });
    };


    themeManager.init = function() {
        // Make sure we do any initting when themes is actually done loading the stuff it needs
        themeFiles.ready(function() {
            $(EditorManager).on("activeEditorChange", function() {
                themeManager.update(false);
            });
        });
    };


    /**
    * Update Themes when all the files have been loaded
    */
    themeFiles.ready(function() {
        viewCommandsManager();
        loadSettingsMenu();

        function returnTrue() {return true;}
        var i, length, themes;
        var args = arguments;

        for ( i = 0, length = args.length; i < length; i++ ) {
            if ( args[i].error ) {
                continue;
            }

            themes = loadThemesFiles(args[i]);
            loadThemesMenu( themes, i + 1 === length );

            try {
                FileSystem.watch({
                    fullPath: args[i].path
                }, returnTrue, returnTrue);
            }
            catch(ex) {
                console.log("=============> Themes file watch", ex);
            }
        }

        themeManager.update(true, true);
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
