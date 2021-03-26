let timeoutID = null;

chrome.runtime.onMessage.addListener((message, MessageSender, sendResponse) => {
    if (timeoutID) {
        clearTimeout(timeoutID)
        timeoutID = null;
    }

    timeoutID = setTimeout(() => {
        timeoutID = null;

        chrome.tabs.create({
            url: 'https://atnd.ak4.jp/',
            active: true
        });
    }, 9 * 60 * 60 * 1000);

    sendResponse({'message': 'ok'});
});
