export const MyConstants = {
	bookmarksBarId: "1",
	otherbookmarksId: "2",
	separator: "   · · ·   ",
	storeKey: "deeboo-storage",
};

export const bookmarkUtils = {
	async getCurrentTab() {
		const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
		return tab;
	},

	async getBookmarksOfCurrentTab() {
		const tab = await this.getCurrentTab();
		const bookmarksForThisUrl = await chrome.bookmarks.search({ url: tab.url });
		return bookmarksForThisUrl;
	},

	async getCurrentTabAndItsBookmarks() {
		const currentTab = await this.getCurrentTab();
		const bookmarksOfCurrentTab = await chrome.bookmarks.search({ url: currentTab.url });
		return { currentTab, bookmarksOfCurrentTab };
	},

	async removeBookmarksOfCurrentTab() {
		const bookmarksForCurrentTab = await this.getBookmarksOfCurrentTab();

		await Promise.all(bookmarksForCurrentTab.map((b) => chrome.bookmarks.remove(b.id)));
	},

	async createNewFolder(newFolderTitle: string, parentFolderId: string): Promise<string> {
		const newFolder = await chrome.bookmarks.create({
			parentId: parentFolderId,
			title: newFolderTitle,
		});

		return newFolder.id;
	},

	async changeBookmarkLocation(newFolderId: string): Promise<chrome.bookmarks.BookmarkTreeNode> {
		const bookmarksForCurrentTab = await this.getBookmarksOfCurrentTab();

		const updatedBookmarks = await Promise.all(
			bookmarksForCurrentTab.map((b) => chrome.bookmarks.move(b.id, { parentId: newFolderId }))
		);
		return updatedBookmarks[0];
	},

	async renameCurrentTabBookmark(newTitle: string): Promise<chrome.bookmarks.BookmarkTreeNode> {
		const bookmarksForCurrentTab = await this.getBookmarksOfCurrentTab();

		const updatedBookmarks = await Promise.all(
			bookmarksForCurrentTab.map((b) => chrome.bookmarks.update(b.id, { title: newTitle }))
		);
		return updatedBookmarks[0];
	},

	async createBookmarkOfCurrentTab(
		parentFolderId: string,
		shouldAddToTop: boolean
	): Promise<chrome.bookmarks.BookmarkTreeNode> {
		const tab = await this.getCurrentTab();

		const bookmarkDetails: chrome.bookmarks.CreateDetails = {
			parentId: parentFolderId,
			title: tab.title,
			url: tab.url,
		};

		if (shouldAddToTop) {
			bookmarkDetails.index = 0;
		}

		const bookmark = await chrome.bookmarks.create(bookmarkDetails);

		return bookmark;
	},
};

export type FlatFolderType = {
	id: string;
	title: string;
	indentedTitle: string;
};

export async function getFlatFolderList() {
	function flatFolderListFromBookmarksTree(bookmarksTree: chrome.bookmarks.BookmarkTreeNode[]) {
		const array: FlatFolderType[] = [];

		function recursiveThing(bookmarksTree: chrome.bookmarks.BookmarkTreeNode[], level: number = 0) {
			bookmarksTree.forEach((bm) => {
				if (!bm.url) {
					if (bm.id !== "0") {
						array.push({
							id: bm.id,
							title: bm.title,
							indentedTitle:
								"\u00A0" +
								"\u00A0".repeat(6).repeat(level - 1) +
								`${level >= 2 ? "· " : ""}` +
								bm.title,
						});
					}

					if (bm.children) {
						recursiveThing(bm.children, level + 1);
					}
				}
			});
		}

		recursiveThing(bookmarksTree);

		return array;
	}

	const bookmarksTree = await chrome.bookmarks.getTree();
	return flatFolderListFromBookmarksTree(bookmarksTree);
}

const sampleFlatFolderList: FlatFolderType[] = [
	{
		id: "1",
		title: "folder 1 title",
		indentedTitle: "folder 1 indented title",
	},
	{
		id: "2",
		title: "folder 2 title",
		indentedTitle: "folder 2 indented title",
	},
	{
		id: "3",
		title: "folder 3 title",
		indentedTitle: "folder 3 indented title",
	},
];

export function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
