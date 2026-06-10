import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export const REPORT_WIDTH_PX = 794;
export const REPORT_HEIGHT_PX = 1123;

const A4_WIDTH_MM = 210;
const A4_HEIGHT_MM = 297;
const MAX_CANVAS_EDGE = 14000;

const IFRAME_BASE_CSS = `
  *, *::before, *::after { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    font-family: Roboto, Arial, sans-serif;
  }
  p, h1, h2, h3, h4 { margin: 0; }
  table { border-collapse: collapse; }
`;

function getCaptureScale(): number {
  const preferred = 2;
  const maxByHeight = MAX_CANVAS_EDGE / REPORT_HEIGHT_PX;
  const maxByWidth = MAX_CANVAS_EDGE / REPORT_WIDTH_PX;
  return Math.min(preferred, maxByHeight, maxByWidth, 2);
}

function stripClasses(root: HTMLElement): void {
  root.removeAttribute("class");
  root.querySelectorAll("[class]").forEach((node) => {
    node.removeAttribute("class");
  });
}

async function createIsolatedCaptureTarget(source: HTMLElement) {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.cssText = [
    "position:fixed",
    "left:-10000px",
    "top:0",
    "border:0",
    `width:${REPORT_WIDTH_PX}px`,
    `height:${REPORT_HEIGHT_PX}px`,
    "visibility:hidden",
    "overflow:hidden",
  ].join(";");
  document.body.appendChild(iframe);

  const iframeWindow = iframe.contentWindow;
  const iframeDocument = iframe.contentDocument;

  if (!iframeWindow || !iframeDocument) {
    document.body.removeChild(iframe);
    throw new Error("Não foi possível preparar o ambiente de exportação.");
  }

  iframeDocument.open();
  iframeDocument.write(
    `<!DOCTYPE html><html><head><style>${IFRAME_BASE_CSS}</style></head><body style="margin:0;padding:0;width:${REPORT_WIDTH_PX}px;height:${REPORT_HEIGHT_PX}px;overflow:hidden;"></body></html>`
  );
  iframeDocument.close();

  const clone = source.cloneNode(true) as HTMLElement;
  stripClasses(clone);
  clone.style.width = `${REPORT_WIDTH_PX}px`;
  clone.style.height = `${REPORT_HEIGHT_PX}px`;
  iframeDocument.body.appendChild(clone);

  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    iframe,
    target: clone,
    iframeWindow,
    cleanup: () => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    },
  };
}

export async function exportLicenseReportPdf(
  element: HTMLElement,
  filename: string
): Promise<void> {
  const { target, iframeWindow, cleanup } =
    await createIsolatedCaptureTarget(element);
  const scale = getCaptureScale();

  try {
    const canvas = await html2canvas(target, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      foreignObjectRendering: false,
      width: REPORT_WIDTH_PX,
      height: REPORT_HEIGHT_PX,
      windowWidth: REPORT_WIDTH_PX,
      windowHeight: REPORT_HEIGHT_PX,
      window: iframeWindow,
    } as Parameters<typeof html2canvas>[1]);

    if (!canvas.width || !canvas.height) {
      throw new Error("Canvas vazio ao capturar o relatório.");
    }

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    pdf.addImage(imgData, "PNG", 0, 0, A4_WIDTH_MM, A4_HEIGHT_MM);
    pdf.save(filename);
  } finally {
    cleanup();
  }
}
