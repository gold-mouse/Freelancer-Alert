var TELEGRAM_BOT_TOKEN = '';
var TELEGRAM_CHAT_ID = '';
let lastNotificationTime = 0;
var oldMsgCount = 0

// Initial load
loadCredentialsAndObserve();

// Reload credentials on config update
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'telegramConfigUpdated') {
        console.log("Telegram config updated. Reloading credentials...");
        loadCredentialsAndObserve();
    }
});

function loadCredentialsAndObserve() {
    chrome.storage.sync.get(['botToken', 'chatId'], (result) => {
        TELEGRAM_BOT_TOKEN = result.botToken;
        TELEGRAM_CHAT_ID = result.chatId;

        if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
            console.warn("Telegram credentials not set.");
            return;
        }

        observeForNotification();  // Start observer
    });
}

async function sendTelegramMessage(message) {
    try {
        const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message + "\n\nNew Messages: " + oldMsgCount
            })
        });

        const data = await response.json();

        if (!data.ok) {
            console.error('Telegram API error:', data);
        }
    } catch (error) {
        console.error('Failed to send Telegram message:', error);
    }
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function observeForNotification() {
    const observer = new MutationObserver(async (mutations, obs) => {
        const now = Date.now();
        if (now - lastNotificationTime < 10000) return

        lastNotificationTime = now

        let newTask = document.querySelector("fl-floating-action[fltrackinglabel='NewProjectsNotification']");
        let newMsg = document.querySelector("fl-button.NavigationItemBtn fl-unread-indicator[label='Unread messages']")
        const delay = 3000 + Math.random() * 2000; // 3 to 5 seconds
        if (newMsg) {
            await sleep(delay)
            newMsgCount = Number(newMsg.innerText)
            if (oldMsgCount !== newMsgCount) {
                oldMsgCount = newMsgCount
                sendTelegramMessage("** New Message!!! **")
            }
        }
        if (newTask) {
            if (!newMsg) await sleep(delay)
            newTask.click();
            await sleep(4000)
            try {
                moreBtn = document.querySelector("fl-project-contest-card button.ReadMoreButton")
                if (moreBtn) {
                    moreBtn.click()
                    await sleep(2)
                }
                title = document.querySelector("fl-project-contest-card fl-heading").innerText
                budget = document.querySelector("fl-project-contest-card fl-text").innerText
                contents = document.querySelector("fl-project-contest-card > fl-text[data-type='paragraph']").innerText
                sendTelegramMessage(`** New Task **\n${title}\n${budget}\n\n${contents}`);
            } catch (e) {
                sendTelegramMessage("Error occurred\n" + e.message);
                console.error(e)
            }
        }
    });

    observer.observe(document.body,
        {
            childList: true,
            subtree: true
        });
}
// Run the observer
observeForNotification();
