/**
 * Brackets Themse Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require) {
    "use strict";
    var PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        SettingsDialog     = require("views/settings");
    var PREFERENCES_KEY    = "extensions.brackets-editorthemes";
    var settings           = PreferencesManager.getPreferenceStorage(PREFERENCES_KEY);

    settings.open = function() {
        SettingsDialog.open(settings);
    };

    settings.close = function() {
        SettingsDialog.close();
    };

    return settings;
});
