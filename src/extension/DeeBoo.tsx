import { cn } from "@/lib/utils";
import { Circle, Spline, Star } from "lucide-react";

function BodySmile({ goGreen }: { goGreen?: boolean }) {
	return (
		<>
			<Star
				className={cn(
					"fill-foreground stroke-foreground absolute top-[6px] left-[6px] size-8",
					goGreen && "fill-success stroke-success"
				)}
			/>
			<Spline className="stroke-background absolute top-[13px] left-[14px] size-4 rotate-235" />
		</>
	);
}

function StarEyes({ className, goGreen }: { className?: string; goGreen?: boolean }) {
	return (
		<>
			<Circle
				className={cn(
					"fill-foreground stroke-foreground absolute top-[8px] left-[13px] size-1",
					goGreen && "fill-success stroke-success",
					className
				)}
			/>
			<Circle
				className={cn(
					"fill-foreground stroke-foreground absolute top-[8px] left-[27px] size-1",
					goGreen && "fill-success stroke-success",
					className
				)}
			/>
		</>
	);
}

function SplineEyes({ className, goGreen }: { className?: string; goGreen?: boolean }) {
	return (
		<>
			<Spline
				className={cn(
					"stroke-foreground absolute top-[8px] left-[12px] size-1.25 rotate-23 stroke-3",
					goGreen && "stroke-success",
					className
				)}
			/>
			<Spline
				className={cn(
					"stroke-foreground absolute top-[8px] left-[27px] size-1.25 rotate-68 stroke-3",
					goGreen && "stroke-success",
					className
				)}
			/>
		</>
	);
}

export function DeeBoo({ className, goGreen }: { className?: string; goGreen?: boolean }) {
	return (
		<div className={cn("group relative", className)}>
			<BodySmile goGreen={goGreen} />
			<StarEyes className="opacity-0 group-hover:opacity-100" goGreen={goGreen} />
			<SplineEyes className="group-hover:opacity-0" goGreen={goGreen} />
		</div>
	);
}

// export function DeeBooTestingWrapper(){
// 	return (
// 		<div className="EXTENSION_WRAPPER w-[470px] h-[245px] p-8 relative bg-white">
// 			<div className="relative size-20 bg-white scale-150">
// 				<Circle className="absolute fill-background stroke-background left-[10px]"/>
// 				<DeeBoo />
// 			</div>
// 		</div>
// 	)
// }
