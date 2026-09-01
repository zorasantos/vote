import QRCode from "qrcode";

export const VERCEL_BASE_URL = "https://vote-pi-sable.vercel.app";
export const CABIN_PATH = "/voting";

/**
 * Retorna a URL padrão da cabine de votação na Vercel
 */
export function getDefaultCabinUrl(): string {
  return `${VERCEL_BASE_URL}${CABIN_PATH}`;
}

/**
 * Retorna a URL da cabine baseada na origem atual do navegador (se disponível) ou fallback para a Vercel
 */
export function getCurrentCabinUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${CABIN_PATH}`;
  }
  return getDefaultCabinUrl();
}

export interface QrCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Gera um DataURL (PNG base64) para o texto/link fornecido
 */
export async function generateQrCodeDataUrl(
  text: string,
  options: QrCodeOptions = {},
): Promise<string> {
  const defaultOptions: QRCode.QRCodeToDataURLOptions = {
    width: options.width || 512,
    margin: options.margin !== undefined ? options.margin : 2,
    errorCorrectionLevel: "H",
    color: {
      dark: options.color?.dark || "#0f172a", // Slate-900
      light: options.color?.light || "#ffffff",
    },
  };

  return QRCode.toDataURL(text, defaultOptions);
}

/**
 * Faz o download da imagem do QR Code no formato PNG
 */
export function downloadQrCodeImage(
  dataUrl: string,
  fileName = "qrcode-cabine-votacao-ace.png",
): void {
  if (typeof document === "undefined") return;

  const downloadLink = document.createElement("a");
  downloadLink.href = dataUrl;
  downloadLink.download = fileName;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}
