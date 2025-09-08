import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeFolderSelect } from "./extension/NativeFolderSelect";
import GithubCorner from "react-github-corner";
import { bookmarkUtils, getFlatFolderList, MyConstants, type FlatFolderType } from "./extension/functions";
import { useDeeBooStore, type BookmarkTitleSaveMode } from "./extension/store";
import { AddNewFolder } from "./extension/AddNewFolder";
import { SetOrUnsetAsDefaultFolder } from "./extension/SetOrUnsetAsDefaultFolder";
import { DeeBoo } from "./extension/DeeBoo";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type BookmarkLifeStatus = "added-now" | "existing";

function App() {
	const [flatFolderList, setFlatFolderList] = useState<FlatFolderType[]>([]);
	const [selectedFolderId, setSelectedFolderId] = useState<string>(MyConstants.otherbookmarksId);
	const [bookmarkNote, setBookmarkNote] = useState<string>("");
	const { defaultFolderId, defaultTitleSaveMode, setDefaultFolderId } = useDeeBooStore();
	const [bookmarkLifeStatus, setBookmarkLifeStatus] = useState<BookmarkLifeStatus>("added-now");
	const inputRef = useRef<HTMLInputElement>(null);

	const [currentTitleSaveMode, setCurrentTitleSaveMode] = useState<BookmarkTitleSaveMode>("just-custom");

	const [refToBookmark, setRefToBookmark] = useState<chrome.bookmarks.BookmarkTreeNode | null>(null);
	const [refToTab, setRefToTab] = useState<chrome.tabs.Tab | null>(null);

	useEffect(() => {
		(async () => {
			const list = await getFlatFolderList();
			setFlatFolderList(list);

			const { currentTab, bookmarksOfCurrentTab } = await bookmarkUtils.getCurrentTabAndItsBookmarks();
			setRefToTab(currentTab);
			if (bookmarksOfCurrentTab.length) {
				const bm = bookmarksOfCurrentTab[0];

				setRefToBookmark(bm);
				setBookmarkNote(bm.title);
				setSelectedFolderId(bm.parentId as string);
				setBookmarkLifeStatus("existing");

				// if bookmark exists, adapt its title saving mode
				if (bm.title.split(MyConstants.separator).length === 2) {
					setCurrentTitleSaveMode("custom-and-original");
					setBookmarkNote(bm.title.split(MyConstants.separator)[0]);
				}
			} else {
				setBookmarkNote(currentTab.title as string);
				let folderId = null;
				if (defaultFolderId) {
					if (list.some((folder) => folder.id === defaultFolderId)) {
						// the folder that is set as default still exists.
						folderId = defaultFolderId;
					} else {
						setDefaultFolderId(null);
						folderId = MyConstants.otherbookmarksId;
					}
				} else {
					folderId = MyConstants.otherbookmarksId;
				}
				setSelectedFolderId(folderId);
				// autosaving the page as bookmark as soon as popup opens. title save mode doesn't matter. it quickly saves the page with its title first. then you can do ur edits.
				const createdBm = await bookmarkUtils.createBookmarkOfCurrentTab(folderId);
				setRefToBookmark(createdBm);

				// if new bookmark, use default title saving mode
				if (defaultTitleSaveMode === "custom-and-original") {
					setCurrentTitleSaveMode("custom-and-original");
					setBookmarkNote("");
				}
			}

			// TODO: if bookmark already exists, input only focuses, it doesnt select.
			setTimeout(() => {
				inputRef.current!.focus();
				inputRef.current!.select();
			}, 50);
		})();
	}, []);

	useEffect(() => {
		// cmd+D should be able to close the extension.
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && (e.key === "d" || e.key === "D")) {
				e.preventDefault();
				e.stopPropagation();
				try {
					window.close();
				} catch {}
			}
		};
		// use capture to ensure we intercept before Chrome handles the shortcut
		window.addEventListener("keydown", handleKeyDown, true);
		return () => window.removeEventListener("keydown", handleKeyDown, true);
	}, []);

	async function handleRemove() {
		await bookmarkUtils.removeBookmarksOfCurrentTab();
		window.close();
	}

	async function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
		setBookmarkNote(e.target.value);
		let titleToSet = "";
		if (currentTitleSaveMode === "just-custom") {
			titleToSet = e.target.value;
		} else if (currentTitleSaveMode === "custom-and-original") {
			titleToSet = e.target.value + MyConstants.separator + refToTab?.title;
		}

		const newRef = await bookmarkUtils.renameCurrentTabBookmark(titleToSet);
		setRefToBookmark(newRef);
	}

	async function handleFolderChange(id: string) {
		setSelectedFolderId(id);
		const newRef = await bookmarkUtils.changeBookmarkLocation(id);
		setRefToBookmark(newRef);
	}

	async function handleFolderCreate(newFolderTitle: string, parentFolderId: string) {
		const newFolderId = await bookmarkUtils.createNewFolder(newFolderTitle, parentFolderId);
		const list = await getFlatFolderList();
		setFlatFolderList(list);
		await handleFolderChange(newFolderId);
	}

	async function handleKeyPressOnInput(e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Enter" || e.keyCode === 13) {
			e.preventDefault();
			window.close();
		}
	}

	async function handleModeChange(mode: BookmarkTitleSaveMode) {
		setCurrentTitleSaveMode(mode);

		// "just custom note" -> "custom note + page title" ::: resave bookmark with <old custom note + separator + page title>, and set input field to be <old custom note>.
		// NOT IMPLEMENTED alternative could be: resave bookmark with just page title, and set input field to be empty.
		if (mode === "custom-and-original") {
			const newRef = await bookmarkUtils.renameCurrentTabBookmark(
				(refToBookmark!.title + MyConstants.separator + refToTab!.title) as string
			);
			setBookmarkNote(refToBookmark!.title);
			setRefToBookmark(newRef);
		}

		// "custom note + page title" -> "just custom note" ::: resave bookmark with custom part as title. set input field to custom part.
		else if (mode === "just-custom") {
			const customPart = refToBookmark!.title.split(MyConstants.separator)[0];
			const newRef = await bookmarkUtils.renameCurrentTabBookmark(customPart);
			setRefToBookmark(newRef);
			setBookmarkNote(customPart);
		}

		setTimeout(() => {
			inputRef.current!.focus();
			inputRef.current!.select();
		}, 50);
	}

	return (
		<div className="EXTENSION_WRAPPER relative h-[245px] w-[470px] p-4">
			{/* <GithubCorner
				href="https://github.com/username/repo"
				target="_blank"
				direction="left"
				bannerColor="var(--success)"
				octoColor="var(--background)"
				size={30}
			/> */}
			<a
				className="absolute top-[33px] left-[-5px] scale-125 rotate-[-45deg] focus-visible:outline-none"
				target="_blank"
				href="https://github.com/tmpluto/deeboo-default-bookmark-folder"
			>
				<DeeBoo goGreen={bookmarkLifeStatus === "added-now"} className="cursor-pointer" />
			</a>
			<div className="flex flex-col gap-4">
				<div className="flex justify-between">
					{bookmarkLifeStatus === "added-now" && (
						<p className="text-success ml-14 flex items-center gap-2 text-base">
							{/* <span className="w-2 h-2 rounded-full inline-block bg-success" /> */}
							bookmark added
						</p>
					)}
					{bookmarkLifeStatus === "existing" && (
						<p className="ml-14 flex items-center gap-2 text-base">
							{/* <span className="w-2 h-2 rounded-full inline-block bg-foreground" /> */}
							edit bookmark
						</p>
					)}

					<Select
						defaultValue="just-custom"
						value={currentTitleSaveMode}
						onValueChange={handleModeChange}
					>
						<SelectTrigger className="text-xs" size="sm">
							<SelectValue placeholder="title save mode" />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>bookmark title saving mode</SelectLabel>
								<SelectItem value="just-custom">just custom note</SelectItem>
								<SelectItem value="custom-and-original">custom + keep page title</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				<div className="flex flex-col gap-4">
					<div className="flex flex-row items-center gap-0">
						<span className="w-14 min-w-14 text-sm">note</span>
						<Input
							ref={inputRef}
							id="bookmark-name"
							placeholder={
								currentTitleSaveMode === "just-custom"
									? "bookmark title"
									: "if empty, bookmark title will stay as the page title"
							}
							value={bookmarkNote}
							onChange={handleTitleChange}
							onKeyDown={handleKeyPressOnInput}
						/>
					</div>

					<div className="flex gap-4">
						<div className="flex w-full flex-row items-center">
							<span className="w-14 min-w-14 text-sm">folder</span>
							<NativeFolderSelect
								folderList={flatFolderList}
								selectedFolderId={selectedFolderId}
								onChange={handleFolderChange}
								defaultFolderId={defaultFolderId}
								highlightDefaultFolder
							/>
						</div>

						<SetOrUnsetAsDefaultFolder
							selectedFolderId={selectedFolderId}
							selectedFolderTitle={
								flatFolderList.find((f) => f.id === selectedFolderId)?.title || ""
							}
						/>

						<AddNewFolder folderList={flatFolderList} onCreate={handleFolderCreate} />
					</div>

					{/* <div className="flex items-center pl-14 pr-4">
						<div className="flex w-full justify-between gap-4">
							<Button variant="ghost" className="w-1/2 opacity-60 h-7" size="sm">
								<History /> save to last used
							</Button>
							<AddNewFolder
								options={flatFolderList}
								onCreated={(newFolder) => {
									setFlatFolderList((prev) => [...prev, newFolder]);
									setSelectedFolderId(newFolder.id);
								}}
							/>
						</div>
					</div> */}

					<div className="mt-4 flex justify-end gap-4">
						<Button
							variant="outline"
							className="text-destructive border-destructive! hover:bg-destructive/60! hover:text-destructive-foreground focus-visible:ring-destructive/40 focus-visible:bg-destructive/60! focus-visible:text-destructive-foreground w-24"
							onClick={handleRemove}
						>
							remove
						</Button>
						<Button className="w-24" onClick={() => window.close()}>
							done
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

export default App;
