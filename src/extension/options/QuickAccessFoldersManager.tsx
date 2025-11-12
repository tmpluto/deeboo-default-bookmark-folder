import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useDeeBooStore } from "../store";
import { getFlatFolderList, type FlatFolderType } from "../functions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { X, GripVertical, Pin, Plus } from "lucide-react";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";

function SortableFolderItem({
	folderId,
	folderTitle,
	onRemove,
}: {
	folderId: string;
	folderTitle: string;
	onRemove: (id: string) => void;
}) {
	const { defaultFolderId } = useDeeBooStore();

	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: folderId,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn("flex items-center gap-2 rounded-lg border p-2", isDragging && "bg-muted")}
		>
			<button
				{...attributes}
				{...listeners}
				className="text-muted-foreground hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 cursor-grab rounded-md outline-none focus-visible:ring-[3px] active:cursor-grabbing"
			>
				<GripVertical className="size-4" />
			</button>
			{folderId === defaultFolderId && <Pin className="text-primary size-4" />}
			<span className={cn("flex-1 truncate text-sm", folderId === defaultFolderId && "text-primary")}>
				{folderTitle.trim() === "" ? "⚠️ untitled folder" : folderTitle}
			</span>
			<Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onRemove(folderId)}>
				<X className="size-4" />
			</Button>
		</div>
	);
}

export function QuickAccessFoldersManager() {
	const { quickAccessFolderIds, setQuickAccessFolderIds, defaultFolderId, isQuickAccessEnabled } =
		useDeeBooStore();
	const [folderList, setFolderList] = useState<FlatFolderType[]>([]);
	const [popoverOpen, setPopoverOpen] = useState(false);

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const isFolderDisabled = (folderId: string) => {
		return quickAccessFolderIds.includes(folderId);
	};

	const hasHydrated = useDeeBooStore((state) => state._hasHydrated);

	useEffect(() => {
		if (!hasHydrated) return;
		(async () => {
			const list = await getFlatFolderList();
			setFolderList(list);
			const validIds = quickAccessFolderIds.filter((id) => list.some((folder) => folder.id === id));
			if (validIds.length !== quickAccessFolderIds.length) {
				setQuickAccessFolderIds(validIds);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [hasHydrated]);

	const quickAccessFolders = quickAccessFolderIds
		.map((id) => folderList.find((f) => f.id === id))
		.filter((f): f is FlatFolderType => f !== undefined);

	const handleSelectFolder = (folderId: string) => {
		setQuickAccessFolderIds([...quickAccessFolderIds, folderId]);
		setPopoverOpen(false);
	};

	const handleRemoveFolder = (id: string) => {
		setQuickAccessFolderIds(quickAccessFolderIds.filter((folderId) => folderId !== id));
	};

	const handleDragEnd = (event: {
		active: { id: string | number };
		over: { id: string | number } | null;
	}) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = quickAccessFolderIds.indexOf(active.id as string);
			const newIndex = quickAccessFolderIds.indexOf(over.id as string);

			setQuickAccessFolderIds(arrayMove(quickAccessFolderIds, oldIndex, newIndex));
		}
	};

	return (
		<div
			className={cn(
				"flex flex-col gap-4 px-6",
				!isQuickAccessEnabled && "pointer-events-none opacity-50 select-none"
			)}
		>
			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">quick access folders</Label>

				{quickAccessFolders.length > 0 && (
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						modifiers={[restrictToVerticalAxis]}
						onDragEnd={handleDragEnd}
					>
						<SortableContext items={quickAccessFolderIds} strategy={verticalListSortingStrategy}>
							<div className="flex flex-col gap-2">
								{quickAccessFolders.map((folder) => (
									<SortableFolderItem
										key={folder.id}
										folderId={folder.id}
										folderTitle={folder.title}
										onRemove={handleRemoveFolder}
									/>
								))}
							</div>
						</SortableContext>
					</DndContext>
				)}
				<Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
					<PopoverTrigger asChild>
						<Button variant="outline" className="mt-4 w-full justify-center">
							<Plus className="mr-2 size-4" />
							add folder to quick access
						</Button>
					</PopoverTrigger>
					<PopoverContent
						className="max-h-[300px] w-[var(--radix-popover-trigger-width)] overflow-y-auto p-0"
						align="start"
					>
						{folderList.map((folder) => {
							const disabled = isFolderDisabled(folder.id);
							return (
								<button
									key={folder.id}
									onClick={() => handleSelectFolder(folder.id)}
									disabled={disabled}
									className={cn(
										"hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent w-full px-4 py-2 text-left text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50",
										disabled && "cursor-not-allowed"
									)}
								>
									{folder.indentedTitle}
									{folder.id === defaultFolderId && " (DEFAULT)"}
									{disabled && " (already added)"}
								</button>
							);
						})}
					</PopoverContent>
				</Popover>
			</div>
		</div>
	);
}
