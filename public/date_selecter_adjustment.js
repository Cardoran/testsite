
function setDefaultDates() {
    const endDate = new Date(); // Current date
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7); // 5 days before current date

    // Format dates as YYYY-MM-DD (required for input[type="date"])
    const formatDate = (date) => date.toISOString().split('T')[0];

    document.getElementById('start').value = formatDate(startDate);
    document.getElementById('end').value = formatDate(endDate);

    fetchData();
}

// Add event listener to the start date input
document.getElementById('start').addEventListener('change', function() {
    const startDate = this.value;
    document.getElementById('end').min = startDate;

    // Optional: If the end date is already set and is before the new start date, clear it
    const endDateInput = document.getElementById('end');
    if (endDateInput.value && endDateInput.value < startDate) {
      endDateInput.value = '';
      endDateInput.focus();
    }
  });

// Call this function when the page loads
window.addEventListener('DOMContentLoaded', setDefaultDates);
