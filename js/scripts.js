// Clear all fields
function clearFields(eventNameField, eventDateField) {
    eventNameField.value = '';
    eventDateField.value = '';
}

// Remove all warnings
function removeWarnings(eventNameError, eventDateError) {
    eventNameError.classList.remove('active');
    eventDateError.classList.remove('active');
}

// TO DO
function isValidDate(date) {
    return true;
}

// Calculate the days between 2 dates
function daysBetween(date) {

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
        result["type"] = "Days Left";
    } else {
        result["days"] = Math.round((currentDate.getTime() - givenDate.getTime()) / day);
        result["type"] = "Days Since";
    }

    // Add the original date
    result["original"] = date;

    // Return the result
    return result;
}

// Init function
function init() {

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
    var deleteCounters = document.getElementsByClassName('counter-delete');
    var deleteConfirm = document.getElementById('counter-deleted');
    var undoDelete = document.getElementById('undo-delete');
    var storeParent;
    var timer;

    // Init date picker
    var picker = new Pikaday({
        field: document.getElementById('event-date'),
        format: 'YYYY-MM-D'
    });

    // Add event listener for add counter button
    addCounterBtn.addEventListener('click', function(e) {
        e.preventDefault();
        addCounter.classList.add('active');
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

        // Create the counter
        var counter = document.createElement("li");
        counter.classList.add('counter');
        counter.innerHTML = '<h3>'+eventName+'</h3><span class="event-days">'+dateResult["days"]+'</span><p>'+dateResult["type"]+'</p><span class="event-original">'+dateResult["original"]+'</span><a class="counter-delete transition" href="#">Delete Counter</a>';
        counters.appendChild(counter);

        // Store next delete counter button reference
        var nextCounter = deleteCounters.length-1;

        // Get delete counter buttons again
        deleteCounters = document.getElementsByClassName('counter-delete');

        // Add event listener to the new one
        deleteCounters[nextCounter].addEventListener('click', function(e) {
            var parent = this.parentNode;
            storeParent = parent.parentNode.removeChild(parent);
            deleteConfirm.classList.add('active');
            setTimeout(function() {
                deleteConfirm.classList.remove('active');
            }, 5000);
        });

        // Close the window
        addCounter.classList.remove('active');

        // Clear fields
        clearFields(eventNameField, eventDateField);

        // Clear any warnings
        removeWarnings(eventNameError, eventDateError);
    });

    // Add event listener to delete counter
    for (var i = 0; i < deleteCounters.length; i++) {
        deleteCounters[i].addEventListener('click', function(e) {
            var parent = this.parentNode;
            storeParent = parent.parentNode.removeChild(parent);
            deleteConfirm.classList.add('active');
            window.clearTimeout(timer);
            timer = window.setTimeout(function() {
                deleteConfirm.classList.remove('active');
            }, 5000);
        });
    }

    // Add event listener to restore counter
    undoDelete.addEventListener('click', function (e) {
        if (storeParent != null) {
            e.preventDefault();
            counters.appendChild(storeParent);
            storeParent = null;
            deleteConfirm.classList.remove('active');
        }
    });

}

// Wait for DOM content to have loaded
document.addEventListener('DOMContentLoaded', function () {

    // Call setup function
    init();

});
