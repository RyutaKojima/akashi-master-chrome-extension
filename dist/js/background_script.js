const timeoutSecond = 9 * 60 * 60;
const locale = 'ja-JP'

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

const setAkashiTimer = (milliSec) => {
    if (milliSec <= 0) {
        timeoutID = null;
        attendanceTime = null;
        return null;
    }

    return setTimeout(() => {
            timeoutID = null;
            attendanceTime = null;

            openAkashiTab()
            notifyAkashiTime();
        },
        milliSec
    );
}

const registerAttendance = () => {
    if (timeoutID) {
        // AKASHIは先に押した出勤が勝つので、タイマー再設定はしない
        return {
            attendance: attendanceTime.toLocaleString(locale)
        }
    }

    attendanceTime = new Date();
    timeoutID = setAkashiTimer(timeoutSecond * 1000);

    chrome.storage.sync.set({attendanceTime: attendanceTime.getTime()}, () => {
    });

    return {
        attendance: attendanceTime.toLocaleString(locale)
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
        attendance: attendanceTime.toLocaleString(locale),
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

chrome.storage.sync.get(['attendanceTime'], function (result) {
    console.log(result.attendanceTime);
    if (!result.attendanceTime) {
        return;
    }

    attendanceTime = new Date(result.attendanceTime);
    const nowTime = new Date();

    if (nowTime.toLocaleDateString(locale) !== attendanceTime.toLocaleDateString(locale)) {
        attendanceTime = null;
        return;
    }

    const elapsedMilliSec = nowTime.getTime() - attendanceTime.getTime()
    timeoutID = setAkashiTimer(timeoutSecond * 1000 - elapsedMilliSec);
});