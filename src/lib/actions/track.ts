import type { Action } from 'svelte/action';
import type { Operation } from '$lib/types';
import { trackGeneration, trackPrint } from '$lib/services/statistics';

type TrackType = 'generation' | 'print' | 'pdf';
type TrackOptions = {
	type: TrackType;
	data?: {
		operations?: Operation[];
		gradePreset?: string;
	};
};

/** 统计埋点 action */
export const track: Action<HTMLButtonElement, TrackOptions> = (node, options) => {
	const handleClick = () => {
		if (options.type === 'generation' && options.data?.operations) {
			trackGeneration(options.data.operations, options.data.gradePreset || '');
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