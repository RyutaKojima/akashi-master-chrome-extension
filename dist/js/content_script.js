const attendanceButton = document.querySelector('a[data-punch-type="attendance"]');
if (attendanceButton) {
    attendanceButton.addEventListener('click', () => {
        const param = {
            action: 'attendance'
        }
        chrome.runtime.sendMessage(param, (response) => {})
    });
}
