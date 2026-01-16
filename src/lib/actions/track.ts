import type { Action } from 'svelte/action';
import { trackGeneration, trackPrint } from '$lib/services/statistics';

type TrackType = 'generation' | 'print';
type TrackOptions = {
	type: TrackType;
	data?: {
		operations?: string[];
		gradePreset?: string;
	};
};

/** 统计埋点 action */
export const track: Action<HTMLButtonElement, TrackOptions> = (node, options) => {
	const handleClick = () => {
		if (options.type === 'generation' && options.data) {
			trackGeneration(
				options.data.operations as any,
				options.data.gradePreset || ''
			);
		} else if (options.type === 'print') {
			trackPrint();
		}
	};

	node.addEventListener('click', handleClick);

	return {
		update(newOptions: TrackOptions) {
			options = newOptions;
		},
		destroy() {
			node.removeEventListener('click', handleClick);
		}
	};
};