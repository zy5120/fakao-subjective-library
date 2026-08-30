import path from "node:path";
import { fileURLToPath } from "node:url";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const target = path.join(root, "outputs/01a053f4-c3bb-7790-a432-e754bb16040b/法考主观题资料库.xlsx");
const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(target));

for (const [sheetId, range] of [
  ["总览", "A1:H15"],
  ["2026每日一题", "A1:P8"],
  ["历年真题", "A1:K8"],
  ["机构覆盖", "A1:E11"],
  ["字段说明", "A1:D10"],
]) {
  const result = await workbook.inspect({ kind: "region", sheetId, range, maxChars: 4500, tableMaxRows: 8, tableMaxCols: 16, tableMaxCellChars: 90 });
  console.log(result.ndjson ?? result);
}

const summary = workbook.worksheets.getItem("总览");
console.log("summary-values", JSON.stringify(summary.getRange("A4:B7").values));

const errors = [];
for (const sheetName of ["总览", "2026每日一题", "历年真题", "机构覆盖", "字段说明"]) {
  const sheet = workbook.worksheets.getItem(sheetName);
  sheet.getUsedRange(true).values.forEach((row, rowIndex) => row.forEach((value, colIndex) => {
    if (typeof value === "string" && /^#(REF!|DIV\/0!|VALUE!|NAME\?|N\/A|NUM!|NULL!)/.test(value)) errors.push(`${sheetName}!R${rowIndex + 1}C${colIndex + 1}:${value}`);
  }));
}
console.log("formula-errors", errors.length ? errors.join(" | ") : "none");
