
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

// Call this function when the page loads
window.addEventListener('DOMContentLoaded', setDefaultDates);
