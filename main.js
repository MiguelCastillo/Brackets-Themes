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
        AppInit             = brackets.getModule("utils/AppInit"),
        FileUtils           = brackets.getModule("file/FileUtils"),
        NativeFileSystem    = brackets.getModule("file/NativeFileSystem").NativeFileSystem;

    var PREFERENCES_KEY = "extensions.brackets-editorthemes";
    var preferences = PreferencesManager.getPreferenceStorage(PREFERENCES_KEY);

    // Load up reset.css to override brackground settings from brackets because
    // they make the themes look really bad.
    ExtensionUtils.loadStyleSheet(module, "reset.css");


    // Forward declaration to avoid JSLint error
    var menuHandler = null, themeManager = null;


    /**
    *  Theme object to encasulate all the logic in one pretty bundle.
    *  The theme will self register when it is created.
    *
    *  * Required settings are fileName and path
    *
    * @constructor
    */
    function theme(options) {
        var _self = this;
        $.extend(_self, options);

        // Create a display and a theme name from the file name
        _self.displayName = theme.toDisplayName(_self.fileName);
        _self.name = _self.fileName.substring(0, _self.fileName.lastIndexOf('.'));

        // Create the command id used by the menu
        var COMMAND_ID = "theme." + _self.name;

        // Register menu event...
        CommandManager.register(_self.displayName, COMMAND_ID, function () {
            menuHandler.updateSelection(this, _self);
        });

        // Add theme menu item
        menuHandler.addItem(COMMAND_ID);
    }


    /**
    *  Takes all dashes and converts them to white spaces...
    *  Then takes all first letters and capitalizes them.
    */
    theme.toDisplayName = function (name) {
        name = name.substring(0, name.lastIndexOf('.')).replace(/-/g, ' ');
        var parts = name.split(" ");

        $.each(parts.slice(0), function (index, part) {
            parts[index] = part[0].toUpperCase() + part.substring(1);
        });

        return parts.join(" ");
    };


    /**
    * Controls the logic for selecting and deselecting themes
    */
    themeManager = (function () {

        // This is to make sure we handle themes that were stored strings rather
        // than an array of string, which is what the newer stuff does in order
        // to support multiselect.
        var selection = preferences.getValue("theme") || ["default"];
        if (typeof selection === "string") {
            selection = [selection];
        }


        // Flag for whether or not multiselection is enabled when loading up
        // the extension
        var multiselect = preferences.getValue("multiselect") === true;


        // These will soon be private data with accessor functions...
        return {
            _selection: selection,
            _multiselect: multiselect,

            // Hash for themes loaded and ready to be used.
            _items: {},

            // Root directory for themes
            _cm_path: FileUtils.getNativeBracketsDirectoryPath() + "/thirdparty/CodeMirror2"
        };

    })();


    /**
    *  Handles updating codemirror with the current selection of themes.
    */
    themeManager.applyThemes = function () {
        var editor = EditorManager.getActiveEditor();
        if (!editor || !editor._codeMirror) {
            return;
        }

        var cm = editor._codeMirror;
        var themesString = themeManager._selection.join(" ");
        var _themes = {};

        // Check if the editor already has the theme applied...
        if (cm.getOption("theme") === themesString) {
            var mainEditor = EditorManager.getCurrentFullEditor();
            if (editor !== mainEditor) {
                setTimeout(function(){
                    EditorManager.resizeEditor(EditorManager.REFRESH_FORCE);
                }, 100);
            }
            return;
        }

        var styleDeferred = [];

        // Setup current and further documents to get the new theme...
        CodeMirror.defaults.theme = themesString;
        cm.setOption("theme", themesString);

        // If the css has not yet been loaded, then we load it so that
        // styling is properly applied to codemirror
        $.each(themeManager._selection.slice(0), function (index, item) {
            var _theme = themeManager._items[item];
            _themes[item] = _theme;

            if (!_theme.css) {
                var deferred = $.Deferred();
                _theme.css = ExtensionUtils.addLinkedStyleSheet(_theme.path + "/" + _theme.fileName, deferred);
                styleDeferred.push(deferred);
            }
        });

        $.when.apply($, styleDeferred).always(function() {
            // Make sure we update the preferences when a new theme is selected.
            // Css is set to false so that when we reload brackets, we can reload
            // the css file for the theme.
            setTimeout(function() {
                preferences.setValue("theme", themeManager._selection);
                cm.refresh();
                $(ExtensionUtils).trigger("Themes.themeChanged", [_themes]);                
            }, 1);
        });
    };


    /**
    *  Create theme objects and add them to the global themes container.
    */
    themeManager.loadThemes = function (_themes) {
        var themes = {};

        //
        // Iterate through each name in the themes and make them theme objects
        //
        $.each(_themes.files, function (index, themeFile) {
            var _theme = new theme({fileName: themeFile, path: _themes.path});
            themes[_theme.name] = themeManager._items[_theme.name] = _theme;
        });

        if (_themes.files.length !== 0) {
            menuHandler.addDivider();
        }

        // return the themes that were loaded
        return themes;
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
        return result.promise();
    };


    menuHandler = (function () {
        // Look for the menu where we will be inserting our theme menu
        var menu = Menus.addMenu("Themes", "editortheme", Menus.BEFORE, Menus.AppMenuBar.HELP_MENU);

        function _updateSelectionChecks(val) {
            $.each(themeManager._selection, function (index, item) {
                var command = CommandManager.get("theme." + item);
                if (command) {
                    command.setChecked(val);
                }
            });
        }


        /**
        *  Updates the theme selection from the menu
        */
        function updateSelection(menuItem, _theme) {

            if (themeManager._multiselect) {
                // I am forcing one theme to be selected at all times.  So, if we are in
                // multiselect mode and we are trying to set/unset the only theme that's
                // already selected, we will return to stop the deselection process.
                if (themeManager._selection.length === 1 && themeManager._selection.indexOf(_theme.name) !== -1) {
                    return;
                }

                var checked = !menuItem.getChecked();
                menuItem.setChecked(checked);

                if (checked) {
                    themeManager._selection.push(_theme.name);
                } else {
                    var index = themeManager._selection.indexOf(_theme.name);
                    if (index !== -1) {
                        themeManager._selection.splice(index, 1);
                    }
                }
            } else {
                _updateSelectionChecks(false);
                menuItem.setChecked(true);
                themeManager._selection = [_theme.name];
            }

            themeManager.applyThemes();
        }


        /**
        *  Register and handle multiselect
        */
        function register() {
            // Create the command id used by the menu
            var COMMAND_ID = "theme.MixedMode";

            // Register menu event...
            CommandManager.register("Mixed Mode", COMMAND_ID, function () {
                var multiselect = !this.getChecked();

                // Handle going from multi select to single select.  Special handling
                // is required because we need to only keep one suitable theme and then
                // re-apply it to undo all the other themes
                if (!multiselect) {
                    _updateSelectionChecks(false);

                    // If we are going from multiselect to single select, then we
                    // need to unselect everything and keep only one.  I am thinking
                    // that keeping your first selection is as good as any.
                    if (themeManager._selection.length !== 0) {
                        themeManager._selection = [themeManager._selection[0]];
                        var command = CommandManager.get("theme." + themeManager._selection[0]);
                        if (command) {
                            command.setChecked(true);
                        }

                        themeManager.applyThemes();
                    }
                }

                this.setChecked(multiselect);
                preferences.setValue("multiselect", multiselect);
                themeManager._multiselect = multiselect;
            });

            // Add theme menu item
            menu.addMenuItem(COMMAND_ID);

            var command = CommandManager.get(COMMAND_ID);
            if (command) {
                command.setChecked(preferences.getValue("multiselect"));
            }

            _updateSelectionChecks(true);
        }

        return {
            register: register,
            updateSelection: updateSelection,
            addDivider: function () {
                menu.addMenuDivider();
            },
            addItem: function (commandId) {
                menu.addMenuItem(commandId);
            }
        };

    })();



    /**
    *  This is where is all starts to load up...
    */
    var promises = [
        // Load up codemirror addon for active lines
        $.getScript(FileUtils.getNativeBracketsDirectoryPath() + "/thirdparty/CodeMirror2/addon/selection/mark-selection.js").promise(),
        $.getScript(FileUtils.getNativeBracketsDirectoryPath() + "/thirdparty/CodeMirror2/addon/search/match-highlighter.js").promise(),

        // Load up all the theme files from custom themes directory
        themeManager.loadFiles(require.toUrl('./theme/')).done(themeManager.loadThemes),

        // Load up all the theme files from codemirror themes directory
        themeManager.loadFiles(themeManager._cm_path + '/theme').done(themeManager.loadThemes)
    ];


    //
    // Synchronize all calls to load resources.
    //
    $.when.apply($, promises).done(function () {

        // Set some default value for codemirror...
        CodeMirror.defaults.highlightSelectionMatches = true;
        CodeMirror.defaults.styleSelectedText = true;


        // Once the app is fully loaded, we will proceed to check the theme that
        // was last set
        AppInit.appReady(function () {
            menuHandler.register();
            themeManager.applyThemes();
            $(EditorManager).on("activeEditorChange", themeManager.applyThemes);
        });
    });


});
