// Initialize Flatpickr for both inputs
const startDatePicker = flatpickr("#start", {
    dateFormat: "Y-m-d",
    maxDate: "today",
    onChange: function(selectedDates, dateStr, instance) {
        if (selectedDates.length > 0) {
        // Set the minDate for the end date picker to the selected start date
        endDatePicker.set("minDate", dateStr);
        // Open the end date picker
        endDatePicker.open();
        }
    }
});

const endDatePicker = flatpickr("#end", {
    dateFormat: "Y-m-d",
    maxDate: "today",
    onChange: function(selectedDates, dateStr, instance) {
        const startDate = document.getElementById("start").value;
        const endDateInput = document.getElementById("end");

        if (dateStr < startDate) {
        endDateInput.classList.add("invalid-date");
        } else {
        endDateInput.classList.remove("invalid-date");
        }
    }
});

// Set default dates (e.g., last 7 days)
function setDefaultDates() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);

    const formatDate = (date) => date.toISOString().split('T')[0];

    startDatePicker.setDate(formatDate(startDate));
    endDatePicker.setDate(formatDate(endDate));
    endDatePicker.set("minDate", formatDate(startDate));
}

// Call this function when the page loads
window.addEventListener('DOMContentLoaded', setDefaultDates);