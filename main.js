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
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils");

	var PREFERENCES_KEY = "extensions.brackets-editorthemes";
	var preferences = PreferencesManager.getPreferenceStorage(PREFERENCES_KEY);


	// Hash for themes loaded and ready to be used.
	// Our default theme will be whatever we save in the preferences
	var themes = {
		_currentTheme: preferences.getValue("theme") || {}
	};


	// Look for the menu where we will be inserting our theme menu
	var menu = Menus.addMenu("Themes", "editortheme", Menus.BEFORE, Menus.AppMenuBar.HELP_MENU);


	// Load up reset.css to override brackground settings from brackets because
	// they make the themes look really bad.
	ExtensionUtils.loadStyleSheet(module, "reset.css");


	// Load up all the available themes
	ExtensionUtils.loadFile(module, "themes.json").done(function(data){
		data = data || {};

		// LoadFile will return the data as a string, so we have to convert it
		// to a JSON object for easier data access
		data = $.parseJSON(data);
		
		// Go through all the themes and create a menu entry for it... Also
		// wire up a callback for menu selections to switch themes accordingly.
		for( var themeName in data.themes ) {

			// Setup a sync for syncing up the theme with the menu
			themes[themeName] = new theme({
				name: themeName,
				value: data.themes[themeName]
			});
		}

	});


	// Theme object to encasulate all the logic in one pretty bundle
	function theme(options) {
		var _self = this, settings = $.extend({}, options);
		this.settings = settings;

		// Create the command id used by the menu
		var COMMAND_ID = "theme." + settings.value;

		// Register menu event...
		CommandManager.register(settings.name, COMMAND_ID, function (){
			_self.update();
		});

		// Add theme menu item
		menu.addMenuItem(COMMAND_ID);
	}


	// Theme update function
	theme.prototype.update = function()
	{
		var settings = this.settings;
		themes._currentTheme = this;

		// Make sure we update the preferences when a new theme is selected.
		// Css is set to false so that when we reload brackets, we can reload
		// the css file for the theme.
		preferences.setValue("theme", $.extend({}, this, {css: false}));

		// Change the current editor...
		updateEditorTheme();
	}


	// Change up the theme of the editor on the fly	
	function updateEditorTheme(){
		var theme = themes._currentTheme;

		// Only apply themes when there is one to be applied.
		if ( !theme.settings.value ) {
			return;	
		}

		// Setup further documents to get the new theme...
		CodeMirror.defaults.themes = theme.settings.value;

		// Change the current editor in view
        var editor = EditorManager.getCurrentFullEditor();

		// Make sure we have a valid editor
		if (editor && editor._codeMirror) {

			// If the css has not yet been loaded, then we load it so that
			// code mirror properly renders the theme
			if ( !theme.css ) {
				theme.css = ExtensionUtils.loadStyleSheet(module, "theme/" + theme.settings.value + ".css");
			}

			editor._codeMirror.setOption("theme", theme.settings.value);
		}
	}


	// Apply the theme to any document that maybe not have the theme yet.
	// This happens when you have documents already loaded that are not
	// in focus... You switch the theme and those documents will not get
	// the theme until they get focus... I don't want to waste cycles
	// updating all the documents for every change of theme
	$(DocumentManager).on("currentDocumentChange", updateEditorTheme);

	// I am doing this extra saving step here so that the preferences are
	// persisted when brackets is closed and opened again... It appears that
	// brackets deletes preferences if they are not saved when brackets is closed.
	preferences.setValue("theme", $.extend({}, themes._currentTheme, {css: false}));

	// From the get go, make sure that the theme is applied to brackets
	updateEditorTheme();
});

