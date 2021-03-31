const updateView = () => {
    const scheduled = document.querySelector('#scheduled');
    const timeLeft = document.querySelector('#timeLeft');

    chrome.runtime.sendMessage({
            action: 'get-progress'
        },
        (response) => {
            // console.log(response)
            scheduled.innerHTML = response.scheduled;
            timeLeft.innerHTML = response.timeLeft;
        }
    )
}

setInterval(() => {
    updateView();
}, 1000);

updateView();
