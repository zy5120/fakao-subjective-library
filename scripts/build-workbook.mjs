import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(await fs.readFile(path.join(root, "data/library.json"), "utf8"));
const outputDir = path.join(root, "outputs/01a053f4-c3bb-7790-a432-e754bb16040b");
const previewDir = path.join(root, "tmp/workbook-previews");
await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const workbook = Workbook.create();
const summary = workbook.worksheets.add("总览");
const daily = workbook.worksheets.add("2026每日一题");
const history = workbook.worksheets.add("历年真题");
const coverage = workbook.worksheets.add("机构覆盖");
const fields = workbook.worksheets.add("字段说明");
const colors = {
  green: "#174C38",
  greenSoft: "#E5EEE7",
  paper: "#F4F1E8",
  ink: "#17211C",
  muted: "#66716B",
  line: "#D8DDD9",
  amberSoft: "#F5EAD7",
};

function setTitle(sheet, title, subtitle, lastColumn) {
  sheet.showGridLines = false;
  const titleRange = sheet.getRange(`A1:${lastColumn}1`);
  titleRange.merge();
  titleRange.values = [[title]];
  titleRange.format = {
    fill: colors.green,
    font: { bold: true, color: "#FFFFFF", size: 18 },
    verticalAlignment: "center",
  };
  titleRange.format.rowHeight = 34;
  const subtitleRange = sheet.getRange(`A2:${lastColumn}2`);
  subtitleRange.merge();
  subtitleRange.values = [[subtitle]];
  subtitleRange.format = {
    fill: colors.greenSoft,
    font: { color: colors.green, size: 10 },
    verticalAlignment: "center",
    wrapText: true,
  };
  subtitleRange.format.rowHeight = 30;
}

function styleDataSheet(sheet, lastColumn, lastRow) {
  const header = sheet.getRange(`A3:${lastColumn}3`);
  header.format = {
    fill: "#DCE7E0",
    font: { bold: true, color: colors.ink, size: 10 },
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "all", style: "thin", color: colors.line },
  };
  header.format.rowHeight = 28;
  if (lastRow >= 4) {
    const body = sheet.getRange(`A4:${lastColumn}${lastRow}`);
    body.format = {
      font: { color: colors.ink, size: 9 },
      verticalAlignment: "top",
      wrapText: true,
      borders: { preset: "all", style: "thin", color: colors.line },
    };
    body.format.rowHeight = 54;
  }
  sheet.freezePanes.freezeRows(3);
}

setTitle(summary, "法考主观题资料库｜总览", `核验截止 ${data.metadata.cutoff}｜只收主观题；主客观一体材料仅保留可形成主观陈述的部分`, "H");
summary.getRange("A4:A7").values = [["2026 日练条目"], ["历年分题索引"], ["结构化条目合计"], ["追踪机构/系列"]];
summary.getRange("B4").formulas = [["=COUNTA('2026每日一题'!A4:A200)"]];
summary.getRange("B5").formulas = [["=COUNTA('历年真题'!A4:A300)"]];
summary.getRange("B6").formulas = [["=SUM(B4:B5)"]];
summary.getRange("B7").formulas = [["=COUNTA('机构覆盖'!A4:A100)"]];
summary.getRange("A4:B7").format = { borders: { preset: "all", style: "thin", color: colors.line }, verticalAlignment: "center" };
summary.getRange("A4:A7").format.fill = colors.greenSoft;
summary.getRange("A4:A7").format.font = { bold: true, color: colors.green };
summary.getRange("B4:B7").format = { font: { bold: true, color: colors.ink, size: 15 }, horizontalAlignment: "center" };
summary.getRange("D4:H4").merge();
summary.getRange("D4:H4").values = [["使用说明"]];
summary.getRange("D4:H4").format = { fill: colors.amberSoft, font: { bold: true, color: "#75501A" } };
summary.getRange("D5:H7").merge();
summary.getRange("D5:H7").values = [[data.metadata.notice]];
summary.getRange("D5:H7").format = { wrapText: true, verticalAlignment: "top", font: { color: colors.muted, size: 10 }, borders: { preset: "outside", style: "thin", color: colors.line } };
summary.getRange("A10:D10").values = [["资料层", "时间/范围", "题面性质", "建议用法"]];
summary.getRange("A11:D13").values = [
  ["2026 每日一题", "2026-01-01 至 2026-08-31", "教师/机构公开主观训练", "按科目与争点筛选，先答后看框架"],
  ["2016—2017", "国家司法考试试卷四", "官方公开", "摘要导航后回原页核对完整题面"],
  ["2018—2025", "国家统一法律职业资格考试", "公开回忆版", "对卷别和争点保留条件式表述"],
];
summary.getRange("A10:D10").format = { fill: colors.green, font: { bold: true, color: "#FFFFFF" }, borders: { preset: "all", style: "thin", color: colors.line } };
summary.getRange("A11:D13").format = { wrapText: true, verticalAlignment: "top", borders: { preset: "all", style: "thin", color: colors.line }, font: { size: 10 } };
summary.getRange("A15:H15").merge();
summary.getRange("A15:H15").values = [["来源原则：官方优先；公开账号逐题核验；回忆版明确标记；受限平台不绕过登录或付费。"]];
summary.getRange("A15:H15").format = { fill: colors.paper, font: { italic: true, color: colors.muted, size: 9 }, wrapText: true };
summary.getRange("A:H").format.columnWidth = 16;
summary.getRange("A:A").format.columnWidth = 20;
summary.getRange("B:B").format.columnWidth = 14;
summary.getRange("D:H").format.columnWidth = 18;
summary.getRange("A4:H15").format.rowHeight = 27;

setTitle(daily, "2026 主观题每日一题｜公开核验库", "来源答案摘要与本库主观作答框架分列；纯客观题不入库", "P");
const dailyHeaders = ["ID", "日期", "机构", "老师", "平台", "科目", "争点", "标题", "题面摘要", "来源答案摘要", "主观作答框架", "易错点", "答案状态", "可信度", "来源链接", "核验日"];
const dailyRows = data.dailyQuestions.map((q) => [q.id, q.date, q.institution, q.teacher, q.platform, q.subject, q.topic, q.title, q.questionSummary, q.sourceAnswer, q.organizedAnswer.map((step, index) => `${index + 1}. ${step}`).join("\n"), q.pitfall, q.answerState, q.confidence, q.sourceUrl, q.verifiedAt]);
daily.getRange(`A3:P${dailyRows.length + 3}`).values = [dailyHeaders, ...dailyRows];
styleDataSheet(daily, "P", dailyRows.length + 3);
daily.tables.add(`A3:P${dailyRows.length + 3}`, true, "DailyQuestionsTable").style = "TableStyleMedium4";
const dailyWidths = [18, 12, 13, 10, 18, 11, 24, 30, 46, 52, 56, 30, 16, 22, 36, 12];
dailyWidths.forEach((width, index) => daily.getRangeByIndexes(0, index, dailyRows.length + 3, 1).format.columnWidth = width);

setTitle(history, "2016—2025 主观题真题｜分题索引", "2016—2017 为官方公开；2018—2025 为公开回忆版，摘要不替代完整题面", "K");
const historyHeaders = ["年份", "考试名称", "题号", "科目", "争点", "题面摘要", "答案/作答主线", "可信度", "题目来源", "答案来源", "卷别说明"];
const historyRows = data.historicalPapers.flatMap((paper) => paper.subQuestions.map((q) => [paper.year, paper.examName, q.no, q.subject, q.topic, q.prompt, q.answer, paper.confidence, paper.sourceUrl, paper.answerUrl, paper.note]));
history.getRange(`A3:K${historyRows.length + 3}`).values = [historyHeaders, ...historyRows];
styleDataSheet(history, "K", historyRows.length + 3);
history.tables.add(`A3:K${historyRows.length + 3}`, true, "HistoricalQuestionsTable").style = "TableStyleMedium4";
const historyWidths = [9, 31, 10, 18, 27, 48, 54, 22, 36, 36, 42];
historyWidths.forEach((width, index) => history.getRangeByIndexes(0, index, historyRows.length + 3, 1).format.columnWidth = width);

setTitle(coverage, "2026 主观题机构覆盖与检索缺口", "未检索到公开归档不等于机构没有课程；客观题系列单列排除", "E");
const coverageHeaders = ["机构/系列", "老师", "状态", "核验说明", "公开依据"];
const coverageRows = data.coverage.map((item) => [item.institution, item.teachers, item.status, item.detail, item.sourceUrl]);
coverage.getRange(`A3:E${coverageRows.length + 3}`).values = [coverageHeaders, ...coverageRows];
styleDataSheet(coverage, "E", coverageRows.length + 3);
coverage.tables.add(`A3:E${coverageRows.length + 3}`, true, "CoverageTable").style = "TableStyleMedium4";
[20, 30, 15, 68, 42].forEach((width, index) => coverage.getRangeByIndexes(0, index, coverageRows.length + 3, 1).format.columnWidth = width);

setTitle(fields, "字段与可信度说明", "用于后续人工追加、核验和增量更新", "D");
const fieldRows = [
  ["字段", "含义", "填写规则", "示例"],
  ["题面摘要", "公开题目的结构化概述", "避免大段转载；保留关键事实与设问", "谁是被告、行为性质如何判断"],
  ["来源答案摘要", "老师或公开解析的压缩", "忠实于来源；存在分歧时明确列出", "主流观点……另一观点……"],
  ["主观作答框架", "便于落笔的标准化表达", "争点—规范—涵摄—结论", "先识别行为，再判断依据……"],
  ["官方公布", "司法行政机关正式公开", "当前主要适用于 2016—2017", "2017 司法考试试卷四"],
  ["回忆版·多源核验", "考生回忆与教师解析可相互印证", "不得称为官方题面或标准答案", "2018—2025"],
  ["题面已核验·答案待核验", "题目可见但答案尚未稳定获取", "不推测教师结论", "2026 李佳第 13 题"],
  ["持续追踪", "尚无可逐题核验的公开主观题归档", "只进入覆盖表，不进入题库正文", "课程内或登录后可见"],
];
fields.getRange(`A3:D${fieldRows.length + 2}`).values = fieldRows;
styleDataSheet(fields, "D", fieldRows.length + 2);
fields.tables.add(`A3:D${fieldRows.length + 2}`, true, "FieldGuideTable").style = "TableStyleMedium4";
[26, 31, 55, 40].forEach((width, index) => fields.getRangeByIndexes(0, index, fieldRows.length + 2, 1).format.columnWidth = width);

const renderSpecs = [
  ["总览", "A1:H15", "overview.png"],
  ["2026每日一题", "A1:P14", "daily.png"],
  ["历年真题", "A1:K15", "history.png"],
  ["机构覆盖", `A1:E${coverageRows.length + 3}`, "coverage.png"],
  ["字段说明", `A1:D${fieldRows.length + 2}`, "fields.png"],
];

for (const [sheetName, range, filename] of renderSpecs) {
  const preview = await workbook.render({ sheetName, range, scale: 1, format: "png" });
  await fs.writeFile(path.join(previewDir, filename), new Uint8Array(await preview.arrayBuffer()));
}

const inspection = await workbook.inspect({ kind: "sheet", include: "id,name", maxChars: 5000 });
console.log(inspection.ndjson ?? inspection);

let errors = [];
for (const sheetName of ["总览", "2026每日一题", "历年真题", "机构覆盖", "字段说明"]) {
  const sheet = workbook.worksheets.getItem(sheetName);
  const values = sheet.getUsedRange(true).values;
  values.forEach((row, rowIndex) => row.forEach((value, colIndex) => {
    if (typeof value === "string" && /^#(REF!|DIV\/0!|VALUE!|NAME\?|N\/A|NUM!|NULL!)/.test(value)) {
      errors.push(`${sheetName}!R${rowIndex + 1}C${colIndex + 1}:${value}`);
    }
  }));
}
if (errors.length) throw new Error(`发现公式错误：${errors.join(", ")}`);

const output = await SpreadsheetFile.exportXlsx(workbook);
const target = path.join(outputDir, "法考主观题资料库.xlsx");
await output.save(target);
console.log(target);
