(function() {
    // Store references needed and define variables
    var counters = document.getElementById('counters');
    var addCounterBtn = document.getElementById('add-counter-btn');
    var addCounter = document.getElementById('add-counter');
    var closeModal = document.getElementById('close-modal');
    var submitBtn = document.getElementById('modal-submit');
    var eventNameField = document.getElementById('event-name');
    var eventDateField = document.getElementById('event-date');
    var eventNameError = document.getElementById('event-name-error');
    var eventDateError = document.getElementById('event-date-error');
    var deleteConfirm = document.getElementById('counter-deleted');
    var undoDelete = document.getElementById('undo-delete');
    var settingsToggle = document.getElementById('settings-toggle');
    var settings = document.getElementById('settings');
    var settingsSize = document.getElementById('setting-size-list');
    var settingsScheme = document.getElementById('setting-scheme-list');
    var settingsSave = document.getElementById('settings-save');
    var editing = false;
    var editCounters, deleteCounters, storeParent, storeParentID, timer, editNode, countersObj, settingsObj;

    // Init date picker
    picker = new Pikaday({
        field: document.getElementById('event-date'),
        format: 'YYYY-MM-D'
    });

    // Clear all fields
    var clearFields = function(eventNameField, eventDateField) {
        eventNameField.value = '';
        eventDateField.value = '';
    };

    // Remove all warnings
    var removeWarnings = function(eventNameError, eventDateError) {
        eventNameError.classList.remove('active');
        eventDateError.classList.remove('active');
    };

    // Validate the given date
    var isValidDate = function(dateStr) {

        // Return if invalid format
        if (!/^\d{4}\-\d{2}\-\d{1,2}$/.test(dateStr)) {
            return false;
        }

        // Store year, month, and day
        var date = dateStr.split("-");
        var year = parseInt(date[0]);
        var month = parseInt(date[1]);
        var day = parseInt(date[2]);

        // Do basic validation
        if (year < 1000 || year > 3000 || month <= 0 || month > 12) {
            return false;
        }

        // Store all month lengths
        var months = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        // Adjust for leap years
        if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
            months[1] = 29;
        }

        // Return the result after checking days
        return day > 0 && day <= months[month - 1];
    };

    // Calculate the days between 2 dates
    var daysBetween = function(date) {
        // Get day in milliseconds
        var day = 1000 * 60 * 60 * 24;

        // Get current time and convert to ISO string
        var currentTime = new Date();
        currentTime.setHours(0, 0, 0, 0);
        currentISO = currentTime.toISOString();

        // Convert given date into ISO string
        var givenISO = new Date(date).toISOString();

        // Create dates out of both ISO strings
        var currentDate = new Date(currentISO);
        var givenDate = new Date(givenISO);

        // Create empty results array
        var result = {
            "days": null,
            "type": null,
            "original": null
        };

        // If given date is in future, use days left, otherwise, days since
        if (givenDate > currentDate) {
            result.days = Math.round((givenDate.getTime() - currentDate.getTime()) / day);
            result.type = "Days Until";
        } else {
            result.days = Math.round((currentDate.getTime() - givenDate.getTime()) / day);
            result.type = "Days Since";
        }

        // Set to "Today" if zero
        if (result.days === 0) {
            result.days = "Today";
            result.type = "<br />";
        }

        // Add the original date
        result.original = date;

        // Return the result
        return result;
    };

    // Set all counter IDs
    var setCounterIDs = function() {
        // Store counters
        var allCounters = document.getElementsByClassName('counter');

        // Empty the counters object
        countersObj = {};

        // If counters exist, loop over them
        if (allCounters.length > 0) {
            for (var i = 0; i < allCounters.length; i++) {
                // Set the ID of the counter
                allCounters[i].id = "counter-" + (i + 1);

                // Add the counter to the counter object with reference as
                // the ID of it
                countersObj["counter" + (i + 1)] = {
                    "event": allCounters[i].children[2].innerHTML,
                    "original": allCounters[i].children[7].innerHTML
                };
            }
        }
    };

    // Create counter
    var createCounter = function(cEvent, cDays, cType, cOriginal) {
        // Create the counter list element
        var counter = document.createElement("li");

        // Add counter class
        counter.classList.add('counter');

        // Change format of original
        cDate = moment(cOriginal).format('ddd, ll');

        // Create the HTML
        counter.innerHTML = '<div class="counter-move"><a class="counter-mover" data-direction="back" href="#"><i class="fa fa-chevron-left" aria-hidden="true"></i></a><a class="counter-mover" data-direction="forward" href="#"><i class="fa fa-chevron-right" aria-hidden="true"></i></a></div><a class="counter-delete transition" href="#"><i class="fa fa-times" aria-hidden="true"></i></a><h3>' + cEvent + '</h3><span class="event-days">' + cDays + '</span><p>' + cType + '</p><span class="event-original">' + cDate + '</span><a class="counter-edit transition" href="#">Edit Counter</a><span class="event-original-hidden">' + cOriginal + '</span>';

        // Append it to the other counters
        counters.appendChild(counter);

        // Return the counter
        return counter;
    };

    // Save counter states
    var saveCounters = function() {
        // Clear counters storage and set new counters
        chrome.storage.sync.remove("counters", function() {
            chrome.storage.sync.set({
                "counters": countersObj
            }, function() {
                console.log("Counters updated.");
            });
        });
    };

    // Get counter states
    var getCounters = function() {
        chrome.storage.sync.get("counters", function(data) {
            for (var savedCounter in data.counters) {
                // skip loop if the property is from prototype
                if (!data.counters.hasOwnProperty(savedCounter)) continue;

                // Get the counter object
                var counterObj = data.counters[savedCounter];

                // Get updated counter result
                var counterResult = daysBetween(counterObj.original);

                // Rebuild the counter
                createCounter(counterObj.event, counterResult.days, counterResult.type, counterObj.original);
            }

            // Set the counter IDs again
            setCounterIDs();

            // Setup counters
            setupCounters();
        });
    };

    // Setup the counters
    var setupCounters = function() {
        // Store reference to counter buttons
        editCounters = document.getElementsByClassName('counter-edit');
        deleteCounters = document.getElementsByClassName('counter-delete');
        moveCounters = document.getElementsByClassName('counter-mover');

        // Add event listener to edit counter
        for (var ei = 0; ei < editCounters.length; ei++) {
            createEditButtons(editCounters[ei]);
        }

        // Add event listener to delete counter
        for (var di = 0; di < deleteCounters.length; di++) {
            createDeleteButtons(deleteCounters[di]);
        }

        // Add event listener to move counter
        for (var mi = 0; mi < moveCounters.length; mi++) {
            createMoveButtons(moveCounters[mi]);
        }
    };

    // Create edit button listeners
    var createEditButtons = function(editBtn) {
        editBtn.addEventListener('click', function(e) {
            // Stop anchor functionality
            e.preventDefault();

            // Get current node
            editNode = this.parentNode;

            // Set editing to true
            editing = true;

            // Set date picker to date that is currently there
            picker.setMoment(moment(editNode.children[7].innerHTML));

            // Ensure values are correct
            document.getElementById('modal-header-title').innerHTML = "Edit Day Counter";
            document.getElementById('modal-submit').value = "Save Day Counter";

            // Set values
            document.getElementById('event-name').value = editNode.children[2].innerHTML;
            document.getElementById('event-date').value = editNode.children[7].innerHTML;

            // Show modal
            addCounter.classList.add('active');
        });
    };

    // Create delete button listeners
    var createDeleteButtons = function(deleteBtn) {
        deleteBtn.addEventListener('click', function(e) {
            // Store parent node
            var parent = this.parentNode;

            // Get parent ID and store a reference to node
            storeParentID = parseInt(parent.id.split("-")[1]);
            storeParent = parent.parentNode.removeChild(parent);

            // Add delete class
            deleteConfirm.classList.add('active');

            // Set the delete undo timer
            window.clearTimeout(timer);
            timer = window.setTimeout(function() {
                deleteConfirm.classList.remove('active');
                setCounterIDs();
                saveCounters();
            }, 5000);
        });
    };

    // Create move button listeners
    var createMoveButtons = function(moveBtn) {
        moveBtn.addEventListener('click', function(e) {
            // Get move direction
            var direction = this.dataset.direction;

            // Get parent ID
            var parentID = parseInt(this.parentNode.parentNode.id.split("-")[1]);

            // Reorder counters
            reorderCounter(parentID, direction);
        });
    };

    // Reorder counters
    var reorderCounter = function(counterID, direction) {
        // Store next, current, and previous counters
        var nextCounter = document.getElementById('counter-' + (counterID + 1));
        var previousCounter = document.getElementById('counter-' + (counterID - 1));
        var currentCounter = document.getElementById('counter-' + counterID);

        // If first and moving back or last and moving forward, return
        if (previousCounter === null && direction === 'back' || nextCounter === null && direction === 'forward') {
            return;
        }

        // Move to requierd position
        if (direction === 'forward') {
            nextCounter.parentNode.insertBefore(currentCounter, nextCounter.nextSibling);
        } else {
            previousCounter.parentNode.insertBefore(currentCounter, previousCounter);
        }

        // Fix counter IDs
        setCounterIDs();

        // Resave counters
        saveCounters();
    };

    // Get user settings
    var getSettings = function() {
        chrome.storage.sync.get("settings", function(data) {
            // Set Settings dropdowns
            settingsSize.value = data.settings.counterSize;
            settingsScheme.value = data.settings.counterScheme;

            // Add body class
            document.documentElement.className = settingsScheme.value;

            // Add counter class
            counters.className = settingsSize.value;

            // Wait 0.5s
            window.setTimeout(function() {
                // Add transition to html, body
                document.documentElement.style.transition = "0.5s ease all";
                document.body.style.transition = "0.5s ease all";
            }, 500);
        });
    };

    // Set user settings
    var setSettings = function() {
        // Clear counters storage and set new counters
        chrome.storage.sync.remove("settings", function() {
            chrome.storage.sync.set({
                "settings": settingsObj
            }, function() {
                console.log("Settings updated.");
                getSettings();
            });
        });
    };

    // Init function
    var init = function() {

        // Get counters
        getCounters();

        // Get settings
        getSettings();

        // Add event listener for add counter button
        addCounterBtn.addEventListener('click', function(e) {
            // Reset date picker to today
            picker.gotoDate(new Date());

            // Stop anchor functionality
            e.preventDefault();

            // Show add counter form
            addCounter.classList.add('active');

            // Ensure values are correct
            document.getElementById('modal-header-title').innerHTML = "Add a New Day Counter";
            document.getElementById('modal-submit').value = "Add Day Counter";

            // Add class to body
            document.body.classList.add('active');
        });

        // Add event listener to close add counter modal
        closeModal.addEventListener('click', function(e) {
            // Stop anchor functionality
            e.preventDefault();

            // Remove active class
            addCounter.classList.remove('active');

            // Clear fields
            clearFields(eventNameField, eventDateField);

            // Clear any warnings
            removeWarnings(eventNameError, eventDateError);

            // Remove overflow hidden class from body
            document.body.classList.remove('active');
        });

        // Add event listener to submit button
        submitBtn.addEventListener('click', function() {

            var eventName = eventNameField.value;
            var eventDate = eventDateField.value;
            var errors = false;

            // Validate event name
            if (eventName === '' || eventName === null) {
                eventNameError.classList.add('active');
                errors = true;
            } else {
                eventNameError.classList.remove('active');
            }

            // Validate event date
            if (eventDate === '' || eventDate === null || !isValidDate(eventDate)) {
                eventDateError.classList.add('active');
                errors = true;
            } else {
                eventDateError.classList.remove('active');
            }

            // Return if there were errors
            if (errors) return;

            // Get event date result
            var dateResult = daysBetween(eventDate);

            // If editing, make changes, otherwise create new node
            if (editing) {
                editNode.children[2].innerHTML = eventName;
                editNode.children[3].innerHTML = dateResult.days;
                editNode.children[4].innerHTML = dateResult.type;
                editNode.children[5].innerHTML = moment(dateResult.original).format('ddd, ll');
                editNode.children[7].innerHTML = dateResult.original;
                editNode = null;
                editing = false;
            } else {
                // Create the counter
                var counter = createCounter(eventName, dateResult.days, dateResult.type, dateResult.original);

                // Setup counter
                createEditButtons(counter.children[6]);
                createDeleteButtons(counter.children[1]);
                createMoveButtons(counter.children[0].children[0]);
                createMoveButtons(counter.children[0].children[1]);
            }

            // Set counter IDs
            setCounterIDs();

            // Save Results to chrome storage
            saveCounters();

            // Close the window
            addCounter.classList.remove('active');

            // Remove body active state
            document.body.classList.remove('active');

            // Clear fields
            clearFields(eventNameField, eventDateField);

            // Clear any warnings
            removeWarnings(eventNameError, eventDateError);
        });

        // Add event listener to restore counter
        undoDelete.addEventListener('click', function(e) {
            // Stop anchor functionality
            e.preventDefault();

            // If the parent isn't null and has ID > 0
            if (storeParent !== null && storeParentID > 0) {
                // If first counter, add to front again
                if (storeParentID == 1 || document.getElementsByClassName('counter').length === 0) {
                    counters.prepend(storeParent);
                } else { // Otherwise, add to neccesary place
                    // Store reference node
                    var refNode = document.getElementById("counter-" + (storeParentID - 1));

                    // If there is no next sibling, add to end
                    if (!refNode.nextSibling) {
                        counters.appendChild(storeParent);
                    } else { // Otherwise, insert where needed
                        refNode.parentNode.insertBefore(storeParent, refNode.nextSibling);
                    }
                }

                // Remove active class on undo
                deleteConfirm.classList.remove('active');

                // Reset parent node and ID to null
                storeParent = null;
                storeParentID = null;

                // Clear the timer
                window.clearTimeout(timer);

                // Reset and save counters
                setCounterIDs();
                saveCounters();
            }
        });

        // Add event listener to show settings
        settingsToggle.addEventListener('click', function() {

            if (this.classList.contains('active')) {
                this.classList.remove('active');
                settings.classList.remove('active');
            } else {
                this.classList.add('active');
                settings.classList.add('active');
            }

        });

        // Save settings
        settingsSave.addEventListener('click', function(e) {

            // Stop anchor functionality
            e.preventDefault();

            // Set empty object
            settingsObj = {};

            // Get counter size
            settingsObj.counterSize = settingsSize.options[settingsSize.selectedIndex].value;

            // Get colour scheme
            settingsObj.counterScheme = settingsScheme.options[settingsScheme.selectedIndex].value;

            // Set settings
            setSettings();

        });

    };

    // Wait for DOM content to have loaded
    document.addEventListener('DOMContentLoaded', function() {

        // Call setup function
        init();

    });
})();
