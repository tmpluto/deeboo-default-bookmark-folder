import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderPlus } from "lucide-react";
import { NativeFolderSelect } from "./NativeFolderSelect";
import { MyConstants, type FlatFolderType } from "./functions";

export function AddNewFolder({
	folderList,
	onCreate,
}: {
	folderList: FlatFolderType[];
	onCreate: (newFolderTitle: string, parentFolderId: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const [newFolderTitle, setNewFolderTitle] = useState("");
	const [parentFolderId, setParentFolderId] = useState<string>(MyConstants.otherbookmarksId);

	return (
		<Dialog
			open={open}
			onOpenChange={(v) => {
				setOpen(v);
				setNewFolderTitle("");
				setParentFolderId(MyConstants.otherbookmarksId);
			}}
		>
			<DialogTrigger asChild>
				<Button variant="outline" className="" size="icon">
					<FolderPlus />
				</Button>
			</DialogTrigger>
			<DialogContent className="h-full w-full min-w-full gap-2 rounded-none border-0 px-12 pt-4 pb-12 sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>add new folder</DialogTitle>
				</DialogHeader>
				<div className="grid h-32 gap-4 py-4">
					<div className="flex flex-row items-center gap-0">
						<Label htmlFor="new-folder-name" className="w-14 min-w-14 text-sm">
							name
						</Label>
						<Input
							id="new-folder-name"
							placeholder="new folder name"
							value={newFolderTitle}
							onChange={(e) => setNewFolderTitle(e.target.value)}
						/>
					</div>
					<div className="flex items-center">
						<span className="w-14 min-w-14 text-sm">parent</span>
						<NativeFolderSelect
							folderList={folderList}
							selectedFolderId={parentFolderId}
							onChange={setParentFolderId}
						/>
					</div>
				</div>
				<DialogFooter className="flex flex-row gap-4">
					<Button variant="outline" className="w-1/2" onClick={() => setOpen(false)}>
						cancel
					</Button>
					<Button
						className="w-1/2"
						disabled={newFolderTitle.trim() === ""}
						onClick={() => {
							onCreate(newFolderTitle, parentFolderId);
							setOpen(false);
						}}
					>
						save
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
