import QRCode from "qrcode";

/**
 * Encode a payment payload (a checkout URL, or a gateway-issued EMV/PayNow
 * string) as a PNG data URL we can drop straight into an <img>.
 */
export async function encodeQr(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 512,
    color: { dark: "#151B26", light: "#FFFFFF" },
  });
}
