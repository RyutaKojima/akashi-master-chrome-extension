const timeoutSecond = 9 * 60 * 60;
const locale = 'ja-JP'

let attendanceTime = null;

const setAlarmTime = (scheduledTime) => {
    attendanceTime = new Date(scheduledTime - timeoutSecond * 1000);
};

const fetchRegisterdAlarm = () => {
    chrome.alarms.get('akashi-alarm', (alarm) => {
        if (!alarm) {
            return;
        }

        setAlarmTime(alarm.scheduledTime)
    })
}

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

const createAkashiTimer = (milliSec) => {
    if (milliSec <= 0) {
        return null;
    }

    if (attendanceTime) {
        return null;
    }

    chrome.alarms.create('akashi-alarm', {
        when: Date.now() + milliSec,
    });

    fetchRegisterdAlarm();

    return null;
}

const registerAttendanceController = () => {
    createAkashiTimer(timeoutSecond * 1000);
    attendanceTime = new Date();

    return {
        attendance: attendanceTime.toLocaleString(locale)
    }
}

const getProgressController = () => {
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
            response = registerAttendanceController();
            break;
        case 'get-progress':
            response = getProgressController();
            break;
        default:
            response = {error: 'Unknown action'}
    }

    sendResponse({'message': 'ok', ...response});
});

chrome.alarms.onAlarm.addListener(() => {
    attendanceTime = null;

    openAkashiTab()
    notifyAkashiTime();
});

fetchRegisterdAlarm();
