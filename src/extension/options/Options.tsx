import { useEffect, useState } from "react";
import { DeeBoo } from "../DeeBoo";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import changes from "./changes.json";
import { History, Settings, Smile } from "lucide-react";
import { ExtensionOptions } from "./ExtensionOptions";
import { useWindowSize } from "react-use";
import Confetti from "react-confetti";
import { cn } from "@/lib/utils";

type TabType = "changelog" | "options" | "welcome";

export function Options() {
	const [tab, setTab] = useState<TabType>(() => {
		// return "changelog"
		const qp = new URLSearchParams(window.location.search).get("tab");
		return qp === "changelog" || qp === "options" || qp === "welcome" ? qp : "options";
	});

	useEffect(() => {
		const onPopState = () => {
			const qp = new URLSearchParams(window.location.search).get("tab");
			const result = qp === "changelog" || qp === "options" || qp === "welcome" ? qp : "options";
			setTab(result);
		};
		window.addEventListener("popstate", onPopState);
		return () => window.removeEventListener("popstate", onPopState);
	}, []);

	function handleTabChange(val: TabType) {
		setTab(val);
		const url = new URL(window.location.href);
		url.searchParams.set("tab", val);
		window.history.pushState({ tab: val }, "", url.toString());
	}
	return (
		<div className="flex h-full flex-col">
			<style>{`
				body { font-size: 100%; }
				html, body, #root { height: 100%; }
			`}</style>
			<div className="bg-success/10 flex h-25 min-h-25 items-center">
				<div className="relative left-14 mr-36 flex scale-200 items-center">
					<a
						className="size-12 focus-visible:outline-none"
						target="_blank"
						href="https://github.com/tmpluto/deeboo-default-bookmark-folder"
					>
						<DeeBoo goGreen={true} className="cursor-pointer" />
					</a>
					<h1 className="excalifont text-success">deeboo</h1>
				</div>

				<Tabs value={tab} onValueChange={handleTabChange as any}>
					<TabsList className="bg-success/20">
						<TabsTrigger
							value="welcome"
							className="data-[state=active]:bg-success/40! data-[state=active]:border-success! excalifont text-success! data-[state=active]:text-foreground!"
						>
							<Smile /> welcome
						</TabsTrigger>
						<TabsTrigger
							value="changelog"
							className="data-[state=active]:bg-success/40! data-[state=active]:border-success! excalifont text-success! data-[state=active]:text-foreground!"
						>
							<History /> changelog
						</TabsTrigger>
						<TabsTrigger
							value="options"
							className="data-[state=active]:bg-success/40! data-[state=active]:border-success! excalifont text-success! data-[state=active]:text-foreground!"
						>
							<Settings /> options
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>
			{tab === "welcome" && <Welcome />}
			{tab === "changelog" && <Changelog />}
			{tab === "options" && <ExtensionOptions />}
		</div>
	);
}

function Welcome() {
	const { width, height } = useWindowSize();
	return (
		<div className="bg-success/10 flex flex-1 flex-col items-center gap-4 pt-28">
			<Confetti width={width} height={height} tweenDuration={50} />
			<p className="excalifont text-success text-2xl">🙂</p>
			<p className="excalifont text-success text-2xl">thanks for downloading</p>
			<Button asChild variant="link" className="excalifont text-success text-lg underline">
				<a href="https://github.com/tmpluto/deeboo-default-bookmark-folder" target="_blank">
					for issues/feature requests {"->"} click here
				</a>
			</Button>
		</div>
	);
}

function Changelog() {
	return (
		<div className="bg-success/10 flex flex-1 flex-col items-center gap-4 pt-28">
			{[...changes].reverse().map((change, index) => (
				<div key={change.version} className="text-center">
					<p className={cn("excalifont text-success/70 text-2xl", index === 0 && "text-success")}>
						{change.version}
					</p>
					<ul>
						{change.changes.map((text, i) => (
							<li
								key={i}
								className={cn(
									"excalifont text-success/70 text-center text-lg",
									index === 0 && "text-success"
								)}
							>
								- {text}
							</li>
						))}
					</ul>
					{index < changes.length - 1 && (
						<div className={cn("text-success/70 my-2", index === 0 && "text-success")}>·</div>
					)}
				</div>
			))}
		</div>
	);
}
