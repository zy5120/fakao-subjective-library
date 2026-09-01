# 法考主观题资料库

只收主观题的公开学习资料库：2026 主观题每日一题、法治思想带背，以及 2016—2025 历年主观题真题与完整原创作答。

## 在线访问

[打开 GitHub Pages 静态网页](https://zy5120.github.io/fakao-subjective-library/)

页面支持手机、iPad 和电脑自适应，可搜索、筛选、展开完整答案，并下载 PDF 阅读册与 Excel 资料库。

## 当前内容

- 2026 纯主观训练：23 题（李佳行政法 14 题；孟献贵民法案例带写 9 题）
- 2026 主客一体主观题：7 题（韩心怡民诉每日一问 Day 64—70）
- 2026 法治思想带背：15 个专题，已按“十二个坚持”更新
- 2016—2025 历年分题训练：57 条
- 覆盖年度：10 年
- 渠道注册与追踪：18 项

## 本地交付物

- `output/site/法考主观题资料库.html`：双击可离线使用的单文件网页
- `output/pdf/法考主观题私人自学册-完整重构题面与原创答案.pdf`：A4 学习版，含 87 组主观题、15 个带背专题、完整原创作答及逐题原题/公布答案入口
- `outputs/01a053f4-c3bb-7790-a432-e754bb16040b/法考主观题资料库.xlsx`：5 个工作表的原始资料库
- `output/收集与使用说明.md`：来源、口径和限制说明

## 收录口径

纯客观选择题不入库。主客观一体材料只保留可独立形成主观陈述的部分，并整理为“争点—规范—涵摄—结论”。2016—2017 标注官方公开，2018—2025 明确标注公开回忆版。

## 开发与更新

```bash
npm install
npm run dev
npm run build
```

内容数据分为 `data/library.json`、`data/recitations.json` 和 `data/channels.json`。更新数据后重新执行：

```bash
npm run export:static
node scripts/build-workbook.mjs
python3 scripts/build-pdf.py
python3 scripts/build-study-pdf.py
```

原题与原答案版权归各自来源方，本项目仅用于个人学习整理。
