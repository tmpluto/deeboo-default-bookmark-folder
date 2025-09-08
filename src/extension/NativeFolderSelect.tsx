import { selectPrimitiveTriggerClasses } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-react";
import { MyConstants, type FlatFolderType } from "./functions";

export function NativeFolderSelect({
	folderList,
	selectedFolderId,
	onChange,
	defaultFolderId,
	highlightDefaultFolder,
}: {
	folderList: FlatFolderType[];
	onChange: (selectedId: string) => void;
	selectedFolderId: string;
	defaultFolderId?: string | null;
	highlightDefaultFolder?: boolean;
}) {
	const selectedFolder = folderList.find((folder) => folder.id === selectedFolderId) || null;
	const selectedFolderName = selectedFolder?.title || "";

	const shouldHighlight = highlightDefaultFolder && selectedFolderId === defaultFolderId;

	const otherBookmarksFolderIndex = folderList.findIndex(
		(item) => item.id === MyConstants.otherbookmarksId
	);

	return (
		<div className="relative h-9 w-full">
			<select
				data-size="default"
				className={cn(selectPrimitiveTriggerClasses, "peer", "w-full opacity-0")}
				value={selectedFolderId}
				onChange={(e) => onChange(e.currentTarget.value)}
			>
				{folderList.slice(0, otherBookmarksFolderIndex).map((item) => (
					<option key={item.id} value={item.id} data-title={item.title} data-id={item.id}>
						{item.id === defaultFolderId ? `${item.indentedTitle} (DEFAULT)` : item.indentedTitle}
					</option>
				))}
				<hr />
				{folderList.slice(otherBookmarksFolderIndex, folderList.length).map((item) => (
					<option key={item.id} value={item.id} data-title={item.title} data-id={item.id}>
						{item.id === defaultFolderId ? `${item.indentedTitle} (DEFAULT)` : item.indentedTitle}
					</option>
				))}
			</select>
			<span
				data-size="default"
				className={cn(
					selectPrimitiveTriggerClasses,
					"pointer-events-none absolute top-0 w-full",
					"peer-focus-visible:border-ring peer-focus-visible:ring-ring/50 peer-focus-visible:ring-[3px]"
				)}
			>
				<span
					className={cn(
						"w-full truncate",
						shouldHighlight && "text-primary"
						// selectedFolderName.trim() === "" && "text-muted-foreground"
					)}
				>
					{selectedFolderName.trim() === "" ? "⚠️ untitled folder" : selectedFolderName}
				</span>
				<ChevronsUpDown className={cn("size-4 opacity-50", shouldHighlight && "text-primary")} />
			</span>
		</div>
	);
}
