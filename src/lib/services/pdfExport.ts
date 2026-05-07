export interface PdfExportOptions {
	filename?: string;
	margin?: number;
	image?: { type: 'jpeg' | 'png' | 'webp'; quality: number };
	html2canvas?: { scale: number; useCORS: boolean };
	jsPDF?: { unit: 'mm' | 'pt' | 'in'; format: string | [number, number]; orientation: 'portrait' | 'landscape' };
}

const DEFAULT_OPTIONS: PdfExportOptions = {
	filename: `数学练习_${new Date().toISOString().slice(0, 10)}.pdf`,
	margin: 5,
	image: { type: 'jpeg', quality: 0.98 },
	html2canvas: { scale: 2, useCORS: true },
	jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
};

export async function exportToPdf(
	element: HTMLElement,
	options: PdfExportOptions = {}
): Promise<void> {
	const html2pdf = (await import('html2pdf.js')).default;
	const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

	await html2pdf()
		.set(mergedOptions)
		.from(element)
		.save();
}

export async function exportElementToPdf(
	element: HTMLElement,
	options: PdfExportOptions = {}
): Promise<void> {
	await exportToPdf(element, options);
}
