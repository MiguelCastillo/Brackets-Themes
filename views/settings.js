/*
 * Brackets Themes Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require, exports, module) {
    "use strict";

    var Dialogs        = brackets.getModule("widgets/Dialogs"),
        DefaultDialogs = brackets.getModule("widgets/DefaultDialogs"),
        FileSystem     = brackets.getModule("filesystem/FileSystem"),
        StringUtils    = brackets.getModule("utils/StringUtils"),
        Strings        = brackets.getModule("strings"),
        ko             = require("lib/knockout-3.0.0"),
        koFactory      = require("lib/ko.factory"),
        importer       = require("mirror-style/main"),
        packageInfo    = JSON.parse(require("text!package.json")),
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

    var lastSaveImportThemeDirectory = "";

    function openDialog(path, openFile, title) {
        var result = $.Deferred();
        title = openFile ? Strings.OPEN_FILE : Strings.CHOOSE_FOLDER;

        FileSystem.showOpenDialog(false, !openFile, title, path, null, function (err, files) {
            var errorMessage;

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
                errorMessage = openFile ? "Error opening file " + path : "Error opening directory " + path;
                result.reject(errorMessage);
                Dialogs.showModalDialog(
                    DefaultDialogs.DIALOG_ID_ERROR,
                    errorMessage,
                    StringUtils.format(Strings.OPEN_DIALOG_ERROR, err)
                );
            }
        });

        return result.promise();
    }


    function getViewModel(settingsManager) {
        var settings  = settingsManager.getAll();
        var viewModel = koFactory($.extend(true, {}, {settings: settings, package: packageInfo}));

        viewModel.reset = function() {
            settingsManager.reset();
        };

        viewModel.addPath = function() {
            openDialog("").done(function(newpath) {
                viewModel.settings.paths.push(koFactory(newpath));
            });
        };

        viewModel.editPath = function() {
            openDialog(this).done(function(newpath) {
                viewModel.settings.path(newpath);
            });
        };

        viewModel.removePath = function() {
            viewModel.settings.paths.remove(this);
        };

        viewModel.importStudioStyle = function() {
            // This is really important.  If the default folder to place custom themes
            // does not exist, then we need to create one so that we have a place to
            // put these default themes to prevent them from being deleted when updates
            // take place.
            var directory = FileSystem.getDirectoryForPath(settingsManager.customPath);
            directory.exists(function(err, exists) {
                if (!err && !exists) {
                    directory.create();
                }
            });

            // We want to save themes in the custom path by default.  But we will cache
            // the value of the last selected directory in case the user just wants to
            // save themes in a different location.
            lastSaveImportThemeDirectory = lastSaveImportThemeDirectory || settingsManager.customPath;

            function importTheme(themeFile) {
                return importer.importFile(themeFile);
            }

            function saveTheme(theme) {
                FileSystem.showSaveDialog("Save Theme", lastSaveImportThemeDirectory, theme.fileName, function(err, fileName) {
                    if (fileName) {
                        var file = FileSystem.getFileForPath (fileName);
                        file.write(theme.content);
                        lastSaveImportThemeDirectory = file._parentPath;
                    }
                });
            }

            openDialog("", true)
                .then(importTheme)
                .then(saveTheme);
        };

        return viewModel;
    }


    function open(settings) {
        var settingsValues = settings.getAll();
        var viewModel      = getViewModel(settings);
        var $template      = $settings.clone();

        $template.find("[data-toggle=tab].default").tab("show");
        koFactory.bind(viewModel, $template);

        Dialogs.showModalDialogUsingTemplate($template).done(function( id ) {
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


    exports.open = open;
});

