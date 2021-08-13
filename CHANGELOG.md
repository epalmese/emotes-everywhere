## Changelog

### 0.3.2
- Added more help info to extension menus.
- Improved compatibility for relevant sites and extensions.
- Migrated Chrome/Edge version to Manifest V3.

### 0.3.1
- Emote list storage is now local only, to remove the 8kb size limit (lists can still be exported and shared).
- The emote menu in the Chrome/Edge version has been moved to it's own page, as in the Firefox version.
- Implementation is now browser-agnostic. Chrome/Edge and Firefox versions share source code (only "manifest.json" differs).

### 0.3
- Images can be added as emotes from the context menu (by right-clicking) on some sites.
- Tooltip text in popular related extensions will not be replaced with emotes.
- The emote menu in the Firefox version makes better use of browser window space.
- The default emote and hostname lists now save on installation via a background script.

### 0.2.3
- Users can remove emotes from the list of all emotes, instead of only from search.
- Extension menus appear in dark mode if a "dark" browser color scheme is detected.

### 0.2.2
- Words in emote tooltips will not break by letter on some sites.
- Removed redundant CSS from the menu.
- Added more help questions.

### 0.2.1
- Changes to the list of enabled sites affect all open tabs immediately.

### 0.2
- Users can choose what sites to enable the extension on by adding the hostname of the current site to a list.
- Added "_" to the allowed characters for emote codes.

### 0.1 (First release)
- Users can set emotes to codes and the extension will replace them in web pages when enabled.
