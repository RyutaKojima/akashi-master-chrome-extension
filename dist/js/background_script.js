let attendenceTime = null;

chrome.runtime.onMessage.addListener((message, MessageSender, sendResponse) => {
    attendenceTime = Date.now();

    sendResponse({'message': 'ok'});
});

const isOver9Hours = (utcMilliSec) => {
    if (!utcMilliSec) {
        return false;
    }

    const elapsedMilliSec = Date.now() - utcMilliSec;

    return elapsedMilliSec >= (9 * 60 * 60 * 1000);
}

setInterval(() => {
    if (isOver9Hours(attendenceTime)) {
        attendenceTime = null;

        chrome.tabs.create({
            url: 'https://atnd.ak4.jp/',
            active: true
        });
    }

}, 1000 * 60);