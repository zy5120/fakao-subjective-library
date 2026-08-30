/**
 * Shared, deterministic content model for the React site and the exported
 * single-file static library. It mirrors the structure of the private PDF.
 */

const unique = (values) => [...new Set(values.filter(Boolean))];

export function questionPrompts(subject, topic) {
  if (subject.includes("习近平") || subject.includes("法理")) {
    return [
      "提炼材料体现的中心法治命题，并用一句话给出总论点。",
      "从理论依据、制度要求和实践路径三个层次展开论证。",
      "结合材料说明各分论点之间的逻辑关系，不整段照抄材料。",
      "以开头、分论点和结论构成一篇完整论述。",
    ];
  }
  if (subject.includes("刑事诉讼")) {
    return [
      `围绕“${topic}”逐项判断侦查、审查起诉或审判行为是否合法。`,
      "区分证据资格、证明力和证明标准，并说明违法取证的处理方式。",
      "确定有权机关、法定程序、期限以及当事人的救济途径。",
      "事实存在两种可能时，分别写明裁判机关应采取的处理方式。",
    ];
  }
  if (subject.includes("民事诉讼") && !subject.includes("民法")) {
    return [
      `围绕“${topic}”确定管辖法院、适格当事人和程序条件。`,
      "分配证明责任，并判断现有证据能否达到证明标准。",
      "说明程序违法的补救方式及法院应作出的裁判。",
      "分别写明程序结论与实体责任结论。",
    ];
  }
  if (subject.includes("刑法")) {
    return [
      `围绕“${topic}”按行为发生顺序逐段判断行为性质。`,
      "分别审查各行为人的主观故意、客观行为、犯罪形态和结果归责。",
      "存在共同犯罪、认识错误、因果关系或罪数争议时分别说明观点。",
      "汇总每名行为人的罪名、犯罪形态及应评价的量刑情节。",
    ];
  }
  if (subject.includes("商法")) {
    return [
      `围绕“${topic}”识别公司、股东、董监高和债权人之间的法律关系。`,
      "区分内部决议或协议效力与对外交易效力。",
      "判断出资、股权、担保或破产程序中的责任主体与权利顺位。",
      "说明请求权基础、程序路径和最终处理结论。",
    ];
  }
  if (subject.includes("行政法")) {
    return [
      `围绕“${topic}”先确定行政行为性质及其法律依据。`,
      "判断行政主体、实施机关、复议机关和行政诉讼被告。",
      "依权限、事实证据、法律适用、程序和裁量审查合法性。",
      "说明复议诉讼路径、起诉条件以及法院应作出的裁判。",
    ];
  }
  return [
    `围绕“${topic}”画出法律关系并确定请求权基础。`,
    "分别判断法律行为效力、履行抗辩、担保或物权变动。",
    "确定责任范围，并说明继续履行、解除、赔偿等救济。",
    "事实不足或观点分歧时，分别作出条件式结论。",
  ];
}

export function ruleTexts(subject, topic) {
  const combined = `${subject}${topic}`;
  const rules = [];

  if (combined.includes("政府信息公开")) {
    rules.push("政府信息公开案件应先判断申请对象是否属于行政机关在履职中制作、获取并保存的信息，再审查主动公开、依申请公开、不予公开和信息不存在等答复类型。答复机关负有检索、说明理由和遵守期限的义务；救济路径还要单独判断是否属于行政复议前置。");
  }
  if (["被告", "委托", "授权", "职权变更"].some((word) => combined.includes(word))) {
    rules.push("行政主体与诉讼被告不能只看文件名称。法律、法规或规章授权的组织以自己名义承担责任；行政委托由委托机关承担责任；职权调整后原则上由继续行使职权的机关承受诉讼责任。");
  }
  if (combined.includes("行政强制") || combined.includes("强制拆")) {
    rules.push("行政强制必须有法定权限与依据，并遵守批准、告知、催告、听取陈述申辩、作出强制执行决定及公告等程序。强制措施与行政强制执行应分开定性，违法实施造成损害的再审查行政赔偿。");
  }
  if (combined.includes("行政处罚") || combined.includes("未成年人")) {
    rules.push("行政处罚须同时审查处罚设定依据、管辖与执法资格、事实证据、告知听证、陈述申辩、裁量和送达。现场制止措施与最终处罚应分别评价；未成年人还要适用相应的从轻、减轻或不予处罚规则。");
  }
  if (["行政许可", "许可证", "驾驶证"].some((word) => combined.includes(word))) {
    rules.push("行政许可的不利变动应依原因区分撤销、撤回、注销与吊销：违法取得通常进入撤销，依据变化或公共利益需要可能适用撤回，法定终止情形适用注销，具有惩戒性的吊销属于行政处罚；既有许可还涉及法不溯及既往与信赖保护。");
  }
  if (combined.includes("原告资格")) {
    rules.push("行政诉讼原告资格要求行政行为与所主张权益之间存在法律上的利害关系。应审查相关规范是否旨在保护该权益、行政行为是否直接增减其权利义务，不能仅凭一般经济影响认定。");
  }
  if (combined.includes("定金")) {
    rules.push("定金须实际交付并受法定比例限制。因给付方原因导致合同目的不能实现的，无权请求返还；因收受方原因导致的，双倍返还；因不可归责于双方的事由未能订约或履行，不适用定金罚则。");
  }
  if (combined.includes("违约金")) {
    rules.push("约定违约金过分高于损失时，可依当事人请求适当减少。判断应以实际损失为基础，综合履行程度、过错、预期利益和诚信原则，不存在机械固定的调整比例。");
  }
  if (["广告", "宣传", "沙盘"].some((word) => combined.includes(word))) {
    rules.push("商品房宣传只有在内容具体确定、涉及规划范围内房屋或相关设施，并对订约和价格具有重大影响时，才可能进入合同内容。违反该承诺构成违约；不满足要约标准时仍可审查欺诈或缔约过失。");
  }
  if (combined.includes("租赁")) {
    rules.push("房屋租赁登记备案原则上不是合同生效要件；租赁期限超过二十年的，超过部分无效。非金钱债务原则上可请求继续履行，但法律上或事实上不能履行、标的不适于强制履行或费用过高等情形除外。");
  }
  if (combined.includes("情势变更")) {
    rules.push("合同基础条件发生订约时无法预见且不属于商业风险的重大变化，继续履行对一方明显不公平的，受不利影响方可请求重新协商；合理期限内协商不成，可请求法院或仲裁机构变更或解除。");
  }
  if (["合同", "借贷", "担保", "抵押", "质押", "以物抵债", "工程"].some((word) => combined.includes(word))) {
    rules.push("民商事合同题应从合同成立与效力、履行状态、抗辩与保全、违约救济及担保顺位依次审查。担保责任依主债权范围和担保设立、公示决定；以物抵债或让与担保应区分清偿安排与流押流质。");
  }
  if (["公司", "股东", "股权", "出资", "董事", "资本", "破产", "重整"].some((word) => combined.includes(word))) {
    rules.push("公司法题需区分公司人格、股东有限责任、出资义务、决议效力与董监高义务。内部限制通常不能当然对抗善意相对人；进入破产或重整后，个别清偿转为集中申报，担保权和取回权依成立要件及标的归属判断。");
  }
  if (combined.includes("共同") || combined.includes("共犯")) {
    rules.push("共同犯罪以共同故意和共同实行、帮助或教唆行为为基础。各共犯仅对共同故意范围内及可归责的结果负责；超出共同故意的过限行为原则上由实施者单独承担。");
  }
  if (["错误", "因果", "死亡", "结果归责"].some((word) => combined.includes(word))) {
    rules.push("结果犯应审查行为是否制造法所不允许的风险、风险是否在结果中实现以及是否存在异常介入因素。认识错误须区分对象错误、打击错误和因果进程错误，再判断是否阻却故意既遂或影响罪数。");
  }
  if (["证据", "非法", "合理怀疑", "证明责任", "鉴定"].some((word) => combined.includes(word))) {
    rules.push("证据审查应区分证据能力、证明力和证明标准。非法言词证据依法排除，物证书证的违法取得结合严重程度及补正解释判断；刑事定罪须达到事实清楚、证据确实充分并排除合理怀疑。");
  }
  if (["二审", "上诉", "抗诉", "再审"].some((word) => combined.includes(word))) {
    rules.push("刑事二审实行全面审查；仅被告一方上诉时受上诉不加刑限制，但检察机关抗诉或自诉人上诉等法定例外另论。再审启动、改判和发回重审应分别依据事实证据、法律适用与程序违法程度。");
  }
  if (["管辖", "送达", "重复起诉", "当事人"].some((word) => combined.includes(word))) {
    rules.push("民事程序问题应先处理主管与管辖，再处理当事人、诉讼标的与请求。重复起诉通常要求前后诉当事人、诉讼标的和请求实质相同；送达与缺席审判必须以合法程序和充分保障诉权为前提。");
  }
  if (subject.includes("习近平") || subject.includes("法理")) {
    rules.push("论述题应形成“总论点—理论依据—制度要求—实践路径—结论”的结构。材料用于提炼命题并联系实践，不能整段照抄；每个分论点都要回答为什么、如何落实以及产生何种法治效果。");
  }
  if (!rules.length) {
    rules.push("以法律关系和争点为主线，先给结论，再写规范依据，随后把题面事实逐一纳入构成要件，最后处理责任范围、程序路径和可能的观点分歧。");
  }
  return unique(rules);
}

function makeCompleteAnswer(record) {
  const rules = ruleTexts(record.subject, record.topic);
  const conclusion = record.coreAnswer;
  const application = record.organizedAnswer?.length
    ? record.organizedAnswer.map((item, index) => `${index + 1}. ${item}`).join("\n")
    : `紧扣题面已经给出的事实：“${record.questionSummary}”逐项判断。把每一项事实放入相应构成要件：能够直接满足要件的，明确写明成立；事实不足的，不补造事实，而分别写出“若……则……”的条件式结论。`;
  const branches = record.answerBranches || "如公开回忆或教师解析存在不同观点，先写通说或更有评分可能的观点，再说明另一观点的规范理由。无论采用何种观点，前提、规则、涵摄与结论必须一致。";
  return {
    conclusion,
    rules,
    application,
    branches,
    conciseSummary: [
      `核心争点：${record.topic}。`,
      `结论要旨：${conclusion}`,
      "落笔顺序：结论先行—规范依据—事实涵摄—争议分支—最终结论。",
    ],
  };
}

function completeness(confidence) {
  if (confidence.includes("待")) return { label: "来源待复核", tone: "pending" };
  if (confidence === "官方公布") return { label: "官方来源已核对", tone: "official" };
  return { label: "回忆资料已结构化", tone: "verified" };
}

function finalize(record) {
  return {
    ...record,
    completeQuestion: record.questionText || `${record.questionSummary}\n\n作答边界：除题面明确事实外，不自行假定其他事实；公开回忆材料存在缺口时，分别作条件式判断。`,
    trainingQuestions: record.trainingQuestions || questionPrompts(record.subject, record.topic),
    completeAnswer: record.completeAnswer || makeCompleteAnswer(record),
    completeness: completeness(record.confidence),
  };
}

export function buildRecords(library) {
  const daily = library.dailyQuestions.map((question) => finalize({
    ...question,
    shelf: "2026 每日一题",
    year: 2026,
    answerUrl: question.answerUrl || question.sourceUrl,
    coreAnswer: [question.sourceAnswer, ...(question.organizedAnswer || [])].join(" "),
    note: `答案核验状态：${question.answerState}。`,
  }));

  const history = library.historicalPapers.flatMap((paper) =>
    paper.subQuestions.map((question) => finalize({
      id: `${paper.year}-${question.no}`,
      shelf: "历年真题",
      year: paper.year,
      date: String(paper.year),
      institution: paper.examName,
      teacher: "历年真题",
      platform: paper.year <= 2017 ? "官方公开页" : "公开回忆与教师解析",
      subject: question.subject,
      topic: question.topic,
      title: `${paper.year} 年 · 第${question.no}题｜${question.topic}`,
      questionSummary: question.prompt,
      sourceAnswer: question.answer,
      organizedAnswer: [
        `争点定位：${question.topic}。`,
        `主观表达：${question.answer}`,
        "先给结论，再写规范依据与事实涵摄；回忆题面不完整处使用条件式表述。",
      ],
      pitfall: paper.year <= 2017
        ? "当前正文为结构化训练版本；官方原题及已公布答案请通过原页核对。"
        : "2018 年后按公开回忆版管理，不把教师解析或考生表述标为官方标准答案。",
      answerState: paper.confidence.includes("待") ? "待逐题复核" : "已整理",
      confidence: paper.confidence,
      sourceUrl: paper.sourceUrl,
      answerUrl: paper.answerUrl,
      note: paper.note,
      coreAnswer: question.answer,
    })),
  );

  return [...daily, ...history].sort((a, b) => {
    if (a.shelf !== b.shelf) return a.shelf === "2026 每日一题" ? -1 : 1;
    return String(b.date).localeCompare(String(a.date), "zh-CN", { numeric: true });
  });
}
