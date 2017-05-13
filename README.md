# Day Counter
Day Counter is an easy-to-use Chrome Extension that allows you to create multiple day counters that show up on each New Tab page or when manually accessed through the extension icon. Easily track days until Birthdays, Holidays, or any other events. You can also track days since a previous event, such as starting at a new job. Events can also be given names and be edited/deleted at any point. This was created as a simple exercise to get used to the functionality and development of Chrome extensions.

**Download the chrome extension [here](https://chrome.google.com/webstore/detail/day-counter-new-tab-page/popaiegponeiefbiddhmaphpbdjoegff).**

# Settings

### Counter Size

Easily adjust the size of the counters from small (4 per line), medium (3 per line) or large (2 per line). The default is medium.

### Color Scheme

Change the color scheme of the Day Counter page to any of the colors provided.

# To Do

- Change styling for "Today" events

# Changelog

### 3.0.2

- Add date range filter for within the week, month, quarter, half-year, or year
- Add optional privacy filter that fades / blurs counters on inactivity / page load

### 3.0.1

- Fix repeat bug so to not cause recurrence until day after it has occurred

### 3.0.0

- Rewritten from the ground up
- Changed to drag and drop reorder instead of arrows
- Allows recurring events Weekly, Bi-Weekly, Monthly, and Yearly
- Changed delete functionality to confirmation-based

### 2.0.4

- Slightly enlarged counters
- Fixed Setting menu being overlapped by counters
- Counters no longer "jump" when hovered

### 2.0.3

- Fixed bug where filtering counter visibility doesn't show "Today"

### 2.0.2

- Added ability to show all counters (default), only future counters, or only past counters

### 2.0.1

- Removed large logo (only shown when no counters are active)
- Repositioned Add New Counter button to the top right
- Fixed a couple minor CSS issues

### 2.0

- Added setting for adjusting counter sizes
- Added setting for adjusting color schemes
- Refactored code to increase performance

### 1.7

- Added ability to reorder counters

### 1.6

- Fixed error causing storage to not working as intended

### 1.5

- Fixed bug where extension icon would just create a new tab (potentially opening another extension)
