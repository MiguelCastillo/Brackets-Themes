/**
 * Brackets Themse Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require) {
    "use strict";
    var PreferencesManager = brackets.getModule("preferences/PreferencesManager");
    var PREFERENCES_KEY    = "extensions.brackets-editorthemes";
    var preferences = PreferencesManager.getPreferenceStorage(PREFERENCES_KEY);

    preferences.open = function() {
    };

    preferences.close = function() {
    };

    return preferences;
});
