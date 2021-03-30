let attendanceTime = null;
let timeoutID = null;

const notifyAkashiTime = () => {
    const opt = {
        type: 'basic',
        title: '退勤時間になりました',
        message: '忘れずに AKASHI を入力しましょう',
        iconUrl: '../img/icon_48.png'
    };

    chrome.notifications.create('', opt);
}

const openAkashiTab = () => {
    chrome.tabs.create({
        url: 'https://atnd.ak4.jp/',
        active: true
    });
}

const registerAttendance = () => {
    if (timeoutID) {
        clearTimeout(timeoutID)
        timeoutID = null;
    }

    attendanceTime = new Date();
    timeoutID = setTimeout(() => {
            timeoutID = null;
            attendanceTime = null;

            openAkashiTab()
            notifyAkashiTime();
        },
        9 * 60 * 60 * 1000
    );

    return {
        attendance: attendanceTime.toLocaleString('ja-JP')
    }
}

chrome.runtime.onMessage.addListener((message, MessageSender, sendResponse) => {
    let response = {}

    switch (message.action) {
        case 'attendance':
            response = registerAttendance();
            break;
        default:
            response = {error: 'Unknown action'}
    }

    sendResponse({'message': 'ok', ...response});
});