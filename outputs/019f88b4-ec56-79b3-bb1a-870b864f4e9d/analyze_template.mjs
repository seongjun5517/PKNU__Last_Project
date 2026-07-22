import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const source = "C:/pknu_202601/day93부터_최종프로젝트(제출 관련 양식)/00_02_산출물(양식)/01_요구사항정의서.xlsx";
const outputDir = "C:/pknu_202601/Last_project/outputs/019f88b4-ec56-79b3-bb1a-870b864f4e9d/template_qa";
await fs.mkdir(outputDir, { recursive: true });

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(source));
const overview = await workbook.inspect({
  kind: "workbook,sheet,table,drawing,definedName",
  maxChars: 12000,
  tableMaxRows: 12,
  tableMaxCols: 12,
  tableMaxCellChars: 160,
});
console.log("OVERVIEW");
console.log(overview.ndjson);

const sheets = workbook.worksheets.items;
for (let i = 0; i < sheets.length; i += 1) {
  const sheet = sheets[i];
  const used = sheet.getUsedRange();
  console.log(`SHEET ${i + 1}: ${sheet.name}`);
  if (used) {
    const region = await workbook.inspect({
      kind: "region,computedStyle,formula",
      sheetId: sheet.name,
      range: used.address,
      maxChars: 18000,
      tableMaxRows: 100,
      tableMaxCols: 30,
      tableMaxCellChars: 300,
      options: { maxResults: 200 },
    });
    console.log(region.ndjson);
  }
  const preview = await workbook.render({
    sheetName: sheet.name,
    autoCrop: "all",
    scale: 1.5,
    format: "png",
  });
  const safeName = sheet.name.replace(/[\\/:*?"<>|]/g, "_");
  await fs.writeFile(path.join(outputDir, `${String(i + 1).padStart(2, "0")}_${safeName}.png`), new Uint8Array(await preview.arrayBuffer()));
}
