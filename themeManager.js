/*
 * Copyright (c) 2013 Miguel Castillo.
 *
 * Licensed under MIT
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */


/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, CodeMirror */

define(function (require, exports, module) {
    "use strict";

    var CommandManager      = brackets.getModule("command/CommandManager"),
        Menus               = brackets.getModule("command/Menus"),
        PreferencesManager  = brackets.getModule("preferences/PreferencesManager"),
        EditorManager       = brackets.getModule("editor/EditorManager"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
        NativeFileSystem    = brackets.getModule("file/NativeFileSystem").NativeFileSystem;

    var Theme = require("theme");

    var PREFERENCES_KEY = "extensions.brackets-editorthemes";
    var preferences = PreferencesManager.getPreferenceStorage(PREFERENCES_KEY);
    var menu = Menus.addMenu("Themes", "editortheme", Menus.BEFORE, Menus.AppMenuBar.HELP_MENU);


    var themeManager = {
        _selected: preferences.getValue("theme") || ["default"],

        // Hash for themes loaded and ready to be used.
        _themes: {}
    };



    /**
    *  Handles updating codemirror with the current selection of themes.
    */
    themeManager.applyThemes = function () {
        var editor = EditorManager.getActiveEditor();
        if (!editor || !editor._codeMirror) {
            return;
        }

        var cm            = editor._codeMirror,
            newThemes     = themeManager._selected.join(" "),
            currentThemes = cm.getOption("theme");

        // Check if the editor already has the theme applied...
        if (currentThemes === newThemes) {
            var mainEditor = EditorManager.getCurrentFullEditor();
            if (editor !== mainEditor) {
                setTimeout(function(){
                    EditorManager.resizeEditor(EditorManager.REFRESH_FORCE);
                }, 100);
            }
            return;
        }

        var themes = {}, styleDeferred = [];

        // Setup current and further documents to get the new theme...
        CodeMirror.defaults.theme = newThemes;
        cm.setOption("theme", newThemes);

        // Make sure the menu is up to date
        syncSelection(true);


        // If the css has not yet been loaded, then we load it so that
        // styling is properly applied to codemirror
        $.each(themeManager._selected.slice(0), function (index, item) {
            var _theme = themeManager._themes[item];
            themes[item] = _theme;

            if (!_theme.css) {
                var deferred = $.Deferred();
                _theme.css = ExtensionUtils.addLinkedStyleSheet(_theme.path + "/" + _theme.fileName, deferred);
                styleDeferred.push(deferred);
            }
        });


        return $.when.apply($, styleDeferred).always(function() {
            // Make sure we update the preferences when a new theme is selected.
            preferences.setValue("theme", themeManager._selected);

            $('body').removeClass(currentThemes.replace(' ', ',')).addClass(newThemes.replace(' ', ','));
            cm.refresh();
            $(ExtensionUtils).trigger("Themes.themeChanged", [themes]);
        });
    };


    /**
    *  Return all the files in the specified path
    */
    themeManager.loadFiles = function (path) {
        var result = $.Deferred();

        function handleError(error) {
            result.reject(error);
        }

        // Load up the content of the directory
        function loadDirectoryContent(fs) {
            fs.root.createReader().readEntries(function success(entries) {
                var i, files = [];

                for (i = 0; i < entries.length; i++) {
                    if (entries[i].isFile) {
                        files.push(entries[i].name);
                    }
                }

                result.resolve({
                    files: files,
                    path: path
                });
            }, handleError);
        }

        // Get directory reader handle
        NativeFileSystem.requestNativeFileSystem(path, loadDirectoryContent, handleError);
        return result.done(loadThemes).promise();
    };


    /**
    *  Create theme objects and add them to the global themes container.
    */
    function loadThemes(themes) {
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
                syncSelection(false);
                themeManager._selected = [_theme.name];
                themeManager.applyThemes();
                this.setChecked(true);
            });

            // Add theme menu item
            menu.addMenuItem(COMMAND_ID);
        });

        if (themes.files.length !== 0) {
            menu.addMenuDivider();
        }
    }


    function syncSelection(val) {
        $.each(themeManager._selected, function (index, item) {
            var command = CommandManager.get("theme." + item);
            if (command) {
                command.setChecked(val);
            }
        });
    }


    return themeManager;

});

