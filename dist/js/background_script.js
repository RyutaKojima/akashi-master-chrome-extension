const locale = 'ja-JP'

let alarmScheduledTime = null;

const fetchTime = () => {
    return new Promise((resolve => {
        chrome.storage.sync.get(['timerTime'], function (result) {
            if (!result.timerTime) {
                resolve('09:00');
            }

            resolve(result.timerTime);
        });
    }))
}

const openOptionPage = () => {
    chrome.tabs.create({
        url: chrome.runtime.getURL('options/options.html'),
        active: true,
    });
};

const setAlarmTime = (scheduledTime) => {
    alarmScheduledTime = new Date(scheduledTime);
};

const fetchRegisteredAlarm = () => {
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

    fetchRegisteredAlarm();

    return null;
}

const registerAttendanceController = () => {
    fetchTime().then((loadTime) => {
        const [hours, minutes] = loadTime.split(':');
        const seconds = (hours * 60 * 60) + (minutes * 60)
        createAkashiTimer(seconds * 1000);
    });

    return {}
}

const getProgressController = () => {
    if (alarmScheduledTime === null) {
        return {
            scheduled: '出勤していません',
            timeLeft: '-',
        }
    }

    let timeLeft = Math.floor((alarmScheduledTime.getTime() - Date.now()) / 1000);

    const timeLeftHour = Math.floor(timeLeft / (60 * 60));
    timeLeft %= (60 * 60);
    const timeLeftMinute = Math.floor(timeLeft / 60);
    timeLeft = timeLeft % 60;

    return {
        scheduled: alarmScheduledTime.toLocaleString(locale),
        timeLeft: `あと ${timeLeftHour}:${timeLeftMinute}:${timeLeft}`,
    }
}

const openOptionsPageController = () => {
    openOptionPage()
    return {}
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
        case 'open-options':
            response = openOptionsPageController();
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

/**
 * 拡張機能がインストール/アップデートされたときに発生するイベント
 * See: https://developer.chrome.com/docs/extensions/reference/runtime/#event-onInstalled
 */
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        openOptionPage();
    }
});

fetchRegisteredAlarm();
