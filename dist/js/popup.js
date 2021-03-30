const updateView = () => {
    const attendance = document.querySelector('#attendance');
    const timeLeft = document.querySelector('#timeLeft');

    chrome.runtime.sendMessage({
            action: 'get-progress'
        },
        (response) => {
            console.log(response)

            attendance.innerHTML = response.attendance;
            timeLeft.innerHTML = response.timeLeft;
        }
    )
}

setInterval(() => {
    updateView();
}, 1000);

updateView();
