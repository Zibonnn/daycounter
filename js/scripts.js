(function () {
    // Store references needed
    var counters = document.getElementById('counters');
    var addCounterBtn = document.getElementById('add-counter-btn');
    var addCounter = document.getElementById('add-counter');
    var closeModal = document.getElementById('close-modal');
    var submitBtn = document.getElementById('modal-submit');
    var eventNameField = document.getElementById('event-name');
    var eventDateField = document.getElementById('event-date');
    var eventNameError = document.getElementById('event-name-error');
    var eventDateError = document.getElementById('event-date-error');
    var editCounters, deleteCounters;
    var deleteConfirm = document.getElementById('counter-deleted');
    var undoDelete = document.getElementById('undo-delete');
    var editing = false;
    var storeParent, storeParentID, timer, editNode;

    // Clear all fields
    var clearFields = function (eventNameField, eventDateField) {
        eventNameField.value = '';
        eventDateField.value = '';
    }

    // Remove all warnings
    var removeWarnings = function (eventNameError, eventDateError) {
        eventNameError.classList.remove('active');
        eventDateError.classList.remove('active');
    }

    // TO DO
    var isValidDate = function (dateStr) {

        if (!/^\d{4}\-\d{2}\-\d{1,2}$/.test(dateStr)) {
            return false;
        }

        var date = dateStr.split("-");
        var year = parseInt(date[0]);
        var month = parseInt(date[1]);
        var day = parseInt(date[2]);

        // Do basic validation
        if (year < 1000 || year > 3000 || month <= 0 || month > 12) {
            return false;
        }

        // Store all month lengths
        var months = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

        // Adjust for leap years
        if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) {
            months[1] = 29;
        }

        // Return the result after checking days
        return day > 0 && day <= months[month - 1];
    }

    // Calculate the days between 2 dates
    var daysBetween = function (date) {

        // Get day in milliseconds
        var day = 1000*60*60*24;

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
            result["days"] = Math.round((givenDate.getTime() - currentDate.getTime()) / day);
            result["type"] = "Days Until";
        } else {
            result["days"] = Math.round((currentDate.getTime() - givenDate.getTime()) / day);
            result["type"] = "Days Since";
        }

        // Add the original date
        result["original"] = date;

        // Return the result
        return result;
    }

    var setCounterIDs = function () {
        var allCounters = document.getElementsByClassName('counter');

        countersObj = {};
        if (allCounters.length > 0) {
            for (var i = 0; i < allCounters.length; i++) {
                allCounters[i].id = "counter-" + (i+1);
                countersObj["counter" + (i+1)] = {
                    "event": allCounters[i].children[1].innerHTML,
                    "days": allCounters[i].children[2].innerHTML,
                    "type": allCounters[i].children[3].innerHTML,
                    "original": allCounters[i].children[4].innerHTML
                }
            }
        }
    }

    var saveCounters = function () {
        chrome.storage.sync.remove("counters", function() {
            chrome.storage.sync.set({"counters": countersObj}, function() {
                console.log("Counters updated.");
            });
        });
    }

    var getCounters = function () {
        chrome.storage.sync.get("counters", function(data) {
            for (var savedCounter in data.counters) {

                // skip loop if the property is from prototype
                if (!data.counters.hasOwnProperty(savedCounter)) continue;

                // Get the counter object
                var counterObj = data.counters[savedCounter];

                // Rebuild the counter
                var counter = document.createElement("li");
                counter.classList.add('counter');
                counter.innerHTML = '<a class="counter-delete transition" href="#"><i class="fa fa-times" aria-hidden="true"></i></a><h3>'+counterObj["event"]+'</h3><span class="event-days">'+counterObj["days"]+'</span><p>'+counterObj["type"]+'</p><span class="event-original">'+counterObj["original"]+'</span><a class="counter-edit transition" href="#">Edit Counter</a>';
                counters.appendChild(counter);
            }

            // Set the counter IDs again
            setCounterIDs();

            // Setup counters
            setupCounters();
        });
    }

    var setupCounters = function() {
        editCounters = document.getElementsByClassName('counter-edit');
        deleteCounters = document.getElementsByClassName('counter-delete');

        // Add event listener to edit counter
        for (var i = 0; i < editCounters.length; i++) {
            editCounters[i].addEventListener('click', function(e) {
                // Stop anchor functionality
                e.preventDefault();

                // Set editing to true
                editing = true;

                // Ensure values are correct
                document.getElementById('modal-header-title').innerHTML = "Edit Day Counter";
                document.getElementById('modal-submit').value = "Save Day Counter";

                // Get current node
                editNode = this.parentNode;

                // Set values
                document.getElementById('event-name').value = editNode.children[1].innerHTML;
                document.getElementById('event-date').value = editNode.children[4].innerHTML;

                // Show modal
                addCounter.classList.add('active');
            });
        }

        // Add event listener to delete counter
        for (var i = 0; i < deleteCounters.length; i++) {
            deleteCounters[i].addEventListener('click', function(e) {
                var parent = this.parentNode;
                storeParentID = parseInt(parent.id.split("-")[1]);
                storeParent = parent.parentNode.removeChild(parent);
                deleteConfirm.classList.add('active');
                window.clearTimeout(timer);
                timer = window.setTimeout(function() {
                    deleteConfirm.classList.remove('active');
                    setCounterIDs();
                    saveCounters();
                }, 5000);
            });
        }
    }

    // Init function
    var init = function () {

        // Create object to hold all counters
        countersObj = {};

        // Get data
        countersObj = getCounters();

        // Init date picker
        var picker = new Pikaday({
            field: document.getElementById('event-date'),
            format: 'YYYY-MM-D'
        });

        // Add event listener for add counter button
        addCounterBtn.addEventListener('click', function(e) {
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

            // Remove class from body
            document.body.classList.remove('active');
        });

        // Add event listener to submit button
        submitBtn.addEventListener('click', function() {

            var eventName = eventNameField.value;
            var eventDate = eventDateField.value;
            var errors = false;

            // Validate event name
            if (eventName == '' || eventName == null) {
                eventNameError.classList.add('active');
                errors = true;
            } else {
                eventNameError.classList.remove('active');
            }

            // Validate event date
            if (eventDate == '' || eventDate == null || !isValidDate(eventDate)) {
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
                editNode.children[1].innerHTML = eventName;
                editNode.children[2].innerHTML = dateResult["days"];
                editNode.children[3].innerHTML = dateResult["type"];
                editNode.children[4].innerHTML = dateResult["original"];
                editNode = null;
                editing = false;
            } else {
                // Create the counter
                var counter = document.createElement("li");
                counter.classList.add('counter');
                counter.innerHTML = '<a class="counter-delete transition" href="#"><i class="fa fa-times" aria-hidden="true"></i></a><h3>'+eventName+'</h3><span class="event-days">'+dateResult["days"]+'</span><p>'+dateResult["type"]+'</p><span class="event-original">'+dateResult["original"]+'</span><a class="counter-edit transition" href="#">Edit Counter</a>';
                counters.appendChild(counter);
                setupCounters();
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
        undoDelete.addEventListener('click', function (e) {
            e.preventDefault();
            if (storeParent != null && storeParentID > 0) {
                if (storeParentID == 1) {
                    counters.prepend(storeParent);
                } else {
                    var refNode = document.getElementById("counter-"+(storeParentID-1));
                    if (!refNode.nextSibling) {
                        counters.appendChild(storeParent);
                    } else {
                        refNode.parentNode.insertBefore(storeParent, refNode.nextSibling);
                    }
                }
                deleteConfirm.classList.remove('active');
                storeParent = null;
                storeParentID = null;
            }
        });

    }

    // Wait for DOM content to have loaded
    document.addEventListener('DOMContentLoaded', function () {

        // Call setup function
        init();

    });
})();
