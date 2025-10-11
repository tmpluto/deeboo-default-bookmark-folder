import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ChromeLocalStorage } from "zustand-chrome-storage";
import { MyConstants } from "./functions";

export type BookmarkTitleSaveMode = "just-custom" | "custom-and-original";

interface Store {
	defaultFolderId: string | null;
	defaultTitleSaveMode: BookmarkTitleSaveMode;
	setDefaultFolderId: (id: string | null) => void;
	setDefaultTitleSaveMode: (val: BookmarkTitleSaveMode) => void;
	_hasHydrated: boolean;
	setHasHydrated: (hydrationState: boolean) => void;
}

export const useDeeBooStore = create(
	persist<Store>(
		(set) => ({
			defaultFolderId: null,
			defaultTitleSaveMode: "just-custom",
			setDefaultFolderId(id: string | null) {
				set(() => ({ defaultFolderId: id }));
			},
			setDefaultTitleSaveMode(val: BookmarkTitleSaveMode) {
				set(() => ({ defaultTitleSaveMode: val }));
			},
			_hasHydrated: false,
			setHasHydrated: (hydrationState) => {
				set({
				_hasHydrated: hydrationState
				});
			}
		}),
		{
			name: MyConstants.storeKey,
			storage: createJSONStorage(() => ChromeLocalStorage),
			onRehydrateStorage: (state) => {
				return () => state.setHasHydrated(true)
			}
		}
	)
);

// try catch just so that the page renders in "npm run dev"
/*
	why this is needed?
	options page is open > user edits default folder from popup >
	> then user edits default title save mode from options page without refreshing the page first
	or vice versa
*/
try {
	chrome.storage.onChanged.addListener((changes, area) => {
		const deebooStoreChanges = changes[MyConstants.storeKey];
		if (area === "local" && deebooStoreChanges) {
			const newState = JSON.parse(deebooStoreChanges.newValue)["state"];
			useDeeBooStore.setState((state) => ({
				...state,
				...newState,
			}));
		}
	});
} catch {}
