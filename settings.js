/**
 * Brackets Themse Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require) {
    "use strict";
    var PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        SettingsDialog     = require("views/settings"),
        PREFERENCES_KEY    = "extensions.brackets-editorthemes",
        _settings          = PreferencesManager.getPreferenceStorage(PREFERENCES_KEY);

    var settings = {};

    settings.open = function() {
        SettingsDialog.open(settings);
    };

    settings.close = function() {
        SettingsDialog.close();
    };

    settings.getValue = function() {
        return _settings.getValue.apply(_settings, arguments);
    };

    settings.setValue = function() {
        _settings.setValue.apply(_settings, arguments);
        $(settings).trigger("change", arguments);
        $(settings).trigger("change:" + arguments[0], [arguments[1]]);
    };

    settings.getAll = function() {
        return $.extend({}, _settings._json);
    };

    return settings;
});
