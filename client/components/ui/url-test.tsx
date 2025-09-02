import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  generateVerificationUrl,
  generateProfileUrl,
  isValidWalletAddress,
  isValidCredentialId,
  parseUrlParams,
  sanitizeUrlForDisplay,
} from "@/lib/url-utils";
import { CheckCircle, XCircle, ExternalLink } from "lucide-react";

export function URLTestComponent() {
  const [walletAddress, setWalletAddress] = useState("0x1234567890abcdef");
  const [credentialId, setCredentialId] = useState("cert-123");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [error, setError] = useState("");

  const testUrlGeneration = () => {
    setError("");
    setGeneratedUrl("");

    try {
      const url = generateVerificationUrl(walletAddress, credentialId);
      setGeneratedUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const testProfileUrl = () => {
    setError("");
    setGeneratedUrl("");

    try {
      const url = generateProfileUrl(walletAddress);
      setGeneratedUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  const currentParams = parseUrlParams();

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>URL Generation Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current URL Parameters */}
        <div>
          <h4 className="font-semibold mb-2">Current URL Parameters:</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-sm font-medium">Address:</span>
              <Badge
                variant={currentParams.address ? "default" : "secondary"}
                className="ml-2"
              >
                {currentParams.address || "None"}
              </Badge>
            </div>
            <div>
              <span className="text-sm font-medium">Credential ID:</span>
              <Badge
                variant={currentParams.credentialId ? "default" : "secondary"}
                className="ml-2"
              >
                {currentParams.credentialId || "None"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Input Testing */}
        <div className="space-y-2">
          <div>
            <label className="text-sm font-medium">Wallet Address:</label>
            <div className="flex items-center space-x-2">
              <Input
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x1234... or user.apt"
              />
              <Badge
                variant={
                  isValidWalletAddress(walletAddress)
                    ? "default"
                    : "destructive"
                }
              >
                {isValidWalletAddress(walletAddress) ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {isValidWalletAddress(walletAddress) ? "Valid" : "Invalid"}
              </Badge>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Credential ID:</label>
            <div className="flex items-center space-x-2">
              <Input
                value={credentialId}
                onChange={(e) => setCredentialId(e.target.value)}
                placeholder="cert-123"
              />
              <Badge
                variant={
                  isValidCredentialId(credentialId) ? "default" : "destructive"
                }
              >
                {isValidCredentialId(credentialId) ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : (
                  <XCircle className="h-3 w-3 mr-1" />
                )}
                {isValidCredentialId(credentialId) ? "Valid" : "Invalid"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="flex space-x-2">
          <Button onClick={testUrlGeneration}>Generate Credential URL</Button>
          <Button onClick={testProfileUrl} variant="outline">
            Generate Profile URL
          </Button>
        </div>

        {/* Results */}
        {generatedUrl && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="font-medium">Generated URL:</p>
                <div className="bg-gray-100 p-2 rounded text-sm font-mono break-all">
                  {generatedUrl}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">
                    Sanitized: {sanitizeUrlForDisplay(generatedUrl)}
                  </span>
                  <Button size="sm" variant="outline" asChild>
                    <a
                      href={generatedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Test
                    </a>
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
