/*
 * Brackets Themes Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require, exports, module) {
    "use strict";

    var _ = brackets.getModule("thirdparty/lodash");
    var Dialog = brackets.getModule("widgets/Dialogs"),
        FileSystem = brackets.getModule("filesystem/FileSystem"),
        Strings = brackets.getModule("strings"),
        ko = require("lib/knockout-3.0.0"),
        koFactory = require("lib/ko.factory"),
        packageInfo = JSON.parse(require("text!package.json")),
        tmpl = {
            main: require("text!views/settings.html"),
            general: require("text!views/general.html"),
            paths: require("text!views/paths.html"),
            schedule: require("text!views/schedule.html"),
            about: require("text!views/about.html")
        };

    // Make sure koFactory get a reference to ko...
    koFactory.ko = ko;

    // Setup all the templates so that we can easily render them with Mustache
    var $settings = $(tmpl.main).addClass("themeSettings");
    $("#generalSettings", $settings).html(tmpl.general);
    $("#pathsSettings", $settings).html(tmpl.paths);
    $("#scheduleSettings", $settings).html(tmpl.schedule);
    $("#aboutSettings", $settings).html(tmpl.about);


    function openFolder(path) {
        var result = $.Deferred();

        FileSystem.showOpenDialog(false, true, Strings.CHOOSE_FOLDER, path, null, function (err, files) {
            if (!err) {
                // If length == 0, user canceled the dialog; length should never be > 1
                if (files.length > 0) {
                    result.resolve(files[0]);
                }
                else {
                    result.reject("User canceled");
                }
            }
            else {
                Dialogs.showModalDialog(
                    DefaultDialogs.DIALOG_ID_ERROR,
                    "Error opening directory " + path,
                    StringUtils.format(Strings.OPEN_DIALOG_ERROR, err)
                );
                result.reject("Error opening directory " + path);
            }
        });

        return result.promise();
    }


    function getViewModel(settings) {
        var viewModel = koFactory($.extend(true, {}, {settings: settings, package: packageInfo}));

        viewModel.addPath = function() {
            var _self = this;
            openFolder("").done(function(newpath) {
                _self.settings.paths.push(koFactory({path: newpath}));
            });
        };

        viewModel.editPath = function() {
            var _self = this;
            openFolder(this.path()).done(function(newpath) {
                _self.settings.path(newpath);
            });
        };

        viewModel.removePath = function() {
            viewModel.settings.paths.remove(this);
        };

        return viewModel;
    }


    function open(settings) {
        var viewModel = getViewModel(settings._json);
        var $template = $settings.clone();
        $template.data("settings", settings).find("[data-toggle=tab].default").tab("show");
        koFactory.bind(viewModel, $template);

        Dialog.showModalDialogUsingTemplate($template).done(function( id ) {
            if ( id === "save" ) {
                var newSettings = koFactory.deserialize(viewModel).settings;
                for( var i in newSettings ) {
                    if ( settings._json.hasOwnProperty(i) ) {
                        settings.setValue( i, newSettings[i] );
                    }
                }
            }
        });
    }


    return {
      open: open
    };
});

