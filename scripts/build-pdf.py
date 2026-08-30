import json
import os
from html import escape
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = ROOT / "data" / "library.json"
OUTPUT = ROOT / "output" / "pdf" / "法考主观题十年与2026每日一题阅读册.pdf"
FONT_PATH = Path("/System/Library/Fonts/Supplemental/Arial Unicode.ttf")

with DATA_PATH.open("r", encoding="utf-8") as source:
    data = json.load(source)

pdfmetrics.registerFont(TTFont("Fakao", str(FONT_PATH)))

INK = colors.HexColor("#17211C")
MUTED = colors.HexColor("#66716B")
GREEN = colors.HexColor("#174C38")
GREEN_2 = colors.HexColor("#2D7454")
GREEN_SOFT = colors.HexColor("#E5EEE7")
PAPER = colors.HexColor("#F4F1E8")
AMBER_SOFT = colors.HexColor("#F5EAD7")
AMBER = colors.HexColor("#7A5118")
LINE = colors.HexColor("#D8DDD9")
WHITE = colors.white

styles = getSampleStyleSheet()

def style(name, **kwargs):
    base = dict(fontName="Fakao", textColor=INK, wordWrap="CJK")
    base.update(kwargs)
    return ParagraphStyle(name, **base)

COVER_EYEBROW = style("CoverEyebrow", fontSize=9, leading=13, textColor=GREEN_2, spaceAfter=10)
COVER_TITLE = style("CoverTitle", fontSize=31, leading=42, textColor=INK, spaceAfter=18)
COVER_SUB = style("CoverSub", fontSize=12, leading=21, textColor=MUTED, spaceAfter=18)
H1 = style("H1", fontSize=22, leading=30, textColor=INK, spaceAfter=14)
H2 = style("H2", fontSize=16, leading=23, textColor=GREEN, spaceAfter=10)
H3 = style("H3", fontSize=11, leading=17, textColor=INK, spaceAfter=6)
BODY = style("Body", fontSize=9.1, leading=15.2, textColor=colors.HexColor("#3F4B45"), spaceAfter=7)
SMALL = style("Small", fontSize=7.4, leading=11.5, textColor=MUTED, spaceAfter=4)
LABEL = style("Label", fontSize=7.2, leading=10, textColor=GREEN_2, spaceAfter=4)
WHITE_LABEL = style("WhiteLabel", fontSize=8, leading=12, textColor=WHITE, alignment=TA_CENTER)
TOC = style("Toc", fontSize=9.4, leading=15, textColor=INK)
PITFALL = style("Pitfall", fontSize=8.5, leading=14, textColor=AMBER)

def para(text, paragraph_style=BODY):
    return Paragraph(escape(str(text)).replace("\n", "<br/>"), paragraph_style)

def pill(text, fill=GREEN_SOFT, text_color=GREEN):
    cell_style = style(f"Pill-{text}", fontSize=7, leading=9, textColor=text_color, alignment=TA_CENTER)
    table = Table([[Paragraph(escape(str(text)), cell_style)]], colWidths=[42 * mm], rowHeights=[7 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), fill),
        ("BOX", (0, 0), (-1, -1), 0.4, fill),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
    ]))
    return table

def text_box(label, text, fill=colors.white, border=LINE, label_color=GREEN_2):
    label_style = style(f"Label-{label}", fontSize=7.2, leading=10, textColor=label_color, spaceAfter=4)
    cell = [Paragraph(escape(label), label_style), para(text, BODY)]
    table = Table([[cell]], colWidths=[174 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), fill),
        ("BOX", (0, 0), (-1, -1), 0.55, border),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return table

def page_frame(canvas, doc):
    canvas.saveState()
    width, height = A4
    if doc.page == 1:
        canvas.setFillColor(GREEN)
        canvas.rect(0, height - 16 * mm, width, 16 * mm, fill=1, stroke=0)
    else:
        canvas.setStrokeColor(LINE)
        canvas.setLineWidth(0.5)
        canvas.line(18 * mm, height - 14 * mm, width - 18 * mm, height - 14 * mm)
        canvas.setFont("Fakao", 7)
        canvas.setFillColor(MUTED)
        canvas.drawString(18 * mm, height - 10.5 * mm, "法考主观题资料库｜只收主观题")
        canvas.drawRightString(width - 18 * mm, height - 10.5 * mm, f"核验截止 {data['metadata']['cutoff']}")
    canvas.setStrokeColor(LINE)
    canvas.line(18 * mm, 13 * mm, width - 18 * mm, 13 * mm)
    canvas.setFont("Fakao", 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 8.5 * mm, "学习整理用途 · 原题与原答案版权归各自来源方")
    canvas.drawRightString(width - 18 * mm, 8.5 * mm, str(doc.page))
    canvas.restoreState()

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
doc = SimpleDocTemplate(
    str(OUTPUT),
    pagesize=A4,
    rightMargin=18 * mm,
    leftMargin=18 * mm,
    topMargin=19 * mm,
    bottomMargin=18 * mm,
    title=data["metadata"]["title"],
    author="Codex 结构化整理",
    subject="2026 法考主观题每日一题与 2016—2025 主观题真题",
)

story = []

# Cover
story += [Spacer(1, 27 * mm), para("2026 SUBJECTIVE EXAM LIBRARY", COVER_EYEBROW), para("法考主观题\n每日一题与十年真题", COVER_TITLE), para("2026 公开主观日练 × 2016—2025 主观题真题\n题面摘要、来源答案、标准化作答框架、来源分级", COVER_SUB)]
cover_table = Table([
    [para(str(len(data["dailyQuestions"])), H1), para(str(sum(len(p["subQuestions"]) for p in data["historicalPapers"])), H1), para("10", H1)],
    [para("2026 日练", SMALL), para("历年分题", SMALL), para("覆盖年度", SMALL)],
], colWidths=[49 * mm] * 3)
cover_table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), GREEN_SOFT),
    ("BOX", (0, 0), (-1, -1), 0.5, LINE),
    ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("TOPPADDING", (0, 0), (-1, -1), 9),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
]))
story += [cover_table, Spacer(1, 15 * mm), text_box("本册口径", data["metadata"]["notice"], fill=PAPER), Spacer(1, 7 * mm), para(f"版本日期：{data['metadata']['cutoff']}｜离线打印版", SMALL), PageBreak()]

# Guide and compact contents
story += [para("如何使用这本册子", H1), para("推荐先遮住答案完成 8—12 分钟的限时作答，再按“争点是否完整、规范是否准确、涵摄是否贴合事实、结论是否明确”四项复盘。", BODY)]
guide_rows = [
    ["01", "题型门槛", "纯客观选择题不入库；主客观一体材料只保留能形成完整陈述的部分。"],
    ["02", "答案分层", "“来源答案摘要”忠实压缩公开解析；“主观作答框架”是本册标准化整理。"],
    ["03", "来源分层", "2016—2017 为官方公开；2018—2025 为回忆版；2026 日练优先教师或机构公开账号。"],
    ["04", "待核验项", "答案图片或公开页面尚不稳定时直接标注，不用推演内容冒充老师原答案。"],
]
guide_table = Table([[para(a, H2), para(b, H3), para(c, BODY)] for a, b, c in guide_rows], colWidths=[15 * mm, 33 * mm, 126 * mm])
guide_table.setStyle(TableStyle([
    ("BOX", (0, 0), (-1, -1), 0.5, LINE),
    ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
    ("BACKGROUND", (0, 0), (0, -1), GREEN_SOFT),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 7),
    ("RIGHTPADDING", (0, 0), (-1, -1), 7),
    ("TOPPADDING", (0, 0), (-1, -1), 8),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
]))
story += [guide_table, Spacer(1, 10 * mm), para("内容导航", H2)]
toc_rows = [
    ["第一编", "2026 主观题每日一题", "行政法 13 题；民法案例带写 9 题；民诉可主观作答 7 题"],
    ["第二编", "2016—2025 历年主观题", "57 个分题索引，官方版与回忆版分层"],
    ["附录", "机构覆盖与检索缺口", f"{len(data['coverage'])} 个机构/系列"],
]
toc_table = Table([[para(a, TOC), para(b, TOC), para(c, SMALL)] for a, b, c in toc_rows], colWidths=[24 * mm, 66 * mm, 84 * mm])
toc_table.setStyle(TableStyle([
    ("LINEBELOW", (0, 0), (-1, -1), 0.45, LINE),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("TOPPADDING", (0, 0), (-1, -1), 7),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
]))
story += [toc_table, PageBreak()]

# Daily questions grouped by subject
subjects = []
for question in data["dailyQuestions"]:
    if question["subject"] not in subjects:
        subjects.append(question["subject"])

for subject in subjects:
    questions = [q for q in data["dailyQuestions"] if q["subject"] == subject]
    story += [Spacer(1, 27 * mm), para("第一编 · 2026 公开主观日练", COVER_EYEBROW), para(subject, COVER_TITLE), para(f"共 {len(questions)} 题｜按公开日期或案例编号收录", COVER_SUB), text_box("本组作答建议", "先自己写出明确结论，再用规范依据连接事实。行政法注意行为定性与救济闭环；民法注意请求权基础、抗辩与责任范围。", fill=GREEN_SOFT), PageBreak()]
    for index, q in enumerate(questions):
        confidence_fill = AMBER_SOFT if "待" not in q["confidence"] else colors.HexColor("#F4E4DF")
        story += [
            pill(q["confidence"], fill=confidence_fill, text_color=AMBER if "待" not in q["confidence"] else colors.HexColor("#9B4236")),
            Spacer(1, 5 * mm),
            para(q["title"], H1),
            para(f"{q['date']}　{q['institution']} · {q['teacher']}　｜　{q['subject']} · {q['topic']}", SMALL),
            Spacer(1, 3 * mm),
            text_box("题面摘要", q["questionSummary"], fill=PAPER),
            Spacer(1, 4 * mm),
            text_box("来源答案摘要", q["sourceAnswer"], fill=colors.white),
            Spacer(1, 4 * mm),
            para("主观作答框架", H2),
        ]
        for step_index, step in enumerate(q["organizedAnswer"], 1):
            story.append(para(f"{step_index}. {step}", BODY))
        story += [
            Spacer(1, 2 * mm),
            text_box("易错提醒", q["pitfall"], fill=AMBER_SOFT, border=AMBER_SOFT, label_color=AMBER),
            Spacer(1, 4 * mm),
            para(f"公开来源：{q['sourceUrl']}　｜　核验状态：{q['answerState']}", SMALL),
            PageBreak(),
        ]

# Historical papers
story += [Spacer(1, 27 * mm), para("第二编", COVER_EYEBROW), para("2016—2025\n历年主观题真题", COVER_TITLE), para("2016—2017 官方公开｜2018—2025 公开回忆版", COVER_SUB), text_box("阅读提醒", "本编采用分题摘要，方便按科目和争点导航。官方题面或回忆题全文、老师原解析请通过每年来源链接核对。2022 年逐题公开索引不稳定，仅保留已核验整卷信息。", fill=GREEN_SOFT), PageBreak()]

for paper in data["historicalPapers"]:
    story += [pill(paper["confidence"], fill=GREEN_SOFT if paper["confidence"] == "官方公布" else AMBER_SOFT, text_color=GREEN if paper["confidence"] == "官方公布" else AMBER), Spacer(1, 4 * mm), para(paper["examName"], H1), para(paper["note"], SMALL), Spacer(1, 3 * mm)]
    for q in paper["subQuestions"]:
        box_content = [
            Paragraph(escape(f"第{q['no']}题 · {q['subject']} · {q['topic']}"), H3),
            Paragraph(escape("题面：" + q["prompt"]), BODY),
            Paragraph(escape("作答主线：" + q["answer"]), BODY),
        ]
        box = Table([[box_content]], colWidths=[174 * mm])
        box.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), colors.white),
            ("BOX", (0, 0), (-1, -1), 0.45, LINE),
            ("LEFTPADDING", (0, 0), (-1, -1), 9),
            ("RIGHTPADDING", (0, 0), (-1, -1), 9),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ]))
        story += [box, Spacer(1, 2.5 * mm)]
    story += [para(f"题目来源：{paper['sourceUrl']}", SMALL), para(f"答案来源：{paper['answerUrl']}", SMALL), PageBreak()]

# Coverage appendix
story += [para("附录｜机构覆盖与检索缺口", H1), para("只把能公开逐题核验的主观题放进正文。其余机构保留观察位；明确为客观题的系列单列排除。", BODY)]
coverage_rows = [[para("机构/系列", WHITE_LABEL), para("状态", WHITE_LABEL), para("核验说明", WHITE_LABEL)]]
for item in data["coverage"]:
    coverage_rows.append([para(item["institution"], BODY), para(item["status"], SMALL), para(item["detail"], SMALL)])
coverage_table = Table(coverage_rows, colWidths=[35 * mm, 24 * mm, 115 * mm], repeatRows=1)
coverage_table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), GREEN),
    ("BOX", (0, 0), (-1, -1), 0.5, LINE),
    ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PAPER]),
]))
story += [coverage_table, Spacer(1, 7 * mm), text_box("后续更新", "本资料库的数据源位于同一工作区的 data/library.json。新增公开主观题时，应先核验题型和来源，再补题面摘要、来源答案、主观作答框架与核验状态。", fill=GREEN_SOFT)]

doc.build(story, onFirstPage=page_frame, onLaterPages=page_frame)
print(OUTPUT)
