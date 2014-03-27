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
        importer = require("mirror-style/main"),
        packageInfo = JSON.parse(require("text!package.json")),
        tmpl = {
            "main": require("text!views/settings.html"),
            "general": require("text!views/general.html"),
            "paths": require("text!views/paths.html"),
            "import": require("text!views/import.html"),
            "schedule": require("text!views/schedule.html"),
            "about": require("text!views/about.html")
        };

    // Make sure koFactory get a reference to ko...
    koFactory.ko = ko;

    // Setup all the templates so that we can easily render them with Mustache
    var $settings = $(tmpl.main).addClass("themeSettings");
    $("#generalSettings", $settings).html(tmpl.general);
    $("#pathsSettings", $settings).html(tmpl.paths);
    $("#importSettings", $settings).html(tmpl.import);
    $("#scheduleSettings", $settings).html(tmpl.schedule);
    $("#aboutSettings", $settings).html(tmpl.about);

    var _currentSettings;


    function openDialog(path, openFile, title) {
        var result = $.Deferred();
        openFile = !openFile;
        title    = openFile ? Strings.CHOOSE_FOLDER : Strings.OPEN_FILE;

        FileSystem.showOpenDialog(false, openFile, title, path, null, function (err, files) {
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
            openDialog("").done(function(newpath) {
                _self.settings.paths.push(koFactory({path: newpath}));
            });
        };

        viewModel.editPath = function() {
            var _self = this;
            openDialog(this.path()).done(function(newpath) {
                _self.settings.path(newpath);
            });
        };

        viewModel.removePath = function() {
            viewModel.settings.paths.remove(this);
        };

        viewModel.importStudioStyle = function() {
            function importTheme(themeFile) {
                return importer.importFile(themeFile);
            }

            function saveTheme(theme) {
                // Default to users folder...
                var path = require.toUrl("./") + "../theme/";
                FileSystem.showSaveDialog("Save Theme", path, theme.fileName, function(err, fileName) {
                    var file = FileSystem.getFileForPath (fileName);
                    file.write(theme.content);
                });
            }

            openDialog("", true)
                .then(importTheme)
                .then(saveTheme);
        };

        return viewModel;
    }


    function open(settings) {
        _currentSettings = settings;
        var settingsValues = settings.getAll();
        var viewModel      = getViewModel(settingsValues);
        var $template      = $settings.clone();

        $template.find("[data-toggle=tab].default").tab("show");
        koFactory.bind(viewModel, $template);

        Dialog.showModalDialogUsingTemplate($template).done(function( id ) {
            if ( id === "save" ) {
                var newSettings = koFactory.deserialize(viewModel).settings;
                for( var i in newSettings ) {
                    if ( settingsValues.hasOwnProperty(i) ) {
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

