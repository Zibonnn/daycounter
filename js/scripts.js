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
function isValidDate(dateStr) {

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

function setCounterIDs() {
    var allCounters = document.getElementsByClassName('counter');

    if (allCounters.length > 0) {
        for (var i = 0; i < allCounters.length; i++) {
            allCounters[i].id = "counter-" + (i+1);
        }
    }

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
    var editCounters = document.getElementsByClassName('counter-edit');
    var deleteCounters = document.getElementsByClassName('counter-delete');
    var deleteConfirm = document.getElementById('counter-deleted');
    var undoDelete = document.getElementById('undo-delete');
    var storeParent, storeParentID, timer, currentCount;

    // Get the current counter
    if (document.getElementsByClassName('counter').length > 0) {
        currentCount = document.getElementById("counters").lastChild.id.split("-")[1];
        setCounterIDs();
    }
    
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
        //counter.id = "counter-"+currentCount;
        counter.innerHTML = '<a class="counter-delete transition" href="#"><i class="fa fa-times" aria-hidden="true"></i></a><h3>'+eventName+'</h3><span class="event-days">'+dateResult["days"]+'</span><p>'+dateResult["type"]+'</p><span class="event-original">'+dateResult["original"]+'</span><a class="counter-edit transition" href="#">Edit Counter</a>';
        counters.appendChild(counter);

        // Store next delete counter button reference
        var nextCounter = deleteCounters.length-1;

        // Get delete counter buttons again
        deleteCounters = document.getElementsByClassName('counter-delete');

        // Add event listener to the new one
        deleteCounters[nextCounter].addEventListener('click', function(e) {
            var parent = this.parentNode;
            storeParentID = parseInt(parent.id.split("-")[1]);
            storeParent = parent.parentNode.removeChild(parent);
            deleteConfirm.classList.add('active');
            setTimeout(function() {
                deleteConfirm.classList.remove('active');
                setCounterIDs();
            }, 5000);
        });

        // Close the window
        addCounter.classList.remove('active');

        // Clear fields
        clearFields(eventNameField, eventDateField);

        // Clear any warnings
        removeWarnings(eventNameError, eventDateError);

        // Set counter IDs
        setCounterIDs();
    });

    // Add event listener to edit counter
    for (var i = 0; i < deleteCounters.length; i++) {
        editCounters[i].addEventListener('click', function(e) {

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
            }, 5000);
        });
    }

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
