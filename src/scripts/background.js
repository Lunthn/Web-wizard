let popupPort = null;

chrome.runtime.onConnect.addListener((port) => {
  if (port.name === "popup") {
    popupPort = port;

    port.onDisconnect.addListener(() => {
      removeHighlightsFromAllTabs();
      popupPort = null;
    });
  }
});

chrome.runtime.onSuspend.addListener(() => {
  removeHighlightsFromAllTabs();
});

async function removeHighlightsFromAllTabs() {
  try {
    const tabs = await chrome.tabs.query({});

    for (const tab of tabs) {
      try {
        await chrome.tabs.sendMessage(tab.id, { action: "removeHighlight" });
      } catch (error) {
        console.log(
          `Error ${tab.id}:`,
          error.message
        );
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading") {
    try {
      chrome.tabs.sendMessage(tabId, { action: "removeHighlight" });
    } catch (error) {
    }
  }
});
