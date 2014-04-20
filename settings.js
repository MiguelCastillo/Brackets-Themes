/**
 * Brackets Themse Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function (require) {
    "use strict";

    var _ = brackets.getModule("thirdparty/lodash");
    var PreferencesManager = brackets.getModule("preferences/PreferencesManager"),
        SettingsDialog     = require("views/settings"),
        PREFERENCES_KEY    = "brackets-themes",
        _settings          = PreferencesManager.getExtensionPrefs(PREFERENCES_KEY);


    var settings = {};

    settings.open = function() {
        SettingsDialog.open(settings);
    };

    settings.close = function() {
        SettingsDialog.close();
    };

    settings.getValue = function() {
        return _settings.get.apply(_settings, arguments);
    };

    settings.setValue = function() {
        _settings.set.apply(_settings, arguments);
        $(settings).trigger("change", arguments);
        $(settings).trigger("change:" + arguments[0], [arguments[1]]);
    };

    settings.getAll = function() {
        var pathLength = _settings.prefix.length;
        var prefix = _settings.prefix;

        return _.transform(_settings.base._scopes.user.data, function(result, value, key) {
            if ( key.indexOf(prefix) === 0 ) {
                result[key.substr(pathLength)] = value;
            }
        });
    };

    return settings;
});
