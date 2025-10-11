import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useDeeBooStore, type BookmarkTitleSaveMode } from "../store";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

export function ExtensionOptions() {
	const { defaultTitleSaveMode, setDefaultTitleSaveMode, shouldAddToTop, setShouldAddToTop } =
		useDeeBooStore();

	return (
		<div className="flex justify-center">
			<div className="max-w-[900px] pt-4">
				<div className="flex flex-col gap-4">
					<fieldset className="flex flex-col gap-3 px-4">
						<legend className="font-medium">default bookmark title save mode</legend>
						<p className="text-muted-foreground text-sm">
							the titles of your new bookmarks will be saved according to this setting. existing
							bookmarks will keep their saving mode as is, but you can change it when editing
							the bookmark.
						</p>
						<RadioGroup
							value={defaultTitleSaveMode}
							onValueChange={setDefaultTitleSaveMode}
							className="flex"
						>
							<Label
								htmlFor="standart"
								className={cn(
									"has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-input/20 flex flex-1 items-start rounded-xl border p-4"
								)}
							>
								<RadioGroupItem value="just-custom" id="standart" />
								<div>
									<p className="mb-2 font-medium">just custom note</p>
									<p className="text-muted-foreground text-xs leading-snug text-balance">
										STANDARD - the same as how Chrome bookmarking works. the bookmark is
										saved with the text you enter in the input field, which by default
										matches the page title until you edit it.
									</p>
								</div>
							</Label>
							<Label
								htmlFor="keep-page-title"
								className={cn(
									"has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-input/20 flex flex-1 items-start rounded-xl border p-4"
								)}
							>
								<RadioGroupItem value="custom-and-original" id="keep-page-title" />
								<div>
									<p className="mb-2 font-medium">
										custom note + always keep the original page title
									</p>
									<p className="text-muted-foreground text-xs leading-snug text-balance">
										the text you enter in the input field is saved together with the
										original page title. your bookmark title will look like this: <br />
										<span className="text-primary">
											"your custom note&nbsp;&nbsp;&nbsp;· · ·&nbsp;&nbsp;&nbsp;the page
											title"
										</span>{" "}
										<br />
										If the input field is left empty, the bookmark will be saved just with
										the page title (as if it is saved via "just custom note" mode).
									</p>
								</div>
							</Label>
						</RadioGroup>
					</fieldset>
					<hr />
					<fieldset className="flex items-center gap-6 px-4">
						<div className="flex flex-col">
							<legend className="font-medium">
								add new bookmarks to the top of its folder
							</legend>
							<p className="text-muted-foreground text-sm">
								by default, chrome saves new bookmarks to the bottom of its folder as the last
								element. if you turn this on, they will be added to the top of folder instead.
							</p>
						</div>
						<Switch checked={shouldAddToTop} onCheckedChange={setShouldAddToTop} />
					</fieldset>
					<hr />
				</div>
			</div>
		</div>
	);
}
