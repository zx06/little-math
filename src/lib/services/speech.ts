import type { AnyProblem, Problem, MakeTargetProblem, ChainProblem, CompareProblem, RemainderProblem } from '$lib/types';
import { OP_SYMBOLS } from '$lib/types';

const NUMBER_WORDS: Record<number, string> = {
	0: '零',
	1: '一',
	2: '二',
	3: '三',
	4: '四',
	5: '五',
	6: '六',
	7: '七',
	8: '八',
	9: '九',
	10: '十',
	11: '十一',
	12: '十二',
	13: '十三',
	14: '十四',
	15: '十五',
	16: '十六',
	17: '十七',
	18: '十八',
	19: '十九',
	20: '二十',
	30: '三十',
	40: '四十',
	50: '五十',
	60: '六十',
	70: '七十',
	80: '八十',
	90: '九十',
	100: '一百'
};

const OPERATION_WORDS: Record<string, string> = {
	add: '加',
	sub: '减',
	mul: '乘以',
	div: '除以'
};

function numberToWords(num: number): string {
	if (NUMBER_WORDS[num]) {
		return NUMBER_WORDS[num];
	}

	// 处理 20-99
	if (num < 100) {
		const tens = Math.floor(num / 10) * 10;
		const units = num % 10;
		return (NUMBER_WORDS[tens] || '') + (units > 0 ? NUMBER_WORDS[units] : '');
	}

	// 处理 100-999
	if (num < 1000) {
		const hundreds = Math.floor(num / 100);
		const remainder = num % 100;
		const hundredWord = NUMBER_WORDS[hundreds] + '百';
		if (remainder === 0) {
			return hundredWord;
		}
		return hundredWord + (remainder < 10 ? '零' : '') + numberToWords(remainder);
	}

	return num.toString();
}

function problemToText(problem: AnyProblem): string {
	if ('type' in problem) {
		if (problem.type === 'makeTarget') {
			const p = problem as MakeTargetProblem;
			const blankWord = p.blankFirst ? '空白' : numberToWords(p.a);
			const otherWord = p.blankFirst ? numberToWords(p.a) : '空白';
			return `${blankWord} 加 ${otherWord} 等于 ${numberToWords(p.target)}`;
		}

		if (problem.type === 'chain') {
			const p = problem as ChainProblem;
			const parts: string[] = [];
			for (let i = 0; i < p.numbers.length; i++) {
				if (p.blank === i) {
					parts.push('空白');
				} else {
					parts.push(numberToWords(p.numbers[i]));
				}
				if (i < p.ops.length) {
					parts.push(OPERATION_WORDS[p.ops[i]]);
				}
			}
			parts.push('等于');
			if (p.blank === 'result') {
				parts.push('空白');
			} else {
				parts.push(numberToWords(p.result));
			}
			return parts.join(' ');
		}

		if (problem.type === 'compare') {
			const p = problem as CompareProblem;
			const left = `${numberToWords(p.left.a)} ${OPERATION_WORDS[p.left.op]} ${numberToWords(p.left.b)}`;
			const right = `${numberToWords(p.right.a)} ${OPERATION_WORDS[p.right.op]} ${numberToWords(p.right.b)}`;
			return `${left} 和 ${right} 比较`;
		}

		if (problem.type === 'remainder') {
			const p = problem as RemainderProblem;
			let text = `${numberToWords(p.dividend)} 除以 ${numberToWords(p.divisor)} 等于 `;
			
			if (p.blank === 'quotient' || p.blank === 'both') {
				text += '空白';
			} else {
				text += numberToWords(p.quotient);
			}
			
			text += ' 余 ';
			
			if (p.blank === 'remainder' || p.blank === 'both') {
				text += '空白';
			} else {
				text += numberToWords(p.remainder);
			}
			
			return text;
		}
	}

	// 普通题目
	const p = problem as Problem;
	const first = p.blank === 'first' ? '空白' : numberToWords(p.a);
	const second = p.blank === 'second' ? '空白' : numberToWords(p.b);
	const result = p.blank === 'result' ? '空白' : numberToWords(p.result);
	return `${first} ${OPERATION_WORDS[p.op]} ${second} 等于 ${result}`;
}

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speakProblem(problem: AnyProblem): void {
	if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
		console.warn('Speech synthesis not supported');
		return;
	}

	// 停止当前语音
	if (currentUtterance) {
		window.speechSynthesis.cancel();
	}

	const text = problemToText(problem);
	const utterance = new SpeechSynthesisUtterance(text);
	utterance.lang = 'zh-CN';
	utterance.rate = 0.9; // 稍慢一点，适合儿童
	utterance.pitch = 1.1; // 稍高一点，更亲切

	// 尝试选择中文语音
	const voices = window.speechSynthesis.getVoices();
	const chineseVoice = voices.find((voice) => voice.lang.startsWith('zh'));
	if (chineseVoice) {
		utterance.voice = chineseVoice;
	}

	currentUtterance = utterance;
	window.speechSynthesis.speak(utterance);

	// 语音结束后清除引用
	utterance.onend = () => {
		currentUtterance = null;
	};

	utterance.onerror = () => {
		currentUtterance = null;
	};
}

export function stopSpeaking(): void {
	if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
		return;
	}

	window.speechSynthesis.cancel();
	currentUtterance = null;
}

export function isSpeechSupported(): boolean {
	return typeof window !== 'undefined' && 'speechSynthesis' in window;
}