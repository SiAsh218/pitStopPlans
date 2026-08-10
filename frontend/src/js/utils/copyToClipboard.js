import { showWarning, showError, showSuccess } from "./myAlert.js";

export const copyToClipboard = async (html) => {
  try {
    if (
      navigator.clipboard &&
      navigator.clipboard.write &&
      window.ClipboardItem
    ) {
      const htmlBlob = new Blob([html], { type: "text/html" });

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;

      const plainText = tempDiv.innerText
        .replace(/\n\s*\n\s*\n+/g, "\n\n")
        .replace(/[ \t]+\n/g, "\n")
        .trim();

      const textBlob = new Blob([plainText], {
        type: "text/plain",
      });

      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": htmlBlob,
          "text/plain": textBlob,
        }),
      ]);
    } else {
      fallbackCopyRichText(html);
    }

    showSuccess("Data copied to clipboard");
  } catch (err) {
    console.error(err);
    showError(err?.message || "Failed to copy to clipboard");
  }
};

const fallbackCopyRichText = (html) => {
  const div = document.createElement("div");

  div.innerHTML = html;
  div.contentEditable = true;

  div.style.position = "fixed";
  div.style.left = "-9999px";

  document.body.appendChild(div);

  const range = document.createRange();
  range.selectNodeContents(div);

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  const success = document.execCommand("copy");

  selection.removeAllRanges();
  document.body.removeChild(div);

  return success;
};
