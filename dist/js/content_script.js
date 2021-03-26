const attendanceButton = document.querySelector('a[data-punch-type="attendance"]');
attendanceButton.addEventListener('click', () => {
    const param = {
        action: 'attendance'
    }
    chrome.runtime.sendMessage(param, (response) => console.log(response))
});
