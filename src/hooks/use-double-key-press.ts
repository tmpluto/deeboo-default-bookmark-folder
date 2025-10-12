import { useEffect, useRef } from "react";

interface UseDoubleKeyPressOptions {
	keys: string[];
	onDoublePress: () => void;
	delay?: number;
}

export const useDoubleKeyPress = ({ keys, onDoublePress, delay = 300 }: UseDoubleKeyPressOptions) => {
	const lastKeyPressTime = useRef(0);
	const lastKey = useRef<string | null>(null);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const pressedKey = e.key.toLowerCase();

			if (!keys.includes(pressedKey)) {
				// reset
				lastKeyPressTime.current = 0;
				lastKey.current = null;
				return;
			}

			const now = Date.now();

			if (lastKey.current === pressedKey && now - lastKeyPressTime.current < delay) {
				// double press detected
				onDoublePress();
				// reset
				lastKeyPressTime.current = 0;
				lastKey.current = null;
			} else {
				// first press or different key from the keys list pressed
				lastKeyPressTime.current = now;
				lastKey.current = pressedKey;
			}
		};

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [keys, onDoublePress, delay]);
};
