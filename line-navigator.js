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


 (function() {


  var _goWordLeft = CodeMirror.commands.goWordLeft, _goWordRight = CodeMirror.commands.goWordRight;

  /**
  *  Register lineNavigator.  Currently, this is a logic for document type.
  *  But, what the plan to use the innerMode to adjust lineNavigation based
  *  on the type of data we are dealing with.  For example, markup can be
  *  processed differently than clike languages
  */
  CodeMirror.defineOption("lineNavigator", false, function(cm, val, old) {

    if ( val ){
      // Take over the old word navigation system so that functionality that
      // depends on word navigation can behave the same accross code mirror.
      CodeMirror.commands.goWordLeft = navigateLineLeft;
      CodeMirror.commands.goWordRight = navigateLineRight;

      // Since we are replacing goWordLeft and goWordRight which are already
      // bound to the keys below, I really don't need to setup a new key map.
      // It will actually cause problems when going to mac, which has different
      // key mapping.
      // I am just leaving it for now as a reference to register new mapping
      // so that I can later support adding custom mappings.
      //
      /*
      cm.addKeyMap({
        name: "lineNavigator",
        "Ctrl-Right": navigateLineRight,
        "Ctrl-Left": navigateLineLeft
      });
      */
    }
    else {
     cm.removeKeyMap("lineNavigator");

      // Restore the old word navigation system
      CodeMirror.commands.goWordLeft = _goWordLeft;
      CodeMirror.commands.goWordRight = _goWordRight;
    }

  });



  var navigateDirection = {
    "left": {
      charCmd: "goCharLeft",
      wordCmd: "goWordLeft"
    },
    "right": {
      charCmd: "goCharRight",
      wordCmd: "goWordRight"
    }
  };


  /**
  *  Line Navigation logic.  There are some parts that have been extracted out of
  *  the implementation to goWordLeft and goWordRight.
  */
  function navigateLineRight(cm, dirName) {
    var dir = navigateDirection.right;
    var currPos = { line: -1 }, line;
    var characters = new charHandlers();

    for (;;) {
      var pos = cm.getCursor();

      // We need to check if navigating to the next character has made the cursor
      // go to the next line so that we can adjust our pos marker and get the new
      // line for processing.
      if ( currPos.line !== pos.line ){
        line = cm.getLine(pos.line);
        currPos = pos;
      }

      var _char = line[pos.ch];
      var _handler = characters.getHandler(_char);

      // If we have a white, we will simply go to the next character...
      if ( _handler.type === "space" ){
      }
      else if (_handler.type === "empty" ) {
        // This empty handler is rather important because this is where
        // we can adjust the behavior of how to skip lines...

        // Exiting when we have read a non white space character gives us
        // a very smooth nagivation skipping all dead space.
        // Notepad++ behaves similar to this.
        if ( characters.handlers.delimeter.count || characters.handlers.character.count ) {
            break;
        }

        // If you just blindly move and exit, then the cursor will
        // stop at every empty line.  Which is a very common behavior
        // for editors like eclipse, visual studio and sublime.
        //cm.execCommand(dir.charCmd);
        //break;
      }
      else if ( _handler.type === "delimeter" ) {
        // We only exit if we have seen any characters...
        if ( characters.handlers.character.count || characters.handlers.space.count ) {
          break;
        }
      }
      else if ( _handler.type === "character" ) {
        // We exit if we have seen a delimeter or a whitespace
        if ( characters.handlers.delimeter.count || characters.handlers.space.count ) {
          break;
        }
      }

      cm.execCommand(dir.charCmd);
    }
  }



  function navigateLineLeft(cm) {
    var dir = navigateDirection.left;
    var currPos = { line: -1 }, line;
    var characters = new charHandlers();

    for (;;) {
      cm.execCommand(dir.charCmd);

      var pos = cm.getCursor();

      // We need to check if navigating to the next character has made the cursor
      // go to the next line so that we can adjust our pos marker and get the new
      // line for processing.
      if ( currPos.line !== pos.line ){
        line = cm.getLine(pos.line);
        currPos = pos;
      }

      var _char = line[pos.ch];
      var _handler = characters.getHandler(_char);

      if ( _handler.type === "space" ) {
        // We only exit if we have seen any characters...
        if ( characters.handlers.character.count || characters.handlers.delimeter.count ) {
          cm.execCommand(navigateDirection.right.charCmd);
          break;
        }
      }
      else if (_handler.type === "empty" ) {
      }
      else if ( _handler.type === "delimeter" ) {
        // We only exit if we have seen any characters...
        if ( characters.handlers.character.count ) {
          cm.execCommand(navigateDirection.right.charCmd);
          break;
        }
      }
      else if ( _handler.type === "character" ) {
        if ( characters.handlers.delimeter.count ) {
          cm.execCommand(navigateDirection.right.charCmd);
          break;
        }
      }
    }
  }


  function charHandlers() {
    this.handlers = {
      empty: {
        count: 0,
        type: 'empty',
        test: function(str){
            str = str || "";
            return str.length === 0;
        }
      },
      space: {
        count: 0,
        type: 'space',
        test: function(str) {
          return /[\s\t\r\n\v]/.test(str);
        }
      },
      delimeter: {
        count: 0,
        type: 'delimeter',
        test: function(str) {
          return /[.:;(){}\/\"',+\-*&%=<>!?|~^]/.test(str);
        }
      },
      character: {
        count: 0,
        type: 'character',
        test: function(str) {
          return isWordChar(str);
        }
      }
    };
  }


  charHandlers.prototype.getHandler = function (str) {
    for ( var handler in this.handlers ) {
      var _handler = this.handlers[handler];
      if ( _handler.test(str) ) {
        _handler.count++;
        return _handler;
      }
    }

    return this.handlers.delimeter;
  }


  /** Directly from codemirror.js */
  var nonASCIISingleCaseWordChar = /[\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc]/;
  function isWordChar(ch) {
    return /\w/.test(ch) || ch > "\x80" &&
      (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch));
  }


})();
