"use client";

import { useEffect, useMemo, useState } from "react";
import libraryJson from "@/data/library.json";
import channelsJson from "@/data/channels.json";
import recitationsJson from "@/data/recitations.json";
import { buildRecords } from "@/lib/content-model.js";

type View = "overview" | "daily" | "recitation" | "history" | "channels" | "standard";

type RecordItem = {
  id: string;
  shelf: "2026 每日一题" | "历年真题";
  year: number;
  date: string;
  institution: string;
  teacher: string;
  platform: string;
  subject: string;
  topic: string;
  title: string;
  questionSummary: string;
  sourceAnswer: string;
  pitfall: string;
  answerState: string;
  confidence: string;
  sourceUrl: string;
  answerUrl?: string;
  note?: string;
  completeQuestion: string;
  trainingQuestions: string[];
  completeness: { label: string; tone: string };
  completeAnswer: {
    conclusion: string;
    rules: string[];
    application: string;
    branches: string;
    conciseSummary: string[];
  };
};

type Recitation = (typeof recitationsJson.records)[number];
type Channel = (typeof channelsJson.channels)[number];

const allRecords = buildRecords(libraryJson) as RecordItem[];
const dailyRecords = allRecords.filter((record) => record.shelf === "2026 每日一题");
const pureDailyRecords = dailyRecords.filter((record) => !record.id.startsWith("2026-han"));
const hybridDailyRecords = dailyRecords.filter((record) => record.id.startsWith("2026-han"));
const historicalRecords = allRecords.filter((record) => record.shelf === "历年真题");
const recitations = recitationsJson.records as Recitation[];
const channels = channelsJson.channels as Channel[];
const unique = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b, "zh-CN"));

const navItems: { id: View; label: string; short: string }[] = [
  { id: "overview", label: "备考总览", short: "总览" },
  { id: "daily", label: "每日一题", short: "日练" },
  { id: "recitation", label: "法治思想带背", short: "带背" },
  { id: "history", label: "历年真题", short: "真题" },
  { id: "channels", label: "渠道中心", short: "渠道" },
  { id: "standard", label: "收录规范", short: "规范" },
];

const mobileNavItems = navItems.filter((item) => ["overview", "daily", "recitation", "history"].includes(item.id));

const dailySeries = [
  { teacher: "李佳", subject: "行政法", series: "主观题每日一题", indexed: 14, published: "14", note: "题面 13/14；答案 12/14 单篇定位" },
  { teacher: "孟献贵", subject: "民法", series: "主观题案例带写", indexed: 9, published: "238", note: "已接入第 225—232、238 题" },
  { teacher: "韩心怡", subject: "民诉", series: "每日一问·主客一体", indexed: 7, published: "71+", note: "已接入 Day 64—70；系列已收官" },
];

function sourceKind(record: RecordItem) {
  if (record.shelf === "历年真题") return record.year <= 2017 ? "官方公开题" : "公开回忆版";
  if (record.id.startsWith("2026-lijia")) return "纯主观·每日一题";
  if (record.id.startsWith("2026-meng")) return "纯主观·案例带写";
  if (record.id.startsWith("2026-han")) return "主客一体·可主观作答";
  return "主观训练";
}

function sourcePrecision(record: RecordItem) {
  if (record.shelf === "历年真题") return record.year <= 2017 ? "题源明确" : "回忆资料";
  if (record.sourceUrl.includes("/media/")) return "系列页已定位·单篇待补";
  return "单篇原文已定位";
}

function tone(value: string) {
  if (value.includes("官方") || value.includes("已核验") || value.includes("已接入")) return "verified";
  if (value.includes("待") || value.includes("预留")) return "pending";
  return "watch";
}

function formatDate(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.slice(5).replace("-", ".");
  return value;
}

function StudyHeader({ view, setView, daysLeft }: { view: View; setView: (view: View) => void; daysLeft: number }) {
  function chooseMobileView(event: React.MouseEvent<HTMLButtonElement>, nextView: View) {
    setView(nextView);
    const details = event.currentTarget.closest("details") as HTMLDetailsElement | null;
    if (details) details.open = false;
  }
  return (
    <>
      <div className="notice-bar">
        <div><span className="live-dot" />资料持续更新至考试</div>
        <strong>2026 主观题 · 10 月 18 日 09:00—13:00</strong>
        <span>距离考试 {daysLeft} 天</span>
      </div>
      <header className="site-header">
        <a className="brand" href="#top" onClick={() => setView("overview")} aria-label="返回备考总览">
          <span className="brand-seal">法</span>
          <span><strong>主观题资料库</strong><small>SUBJECTIVE LAW LIBRARY</small></span>
        </a>
        <nav className="desktop-nav" aria-label="资料库主导航">
          {navItems.map((item) => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}>{item.label}</button>)}
        </nav>
        <details className="mobile-more">
          <summary>更多</summary>
          <div className="mobile-more-menu">
            <button className={view === "channels" ? "active" : ""} onClick={(event) => chooseMobileView(event, "channels")}>渠道中心</button>
            <button className={view === "standard" ? "active" : ""} onClick={(event) => chooseMobileView(event, "standard")}>收录规范</button>
          </div>
        </details>
        <a className="header-action" href="/downloads/法考主观题私人自学册-完整重构题面与原创答案.pdf" download>下载学习册</a>
      </header>
    </>
  );
}

function Overview({ setView, daysLeft }: { setView: (view: View) => void; daysLeft: number }) {
  const connected = channels.filter((channel) => channel.status.includes("接入") || channel.status.includes("追踪")).length;
  return (
    <div className="overview" id="top">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="kicker">2026 法考主观题备考中枢</p>
          <h1>收得全，<br /><em>核得准。</em></h1>
          <p>每日一题、法治思想带背和近十年真题统一归档。每条资料都标明题型、来源、核验层级与答案性质，后续新增老师和平台无需重做网页。</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => setView("daily")}>开始今日训练 <span>→</span></button>
            <button className="secondary-button" onClick={() => setView("recitation")}>背十二个坚持</button>
          </div>
        </div>
        <aside className="countdown-card">
          <div className="countdown-label"><span>考试倒计时</span><small>司法部公告已核验</small></div>
          <strong>{daysLeft}</strong>
          <p>天</p>
          <div className="exam-meta"><span>10 月 18 日</span><span>240 分钟</span><span>计算机化考试</span></div>
          <a href="https://www.chinalaw.gov.cn/jgsz/jgszzsdw/zsdwgjsfkszx/" target="_blank" rel="noreferrer">查看司法部考试中心 ↗</a>
        </aside>
      </section>

      <section className="metric-grid" aria-label="资料库统计">
        <button onClick={() => setView("daily")}><span>01</span><strong>{pureDailyRecords.length}<i>+{hybridDailyRecords.length}</i></strong><p>纯主观 / 主客一体</p><small>{dailySeries.length} 位老师 · {dailyRecords.length} 道完整训练</small></button>
        <button onClick={() => setView("recitation")}><span>02</span><strong>{recitations.length}</strong><p>法治思想带背专题</p><small>已按十二个坚持更新</small></button>
        <button onClick={() => setView("history")}><span>03</span><strong>{historicalRecords.length}</strong><p>历年分题训练</p><small>覆盖 2016—2025</small></button>
        <button onClick={() => setView("channels")}><span>04</span><strong>{connected}/{channels.length}</strong><p>已接入 / 全部渠道</p><small>保留后续扩展位</small></button>
      </section>

      <section className="dashboard-grid">
        <article className="focus-card update-card">
          <div className="section-cap"><span>2026 重要更新</span><small>必须改背</small></div>
          <p className="update-number">12</p>
          <h2>“十一个坚持”已更新为“十二个坚持”</h2>
          <p>新增“坚持依法治国和依规治党有机统一”；第五项更新为“坚持在法治轨道上全面建设社会主义现代化国家”。</p>
          <button onClick={() => setView("recitation")}>打开新增必背专题 →</button>
        </article>
        <article className="focus-card workflow-card">
          <div className="section-cap"><span>资料入库流程</span><small>每条可追溯</small></div>
          <ol>
            <li><b>发现</b><span>机构、老师、平台与公开转载</span></li>
            <li><b>定位</b><span>原题、公布答案与单篇链接</span></li>
            <li><b>核验</b><span>题型、事实、结论和发布时间</span></li>
            <li><b>整理</b><span>题面—设问—规则—涵摄—结论</span></li>
            <li><b>发布</b><span>保留来源、版本和复核状态</span></li>
          </ol>
        </article>
        <article className="focus-card channel-card">
          <div className="section-cap"><span>本周重点追踪</span><small>{channelsJson.lastReviewed}</small></div>
          <div className="channel-mini-list">
            {channels.filter((channel) => channel.priority === "P0").map((channel) => (
              <div key={channel.id}><span className={`mini-status ${tone(channel.status)}`} /> <p><strong>{channel.teacher}</strong><small>{channel.series}</small></p><em>{channel.status}</em></div>
            ))}
          </div>
          <button onClick={() => setView("channels")}>查看全部渠道与下次核验 →</button>
        </article>
      </section>
    </div>
  );
}

function RecordReader({ record }: { record: RecordItem }) {
  return (
    <article className="reader" id="record-reader">
      <header className="reader-header">
        <div className="record-badges"><span>{record.subject}</span><span>{sourceKind(record)}</span><span className={tone(sourcePrecision(record))}>{sourcePrecision(record)}</span></div>
        <p>{record.institution} · {record.teacher} · {record.shelf === "历年真题" ? record.year : "2026"}</p>
        <h2>{record.title}</h2>
        <div className="source-actions"><a href={record.sourceUrl} target="_blank" rel="noreferrer">题目来源 ↗</a><a href={record.answerUrl ?? record.sourceUrl} target="_blank" rel="noreferrer">公布答案 / 解析 ↗</a></div>
      </header>
      <section className="reader-section prompt-section">
        <div className="reader-section-title"><span>01</span><h3>完整训练题面</h3><small>依公开资料重构</small></div>
        <p className="long-copy">{record.completeQuestion}</p>
      </section>
      <section className="reader-section">
        <div className="reader-section-title"><span>02</span><h3>作答任务</h3></div>
        <ol className="question-list">{record.trainingQuestions.map((question) => <li key={question}>{question}</li>)}</ol>
      </section>
      <details className="answer-disclosure" open>
        <summary><span><b>03</b> 完整答案</span><em>点击收起 / 展开</em></summary>
        <div className="answer-body">
          <aside className="published-note"><strong>发布者公布答案要旨</strong><p>{record.sourceAnswer}</p><small>非逐字稿；请通过上方原页核对发布者完整内容。</small></aside>
          <h4>一、结论先行</h4><p>{record.completeAnswer.conclusion}</p>
          <h4>二、适用规则</h4><ol>{record.completeAnswer.rules.map((rule) => <li key={rule}>{rule}</li>)}</ol>
          <h4>三、事实涵摄</h4><p>{record.completeAnswer.application}</p>
          <h4>四、争议与条件分支</h4><p>{record.completeAnswer.branches}</p>
          <div className="answer-summary"><strong>落笔压缩版</strong><ul>{record.completeAnswer.conciseSummary.map((item) => <li key={item}>{item}</li>)}</ul></div>
          <aside className="warning-note"><strong>易错提醒</strong><p>{record.pitfall}</p></aside>
        </div>
      </details>
    </article>
  );
}

function LibraryWorkspace({ mode }: { mode: "daily" | "history" }) {
  const source = mode === "daily" ? dailyRecords : historicalRecords;
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("全部科目");
  const [teacher, setTeacher] = useState("全部老师");
  const [year, setYear] = useState("全部年份");
  const [selectedId, setSelectedId] = useState(source[0]?.id ?? "");
  const subjects = useMemo(() => unique(source.map((record) => record.subject)), [source]);
  const teachers = useMemo(() => unique(source.map((record) => record.teacher)), [source]);
  const years = useMemo(() => unique(source.map((record) => String(record.year))).sort((a, b) => Number(b) - Number(a)), [source]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return source.filter((record) => (subject === "全部科目" || record.subject === subject) && (teacher === "全部老师" || record.teacher === teacher) && (year === "全部年份" || String(record.year) === year) && (!needle || [record.title, record.topic, record.completeQuestion, record.completeAnswer.conclusion, record.institution, record.teacher].join(" ").toLowerCase().includes(needle)));
  }, [query, source, subject, teacher, year]);
  const selected = filtered.find((record) => record.id === selectedId) ?? filtered[0] ?? source[0];

  return (
    <section className="workspace-page">
      <header className="page-title-row">
        <div><p className="kicker">{mode === "daily" ? "2026 DAILY PRACTICE" : "2016—2025 ARCHIVE"}</p><h1>{mode === "daily" ? "每日一题工作台" : "近十年真题库"}</h1><p>{mode === "daily" ? "持续收集至 10 月 18 日。主客观一体题只有在能够独立形成法律论证时才入库。" : "2016—2017 为官方公开题；2018—2025 按公开回忆版管理，事实缺口不补造。"}</p></div>
        <div className="title-stat"><strong>{filtered.length}</strong><span>当前结果</span></div>
      </header>
      {mode === "daily" && <div className="daily-audit" aria-label="2026 每日一题收录审计">
        <div><span>已结构化入库</span><strong>{dailyRecords.length}</strong><small>均含完整训练题面与答案</small></div>
        <div><span>已接入老师</span><strong>{dailySeries.length}</strong><small>行政法、民法、民诉</small></div>
        <div><span>纯主观训练</span><strong>{pureDailyRecords.length}</strong><small>李佳每日一题 + 孟献贵案例带写</small></div>
        <div><span>主客一体主观题</span><strong>{hybridDailyRecords.length}</strong><small>韩心怡 Day 64—70</small></div>
        <p>截至 2026-09-01，已核到李佳、孟献贵、韩心怡三个连续栏目。柏浪涛、左宁、郄鹏恩等同名“每日一题”当前以客观选择题为主，只登记在渠道中心，不计入主观题数量。</p>
      </div>}
      {mode === "daily" && <section className="series-ledger" aria-label="教师系列接入台账">
        {dailySeries.map((series) => <article key={series.teacher}>
          <header><span>{series.subject}</span><em>{series.indexed}/{series.published}</em></header>
          <h2>{series.teacher}</h2>
          <p>{series.series}</p>
          <small>{series.note}</small>
        </article>)}
      </section>}
      <div className="workspace-toolbar">
        <label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索案情、争点、老师、规则……" aria-label="搜索题库" /></label>
        <label><span>科目</span><select value={subject} onChange={(event) => setSubject(event.target.value)}><option>全部科目</option>{subjects.map((item) => <option key={item}>{item}</option>)}</select></label>
        {mode === "daily" && <label><span>老师</span><select value={teacher} onChange={(event) => setTeacher(event.target.value)}><option>全部老师</option>{teachers.map((item) => <option key={item}>{item}</option>)}</select></label>}
        {mode === "history" && <label><span>年份</span><select value={year} onChange={(event) => setYear(event.target.value)}><option>全部年份</option>{years.map((item) => <option key={item}>{item}</option>)}</select></label>}
      </div>
      <div className="study-workspace">
        <aside className="workspace-rail">
          <div className="rail-block"><span>资料类型</span><strong>{mode === "daily" ? "2026 持续更新" : "近十年归档"}</strong><p>{mode === "daily" ? "纯主观题优先；主客观一体内容明确标注。" : "回忆版必须使用条件式结论处理事实缺口。"}</p></div>
          <div className="rail-block"><span>完整性标准</span><ul><li>题面范围明确</li><li>设问可以独立作答</li><li>答案有规则与涵摄</li><li>原文与核验状态可追溯</li></ul></div>
          <button onClick={() => { setQuery(""); setSubject("全部科目"); setTeacher("全部老师"); setYear("全部年份"); }}>清空全部筛选</button>
        </aside>
        <div className="record-index" aria-label="题目列表">
          <div className="index-head"><strong>{mode === "daily" ? "训练目录" : "真题目录"}</strong><span>{filtered.length} 条</span></div>
          {filtered.length ? filtered.map((record, index) => (
            <button key={record.id} className={selected?.id === record.id ? "active" : ""} onClick={() => setSelectedId(record.id)}>
              <span className="index-number">{String(index + 1).padStart(2, "0")}</span>
              <span className="index-copy"><small>{record.subject} · {record.shelf === "历年真题" ? record.year : formatDate(record.date)}</small><strong>{record.title}</strong><em>{record.topic}</em><i>{sourceKind(record)}</i></span>
            </button>
          )) : <div className="empty"><strong>没有匹配条目</strong><p>请更换关键词或清空筛选。</p></div>}
        </div>
        {selected && <RecordReader record={selected} />}
      </div>
    </section>
  );
}

function RecitationReader({ item, completed, toggle }: { item: Recitation; completed: boolean; toggle: () => void }) {
  const [hidden, setHidden] = useState(false);
  return (
    <article className="reader recitation-reader" id="recitation-reader">
      <header className="reader-header">
        <div className="record-badges"><span>{item.series}</span><span>{item.importance}</span><span className="verified">{item.status}</span></div>
        <p>2026 法治思想 · 第 {String(item.order).padStart(2, "0")} 讲</p>
        <h2>{item.topic}</h2>
        <div className="source-actions"><a href={item.sourceUrl} target="_blank" rel="noreferrer">公开来源 ↗</a><a href={item.authorityUrl} target="_blank" rel="noreferrer">权威复核 ↗</a></div>
      </header>
      <section className="reader-section prompt-section"><div className="reader-section-title"><span>问</span><h3>主观题设问</h3></div><p className="recitation-question">{item.question}</p></section>
      <section className="reader-section memory-section">
        <div className="reader-section-title"><span>背</span><h3>本库原创背诵稿</h3><button onClick={() => setHidden((value) => !value)}>{hidden ? "显示内容" : "隐藏默写"}</button></div>
        <div className={`memory-copy ${hidden ? "concealed" : ""}`}>{hidden ? "请根据关键词骨架完整默写本段。" : item.memorization}</div>
      </section>
      <section className="reader-section"><div className="reader-section-title"><span>骨</span><h3>关键词骨架</h3></div><div className="keyword-grid">{item.skeleton.map((word, index) => <span key={word}><b>{index + 1}</b>{word}</span>)}</div></section>
      <section className="reader-section"><div className="reader-section-title"><span>测</span><h3>闭卷自测</h3></div><ol className="question-list">{item.selfCheck.map((question) => <li key={question}>{question}</li>)}</ol></section>
      <aside className="published-note"><strong>公开内容要旨</strong><p>{item.publishedGist}</p><small>教师或权威页面原文不在本站冒充原创；请从上方来源入口核对。</small></aside>
      <button className={`completion-button ${completed ? "completed" : ""}`} onClick={toggle}>{completed ? "✓ 已完成本讲" : "标记为已完成"}</button>
    </article>
  );
}

function RecitationWorkspace() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(recitations[0]?.id ?? "");
  const [completed, setCompleted] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("fakao-recitation-progress") ?? "[]"); } catch { return []; }
  });
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return recitations.filter((item) => !needle || [item.topic, item.question, item.memorization, item.skeleton.join(" ")].join(" ").toLowerCase().includes(needle));
  }, [query]);
  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? recitations[0];
  function toggle(id: string) {
    setCompleted((items) => {
      const next = items.includes(id) ? items.filter((item) => item !== id) : [...items, id];
      localStorage.setItem("fakao-recitation-progress", JSON.stringify(next));
      return next;
    });
  }
  return (
    <section className="workspace-page recitation-page">
      <header className="page-title-row"><div><p className="kicker">2026 RULE OF LAW THOUGHT</p><h1>法治思想带背</h1><p>依据 2025 年版《学习纲要》更新为十二个坚持。公开带背负责发现高频设问，权威资料负责校准表述。</p></div><div className="title-stat"><strong>{completed.length}/{recitations.length}</strong><span>本机完成进度</span></div></header>
      <div className="change-alert"><strong>2026 必须纠正</strong><span>第五项使用“全面建设社会主义现代化国家”；新增第十二项“依法治国和依规治党有机统一”。</span></div>
      <div className="workspace-toolbar"><label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索十二个坚持、法治体系、涉外法治……" aria-label="搜索带背专题" /></label><div className="progress-pill"><span style={{ width: `${Math.round((completed.length / recitations.length) * 100)}%` }} /><b>{Math.round((completed.length / recitations.length) * 100)}%</b></div></div>
      <div className="study-workspace recitation-workspace">
        <aside className="workspace-rail"><div className="rail-block"><span>背诵方法</span><ol><li>先读主观题设问</li><li>只看关键词骨架复述</li><li>隐藏正文完成默写</li><li>核对表述并完成自测</li></ol></div><div className="rail-block"><span>来源层级</span><p>中央和国家机关公开资料为权威底稿；老师公开带背用于识别高频问法。</p></div></aside>
        <div className="record-index recitation-index"><div className="index-head"><strong>专题目录</strong><span>{filtered.length} 讲</span></div>{filtered.map((item) => <button key={item.id} className={selected?.id === item.id ? "active" : ""} onClick={() => setSelectedId(item.id)}><span className="index-number">{completed.includes(item.id) ? "✓" : String(item.order).padStart(2, "0")}</span><span className="index-copy"><small>{item.series} · {item.importance}</small><strong>{item.topic}</strong><em>{item.question}</em></span></button>)}</div>
        {selected && <RecitationReader item={selected} completed={completed.includes(selected.id)} toggle={() => toggle(selected.id)} />}
      </div>
    </section>
  );
}

function ChannelsView() {
  const [query, setQuery] = useState("");
  const filtered = channels.filter((channel) => !query || [channel.institution, channel.teacher, channel.series, channel.subjects.join(" "), channel.status].join(" ").toLowerCase().includes(query.toLowerCase()));
  return (
    <section className="workspace-page channels-page">
      <header className="page-title-row"><div><p className="kicker">SOURCE REGISTRY</p><h1>渠道中心</h1><p>新增机构、老师或平台只需登记渠道，不需要改页面结构。每个渠道都有优先级、访问限制、核验时间和下一次检查日期。</p></div><div className="title-stat"><strong>{channels.length}</strong><span>渠道登记</span></div></header>
      <div className="channel-summary"><div><strong>{channels.filter((item) => item.priority === "P0").length}</strong><span>P0 核心渠道</span></div><div><strong>{channels.filter((item) => item.status.includes("接入")).length}</strong><span>已接入</span></div><div><strong>{channels.filter((item) => item.status.includes("追踪")).length}</strong><span>持续追踪</span></div><div><strong>{channels.filter((item) => item.status.includes("预留") || item.status.includes("待")).length}</strong><span>待接入 / 预留</span></div></div>
      <label className="search-box channel-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索机构、老师、科目或栏目……" aria-label="搜索渠道" /></label>
      <div className="channel-table" aria-label="资料渠道登记表">
        <div className="channel-table-head"><span>优先级 / 状态</span><span>机构与老师</span><span>栏目与内容</span><span>核验计划</span><span>入口</span></div>
        {filtered.map((channel) => <article key={channel.id}>
          <div><b className={`priority ${channel.priority.toLowerCase()}`}>{channel.priority}</b><span className={`channel-state ${tone(channel.status)}`}>{channel.status}</span></div>
          <div><strong>{channel.institution}</strong><small>{channel.teacher} · {channel.platform}</small></div>
          <div><strong>{channel.series}</strong><small>{channel.contentKinds.join(" · ")}</small><p>{channel.notes}</p></div>
          <div><strong>{channel.cadence}</strong><small>上次 {channel.lastChecked}</small><small>下次 {channel.nextCheck}</small></div>
          <a href={channel.primaryUrl} target="_blank" rel="noreferrer">打开 ↗</a>
        </article>)}
      </div>
    </section>
  );
}

function StandardView() {
  const rules = [
    ["01", "题型门槛", "纯客观选择题不入主观题库。主客观一体材料只有在能够独立形成“结论—规则—涵摄”的法律陈述时，才作为主观化训练收录并明确标记。"],
    ["02", "来源定位", "优先保存单篇原题和单篇答案链接；只能定位到账号或系列页时，标记“单篇待补”，不得写成已经逐题核验。"],
    ["03", "答案分层", "发布者答案要旨、本库完整原创答案、简约归纳分开呈现。发布者全文从原页核对，本站不把整理稿冒充官方答案。"],
    ["04", "事实完整", "题面事实不完整时不得自行补造。使用“若……则……”分别处理条件分支，并在醒目位置标明回忆版或重构题面。"],
    ["05", "理论更新", "法治思想以最新权威文件为准。2026 年按十二个坚持管理，并记录旧表述、新表述和核验依据。"],
    ["06", "版本与复核", "每条记录保存首次发现、最后核验、核验人、来源状态和内容版本；修改结论时必须写明原因。"],
  ];
  return (
    <section className="workspace-page standard-page">
      <header className="page-title-row"><div><p className="kicker">EDITORIAL STANDARD</p><h1>收集与核验规范</h1><p>质量优先不是“收得少”，而是每条资料都能说明从哪里来、完整到什么程度、答案是什么性质、何时核验过。</p></div><div className="title-stat"><strong>5</strong><span>来源层级</span></div></header>
      <div className="standard-hero"><div><span>来源等级</span><h2>P0 官方权威 → P1 教师原发 → P2 机构公开 → P3 可靠转载 → P4 搜索线索</h2></div><p>P4 只能用于发现，不能直接作为“完整题目/答案已核验”的依据。</p></div>
      <div className="standard-grid">{rules.map(([number, title, copy]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{copy}</p></article>)}</div>
      <section className="field-spec"><div><p className="kicker">REQUIRED FIELDS</p><h2>以后新增每一题，至少填写这些字段</h2></div><div className="field-list">{["唯一 ID 与内容类型", "机构、老师、平台、栏目", "发布时间与最后核验时间", "原题单篇链接与答案单篇链接", "完整题面或明确的重构边界", "发布者答案性质与核验状态", "本库完整答案：结论、规则、涵摄、分支", "题型标签：纯主观 / 主客观一体转主观", "版权与访问限制说明", "版本变更记录"].map((field, index) => <span key={field}><b>{String(index + 1).padStart(2, "0")}</b>{field}</span>)}</div></section>
    </section>
  );
}

export default function Home() {
  const [view, setView] = useState<View>("overview");
  const [daysLeft] = useState(() => {
    const exam = new Date("2026-10-18T09:00:00+08:00").getTime();
    return Math.max(0, Math.ceil((exam - Date.now()) / 86400000));
  });
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [view]);

  return (
    <main>
      <StudyHeader view={view} setView={setView} daysLeft={daysLeft} />
      <div className="site-frame">
        {view === "overview" && <Overview setView={setView} daysLeft={daysLeft} />}
        {view === "daily" && <LibraryWorkspace mode="daily" />}
        {view === "recitation" && <RecitationWorkspace />}
        {view === "history" && <LibraryWorkspace mode="history" />}
        {view === "channels" && <ChannelsView />}
        {view === "standard" && <StandardView />}
      </div>
      <footer><div><span className="brand-seal">法</span><p><strong>法考主观题资料库</strong><small>持续更新至 2026 年 10 月 18 日</small></p></div><p>公开学习整理 · 原题与公布答案请从来源页核对 · 核验截止 2026-09-01</p></footer>
      <nav className="mobile-nav" aria-label="移动端主导航">{mobileNavItems.map((item) => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}><span>{item.id === "overview" ? "⌂" : item.id === "daily" ? "题" : item.id === "recitation" ? "背" : "卷"}</span>{item.id === "daily" ? "题库" : item.short}</button>)}</nav>
    </main>
  );
}
