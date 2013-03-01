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


/** Simple extension that adds a "File > Hello World" menu item */
define(function (require, exports, module) {
	"use strict";

	var CommandManager      = brackets.getModule("command/CommandManager"),
		Menus               = brackets.getModule("command/Menus"),
		PreferencesManager  = brackets.getModule("preferences/PreferencesManager"),
		DocumentManager     = brackets.getModule("document/DocumentManager"),
		EditorManager       = brackets.getModule("editor/EditorManager"),
		ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
		AppInit             = brackets.getModule("utils/AppInit"),
		FileUtils           = brackets.getModule("file/FileUtils"),
		NativeFileSystem    = brackets.getModule("file/NativeFileSystem").NativeFileSystem;


	var PREFERENCES_KEY = "extensions.brackets-editorthemes";
	var preferences = PreferencesManager.getPreferenceStorage(PREFERENCES_KEY);


	// Hash for themes loaded and ready to be used.
	// Our default theme will be whatever we save in the preferences
	var themes = {
		_selected: preferences.getValue("theme") || {},

		// Root directory for themes
		_path: FileUtils.getNativeBracketsDirectoryPath() + "/thirdparty/CodeMirror2/theme"
	};

	// Look for the menu where we will be inserting our theme menu
	var menu = Menus.addMenu("Themes", "editortheme", Menus.BEFORE, Menus.AppMenuBar.HELP_MENU);


	// Load up reset.css to override brackground settings from brackets because
	// they make the themes look really bad.
	ExtensionUtils.loadStyleSheet(module, "reset.css");
	

	/**
	*  Theme object to encasulate all the logic in one pretty bundle
	*
	* @constructor
	*/
	function theme(options) {
		var _self = this;
		$.extend(this, options);

		// Create the command id used by the menu
		var COMMAND_ID = "theme." + this.name;

		// Register menu event...
		CommandManager.register(this.displayName, COMMAND_ID, function (){
			// Uncheck the previous selection...
			var command = CommandManager.get("theme." + themes._selected.name);
			if (command){
				command.setChecked(false);
			}

			// Check the new selection
			this.setChecked(true);

			// Update the theme
			_self.update();
		});

		// Add theme menu item
		menu.addMenuItem(COMMAND_ID);
	}


	/**
	*  Handles updating of the current them, updating the preferences and
	*  updating the editor so that the new theme is set.
	*/
	theme.prototype.update = function() {
		themes._selected = this;

		// Make sure we update the preferences when a new theme is selected.
		// Css is set to false so that when we reload brackets, we can reload
		// the css file for the theme.
		preferences.setValue("theme", $.extend({}, this, {css: false}));

		// Change the current editor...
		updateEditorTheme();
	}


	/**
	*  Change up the theme of the editor on the fly
	*/
	function updateEditorTheme(){
		var theme = themes._selected;

		// Only apply themes when there is one to be applied.
		if ( !theme || !theme.name ) {
			theme = themes._selected = themes['Default'];
		}

		// Setup further documents to get the new theme...
		CodeMirror.defaults.themes = theme.name;

		// Change the current editor in view
		var editor = EditorManager.getCurrentFullEditor();

		// Make sure we have a valid editor
		if (editor && editor._codeMirror) {

			// If the css has not yet been loaded, then we load it so that
			// code mirror properly renders the theme
			if ( !theme.css ) {
				theme.css = ExtensionUtils.addLinkedStyleSheet(theme.path + "/" + theme.fileName);
			}

			editor._codeMirror.setOption("theme", theme.name);
		}
	}


	/**
	*  This will go through all the files in the themes directory so that I can
	*  build my table of themes to be loaded for the editor
	*/
	function loadThemeFiles( path ) {
		var result = $.Deferred();

		// Get directory reader handle
		NativeFileSystem.requestNativeFileSystem( path, loadDirectoryContent, handleError );

		// Load up the content of the directory
		function loadDirectoryContent( fs ){

			fs.root.createReader().readEntries(
				function (entries) {
					var i, _themes = [];

					for (i = 0; i < entries.length; i++) {
						if (entries[i].isFile) {
							_themes.push(entries[i].name);
						}
					}

					result.resolve({
						files: _themes,
						path: path
					});
				},
				function (error) {
					result.reject();
				}
			);
		}


		function handleError(){
			result.reject();
		}


		return result.promise();
	}


	/**
	*  Takes all dashes and converts them to white spaces...
	*  Then takes all first letters and capitalizes them.
	*/
	function toDisplayname(name){
		name = name.substring(0, name.lastIndexOf('.')).replace('-', ' ');
		var parts = name.split(" ");

		$.each(parts.slice(0), function(index, part){
			parts[index] = part[0].toUpperCase() + part.substring(1);
		});

		return parts.join(" ");
	}


	/**
	/*  Iterate through the array of themes and build theme objects.
	*/
	function buildThemes(_themes){
		//
		// Iterate through each name in the themes and make them theme objects
		//
		$.each(_themes.files, function(index, themeFile) {
			var themeDisplayName = toDisplayname(themeFile);
			var themeName = themeFile.substring(0, themeFile.lastIndexOf('.'));

			themes[themeDisplayName] = new theme({
				name: themeName,
				displayName: themeDisplayName,
				fileName: themeFile,
				path: _themes.path
			});
			
		});
	}


	// Load up custom and default themes
	loadThemeFiles( require.toUrl('./theme/') ).done(buildThemes).done(function(_themes){
		if (_themes.length !== 0){
			// Add a little divider to break up custom from what's shipped? We'll see...
			menu.addMenuDivider();
		}
	});
	

	// Load up all the theme files from code mirror's directory
	loadThemeFiles( themes._path ).done(buildThemes).always(function(){
		// Apply the theme to any document that maybe not have the theme yet.
		// This happens when you have documents already loaded that are not
		// in focus... You switch the theme and those documents will not get
		// the theme until they get focus... I don't want to waste cycles
		// updating all the documents for every change of theme
		$(DocumentManager).on("currentDocumentChange", updateEditorTheme);
	
		// I am doing this extra saving step here so that the preferences are
		// persisted when brackets is closed and opened again... It appears that
		// brackets deletes preferences if they are not saved when brackets is closed.
		preferences.setValue("theme", $.extend({}, {css: false}));
	
		// From the get go, make sure that the theme is applied to brackets
		updateEditorTheme();
	});


	// Once the app is fully loaded, we will proceed to check the theme that
	// was last set
	AppInit.appReady(function () {
		var command = CommandManager.get("theme." + themes._selected.name);
		if (command){
			command.setChecked(true);
		}	
	});

});

