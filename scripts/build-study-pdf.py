import json
from html import escape
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "data" / "library.json").read_text(encoding="utf-8"))
RECITATIONS = json.loads((ROOT / "data" / "recitations.json").read_text(encoding="utf-8"))["records"]
CHANNELS = json.loads((ROOT / "data" / "channels.json").read_text(encoding="utf-8"))["channels"]
OUTPUT = ROOT / "output" / "pdf" / "法考主观题私人自学册-完整重构题面与原创答案.pdf"
FONT_PATH = Path("/System/Library/Fonts/Supplemental/Arial Unicode.ttf")

pdfmetrics.registerFont(TTFont("Fakao", str(FONT_PATH)))

INK = colors.HexColor("#17211C")
TEXT = colors.HexColor("#3F4B45")
MUTED = colors.HexColor("#66716B")
GREEN = colors.HexColor("#174C38")
GREEN_2 = colors.HexColor("#2D7454")
GREEN_SOFT = colors.HexColor("#E5EEE7")
PAPER = colors.HexColor("#F5F3EC")
AMBER = colors.HexColor("#7A5118")
AMBER_SOFT = colors.HexColor("#F5EAD7")
RED = colors.HexColor("#93473C")
RED_SOFT = colors.HexColor("#F4E4DF")
LINE = colors.HexColor("#D8DDD9")

getSampleStyleSheet()


def make_style(name, **kwargs):
    base = dict(fontName="Fakao", textColor=INK, wordWrap="CJK")
    base.update(kwargs)
    return ParagraphStyle(name, **base)


COVER_KICKER = make_style("CoverKicker", fontSize=9, leading=13, textColor=GREEN_2, spaceAfter=10)
COVER_TITLE = make_style("CoverTitle", fontSize=29, leading=40, textColor=INK, spaceAfter=18)
COVER_SUB = make_style("CoverSub", fontSize=11.5, leading=20, textColor=MUTED, spaceAfter=12)
H1 = make_style("H1", fontSize=19, leading=25, textColor=INK, spaceAfter=8)
H2 = make_style("H2", fontSize=13.5, leading=18, textColor=GREEN, spaceAfter=6)
H3 = make_style("H3", fontSize=10.2, leading=13.8, textColor=INK, spaceAfter=2.5)
BODY = make_style("Body", fontSize=8.7, leading=13.2, textColor=TEXT, spaceAfter=3.5)
BODY_TIGHT = make_style("BodyTight", fontSize=8.2, leading=12.1, textColor=TEXT, spaceAfter=2.5)
SMALL = make_style("Small", fontSize=7.2, leading=10.3, textColor=MUTED, spaceAfter=2)
LABEL = make_style("Label", fontSize=7.2, leading=10, textColor=GREEN_2, spaceAfter=4)
WHITE = make_style("White", fontSize=8, leading=11, textColor=colors.white, alignment=TA_CENTER)


def paragraph(text, style=BODY):
    return Paragraph(escape(str(text)).replace("\n", "<br/>"), style)


def box(label, content, fill=colors.white, border=LINE, label_color=GREEN_2):
    label_style = make_style(f"Label-{label}-{label_color}", fontSize=7.2, leading=10, textColor=label_color, spaceAfter=4)
    items = [Paragraph(escape(label), label_style)]
    if isinstance(content, list):
        items.extend(content)
    else:
        items.append(paragraph(content))
    table = Table([[items]], colWidths=[174 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), fill),
        ("BOX", (0, 0), (-1, -1), 0.55, border),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
        ("RIGHTPADDING", (0, 0), (-1, -1), 10),
        ("TOPPADDING", (0, 0), (-1, -1), 5.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5.5),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ]))
    return table


def tag(text, status=False):
    is_pending = "待" in text
    fill = RED_SOFT if is_pending else (AMBER_SOFT if status else GREEN_SOFT)
    text_color = RED if is_pending else (AMBER if status else GREEN)
    pill_style = make_style(f"Tag-{text}", fontSize=7, leading=9, textColor=text_color, alignment=TA_CENTER)
    table = Table([[Paragraph(escape(text), pill_style)]], colWidths=[48 * mm], rowHeights=[7 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), fill),
        ("BOX", (0, 0), (-1, -1), 0.4, fill),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return table


def source_link_box(record):
    source_url = escape(record["source_url"], quote=True)
    answer_url = escape(record["answer_url"], quote=True)
    source = Paragraph(f'<link href="{source_url}" color="#2D7454"><u>打开题目发布原页</u></link>', SMALL)
    answer = Paragraph(f'<link href="{answer_url}" color="#2D7454"><u>打开公布答案／解析原页</u></link>', SMALL)
    return box("公开原题与公布答案留存入口", [
        source,
        answer,
        paragraph(record["note"], SMALL),
        paragraph("本册正文为重构题面与原创作答；发布者公布的原题、原答案不作删改转录，以上链接用于返回原页核对。", SMALL),
    ], fill=AMBER_SOFT, border=AMBER_SOFT, label_color=AMBER)


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
        canvas.drawString(18 * mm, height - 10.5 * mm, "法考主观题私人自学册｜完整重构题面与原创答案")
        canvas.drawRightString(width - 18 * mm, height - 10.5 * mm, f"资料核验截止 {DATA['metadata']['cutoff']}")
    canvas.setStrokeColor(LINE)
    canvas.line(18 * mm, 13 * mm, width - 18 * mm, 13 * mm)
    canvas.setFont("Fakao", 7)
    canvas.setFillColor(MUTED)
    canvas.drawString(18 * mm, 8.5 * mm, "私人学习使用｜公开来源链接保留在每题末尾")
    canvas.drawRightString(width - 18 * mm, 8.5 * mm, str(doc.page))
    canvas.restoreState()


def question_prompts(subject, topic):
    combined = subject + topic
    if "习近平" in subject or "法理" in subject:
        return [
            "提炼材料体现的中心法治命题，并给出明确总论点。",
            "从理论依据、制度要求和实践路径三个层次展开论证。",
            "结合材料而非照抄材料，说明各分论点之间的逻辑关系。",
            "形成具有开头、分论点和结论的完整论述。",
        ]
    if "刑事诉讼" in subject:
        return [
            f"围绕“{topic}”逐项判断有关侦查、审查起诉或审判行为是否合法。",
            "区分证据资格、证明力和证明标准，并说明违法取证的处理方式。",
            "确定有权机关、法定程序、期限以及当事人的救济途径。",
            "若事实存在两种可能，分别写出裁判机关应采取的处理方式。",
        ]
    if "民事诉讼" in subject and "民法" not in subject:
        return [
            f"围绕“{topic}”确定管辖法院、适格当事人和程序条件。",
            "分配证明责任并判断现有证据能否达到证明标准。",
            "说明程序违法的补救方式及法院应作出的裁判。",
            "实体责任与程序结论应当分别如何表述？",
        ]
    if "刑法" in subject:
        return [
            f"围绕“{topic}”按行为发生顺序逐段判断行为性质。",
            "分别审查各行为人的主观故意、客观行为、犯罪形态和结果归责。",
            "存在共同犯罪、认识错误、因果关系或罪数争议时，分别说明不同观点。",
            "最后汇总每名行为人的罪名、形态和应当评价的量刑情节。",
        ]
    if "商法" in subject:
        return [
            f"围绕“{topic}”识别公司、股东、董监高、债权人之间的法律关系。",
            "区分内部决议或协议的效力与对外交易效力。",
            "判断出资、股权、担保或破产程序中的责任主体和权利顺位。",
            "说明请求权基础、程序路径以及最终处理结论。",
        ]
    if "行政法" in subject:
        return [
            f"围绕“{topic}”先确定行政行为性质及其法律依据。",
            "判断行政主体、实施机关、复议机关和行政诉讼被告。",
            "依权限、事实证据、法律适用、程序和裁量五个层次审查合法性。",
            "说明复议诉讼路径、起诉条件以及法院应作出的裁判。",
        ]
    return [
        f"围绕“{topic}”画出法律关系并确定请求权基础。",
        "分别判断法律行为效力、履行抗辩、担保或物权变动。",
        "计算或确定责任范围，并说明继续履行、解除、赔偿等救济。",
        "存在事实不足或观点分歧时，分别作出条件式结论。",
    ]


def rule_text(subject, topic):
    combined = subject + topic
    rules = []
    if "政府信息公开" in combined:
        rules.append("政府信息公开案件应先判断申请对象是否属于行政机关在履职中制作、获取并保存的信息，再审查主动公开、依申请公开、不予公开和信息不存在等答复类型。答复机关负有检索、说明理由和遵守期限的义务；救济路径还要单独判断是否属于行政复议前置。")
    if any(word in combined for word in ["被告", "委托", "授权", "职权变更"]):
        rules.append("行政主体与被告不能只看文件用语或内部审批过程。法律、法规或规章授权的组织以自己名义承担责任；行政委托由委托机关承担责任；职权调整后原则上由继续行使职权的机关承受诉讼责任。")
    if "行政强制" in combined or "强制拆" in combined:
        rules.append("行政强制须有法定权限和依据，并遵守批准、告知、催告、听取陈述申辩、作出强制执行决定及公告等程序。强制措施与行政强制执行应分开定性，违法实施造成损害的再进入行政赔偿审查。")
    if "行政处罚" in combined or "未成年人" in combined:
        rules.append("行政处罚需同时审查处罚设定依据、管辖和执法资格、事实证据、告知与听证、陈述申辩、裁量和决定送达。已满十四周岁不满十八周岁的，应依法从轻或减轻处罚；现场制止措施与最终处罚分开评价。")
    if "行政许可" in combined or "许可证" in combined or "驾驶证" in combined:
        rules.append("行政许可的不利变动应依原因区分撤销、撤回、注销与吊销。违法取得通常进入撤销，依据变化或公共利益需要可能适用撤回，法定终止情形适用注销，具有惩戒性的吊销才属于行政处罚；既有许可还涉及法不溯及既往和信赖保护。")
    if "原告资格" in combined:
        rules.append("行政诉讼原告资格要求行政行为与所主张权益之间存在法律上的利害关系。应审查相关规范是否旨在保护该权益、行政行为是否直接增减其权利义务，不能仅凭一般经济影响认定。")
    if "定金" in combined:
        rules.append("定金须实际交付并受法定比例限制。因给付定金一方原因导致合同目的不能实现的，无权请求返还；因收受方原因导致的，双倍返还；因不可归责于双方的事由未能订约或履行，不适用罚则，返还原定金。")
    if "违约金" in combined:
        rules.append("约定违约金过分高于损失时，法院或仲裁机构可依当事人请求适当减少。判断应以实际损失为基础，综合履行程度、过错、预期利益和诚信原则，不存在机械固定的法定调整比例。")
    if "广告" in combined or "宣传" in combined or "沙盘" in combined:
        rules.append("商品房宣传只有在内容具体确定、涉及开发规划范围内房屋或相关设施，并对订约和价格具有重大影响时，才可进入合同内容。违反该承诺构成违约；不满足要约标准时仍可审查欺诈或缔约过失。")
    if "租赁" in combined:
        rules.append("房屋租赁登记备案原则上不是合同生效要件；租赁期限超过二十年的，超过部分无效。非金钱债务原则上可请求继续履行，但法律上或事实上不能履行、标的不适于强制履行或费用过高等情形除外。")
    if "情势变更" in combined:
        rules.append("合同基础条件发生订约时无法预见、非商业风险的重大变化，继续履行对一方明显不公平的，受不利影响方可请求重新协商；合理期限内协商不成，可请求法院或仲裁机构变更或解除。")
    if any(word in combined for word in ["合同", "借贷", "担保", "抵押", "质押", "以物抵债", "工程"]):
        rules.append("民商事合同题应从合同成立与效力、履行状态、抗辩和保全、违约救济及担保顺位依次审查。担保责任依主债权范围和担保设立、公示决定；以物抵债或让与担保应区分清偿安排与流押流质。")
    if any(word in combined for word in ["公司", "股东", "股权", "出资", "董事", "资本", "破产", "重整"]):
        rules.append("公司法题需区分公司人格、股东有限责任、出资义务、决议效力和董监高义务。内部限制通常不能当然对抗善意相对人；进入破产或重整后，个别清偿转为集中申报，担保权和取回权依其成立要件及标的归属判断。")
    if "共同" in combined or "共犯" in combined:
        rules.append("共同犯罪以共同故意和共同实行、帮助或教唆行为为基础。各共犯仅对共同故意范围内及可归责的结果负责；超出共同故意的过限行为原则上由实施者单独承担。")
    if any(word in combined for word in ["错误", "因果", "死亡", "结果归责"]):
        rules.append("结果犯应审查行为是否制造法所不允许的风险、风险是否在结果中实现以及是否存在异常介入因素。认识错误须区分对象错误、打击错误和因果进程错误，再判断是否阻却故意既遂或影响罪数。")
    if any(word in combined for word in ["证据", "非法", "合理怀疑", "证明责任", "鉴定"]):
        rules.append("证据审查应区分证据能力、证明力和证明标准。非法言词证据依法排除，物证书证的违法取得结合严重程度与补正解释判断；刑事定罪须达到事实清楚、证据确实充分并排除合理怀疑。")
    if any(word in combined for word in ["二审", "上诉", "抗诉", "再审"]):
        rules.append("刑事二审实行全面审查；仅被告一方上诉时受上诉不加刑限制，但检察机关抗诉或自诉人上诉等法定例外另论。再审启动、改判和发回重审应分别依据事实证据、法律适用与程序违法程度。")
    if any(word in combined for word in ["管辖", "送达", "重复起诉", "当事人"]):
        rules.append("民事程序问题应先处理主管与管辖，再处理当事人、诉讼标的和请求。重复起诉通常要求前后诉当事人、诉讼标的和请求实质相同；送达和缺席审判必须以合法程序和充分保障诉权为前提。")
    if "习近平" in subject or "法理" in subject:
        rules.append("论述题应形成“总论点-理论依据-制度要求-实践路径-结论”的结构。材料用于提炼命题和联系实践，不能整段照抄；每个分论点都要回答为什么、如何落实以及产生何种法治效果。")
    if not rules:
        rules.append("本题应以法律关系和争点为主线，先给结论，再写规范依据，随后把题面事实逐一纳入构成要件，最后处理责任范围、程序路径和可能的观点分歧。")
    return rules


def build_answer(subject, topic, prompt, core_answer, source_state, organized_answer=None):
    rules = rule_text(subject, topic)
    answer = [
        paragraph("一、结论先行", H3),
        paragraph(core_answer),
        paragraph("二、适用规则与审查标准", H3),
    ]
    for index, rule in enumerate(rules, 1):
        answer.append(paragraph(f"{index}. {rule}", BODY_TIGHT))
    answer.append(paragraph("三、事实涵摄", H3))
    if organized_answer:
        for index, point in enumerate(organized_answer, 1):
            answer.append(paragraph(f"{index}. {point}", BODY_TIGHT))
    else:
        answer.append(paragraph(f"应紧扣题面已经给出的事实：“{prompt}”进行判断。作答时把每一个事实放入相应构成要件：能够直接满足要件的，明确写明成立；事实不足的，不补造事实，而是分别写出“若……则……”的条件式结论。"))
    answer.extend([
        paragraph("四、争议与条件分支", H3),
        paragraph("如题面事实或公开回忆存在两种可能，应先写主流结论，再分别使用“若……则……”处理条件分支。无论采取何种观点，都须保持前提、规则、涵摄和结论一致。"),
    ])
    return answer


def historical_records():
    result = []
    for paper in DATA["historicalPapers"]:
        for item in paper["subQuestions"]:
            result.append({
                "id": f"{paper['year']}-{item['no']}",
                "year": paper["year"],
                "date": str(paper["year"]),
                "institution": paper["examName"],
                "teacher": "历年真题",
                "platform": "官方公开" if paper["year"] <= 2017 else "公开回忆与教师解析",
                "subject": item["subject"],
                "topic": item["topic"],
                "title": f"{paper['year']} 年第{item['no']}题｜{item['topic']}",
                "question": item["prompt"],
                "core_answer": item["answer"],
                "confidence": paper["confidence"],
                "source_url": paper["sourceUrl"],
                "answer_url": paper["answerUrl"],
                "note": paper["note"],
            })
    return result


daily = []
for item in DATA["dailyQuestions"]:
    daily.append({
        "id": item["id"],
        "year": 2026,
        "date": item["date"],
        "institution": item["institution"],
        "teacher": item["teacher"],
        "platform": item["platform"],
        "subject": item["subject"],
        "topic": item["topic"],
        "title": item["title"],
        "question": item.get("questionText", item["questionSummary"]),
        "training_questions": item.get("trainingQuestions", question_prompts(item["subject"], item["topic"])),
        "core_answer": item["sourceAnswer"],
        "organized_answer": item["organizedAnswer"],
        "confidence": item["confidence"],
        "source_url": item["sourceUrl"],
        "answer_url": item.get("answerUrl", item["sourceUrl"]),
        "note": f"答案核验状态：{item['answerState']}。易错点：{item['pitfall']}",
    })

history = historical_records()
all_records = daily + history

OUTPUT.parent.mkdir(parents=True, exist_ok=True)
doc = SimpleDocTemplate(
    str(OUTPUT),
    pagesize=A4,
    leftMargin=18 * mm,
    rightMargin=18 * mm,
    topMargin=18 * mm,
    bottomMargin=17.5 * mm,
    title="法考主观题私人自学册-完整重构题面与原创答案",
    author="Codex 公开来源整理与原创解析",
    subject="2026 主观题日练、法治思想带背及 2016-2025 历年主观题私人学习资料",
)

story = []
story += [
    Spacer(1, 28 * mm),
    paragraph("PRIVATE STUDY EDITION", COVER_KICKER),
    paragraph("法考主观题\n私人自学册", COVER_TITLE),
    paragraph("2026 公开日练 × 法治思想带背 × 2016-2025 历年真题\n完整训练题面 · 明确设问 · 完整原创答案 · 来源入口", COVER_SUB),
]
count_table = Table([
    [paragraph(str(len(daily)), H1), paragraph(str(len(RECITATIONS)), H1), paragraph(str(len(history)), H1), paragraph(str(len(all_records) + len(RECITATIONS)), H1)],
    [paragraph("2026 日练", SMALL), paragraph("法治思想带背", SMALL), paragraph("历年分题", SMALL), paragraph("合计", SMALL)],
], colWidths=[42 * mm] * 4)
count_table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, -1), GREEN_SOFT),
    ("BOX", (0, 0), (-1, -1), 0.5, LINE),
    ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("TOPPADDING", (0, 0), (-1, -1), 9),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
]))
story += [count_table, Spacer(1, 13 * mm), box("版本说明", [
    paragraph("每道题完整保留可核验的案情事实与设问，并提供完整原创参考答案；法治思想带背以最新权威资料校准。"),
    paragraph("发布者公布答案的原始页面入口保留在每题前部，便于逐项核对；本册整理稿与发布者原文分层呈现。", BODY_TIGHT),
], fill=PAPER), Spacer(1, 6 * mm), paragraph(f"资料核验截止：{DATA['metadata']['cutoff']}｜私人学习版", SMALL), PageBreak()]

story += [paragraph("使用方法", H1), paragraph("建议先只阅读“完整重构题面”和“训练设问”，用 8-15 分钟写出自己的答案，再继续阅读下方原创答案。对于回忆版真题，题面事实不足时练习条件式作答，而不是自行补造事实。", BODY)]
method_rows = [
    ["第一步", "识别争点", "把问题转换为行为性质、构成要件、程序条件或救济方式。"],
    ["第二步", "结论先行", "每一问第一句先写成立或不成立、合法或违法、支持或不支持。"],
    ["第三步", "规范与涵摄", "规则必须与事实逐项对应，不能只有法条，也不能只有结论。"],
    ["第四步", "处理分歧", "先写主流观点，再说明另一观点及其前提，最后明确自己采用的结论。"],
]
method_table = Table([[paragraph(a, H3), paragraph(b, H3), paragraph(c, BODY_TIGHT)] for a, b, c in method_rows], colWidths=[25 * mm, 34 * mm, 115 * mm])
method_table.setStyle(TableStyle([
    ("BOX", (0, 0), (-1, -1), 0.5, LINE),
    ("INNERGRID", (0, 0), (-1, -1), 0.5, LINE),
    ("BACKGROUND", (0, 0), (0, -1), GREEN_SOFT),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 7),
    ("RIGHTPADDING", (0, 0), (-1, -1), 7),
    ("TOPPADDING", (0, 0), (-1, -1), 7),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
]))
story += [method_table, Spacer(1, 8 * mm), box("来源分级", [
    paragraph("官方公布：2016-2017 司法考试公开题面。"),
    paragraph("回忆版：2018-2025 考生回忆与教师解析，按来源完整度使用条件式表述。"),
    paragraph("公开账号已核验：2026 教师或机构公开主观训练。答案尚未稳定出现的，明确标注待核验。"),
], fill=AMBER_SOFT, border=AMBER_SOFT, label_color=AMBER), PageBreak()]


def section_page(kicker, title, subtitle):
    return [Spacer(1, 30 * mm), paragraph(kicker, COVER_KICKER), paragraph(title, COVER_TITLE), paragraph(subtitle, COVER_SUB), box("本编说明", "每题从新页开始。题面之后紧接训练设问和完整原创答案；来源状态及原始入口置于题末。", fill=GREEN_SOFT), PageBreak()]


story += section_page("第一编", "2026 主观题\n每日训练", f"{len(daily)} 个公开可核验训练条目")

last_history_year = None
for index, record in enumerate(all_records):
    if index == len(daily):
        story += section_page("第二编", "2016-2025\n历年主观题", f"{len(history)} 个分题训练条目｜官方题面与回忆版分层")
    if index >= len(daily) and record["year"] != last_history_year:
        last_history_year = record["year"]
        story += [paragraph(f"{record['year']} 年度", COVER_KICKER), paragraph(record["institution"], H1), paragraph(record["note"], SMALL), Spacer(1, 5 * mm)]

    prompts = record.get("training_questions", question_prompts(record["subject"], record["topic"]))
    story += [
        tag(record["confidence"], status=True),
        Spacer(1, 3 * mm),
        paragraph(record["title"], H1),
        paragraph(f"{record['date']}　{record['institution']} · {record['teacher']}　｜　{record['subject']} · {record['topic']}", SMALL),
        Spacer(1, 2 * mm),
        source_link_box(record),
        Spacer(1, 2 * mm),
        box("完整训练题面", [
            paragraph(record["question"]),
            paragraph("除题面明确给出的事实外，不自行假定其他事实。公开回忆材料存在缺口时，应在答案中分别作条件式判断。", BODY_TIGHT),
        ], fill=PAPER),
        Spacer(1, 4 * mm),
        paragraph("训练设问", H2),
    ]
    for prompt_index, prompt in enumerate(prompts, 1):
        story.append(paragraph(f"{prompt_index}. {prompt}"))
    story += [Spacer(1, 2 * mm), box("作答暂停区", "建议先独立完成答案，再继续阅读。检查是否具备：明确结论、规则依据、事实涵摄、条件分支和最终结论。", fill=GREEN_SOFT), Spacer(1, 4 * mm), paragraph("完整原创答案", H2)]
    story.extend(build_answer(record["subject"], record["topic"], record["question"], record["core_answer"], record["confidence"], record.get("organized_answer")))
    story += [
        PageBreak(),
    ]

story += section_page("第三编", "2026 法治思想\n主观题带背", f"{len(RECITATIONS)} 个专题｜依据十二个坚持与权威资料校准")
for item in RECITATIONS:
    source_url = escape(item["sourceUrl"], quote=True)
    authority_url = escape(item["authorityUrl"], quote=True)
    story += [
        tag(item["status"], status=True),
        Spacer(1, 3 * mm),
        paragraph(f"第 {item['order']:02d} 讲｜{item['topic']}", H1),
        paragraph(f"{item['series']}　｜　{item['importance']}　｜　核验 {item['verifiedAt']}", SMALL),
        Spacer(1, 2 * mm),
        box("主观题设问", item["question"], fill=PAPER),
        Spacer(1, 4 * mm),
        paragraph("本库原创背诵稿", H2),
        paragraph(item["memorization"]),
        Spacer(1, 2 * mm),
        box("关键词骨架", " → ".join(item["skeleton"]), fill=GREEN_SOFT),
        Spacer(1, 4 * mm),
        paragraph("闭卷自测", H2),
    ]
    for check_index, check in enumerate(item["selfCheck"], 1):
        story.append(paragraph(f"{check_index}. {check}"))
    story += [
        Spacer(1, 2 * mm),
        box("公开内容要旨", item["publishedGist"], fill=AMBER_SOFT, border=AMBER_SOFT, label_color=AMBER),
        Spacer(1, 3 * mm),
        Paragraph(f'<link href="{source_url}" color="#2D7454"><u>打开公开来源</u></link>　　<link href="{authority_url}" color="#2D7454"><u>打开权威复核页</u></link>', SMALL),
        PageBreak(),
    ]

story += [paragraph("附录｜机构与系列覆盖", H1), paragraph("没有公开可逐题核验的完整主观题归档时，只记录检索状态，不把课程名称或客观题系列混入正文。渠道注册表用于后续持续增量核验。", BODY)]
coverage_rows = [[paragraph("机构/系列", WHITE), paragraph("状态", WHITE), paragraph("核验说明", WHITE)]]
for item in CHANNELS:
    name = f"{item['institution']} · {item['teacher']}"
    detail = f"{item['series']}。{item['notes']} 下次核验：{item['nextCheck']}。"
    coverage_rows.append([paragraph(name, BODY_TIGHT), paragraph(item["status"], SMALL), paragraph(detail, SMALL)])
coverage_table = Table(coverage_rows, colWidths=[37 * mm, 25 * mm, 112 * mm], repeatRows=1)
coverage_table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), GREEN),
    ("BOX", (0, 0), (-1, -1), 0.5, LINE),
    ("INNERGRID", (0, 0), (-1, -1), 0.4, LINE),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, PAPER]),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
]))
story += [coverage_table]

doc.build(story, onFirstPage=page_frame, onLaterPages=page_frame)
print(OUTPUT)
