import html2pdf from 'html2pdf.js';

export interface PdfExportOptions {
	filename?: string;
	margin?: number;
	image?: { type: 'jpeg' | 'png' | 'webp'; quality: number };
	html2canvas?: { scale: number; useCORS: boolean };
	jsPDF?: { unit: 'mm' | 'pt' | 'in'; format: string | [number, number]; orientation: 'portrait' | 'landscape' };
}

export async function exportToPdf(
	element: HTMLElement,
	options: PdfExportOptions = {}
): Promise<void> {
	const defaultOptions = {
		filename: `数学练习_${new Date().toISOString().slice(0, 10)}.pdf`,
		margin: 5,
		image: { type: 'jpeg' as const, quality: 0.98 },
		html2canvas: { scale: 2, useCORS: true },
		jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
	};

	const mergedOptions = { ...defaultOptions, ...options };

	await html2pdf()
		.set(mergedOptions as any)
		.from(element)
		.save();
}

export async function exportElementToPdf(
	elementId: string,
	options: PdfExportOptions = {}
): Promise<void> {
	const element = document.getElementById(elementId);
	if (!element) {
		console.error(`Element with id "${elementId}" not found`);
		return;
	}
	await exportToPdf(element, options);
}
