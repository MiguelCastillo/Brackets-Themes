/*
 * Brackets Themes Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require, exports, module) {
    "use strict";

    var EditorManager  = brackets.getModule("editor/EditorManager"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        AppInit        = brackets.getModule("utils/AppInit");

    // Load up reset.css to override brackground settings from brackets because
    // they make the themes look really bad.
    ExtensionUtils.loadStyleSheet(module, "reset.css");
    ExtensionUtils.loadStyleSheet(module, "views/settings.css");
    

    function init(SettingsManager, ThemeManager, MenuManager, codeMirrorAddons) {
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


        function setDocumentType(evt, doc) {
            if (!doc) {
                return;
            }

            var cm      = doc._codeMirror;
            var mode    = cm && cm.getDoc().getMode();
            var docType = mode && (mode.helperType || mode.name);
            $(cm.display.wrapper).attr("doctype", docType || cm.options.mode);
        }


        function initAll() {
            MenuManager.init();
            initMenu();
        }


        $(SettingsManager).on("imported", initMenu);
        codeMirrorAddons.ready(initAll);

        $(EditorManager).on("activeEditorChange.themes", setDocumentType);
        setDocumentType(null, EditorManager.getActiveEditor());
    }


    // Init when app is ready
    AppInit.htmlReady(function () {
        require(["SettingsManager","ThemeManager","MenuManager","codeMirrorAddons"], init);
    });
});

