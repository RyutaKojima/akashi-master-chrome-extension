const timeoutSecond = 9 * 60 * 60;
const locale = 'ja-JP'

let alarmScheduledTime = null;

const setAlarmTime = (scheduledTime) => {
    alarmScheduledTime = new Date(scheduledTime);
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

    if (alarmScheduledTime) {
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

    return {}
}

const getProgressController = () => {
    if (alarmScheduledTime === null) {
        return {
            scheduled: '出勤していません',
            timeLeft: '-',
        }
    }

    let timeLeft = Math.floor((alarmScheduledTime.getTime() - Date.now() ) / 1000);

    const timeLeftHour = Math.floor(timeLeft / (60 * 60));
    timeLeft %= (60 * 60);
    const timeLeftMinute = Math.floor(timeLeft / 60);
    timeLeft = timeLeft % 60;

    return {
        scheduled: alarmScheduledTime.toLocaleString(locale),
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
    alarmScheduledTime = null;

    openAkashiTab()
    notifyAkashiTime();
});

fetchRegisterdAlarm();
