import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Share2, CheckCircle } from "lucide-react";
import { copyToClipboard, getClipboardMessage } from "@/lib/clipboard";
import { ClipboardHelp } from "@/components/ui/clipboard-status";
import { generateQRVerificationData, handleUrlError } from "@/lib/url-utils";
import { toast } from "sonner";

interface Credential {
  id: string;
  title: string;
  issuer: string;
  date: string;
  type: string;
  description: string;
  eventLink: string;
  metadata: Record<string, any>;
}

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  credential: Credential | null;
  walletAddress?: string;
}

export function QRModal({
  isOpen,
  onClose,
  credential,
  walletAddress,
}: QRModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && credential && canvasRef.current) {
      generateQRCode();
    }
  }, [isOpen, credential]);

  const generateQRCode = async () => {
    if (!credential || !canvasRef.current || !walletAddress) return;

    try {
      // Create verification data using improved URL utilities
      const verificationData = generateQRVerificationData(
        credential,
        walletAddress,
      );

      // Use the URL directly for QR code (cleaner than JSON)
      const qrData = verificationData.url;

      // Generate QR code on canvas
      await QRCode.toCanvas(canvasRef.current, qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: "#1f2937",
          light: "#ffffff",
        },
        errorCorrectionLevel: "M", // Medium error correction for better scanning
      });

      // Get data URL for sharing/downloading
      const dataUrl = canvasRef.current.toDataURL("image/png");
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error("QR Code generation failed:", error);
      const errorMessage = handleUrlError(error);
      toast.error("QR Generation Failed", {
        description: errorMessage,
      });
    }
  };

  const copyVerificationUrl = async () => {
    if (!credential || !walletAddress) return;

    try {
      const verificationData = generateQRVerificationData(
        credential,
        walletAddress,
      );
      const result = await copyToClipboard(verificationData.url);

      if (result.success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);

        toast.success("Copied!", {
          description: getClipboardMessage(result),
        });
      } else {
        toast.error("Copy failed", {
          description: "Please copy the URL manually or try again.",
        });
      }
    } catch (error) {
      const errorMessage = handleUrlError(error);
      toast.error("URL Generation Failed", {
        description: errorMessage,
      });
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl || !credential) return;

    const link = document.createElement("a");
    link.download = `${credential.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_qr.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const shareQR = async () => {
    if (!credential || !walletAddress) return;

    try {
      const verificationData = generateQRVerificationData(
        credential,
        walletAddress,
      );

      if (navigator.share) {
        try {
          await navigator.share({
            title: `Verify ${credential.title}`,
            text: `Verify this credential: ${credential.title} issued by ${credential.issuer}`,
            url: verificationData.url,
          });
          return;
        } catch (error) {
          console.error("Share failed:", error);
        }
      }

      // Fallback to copying URL
      const result = await copyToClipboard(verificationData.url);

      if (result.success) {
        toast.success("Ready to share!", {
          description:
            "Verification URL copied to clipboard. You can now paste it anywhere to share.",
        });
      } else {
        toast.error("Share failed", {
          description:
            "Please copy the verification URL manually and share it.",
        });
      }
    } catch (error) {
      const errorMessage = handleUrlError(error);
      toast.error("Share Failed", {
        description: errorMessage,
      });
    }
  };

  if (!credential) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>Credential QR Code</span>
            <Badge variant="secondary">{credential.type}</Badge>
          </DialogTitle>
          <DialogDescription>
            Scan this QR code to instantly verify the authenticity of this
            credential on the blockchain.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Credential Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-sm text-gray-900 mb-1">
              {credential.title}
            </h3>
            <p className="text-sm text-gray-600">
              Issued by {credential.issuer}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(credential.date).toLocaleDateString()}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center bg-white p-4 rounded-lg border">
            <canvas ref={canvasRef} className="max-w-full h-auto" />
          </div>

          {/* Verification Info */}
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Verification Details
              </span>
            </div>
            <p className="text-xs text-blue-700">
              This QR contains blockchain verification data including credential
              ID, wallet address, and issuer information.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <Button onClick={copyVerificationUrl} variant="outline" size="sm">
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy URL
                  </>
                )}
              </Button>
              <Button onClick={downloadQR} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button onClick={shareQR} variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            <ClipboardHelp className="text-center" />

            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
