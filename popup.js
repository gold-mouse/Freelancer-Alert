document.addEventListener('DOMContentLoaded', () => {
  const botTokenInput = document.getElementById('botToken');
  const chatIdInput = document.getElementById('chatId');
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');
  const errorMsg = document.getElementById('errorMsg');
  const successMsg = document.getElementById('successMsg');

  chrome.storage.sync.get(['botToken', 'chatId'], (result) => {
    if (result.botToken) botTokenInput.value = result.botToken;
    if (result.chatId) chatIdInput.value = result.chatId;
  });

  saveBtn.addEventListener('click', () => {
    const botToken = botTokenInput.value.trim();
    const chatId = chatIdInput.value.trim();
    const tokenRegex = /^\d{8,10}:[a-zA-Z0-9_-]{35}$/;

    if (!botToken || !chatId) {
      errorMsg.textContent = '⚠️ Please fill in both fields.';
      errorMsg.style.display = 'block';
      successMsg.style.display = 'none';
      return;
    }

    if (!tokenRegex.test(botToken)) {
      errorMsg.textContent = '⚠️ Invalid Bot Token format.';
      errorMsg.style.display = 'block';
      successMsg.style.display = 'none';
      return;
    }

    chrome.storage.sync.set({ botToken, chatId }, () => {
      errorMsg.style.display = 'none';
      successMsg.style.display = 'block';

      chrome.runtime.sendMessage({ type: 'telegramConfigUpdated' });

      setTimeout(() => {
        window.close();
      }, 500);
    });
  });

  resetBtn.addEventListener('click', () => {
    chrome.storage.sync.remove(['botToken', 'chatId'], () => {
      botTokenInput.value = '';
      chatIdInput.value = '';
      errorMsg.textContent = 'Settings cleared.';
      errorMsg.style.display = 'block';
      successMsg.style.display = 'none';
    });
  });
});
