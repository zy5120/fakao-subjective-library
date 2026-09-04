import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildRecords } from "../lib/content-model.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const readJson = (relative) => JSON.parse(fs.readFileSync(path.join(root, relative), "utf8"));
const library = readJson("data/library.json");
const channels = readJson("data/channels.json");
const recitations = readJson("data/recitations.json");
const records = buildRecords(library);
const payload = JSON.stringify({ library, channels, recitations, records }).replaceAll("<", "\\u003c");
const css = fs.readFileSync(path.join(root, "app/globals.css"), "utf8").replace('@import "tailwindcss";', "");

const pageTitle = "2026 法考主观题资料库｜每日一题、带背与近十年真题";
const pageDescription = "持续收集 2026 法考老师主观题每日一题、法治思想带背与 2016—2025 主观题真题，逐条保留来源与答案入口。";

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
  <meta name="theme-color" content="#123d2c">
  <meta name="color-scheme" content="light">
  <title>${pageTitle}</title>
  <meta name="description" content="${pageDescription}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${pageTitle}">
  <meta property="og:description" content="${pageDescription}">
  <meta property="og:image" content="https://zy5120.github.io/fakao-subjective-library/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${pageTitle}">
  <meta name="twitter:description" content="${pageDescription}">
  <meta name="twitter:image" content="https://zy5120.github.io/fakao-subjective-library/og.png">
  <style>${css}</style>
</head>
<body>
  <script type="application/json" id="payload">${payload}</script>
  <main id="app"></main>
  <script>
    const data = JSON.parse(document.getElementById("payload").textContent);
    const records = data.records;
    const channels = data.channels.channels;
    const recitations = data.recitations.records;
    const daily = records.filter((item) => item.shelf === "2026 每日一题");
    const pureDaily = daily.filter((item) => !item.id.startsWith("2026-han"));
    const hybridDaily = daily.filter((item) => item.id.startsWith("2026-han"));
    const history = records.filter((item) => item.shelf === "历年真题");
    const navItems = [
      ["overview", "备考总览", "总览", "⌂"], ["daily", "每日一题", "题库", "题"],
      ["recitation", "法治思想带背", "带背", "背"], ["history", "历年真题", "真题", "卷"],
      ["channels", "渠道中心", "渠道", "源"], ["standard", "收录规范", "规范", "规"]
    ];
    const mobileNavItems = navItems.filter((item) => ["overview","daily","recitation","history"].includes(item[0]));
    const dailySeries = [
      {teacher:"李佳",subject:"行政法",series:"主观题每日一题",indexed:18,published:"18",note:"题面与答案 18/18 单篇定位"},
      {teacher:"孟献贵",subject:"民法",series:"主观题案例带写",indexed:12,published:"250",note:"已接入第 225—232、238、248—250 题"},
      {teacher:"韩心怡",subject:"民诉",series:"每日一问·主客一体",indexed:7,published:"71+",note:"已接入 Day 64—70；系列已收官"}
    ];
    const state = {
      view: "overview", query: "", subject: "全部科目", teacher: "全部老师", year: "全部年份",
      selectedDaily: pureDaily[0]?.id || daily[0]?.id || "", selectedHistory: history[0]?.id || "",
      selectedRecitation: recitations[0]?.id || "", recitationQuery: "", channelQuery: "", concealed: false,
      completed: (() => { try { return JSON.parse(localStorage.getItem("fakao-recitation-progress") || "[]"); } catch { return []; } })()
    };
    const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[character]);
    const uniq = (values) => [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), "zh-CN"));
    const examDays = Math.max(0, Math.ceil((new Date("2026-10-18T09:00:00+08:00").getTime() - Date.now()) / 86400000));
    const dateLabel = (value) => /^\\d{4}-\\d{2}-\\d{2}$/.test(value) ? value.slice(5).replace("-", ".") : value;
    const tone = (value) => value.includes("官方") || value.includes("核验") || value.includes("接入") ? "verified" : value.includes("待") || value.includes("预留") ? "pending" : "watch";
    const sourceKind = (record) => record.shelf === "历年真题" ? (record.year <= 2017 ? "官方公开题" : "公开回忆版") : record.id.startsWith("2026-lijia") ? "纯主观·每日一题" : record.id.startsWith("2026-meng") ? "纯主观·案例带写" : record.id.startsWith("2026-han") ? "主客一体·可主观作答" : "主观训练";
    const sourcePrecision = (record) => record.shelf === "历年真题" ? (record.year <= 2017 ? "题源明确" : "回忆资料") : record.sourceUrl.includes("/media/") ? "系列页已定位·单篇待补" : "单篇原文已定位";

    function header() {
      return '<div class="notice-bar"><div><span class="live-dot"></span>资料持续更新至考试</div><strong>2026 主观题 · 10 月 18 日 09:00—13:00</strong><span>距离考试 '+examDays+' 天</span></div>'+
        '<header class="site-header"><a class="brand" href="#" data-view="overview" aria-label="返回备考总览"><span class="brand-seal">法</span><span><strong>主观题资料库</strong><small>SUBJECTIVE LAW LIBRARY</small></span></a>'+
        '<nav class="desktop-nav" aria-label="资料库主导航">'+navItems.map((item) => '<button data-view="'+item[0]+'" class="'+(state.view === item[0] ? "active" : "")+'">'+item[1]+'</button>').join("")+'</nav>'+
        '<details class="mobile-more"><summary>更多</summary><div class="mobile-more-menu"><button data-view="channels" class="'+(state.view === "channels" ? "active" : "")+'">渠道中心</button><button data-view="standard" class="'+(state.view === "standard" ? "active" : "")+'">收录规范</button></div></details>'+
        '<a class="header-action" href="downloads/法考主观题私人自学册-完整重构题面与原创答案.pdf" download>下载学习册</a></header>';
    }

    function overview() {
      const connected = channels.filter((item) => item.status.includes("接入") || item.status.includes("追踪")).length;
      const p0 = channels.filter((item) => item.priority === "P0");
      return '<div class="overview" id="top"><section class="hero-panel"><div class="hero-copy"><p class="kicker">2026 法考主观题备考中枢</p><h1>收得全，<br><em>核得准。</em></h1><p>每日一题、法治思想带背和近十年真题统一归档。每条资料都标明题型、来源、核验层级与答案性质，后续新增老师和平台无需重做网页。</p><div class="hero-actions"><button class="primary-button" data-view="daily">开始今日训练 <span>→</span></button><button class="secondary-button" data-view="recitation">背十二个坚持</button></div></div><aside class="countdown-card"><div class="countdown-label"><span>考试倒计时</span><small>司法部公告已核验</small></div><strong>'+examDays+'</strong><p>天</p><div class="exam-meta"><span>10 月 18 日</span><span>240 分钟</span><span>计算机化考试</span></div><a href="https://www.chinalaw.gov.cn/jgsz/jgszzsdw/zsdwgjsfkszx/" target="_blank" rel="noreferrer">查看司法部考试中心 ↗</a></aside></section>'+
        '<section class="metric-grid" aria-label="资料库统计"><button data-view="daily"><span>01</span><strong>'+pureDaily.length+'<i>+'+hybridDaily.length+'</i></strong><p>纯主观 / 主客一体</p><small>'+dailySeries.length+' 位老师 · '+daily.length+' 道完整训练</small></button><button data-view="recitation"><span>02</span><strong>'+recitations.length+'</strong><p>法治思想带背专题</p><small>已按十二个坚持更新</small></button><button data-view="history"><span>03</span><strong>'+history.length+'</strong><p>历年分题训练</p><small>覆盖 2016—2025</small></button><button data-view="channels"><span>04</span><strong>'+connected+'/'+channels.length+'</strong><p>已接入 / 全部渠道</p><small>保留后续扩展位</small></button></section>'+
        '<section class="dashboard-grid"><article class="focus-card update-card"><div class="section-cap"><span>2026 重要更新</span><small>必须改背</small></div><p class="update-number">12</p><h2>“十一个坚持”已更新为“十二个坚持”</h2><p>新增“坚持依法治国和依规治党有机统一”；第五项更新为“坚持在法治轨道上全面建设社会主义现代化国家”。</p><button data-view="recitation">打开新增必背专题 →</button></article><article class="focus-card workflow-card"><div class="section-cap"><span>资料入库流程</span><small>每条可追溯</small></div><ol><li><b>发现</b><span>机构、老师、平台与公开转载</span></li><li><b>定位</b><span>原题、公布答案与单篇链接</span></li><li><b>核验</b><span>题型、事实、结论和发布时间</span></li><li><b>整理</b><span>题面—设问—规则—涵摄—结论</span></li><li><b>发布</b><span>保留来源、版本和复核状态</span></li></ol></article><article class="focus-card channel-card"><div class="section-cap"><span>本周重点追踪</span><small>'+esc(data.channels.lastReviewed)+'</small></div><div class="channel-mini-list">'+p0.map((item) => '<div><span class="mini-status '+tone(item.status)+'"></span><p><strong>'+esc(item.teacher)+'</strong><small>'+esc(item.series)+'</small></p><em>'+esc(item.status)+'</em></div>').join("")+'</div><button data-view="channels">查看全部渠道与下次核验 →</button></article></section></div>';
    }

    function recordReader(record) {
      const answer = record.completeAnswer;
      return '<article class="reader" id="record-reader"><header class="reader-header"><div class="record-badges"><span>'+esc(record.subject)+'</span><span>'+esc(sourceKind(record))+'</span><span class="'+tone(sourcePrecision(record))+'">'+esc(sourcePrecision(record))+'</span></div><p>'+esc(record.institution)+' · '+esc(record.teacher)+' · '+(record.shelf === "历年真题" ? record.year : "2026")+'</p><h2>'+esc(record.title)+'</h2><div class="source-actions"><a href="'+esc(record.sourceUrl)+'" target="_blank" rel="noreferrer">题目原页 ↗</a><a href="'+esc(record.answerUrl || record.sourceUrl)+'" target="_blank" rel="noreferrer">公布答案原页 ↗</a></div></header>'+
        '<section class="reader-section prompt-section"><div class="reader-section-title"><span>01</span><h3>完整训练题面</h3><small>事实与设问完整保留，措辞经整理</small></div><p class="long-copy">'+esc(record.completeQuestion)+'</p></section>'+
        '<section class="reader-section"><div class="reader-section-title"><span>02</span><h3>作答任务</h3></div><ol class="question-list">'+record.trainingQuestions.map((item) => '<li>'+esc(item)+'</li>').join("")+'</ol></section>'+
        '<details class="answer-disclosure" open><summary><span><b>03</b> 完整答案</span><em>点击收起 / 展开</em></summary><div class="answer-body"><aside class="published-note"><strong>发布者公布答案要旨</strong><p>'+esc(record.sourceAnswer)+'</p><small>答案原页已保留；请通过上方“公布答案原页”核对发布者完整表述。</small></aside><h4>一、结论先行</h4><p>'+esc(answer.conclusion)+'</p><h4>二、适用规则</h4><ol>'+answer.rules.map((item) => '<li>'+esc(item)+'</li>').join("")+'</ol><h4>三、事实涵摄</h4><p>'+esc(answer.application)+'</p><h4>四、争议与条件分支</h4><p>'+esc(answer.branches)+'</p><div class="answer-summary"><strong>落笔压缩版</strong><ul>'+answer.conciseSummary.map((item) => '<li>'+esc(item)+'</li>').join("")+'</ul></div><aside class="warning-note"><strong>易错提醒</strong><p>'+esc(record.pitfall)+'</p></aside></div></details></article>';
    }

    function libraryWorkspace(mode) {
      const source = mode === "daily" ? daily : history;
      const selectedKey = mode === "daily" ? "selectedDaily" : "selectedHistory";
      const query = state.query.trim().toLowerCase();
      const filtered = source.filter((item) => (state.subject === "全部科目" || item.subject === state.subject) && (mode !== "daily" || state.teacher === "全部老师" || item.teacher === state.teacher) && (mode === "daily" || state.year === "全部年份" || String(item.year) === state.year) && (!query || [item.title,item.topic,item.completeQuestion,item.completeAnswer.conclusion,item.institution,item.teacher].join(" ").toLowerCase().includes(query)));
      const selected = filtered.find((item) => item.id === state[selectedKey]) || filtered[0] || source[0];
      if (selected && !filtered.find((item) => item.id === state[selectedKey])) state[selectedKey] = selected.id;
      const subjects = uniq(source.map((item) => item.subject));
      const teachers = uniq(source.map((item) => item.teacher));
      const years = uniq(source.map((item) => String(item.year))).sort((a,b) => Number(b)-Number(a));
      const audit = mode === "daily" ? '<div class="daily-audit" aria-label="2026 每日一题收录审计"><div><span>已结构化入库</span><strong>'+daily.length+'</strong><small>均含完整训练题面与答案</small></div><div><span>已接入老师</span><strong>'+dailySeries.length+'</strong><small>行政法、民法、民诉</small></div><div><span>纯主观训练</span><strong>'+pureDaily.length+'</strong><small>李佳每日一题 + 孟献贵案例带写</small></div><div><span>主客一体主观题</span><strong>'+hybridDaily.length+'</strong><small>韩心怡 Day 64—70</small></div><p>截至 2026-09-04，已核到李佳、孟献贵、韩心怡三个连续栏目。柏浪涛、左宁、郄鹏恩等同名“每日一题”当前以客观选择题为主，只登记在渠道中心，不计入主观题数量。</p></div>' : '';
      const ledger = mode === "daily" ? '<section class="series-ledger" aria-label="教师系列接入台账">'+dailySeries.map((item) => '<article><header><span>'+item.subject+'</span><em>'+item.indexed+'/'+item.published+'</em></header><h2>'+item.teacher+'</h2><p>'+item.series+'</p><small>'+item.note+'</small></article>').join("")+'</section>' : '';
      return '<section class="workspace-page"><header class="page-title-row"><div><p class="kicker">'+(mode === "daily" ? "2026 DAILY PRACTICE" : "2016—2025 ARCHIVE")+'</p><h1>'+(mode === "daily" ? "每日一题工作台" : "近十年真题库")+'</h1><p>'+(mode === "daily" ? "持续收集至 10 月 18 日。主客观一体题只有在能够独立形成法律论证时才入库。" : "2016—2017 为官方公开题；2018—2025 按公开回忆版管理，事实缺口不补造。")+'</p></div><div class="title-stat"><strong>'+filtered.length+'</strong><span>当前结果</span></div></header>'+audit+ledger+
        '<div class="workspace-toolbar"><label class="search-box"><span>⌕</span><input id="library-query" value="'+esc(state.query)+'" placeholder="搜索案情、争点、老师、规则……" aria-label="搜索题库"></label><label><span>科目</span><select id="subject-filter"><option>全部科目</option>'+subjects.map((item) => '<option '+(item === state.subject ? "selected" : "")+'>'+esc(item)+'</option>').join("")+'</select></label>'+(mode === "daily" ? '<label><span>老师</span><select id="teacher-filter"><option>全部老师</option>'+teachers.map((item) => '<option '+(item === state.teacher ? "selected" : "")+'>'+esc(item)+'</option>').join("")+'</select></label>' : '')+(mode === "history" ? '<label><span>年份</span><select id="year-filter"><option>全部年份</option>'+years.map((item) => '<option '+(item === state.year ? "selected" : "")+'>'+esc(item)+'</option>').join("")+'</select></label>' : '')+'</div>'+
        '<div class="study-workspace"><aside class="workspace-rail"><div class="rail-block"><span>资料类型</span><strong>'+(mode === "daily" ? "2026 持续更新" : "近十年归档")+'</strong><p>'+(mode === "daily" ? "纯主观题优先；主客观一体内容明确标注。" : "回忆版使用条件式结论处理事实缺口。")+'</p></div><div class="rail-block"><span>完整性标准</span><ul><li>题面范围明确</li><li>设问可以独立作答</li><li>答案有规则与涵摄</li><li>原文与核验状态可追溯</li></ul></div><button id="reset-library">清空全部筛选</button></aside><div class="record-index" aria-label="题目列表"><div class="index-head"><strong>'+(mode === "daily" ? "训练目录" : "真题目录")+'</strong><span>'+filtered.length+' 条</span></div>'+(filtered.length ? filtered.map((item,index) => '<button data-record="'+esc(item.id)+'" class="'+(selected?.id === item.id ? "active" : "")+'"><span class="index-number">'+String(index+1).padStart(2,"0")+'</span><span class="index-copy"><small>'+esc(item.subject)+' · '+(mode === "history" ? item.year : dateLabel(item.date))+'</small><strong>'+esc(item.title)+'</strong><em>'+esc(item.topic)+'</em><i>'+esc(sourceKind(item))+'</i></span></button>').join("") : '<div class="empty"><strong>没有匹配条目</strong><p>请更换关键词或清空筛选。</p></div>')+'</div>'+(selected ? recordReader(selected) : '')+'</div></section>';
    }

    function recitationReader(item) {
      const completed = state.completed.includes(item.id);
      const memory = state.concealed ? "请根据关键词骨架完整默写本段。" : item.memorization;
      return '<article class="reader recitation-reader" id="recitation-reader"><header class="reader-header"><div class="record-badges"><span>'+esc(item.series)+'</span><span>'+esc(item.importance)+'</span><span class="verified">'+esc(item.status)+'</span></div><p>2026 法治思想 · 第 '+String(item.order).padStart(2,"0")+' 讲</p><h2>'+esc(item.topic)+'</h2><div class="source-actions"><a href="'+esc(item.sourceUrl)+'" target="_blank" rel="noreferrer">公开来源 ↗</a><a href="'+esc(item.authorityUrl)+'" target="_blank" rel="noreferrer">权威复核 ↗</a></div></header><section class="reader-section prompt-section"><div class="reader-section-title"><span>问</span><h3>主观题设问</h3></div><p class="recitation-question">'+esc(item.question)+'</p></section><section class="reader-section memory-section"><div class="reader-section-title"><span>背</span><h3>本库原创背诵稿</h3><button id="toggle-memory">'+(state.concealed ? "显示内容" : "隐藏默写")+'</button></div><div class="memory-copy '+(state.concealed ? "concealed" : "")+'">'+esc(memory)+'</div></section><section class="reader-section"><div class="reader-section-title"><span>骨</span><h3>关键词骨架</h3></div><div class="keyword-grid">'+item.skeleton.map((word,index) => '<span><b>'+(index+1)+'</b>'+esc(word)+'</span>').join("")+'</div></section><section class="reader-section"><div class="reader-section-title"><span>测</span><h3>闭卷自测</h3></div><ol class="question-list">'+item.selfCheck.map((question) => '<li>'+esc(question)+'</li>').join("")+'</ol></section><aside class="published-note"><strong>公开内容要旨</strong><p>'+esc(item.publishedGist)+'</p><small>公开来源与权威复核链接均已保留。</small></aside><button class="completion-button '+(completed ? "completed" : "")+'" id="toggle-completion">'+(completed ? "✓ 已完成本讲" : "标记为已完成")+'</button></article>';
    }

    function recitationWorkspace() {
      const needle = state.recitationQuery.trim().toLowerCase();
      const filtered = recitations.filter((item) => !needle || [item.topic,item.question,item.memorization,item.skeleton.join(" ")].join(" ").toLowerCase().includes(needle));
      const selected = filtered.find((item) => item.id === state.selectedRecitation) || filtered[0] || recitations[0];
      if (selected) state.selectedRecitation = selected.id;
      const progress = Math.round((state.completed.length / recitations.length) * 100);
      return '<section class="workspace-page recitation-page"><header class="page-title-row"><div><p class="kicker">2026 RULE OF LAW THOUGHT</p><h1>法治思想带背</h1><p>依据 2025 年版《学习纲要》更新为十二个坚持。公开带背负责发现高频设问，权威资料负责校准表述。</p></div><div class="title-stat"><strong>'+state.completed.length+'/'+recitations.length+'</strong><span>本机完成进度</span></div></header><div class="change-alert"><strong>2026 必须纠正</strong><span>第五项使用“全面建设社会主义现代化国家”；新增第十二项“依法治国和依规治党有机统一”。</span></div><div class="workspace-toolbar"><label class="search-box"><span>⌕</span><input id="recitation-query" value="'+esc(state.recitationQuery)+'" placeholder="搜索十二个坚持、法治体系、涉外法治……" aria-label="搜索带背专题"></label><div class="progress-pill"><span style="width:'+progress+'%"></span><b>'+progress+'%</b></div></div><div class="study-workspace recitation-workspace"><aside class="workspace-rail"><div class="rail-block"><span>背诵方法</span><ol><li>先读主观题设问</li><li>只看关键词骨架复述</li><li>隐藏正文完成默写</li><li>核对表述并完成自测</li></ol></div><div class="rail-block"><span>来源层级</span><p>中央和国家机关资料为权威底稿；老师公开带背用于识别高频问法。</p></div></aside><div class="record-index recitation-index"><div class="index-head"><strong>专题目录</strong><span>'+filtered.length+' 讲</span></div>'+filtered.map((item) => '<button data-recitation="'+esc(item.id)+'" class="'+(selected?.id === item.id ? "active" : "")+'"><span class="index-number">'+(state.completed.includes(item.id) ? "✓" : String(item.order).padStart(2,"0"))+'</span><span class="index-copy"><small>'+esc(item.series)+' · '+esc(item.importance)+'</small><strong>'+esc(item.topic)+'</strong><em>'+esc(item.question)+'</em></span></button>').join("")+'</div>'+(selected ? recitationReader(selected) : '')+'</div></section>';
    }

    function channelsView() {
      const needle = state.channelQuery.toLowerCase();
      const filtered = channels.filter((item) => !needle || [item.institution,item.teacher,item.series,item.subjects.join(" "),item.status].join(" ").toLowerCase().includes(needle));
      const summary = [
        [channels.filter((item) => item.priority === "P0").length,"P0 核心渠道"],
        [channels.filter((item) => item.status.includes("接入")).length,"已接入"],
        [channels.filter((item) => item.status.includes("追踪")).length,"持续追踪"],
        [channels.filter((item) => item.status.includes("预留") || item.status.includes("待")).length,"待接入 / 预留"]
      ];
      return '<section class="workspace-page channels-page"><header class="page-title-row"><div><p class="kicker">SOURCE REGISTRY</p><h1>渠道中心</h1><p>新增机构、老师或平台只需登记渠道。每个渠道都有优先级、访问限制、核验时间和下一次检查日期。</p></div><div class="title-stat"><strong>'+channels.length+'</strong><span>渠道登记</span></div></header><div class="channel-summary">'+summary.map((item) => '<div><strong>'+item[0]+'</strong><span>'+item[1]+'</span></div>').join("")+'</div><label class="search-box channel-search"><span>⌕</span><input id="channel-query" value="'+esc(state.channelQuery)+'" placeholder="搜索机构、老师、科目或栏目……" aria-label="搜索渠道"></label><div class="channel-table"><div class="channel-table-head"><span>优先级 / 状态</span><span>机构与老师</span><span>栏目与内容</span><span>核验计划</span><span>入口</span></div>'+filtered.map((item) => '<article><div><b class="priority '+item.priority.toLowerCase()+'">'+esc(item.priority)+'</b><span class="channel-state '+tone(item.status)+'">'+esc(item.status)+'</span></div><div><strong>'+esc(item.institution)+'</strong><small>'+esc(item.teacher)+' · '+esc(item.platform)+'</small></div><div><strong>'+esc(item.series)+'</strong><small>'+esc(item.contentKinds.join(" · "))+'</small><p>'+esc(item.notes)+'</p></div><div><strong>'+esc(item.cadence)+'</strong><small>上次 '+esc(item.lastChecked)+'</small><small>下次 '+esc(item.nextCheck)+'</small></div><a href="'+esc(item.primaryUrl)+'" target="_blank" rel="noreferrer">打开 ↗</a></article>').join("")+'</div></section>';
    }

    function standardView() {
      const rules = [
        ["01","题型门槛","纯客观选择题不入主观题库。主客观一体材料只有在能够独立形成“结论—规则—涵摄”的法律陈述时，才作为主观化训练收录并明确标记。"],
        ["02","来源定位","优先保存单篇原题和单篇答案链接；只能定位到账号或系列页时，标记“单篇待补”，不得写成已经逐题核验。"],
        ["03","答案分层","发布者答案要旨、本库完整原创答案、简约归纳分开呈现。公布答案原页永久保留，整理稿不冒充原文。"],
        ["04","事实完整","题面事实不完整时不得自行补造。使用“若……则……”分别处理条件分支，并标明回忆版或重构边界。"],
        ["05","理论更新","法治思想以最新权威文件为准。2026 年按十二个坚持管理，并记录旧表述、新表述和核验依据。"],
        ["06","版本与复核","每条记录保存首次发现、最后核验、来源状态和内容版本；修改结论时必须写明原因。"]
      ];
      const fields = ["唯一 ID 与内容类型","机构、老师、平台、栏目","发布时间与最后核验时间","原题单篇链接与答案单篇链接","完整题面或明确的重构边界","发布者答案性质与核验状态","本库完整答案：结论、规则、涵摄、分支","纯主观 / 主客观一体转主观标签","版权与访问限制说明","版本变更记录"];
      return '<section class="workspace-page standard-page"><header class="page-title-row"><div><p class="kicker">EDITORIAL STANDARD</p><h1>收集与核验规范</h1><p>质量优先不是“收得少”，而是每条资料都能说明从哪里来、完整到什么程度、答案是什么性质、何时核验过。</p></div><div class="title-stat"><strong>5</strong><span>来源层级</span></div></header><div class="standard-hero"><div><span>来源等级</span><h2>P0 官方权威 → P1 教师原发 → P2 机构公开 → P3 可靠转载 → P4 搜索线索</h2></div><p>P4 只能用于发现，不能直接作为“完整题目/答案已核验”的依据。</p></div><div class="standard-grid">'+rules.map((item) => '<article><span>'+item[0]+'</span><h3>'+item[1]+'</h3><p>'+item[2]+'</p></article>').join("")+'</div><section class="field-spec"><div><p class="kicker">REQUIRED FIELDS</p><h2>以后新增每一题，至少填写这些字段</h2></div><div class="field-list">'+fields.map((item,index) => '<span><b>'+String(index+1).padStart(2,"0")+'</b>'+item+'</span>').join("")+'</div></section></section>';
    }

    function body() {
      if (state.view === "overview") return overview();
      if (state.view === "daily") return libraryWorkspace("daily");
      if (state.view === "history") return libraryWorkspace("history");
      if (state.view === "recitation") return recitationWorkspace();
      if (state.view === "channels") return channelsView();
      return standardView();
    }

    function render(focusId) {
      document.getElementById("app").innerHTML = header()+'<div class="site-frame">'+body()+'</div><footer><div><span class="brand-seal">法</span><p><strong>法考主观题资料库</strong><small>持续更新至 2026 年 10 月 18 日</small></p></div><p>公开学习整理 · 原题与公布答案请从来源页核对 · 核验截止 2026-09-04</p></footer><nav class="mobile-nav" aria-label="移动端主导航">'+mobileNavItems.map((item) => '<button data-view="'+item[0]+'" class="'+(state.view === item[0] ? "active" : "")+'"><span>'+item[3]+'</span>'+(item[0] === "daily" ? "题库" : item[2])+'</button>').join("")+'</nav>';
      if (focusId) { const input = document.getElementById(focusId); if (input) { input.focus(); input.setSelectionRange(input.value.length,input.value.length); } }
    }

    document.addEventListener("click", (event) => {
      const view = event.target.closest("[data-view]");
      if (view) { event.preventDefault(); state.view = view.dataset.view; state.query = ""; state.subject = "全部科目"; state.teacher = "全部老师"; state.year = "全部年份"; render(); window.scrollTo({top:0,behavior:"smooth"}); return; }
      const record = event.target.closest("[data-record]");
      if (record) { state[state.view === "daily" ? "selectedDaily" : "selectedHistory"] = record.dataset.record; render(); document.getElementById("record-reader")?.scrollIntoView({behavior:"smooth",block:"start"}); return; }
      const recitation = event.target.closest("[data-recitation]");
      if (recitation) { state.selectedRecitation = recitation.dataset.recitation; state.concealed = false; render(); document.getElementById("recitation-reader")?.scrollIntoView({behavior:"smooth",block:"start"}); return; }
      if (event.target.closest("#reset-library")) { state.query = ""; state.subject = "全部科目"; state.teacher = "全部老师"; state.year = "全部年份"; render(); return; }
      if (event.target.closest("#toggle-memory")) { state.concealed = !state.concealed; render(); return; }
      if (event.target.closest("#toggle-completion")) { const id = state.selectedRecitation; state.completed = state.completed.includes(id) ? state.completed.filter((item) => item !== id) : [...state.completed,id]; localStorage.setItem("fakao-recitation-progress", JSON.stringify(state.completed)); render(); }
    });
    document.addEventListener("input", (event) => {
      if (event.target.id === "library-query") { state.query = event.target.value; render("library-query"); }
      if (event.target.id === "recitation-query") { state.recitationQuery = event.target.value; render("recitation-query"); }
      if (event.target.id === "channel-query") { state.channelQuery = event.target.value; render("channel-query"); }
    });
    document.addEventListener("change", (event) => {
      if (event.target.id === "subject-filter") { state.subject = event.target.value; render(); }
      if (event.target.id === "teacher-filter") { state.teacher = event.target.value; render(); }
      if (event.target.id === "year-filter") { state.year = event.target.value; render(); }
    });
    render();
  </script>
</body>
</html>`;

const outputSite = path.join(root, "output/site");
const docs = path.join(root, "docs");
for (const directory of [outputSite, docs, path.join(outputSite, "downloads"), path.join(docs, "downloads")]) {
  fs.mkdirSync(directory, { recursive: true });
}

const targets = [path.join(outputSite, "法考主观题资料库.html"), path.join(docs, "index.html")];
for (const target of targets) fs.writeFileSync(target, html, "utf8");
for (const target of [path.join(outputSite, ".nojekyll"), path.join(docs, ".nojekyll")]) fs.writeFileSync(target, "", "utf8");

const assets = [
  [path.join(root, "output/pdf/法考主观题私人自学册-完整重构题面与原创答案.pdf"), "downloads/法考主观题私人自学册-完整重构题面与原创答案.pdf"],
  [path.join(root, "outputs/01a053f4-c3bb-7790-a432-e754bb16040b/法考主观题资料库.xlsx"), "downloads/法考主观题资料库.xlsx"],
  [path.join(root, "public/og.png"), "og.png"]
];
for (const [source, relative] of assets) {
  if (!fs.existsSync(source)) throw new Error(`Missing static asset: ${source}`);
  fs.copyFileSync(source, path.join(outputSite, relative));
  fs.copyFileSync(source, path.join(docs, relative));
}

console.log(`Generated ${records.length} questions, ${recitations.records.length} recitations, ${channels.channels.length} channels.`);
console.log(targets.join("\n"));
