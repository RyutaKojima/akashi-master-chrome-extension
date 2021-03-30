const timeoutSecond = 9 * 60 * 60;

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
        // AKASHIは先に押した出勤が勝つので、タイマー再設定はしない
        return {
            attendance: attendanceTime.toLocaleString('ja-JP')
        }
    }

    attendanceTime = new Date();
    timeoutID = setTimeout(() => {
            timeoutID = null;
            attendanceTime = null;

            openAkashiTab()
            notifyAkashiTime();
        },
        timeoutSecond * 1000
    );

    return {
        attendance: attendanceTime.toLocaleString('ja-JP')
    }
}

const getProgress = () => {
    if (attendanceTime === null) {
        return {
            attendance: '出勤していません',
            timeLeft: '-',
        }
    }

    let elapsedSeconds = Math.floor((Date.now() - attendanceTime.getTime()) / 1000);
    let timeLeft = timeoutSecond - elapsedSeconds;

    const timeLeftHour = Math.floor(timeLeft / (60 * 60));
    timeLeft %= (60 * 60);
    const timeLeftMinute = Math.floor(timeLeft / 60);
    timeLeft = timeLeft % 60;

    return {
        attendance: attendanceTime.toLocaleString('ja-JP'),
        timeLeft: `あと ${timeLeftHour}:${timeLeftMinute}:${timeLeft}`,
    }
}

chrome.runtime.onMessage.addListener((message, MessageSender, sendResponse) => {
    let response = {}

    switch (message.action) {
        case 'attendance':
            response = registerAttendance();
            break;
        case 'get-progress':
            response = getProgress();
            break;
        default:
            response = {error: 'Unknown action'}
    }

    sendResponse({'message': 'ok', ...response});
});