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


/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets, window, CodeMirror */

define(function (require, exports, module) {
    "use strict";

    var EditorManager       = brackets.getModule("editor/EditorManager"),
        ExtensionUtils      = brackets.getModule("utils/ExtensionUtils"),
        AppInit             = brackets.getModule("utils/AppInit"),
        FileUtils           = brackets.getModule("file/FileUtils");


    // Load up reset.css to override brackground settings from brackets because
    // they make the themes look really bad.
    ExtensionUtils.loadStyleSheet(module, "reset.css");
    var themeManager = require("themeManager");

    // Root directory for CodeMirror themes
    var cm_path = FileUtils.getNativeBracketsDirectoryPath() + "/thirdparty/CodeMirror2";


    /**
    *  This is where is all starts to load up...
    */
    var promises = [
        // Load up codemirror addon for active lines
        $.getScript(FileUtils.getNativeBracketsDirectoryPath() + "/thirdparty/CodeMirror2/addon/selection/mark-selection.js").promise(),
        $.getScript(FileUtils.getNativeBracketsDirectoryPath() + "/thirdparty/CodeMirror2/addon/search/match-highlighter.js").promise(),

        // Load up all the theme files from custom themes directory
        themeManager.loadFiles(require.toUrl('./theme/')),

        // Load up all the theme files from codemirror themes directory
        themeManager.loadFiles(cm_path + '/theme')
    ];


    //
    // Synchronize all calls to load resources.
    //
    $.when.apply($, promises).done(function () {

        // Set some default value for codemirror...
        CodeMirror.defaults.highlightSelectionMatches = true;
        CodeMirror.defaults.styleSelectedText = true;


        // Once the app is fully loaded, we will proceed to check the theme that
        // was last set
        AppInit.appReady(function () {
            themeManager.applyThemes();
            $(EditorManager).on("activeEditorChange", themeManager.applyThemes);
        });
    });


});
