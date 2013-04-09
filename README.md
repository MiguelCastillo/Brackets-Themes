Brackets-Themes
===============

Easy and accessible way of loading codemirror themes into brackets.


Features
===============

- Dynamic loading of codemirror's css theme files from the theme directory.
- Dynamic loading of custom themes.  Handy if you want to create your own themes or already have themes you want to keep when you upgrade brackets.
- Custom themes are 100% codemirror standard.

Custom themes 101 guide
===============

Custom themes are codemirror's themes, so you will need to be familiar with codemirror's theme guidelines.  I provide a set of steps to get you started below, but for more details please navigate to http://codemirror.net/doc/manual.html and search for "theme".
<br><br>
Codemirror's themes are css files.  Important requirement is that the file name has to match your css class definition.  E.g. If your theme file is called "default", then your primary css class name needs to be "default".  Codemirror's guidelines require that the actual css class name starts with ".cm-s-", so your fully qualified css class name will be ".cm-s-default".
<br><br>
To get you started, you could use the already existing custom theme "default.css".  Let's do the following.
<br>
- Open the custom theme directory.  Navigate to your themes manager directory (extensions directory/themes) and you will find custom themes in the "theme" directory.  Brackets provides a quick way of accessing your extensions directory... Help > Show Extensions Folder.
- Copy and paste the file "default.css" and rename it to "my-theme.css".
- Open "my-theme.css" and replace "default" with "my-theme", which should end up looking like ".cm-s-my-theme".  You will also have a second class ".CodeMirror", just leave it there and the net result will look like ".cm-s-my-theme.CodeMirror".
- In "my-theme.css", change "background-color: #F8F8F8;" to "backgound-color: red;".
- Relaunch brackets, open a JavaScript file and you should see the document with a red background.
<br><br>
For details on what can be customized, please navigate to http://codemirror.net/doc/manual.html and search for "Customized Styling".  As you will notice, the documentation isn't exhautive but they suggest you use "codemirror.css" as a reference.  Give it a try, it is pretty straight forward.
<br><br>
If you have a cool theme you created and want to share, please send it my way and I will gladly add it to the custom themes.


How to
===============

* Install... Open Brackets then copy and paste https://github.com/MiguelCastillo/Brackets-Themes into File->Install Extension.  You don't need to restart Brackets.


Links
===============
Brackets? Right here... http://brackets.io/ <br>
Brackets github? Right here... https://github.com/adobe/brackets


Contact me
===============

If you have any issues or want to just drop in a line, you can use miguel.castillo@borland.com or my personal email at manchagnu@gmail.com

License
===============

Licensed under MIT
