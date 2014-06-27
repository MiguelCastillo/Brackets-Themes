/*
 * Brackets Themes Copyright (c) 2014 Miguel Castillo.
 *
 * Licensed under MIT
 */


define(function(require, exports, module) {
    "use strict";

    var _ = brackets.getModule("thirdparty/lodash");
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
    koFactory.$  = $;

    // Setup all the templates so that we can easily render them with Mustache
    var $settings = $(tmpl.main).addClass("themeSettings");
    $("#generalSettings", $settings).html(tmpl.general);
    $("#pathsSettings", $settings).html(tmpl.paths);
    $("#importSettings", $settings).html(tmpl.import);
    $("#scheduleSettings", $settings).html(tmpl.schedule);
    $("#aboutSettings", $settings).html(tmpl.about);


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
        function defaults() {
            var settings  = settingsManager.getAll();
            return $.extend(true, {}, {settings: settings, package: packageInfo, imported: []});
        }

        var viewModel = koFactory.serialize(defaults());

        viewModel.reset = function() {
            settingsManager.reset();
            koFactory.serialize(defaults(), viewModel);
        };

        viewModel.addPath = function() {
            openDialog("").done(function(newpath) {
                viewModel.settings.paths.push(koFactory({path:newpath}));
            });
        };

        viewModel.removePath = function() {
            viewModel.settings.paths.remove(this);
        };

        viewModel.editPath = function() {
            openDialog(this.path()).done(function(newpath) {
                this.path(newpath);
            }.bind(this));
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

            function importTheme(themeFile) {
                return importer.importFile(themeFile).fail(function(err) {
                    viewModel.imported.push({fileName: themeFile, err: !!err});
                    console.log("Failure importing theme", themeFile, "- " + err);
                });
            }

            function saveTheme(theme) {
                var fileName = settingsManager.customPath + "/" + theme.fileName;
                var file = FileSystem.getFileForPath (fileName);

                file.write(theme.content, {}, function(err) {
                    viewModel.imported.push({fileName: theme.fileName, err: !!err});

                    if (err) {
                        console.log("Failure importing theme", theme.fileName, "- " + err);
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
        var viewModel = getViewModel(settings);
        var $template = $settings.clone();

        $template.find("[data-toggle=tab].default").tab("show");
        koFactory.bind($template, viewModel);

        Dialogs.showModalDialogUsingTemplate($template).done(function( id ) {
            if (id === "save") {
                var model = koFactory.deserialize(viewModel);
                var newSettings = model.settings;
                var settingsValues = settings.getAll();

                var imported = _.filter(model.imported, function(item) {
                   return !item.err;
                });

                for (var i in newSettings) {
                    if (settingsValues.hasOwnProperty(i)) {
                        settings.setValue(i, newSettings[i]);
                    }
                }

                if (imported.length) {
                    $(settings).triggerHandler("imported", [imported]);
                }
            }
        });
    }


    exports.open = open;
});

