/**
 * 导出 PDF：每一张网页卷面（.page，固定 210mm × 297mm）单独渲染成一张图片，
 * 放进 PDF 的一页 A4，保证「一页卷子 = 一页 PDF」，不再出现右侧被裁、卷头掉到上一页底部的问题。
 * html2canvas / jsPDF 体积较大，只在点击「导出PDF」时才按需加载。
 */

/** 用浏览器本地时间（例如北京时间）生成日期，导出时才计算 */
export function localDateStamp(date: Date = new Date()): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

export function defaultPdfFilename(date: Date = new Date()): string {
	return `数学练习_${localDateStamp(date)}.pdf`;
}

export interface PdfExportOptions {
	filename?: string;
	/** 渲染倍率，越大越清晰 */
	scale?: number;
	/** 只生成不下载（测试用） */
	returnBlob?: boolean;
}

const A4_W = 210;
const A4_H = 297;
/** 与 ExerciseSheet `.page` 的 210mm × 297mm 在 96dpi 下一致 */
const A4_W_PX = Math.round((A4_W / 25.4) * 96);
const A4_H_PX = Math.round((A4_H / 25.4) * 96);

export async function exportPagesToPdf(
	root: HTMLElement,
	options: PdfExportOptions = {}
): Promise<Blob | void> {
	const pages = Array.from(root.querySelectorAll<HTMLElement>('.page'));
	if (pages.length === 0) throw new Error('没有可导出的页面');

	const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')]);
	const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait', compress: true });
	const scale = options.scale ?? 2;

	// 导出与 @media print 一致：白底、题目纯黑、浅色主题点缀。
	// 必须加在原文档上：html2canvas 在 onclone 之前就读取了 ::before / ::after 等伪元素样式。
	const html = document.documentElement;
	const hadInk = html.hasAttribute('data-ink');
	const hadCapture = html.hasAttribute('data-capture');
	if (!hadInk) html.setAttribute('data-ink', 'print');
	if (!hadCapture) html.setAttribute('data-capture', 'pdf');
	try {
		// 等自托管字体（Nunito / 快乐体）下载完再截图，避免用后备字体
		await document.fonts?.ready;
		for (let i = 0; i < pages.length; i++) {
			const page = pages[i];
			const w = page.offsetWidth > 0 ? page.offsetWidth : A4_W_PX;
			const h = page.offsetHeight > 0 ? page.offsetHeight : A4_H_PX;
			const canvas = await html2canvas(page, {
				scale,
				useCORS: true,
				backgroundColor: '#ffffff',
				logging: false,
				width: w,
				height: h,
				scrollX: 0,
				scrollY: 0,
				windowWidth: Math.max(document.documentElement.clientWidth, w + 40),
				onclone: (doc, el) => {
					// 克隆出来的页面去掉预览用的阴影和外边距
					el.style.margin = '0';
					el.style.boxShadow = 'none';
					el.style.borderRadius = '0';
					doc.querySelectorAll<HTMLElement>('.sheet-container').forEach((c) => (c.style.zoom = '1'));
				}
			});
			if (i > 0) pdf.addPage('a4', 'portrait');
			pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, A4_W, A4_H, undefined, 'FAST');
		}
	} finally {
		if (!hadCapture) html.removeAttribute('data-capture');
		if (!hadInk) html.removeAttribute('data-ink');
	}

	if (options.returnBlob) return pdf.output('blob');
	pdf.save(options.filename ?? defaultPdfFilename());
}
