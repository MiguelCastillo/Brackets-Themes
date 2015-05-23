/**
 * Brackets Themes Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require, exports, module) {
    "use strict";

    var PreferencesManager  = brackets.getModule("preferences/PreferencesManager"),
        FileUtils           = brackets.getModule("file/FileUtils"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
        ExtensionLoader     = brackets.getModule("utils/ExtensionLoader"),
        ViewCommandHandlers = brackets.getModule("view/ViewCommandHandlers"),
        SettingsDialog      = require("views/settings");

    var prefs = PreferencesManager.getExtensionPrefs("themes-brackets-extension");

    var cm_path     = FileUtils.getNativeBracketsDirectoryPath() + "/thirdparty/CodeMirror/theme",
        user_path   = ExtensionUtils.getModulePath(module, "theme"),
        custom_path = user_path.substr(0, ExtensionLoader.getUserExtensionPath().lastIndexOf('/')) + "/themes";

    var defaults = {
        paths: [{path:custom_path}, {path:user_path}, {path:cm_path}]
    };


    function openDialog() {
        SettingsDialog.open(exports);
    }

    function closeDialog() {
        SettingsDialog.close();
    }

    function getValue(name) {
        return prefs.get(name);
    }

    function setValue(name, value) {
        prefs.set(name, value);
        $(exports).trigger("change", arguments);
        $(exports).trigger("change:" + arguments[0], [arguments[1]]);
    }

    function getAll() {
        var result = {};
        Object.keys(defaults).forEach(function(value) {
            result[value] = prefs.get(value);
        });
        return result;
    }

    function reset() {
        prefs.set("paths", defaults.paths);
    }

    function getPreferences() {
        return prefs;
    }


    // Define all default values
    prefs.definePreference("paths", "array", defaults.paths);


    $(SettingsDialog).on("imported", function(evt, imported) {
        $(exports).triggerHandler("imported", [imported]);
    });


    exports.defaults       = defaults;
    exports.reset          = reset;
    exports.openDialog     = openDialog;
    exports.closeDialog    = closeDialog;
    exports.getValue       = getValue;
    exports.setValue       = setValue;
    exports.getAll         = getAll;
    exports.customPath     = custom_path;
    exports.getPreferences = getPreferences;
});
