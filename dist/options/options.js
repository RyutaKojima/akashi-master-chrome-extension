const saveTime = (time) => {
    return new Promise((resolve => {
        chrome.storage.sync.set({timerTime: time}, () => {
            resolve(time)
        });
    }))
}

const fetchTime = () => {
    return new Promise((resolve => {
        chrome.storage.sync.get(['timerTime'], function (result) {
            if (!result.timerTime) {
                resolve(null);
            }

            resolve(result.timerTime);
        });
    }))
}

document.addEventListener('DOMContentLoaded', async () => {
    const inputTime = document.querySelector('#input_time');
    const saveButton = document.querySelector('#save');

    saveButton.addEventListener('click', async () => {
        const savedTime = await saveTime(inputTime.value)
        alert('保存しました: ' + savedTime)
    })

    const loadTime = await fetchTime();
    if (!loadTime) {
        inputTime.value = await saveTime('09:00');
    } else {
        inputTime.value = loadTime;
    }
});
