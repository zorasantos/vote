import { describe, expect, it } from "vitest";
import {
  CABIN_PATH,
  generateQrCodeDataUrl,
  getCurrentCabinUrl,
  getDefaultCabinUrl,
  VERCEL_BASE_URL,
} from "../qrCodeService";

describe("qrCodeService", () => {
  it("deve retornar a URL padrão correta apontando para o servidor da Vercel", () => {
    expect(VERCEL_BASE_URL).toBe("https://vote-pi-sable.vercel.app");
    expect(CABIN_PATH).toBe("/voting");
    expect(getDefaultCabinUrl()).toBe(
      "https://vote-pi-sable.vercel.app/voting",
    );
  });

  it("deve retornar URL atual ou fallback", () => {
    const url = getCurrentCabinUrl();
    expect(url).toContain("/voting");
  });

  it("deve gerar um DataURL válido em base64 para a URL da cabine", async () => {
    const dataUrl = await generateQrCodeDataUrl(
      "https://vote-pi-sable.vercel.app/voting",
    );
    expect(dataUrl).toBeTypeOf("string");
    expect(dataUrl.startsWith("data:image/png;base64,")).toBe(true);
  });
});
