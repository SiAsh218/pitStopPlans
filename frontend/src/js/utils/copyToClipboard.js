import { showWarning, showError, showSuccess } from "./myAlert.js";

export const copyToClipboard = async (html, text) => {
  try {
    if (
      navigator.clipboard &&
      navigator.clipboard.write &&
      window.ClipboardItem
    ) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], {
            type: "text/html",
          }),
          "text/plain": new Blob([text], {
            type: "text/plain",
          }),
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
