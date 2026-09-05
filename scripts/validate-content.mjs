import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildRecords } from "../lib/content-model.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const library = readJson("data/library.json");
const channels = readJson("data/channels.json");
const recitations = readJson("data/recitations.json");
const errors = [];

function requireValue(value, label) {
  if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) errors.push(`${label} 缺失`);
}

function requireUrl(value, label) {
  requireValue(value, label);
  if (value && !/^https:\/\//.test(value)) errors.push(`${label} 必须是 HTTPS 链接`);
}

function requireUnique(items, key, label) {
  const seen = new Set();
  for (const item of items) {
    if (seen.has(item[key])) errors.push(`${label} 重复：${item[key]}`);
    seen.add(item[key]);
  }
}

requireUnique(library.dailyQuestions, "id", "每日一题 ID");
const liDaily = library.dailyQuestions.filter((item) => item.id.startsWith("2026-lijia"));
const mengDaily = library.dailyQuestions.filter((item) => item.id.startsWith("2026-meng"));
const hanDaily = library.dailyQuestions.filter((item) => item.id.startsWith("2026-han"));
const pureDaily = [...liDaily, ...mengDaily];
if (liDaily.length !== 19) errors.push(`李佳纯主观每日一题应为 19 题，当前 ${liDaily.length} 题`);
if (mengDaily.length !== 12) errors.push(`孟献贵案例带写当前应接入 12 题，当前 ${mengDaily.length} 题`);
if (hanDaily.length !== 7) errors.push(`韩心怡主客一体主观题当前应接入 7 题，当前 ${hanDaily.length} 题`);
for (const item of library.dailyQuestions) {
  for (const field of ["id", "date", "institution", "teacher", "subject", "topic", "title", "questionSummary", "sourceAnswer", "answerState", "verifiedAt"]) {
    requireValue(item[field], `${item.id}.${field}`);
  }
  requireUrl(item.sourceUrl, `${item.id}.sourceUrl`);
  requireValue(item.questionText, `${item.id}.questionText`);
  requireValue(item.trainingQuestions, `${item.id}.trainingQuestions`);
  if ((item.questionText ?? "").length < 40) errors.push(`${item.id}.questionText 过短`);
}
const pureQuestionLinks = liDaily.filter((item) => item.sourceUrl.includes("/news/detail/")).length;
const pureAnswerLinks = liDaily.filter((item) => item.answerUrl?.includes("/news/detail/")).length;
if (pureQuestionLinks !== 19) errors.push(`李佳题目单篇链接应为 19/19，当前 ${pureQuestionLinks}/19`);
if (pureAnswerLinks !== 19) errors.push(`李佳已公布答案单篇链接应为 19/19，当前 ${pureAnswerLinks}/19`);

requireUnique(channels.channels, "id", "渠道 ID");
if (channels.channels.length < 18) errors.push(`渠道数量不应少于 18，当前 ${channels.channels.length}`);
for (const item of channels.channels) {
  for (const field of ["institution", "teacher", "platform", "series", "priority", "status", "contentType", "lastChecked", "nextCheck", "notes"]) {
    requireValue(item[field], `${item.id}.${field}`);
  }
  requireUrl(item.primaryUrl, `${item.id}.primaryUrl`);
}

requireUnique(recitations.records, "id", "带背 ID");
requireUnique(recitations.records, "order", "带背顺序");
if (recitations.records.length !== 15) errors.push(`法治思想带背应为 15 个专题，当前 ${recitations.records.length}`);
for (const item of recitations.records) {
  for (const field of ["topic", "question", "publishedGist", "memorization", "skeleton", "selfCheck", "verifiedAt", "status"]) {
    requireValue(item[field], `${item.id}.${field}`);
  }
  requireUrl(item.sourceUrl, `${item.id}.sourceUrl`);
  requireUrl(item.authorityUrl, `${item.id}.authorityUrl`);
}

const records = buildRecords(library);
if (records.length !== 95) errors.push(`结构化题目总数应为 95，当前 ${records.length}`);
for (const record of records) {
  requireValue(record.completeQuestion, `${record.id}.completeQuestion`);
  requireValue(record.trainingQuestions, `${record.id}.trainingQuestions`);
  requireValue(record.completeAnswer?.conclusion, `${record.id}.completeAnswer.conclusion`);
  requireValue(record.completeAnswer?.rules, `${record.id}.completeAnswer.rules`);
  requireValue(record.completeAnswer?.application, `${record.id}.completeAnswer.application`);
}

if (errors.length) {
  console.error(`内容校验失败（${errors.length} 项）：\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log(`内容校验通过：${pureDaily.length} 道纯主观训练，${hanDaily.length} 道主客一体主观题，${recitations.records.length} 个带背专题，${records.length} 道结构化主观题，${channels.channels.length} 个渠道。`);
