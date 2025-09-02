/**
 * Robust clipboard utility with multiple fallback methods
 * Handles various browser environments and permissions policies
 */

export interface ClipboardResult {
  success: boolean;
  method?: "clipboard-api" | "execCommand" | "manual-select" | "fallback";
  error?: string;
}

/**
 * Copy text to clipboard with multiple fallback methods
 */
export async function copyToClipboard(text: string): Promise<ClipboardResult> {
  // Method 1: Try modern Clipboard API first
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, method: "clipboard-api" };
    } catch (error) {
      console.warn("Clipboard API failed:", error);
    }
  }

  // Method 2: Try legacy execCommand method
  try {
    const result = await copyWithExecCommand(text);
    if (result.success) {
      return result;
    }
  } catch (error) {
    console.warn("execCommand failed:", error);
  }

  // Method 3: Try manual text selection method
  try {
    const result = await copyWithTextSelection(text);
    if (result.success) {
      return result;
    }
  } catch (error) {
    console.warn("Text selection failed:", error);
  }

  // Method 4: Final fallback - show text for manual copy
  return showManualCopyFallback(text);
}

/**
 * Legacy execCommand method
 */
async function copyWithExecCommand(text: string): Promise<ClipboardResult> {
  return new Promise((resolve) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);

    try {
      textArea.select();
      textArea.setSelectionRange(0, 99999);

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        resolve({ success: true, method: "execCommand" });
      } else {
        resolve({ success: false, error: "execCommand returned false" });
      }
    } catch (error) {
      document.body.removeChild(textArea);
      resolve({ success: false, error: "execCommand threw error" });
    }
  });
}

/**
 * Manual text selection method
 */
async function copyWithTextSelection(text: string): Promise<ClipboardResult> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "text";
    input.value = text;
    input.style.position = "absolute";
    input.style.left = "-9999px";
    document.body.appendChild(input);

    try {
      input.select();
      input.setSelectionRange(0, input.value.length);

      // Try to copy using the newer approach
      if (document.execCommand) {
        const successful = document.execCommand("copy");
        document.body.removeChild(input);

        if (successful) {
          resolve({ success: true, method: "manual-select" });
        } else {
          resolve({ success: false, error: "Manual selection copy failed" });
        }
      } else {
        document.body.removeChild(input);
        resolve({ success: false, error: "execCommand not available" });
      }
    } catch (error) {
      document.body.removeChild(input);
      resolve({ success: false, error: "Manual selection threw error" });
    }
  });
}

/**
 * Final fallback - prompt user to copy manually
 */
function showManualCopyFallback(text: string): ClipboardResult {
  try {
    // Create a temporary text area for manual selection
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "50%";
    textArea.style.left = "50%";
    textArea.style.transform = "translate(-50%, -50%)";
    textArea.style.width = "80%";
    textArea.style.height = "100px";
    textArea.style.zIndex = "10000";
    textArea.style.backgroundColor = "white";
    textArea.style.border = "2px solid #ccc";
    textArea.style.padding = "10px";
    textArea.readOnly = true;

    document.body.appendChild(textArea);
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);

    // Show instruction
    alert(
      "The text has been selected. Press Ctrl+C (or Cmd+C on Mac) to copy, then click OK.",
    );

    document.body.removeChild(textArea);
    return { success: true, method: "fallback" };
  } catch (error) {
    // Ultimate fallback - use prompt if available
    if (window.prompt) {
      window.prompt("Copy this text (Ctrl+C / Cmd+C):", text);
      return { success: true, method: "fallback" };
    }

    // If even prompt doesn't work, just alert
    const message = `Unable to copy automatically. Please copy this text manually:\n\n${text}`;
    alert(message);
    return { success: false, error: "All clipboard methods failed" };
  }
}

/**
 * Check if clipboard functionality is likely to work
 */
export function isClipboardSupported(): boolean {
  return !!(
    (navigator.clipboard && window.isSecureContext) ||
    document.execCommand ||
    document.queryCommandSupported?.("copy")
  );
}

/**
 * Get user-friendly message based on clipboard result
 */
export function getClipboardMessage(result: ClipboardResult): string {
  if (result.success) {
    switch (result.method) {
      case "clipboard-api":
        return "Copied to clipboard!";
      case "execCommand":
      case "manual-select":
        return "Copied to clipboard!";
      case "fallback":
        return "Please copy the text from the dialog";
      default:
        return "Copied successfully!";
    }
  } else {
    return "Unable to copy automatically. Please copy manually.";
  }
}
