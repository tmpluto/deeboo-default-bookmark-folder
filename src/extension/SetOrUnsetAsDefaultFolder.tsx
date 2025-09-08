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
import { Info, Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeeBooStore } from "./store";

export function SetOrUnsetAsDefaultFolder({
	selectedFolderId,
	selectedFolderTitle,
}: {
	selectedFolderId: string | null;
	selectedFolderTitle: string;
}) {
	const [open, setOpen] = useState(false);
	const { defaultFolderId, setDefaultFolderId } = useDeeBooStore();
	const isSelectedFolderDefault = !!selectedFolderId && defaultFolderId === selectedFolderId;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					title={isSelectedFolderDefault ? "remove default folder" : "set as default folder"}
					className={cn(
						isSelectedFolderDefault && "text-primary border-primary hover:text-primary"
					)}
				>
					{isSelectedFolderDefault ? <Pin className="fill-primary" /> : <Pin />}
				</Button>
			</DialogTrigger>
			<DialogContent className="h-full w-full min-w-full gap-2 rounded-none border-0 px-12 pt-4 pb-12 sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className={isSelectedFolderDefault ? "text-destructive" : "text-primary"}>
						{isSelectedFolderDefault ? "remove default folder" : "set as default folder"}
					</DialogTitle>
				</DialogHeader>
				<div className="grid h-32 gap-4 py-4">
					<p
						className={`text-center ${selectedFolderTitle.trim() === "" ? "text-muted-foreground" : "underline"}`}
						style={
							selectedFolderTitle.trim() === "" ? undefined : { textUnderlinePosition: "under" }
						}
					>
						{selectedFolderTitle.trim() === ""
							? "⚠️ untitled folder"
							: `${selectedFolderTitle.slice(0, 100)}${selectedFolderTitle.length > 100 ? "..." : ""}`}
					</p>
					{isSelectedFolderDefault && (
						<div className="flex gap-1.5">
							<Info className="text-destructive h-[18px] w-[18px] flex-shrink-0" />
							<p className="text-destructive">
								if no default folder is set, your new bookmarks will go to "Other Bookmarks"
							</p>
						</div>
					)}
				</div>
				<DialogFooter className="flex flex-row gap-4">
					<Button variant="outline" className="w-1/2" onClick={() => setOpen(false)}>
						cancel
					</Button>
					<Button
						className="w-1/2"
						onClick={() => {
							if (isSelectedFolderDefault) {
								setDefaultFolderId(null);
							} else {
								setDefaultFolderId(selectedFolderId);
							}
							setOpen(false);
						}}
						variant={isSelectedFolderDefault ? "destructive" : "default"}
					>
						{isSelectedFolderDefault ? "remove" : "yes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
