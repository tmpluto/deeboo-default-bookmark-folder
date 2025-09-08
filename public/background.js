chrome.runtime.onInstalled.addListener((details) => {
	try {
		if (details.reason === "install") {
			chrome.tabs.create({ url: chrome.runtime.getURL("options.html?tab=welcome") });
		} else if (details.reason === "update") {
			chrome.tabs.create({ url: chrome.runtime.getURL("options.html?tab=changelog") });
		}
	} catch {}
});
