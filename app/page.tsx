"use client";

import { useMemo, useState } from "react";
import libraryJson from "@/data/library.json";

type DailyQuestion = (typeof libraryJson.dailyQuestions)[number];
type HistoricalPaper = (typeof libraryJson.historicalPapers)[number];
type HistoricalQuestion = HistoricalPaper["subQuestions"][number];

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
  organizedAnswer: string[];
  pitfall: string;
  answerState: string;
  confidence: string;
  sourceUrl: string;
  answerUrl?: string;
  note?: string;
};

const dailyRecords: RecordItem[] = libraryJson.dailyQuestions.map(
  (question: DailyQuestion) => ({ ...question, shelf: "2026 每日一题", year: 2026 }),
);

const historicalRecords: RecordItem[] = libraryJson.historicalPapers.flatMap(
  (paper: HistoricalPaper) =>
    paper.subQuestions.map((question: HistoricalQuestion) => ({
      id: `${paper.year}-${question.no}`,
      shelf: "历年真题" as const,
      year: paper.year,
      date: String(paper.year),
      institution: paper.year <= 2017 ? "国家司法考试" : "国家统一法律职业资格考试",
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
        "落笔时先给结论，再写规则依据与事实涵摄；对回忆题面不完整处使用条件式表述。",
      ],
      pitfall:
        paper.year <= 2017
          ? "摘要用于导航，完整题面与官方材料请回到原始来源核对。"
          : "2018 年后为回忆版，不要把老师解析或考生表述标成官方标准答案。",
      answerState: paper.confidence.includes("待") ? "待逐题复核" : "已整理",
      confidence: paper.confidence,
      sourceUrl: paper.sourceUrl,
      answerUrl: paper.answerUrl,
      note: paper.note,
    })),
);

const allRecords = [...dailyRecords, ...historicalRecords].sort((a, b) => {
  if (a.shelf !== b.shelf) return a.shelf === "2026 每日一题" ? -1 : 1;
  return b.date.localeCompare(a.date, "zh-CN", { numeric: true });
});

const unique = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b, "zh-CN"));

function confidenceTone(confidence: string) {
  if (confidence === "官方公布") return "official";
  if (confidence.includes("待")) return "pending";
  return "verified";
}

export default function Home() {
  const [section, setSection] = useState<"library" | "coverage" | "method">("library");
  const [query, setQuery] = useState("");
  const [shelf, setShelf] = useState("全部");
  const [subject, setSubject] = useState("全部科目");
  const [institution, setInstitution] = useState("全部来源");
  const [year, setYear] = useState("全部年份");
  const [visible, setVisible] = useState(18);

  const subjects = useMemo(() => unique(allRecords.map((record) => record.subject)), []);
  const institutions = useMemo(() => unique(allRecords.map((record) => record.institution)), []);
  const years = useMemo(() => unique(allRecords.map((record) => String(record.year))).sort((a, b) => Number(b) - Number(a)), []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return allRecords.filter((record) => {
      const haystack = [record.title, record.subject, record.topic, record.questionSummary, record.sourceAnswer, record.institution, record.teacher].join(" ").toLowerCase();
      return (
        (shelf === "全部" || record.shelf === shelf) &&
        (subject === "全部科目" || record.subject === subject) &&
        (institution === "全部来源" || record.institution === institution) &&
        (year === "全部年份" || String(record.year) === year) &&
        (!needle || haystack.includes(needle))
      );
    });
  }, [institution, query, shelf, subject, year]);

  function resetFilters() {
    setQuery(""); setShelf("全部"); setSubject("全部科目"); setInstitution("全部来源"); setYear("全部年份"); setVisible(18);
  }

  return (
    <main>
      <header className="hero">
        <nav className="top-nav" aria-label="资料库导航">
          <a className="brand" href="#top" aria-label="返回顶部"><span>法</span><strong>主观题资料库</strong></a>
          <div>
            <button className={section === "library" ? "active" : ""} onClick={() => setSection("library")}>题目库</button>
            <button className={section === "coverage" ? "active" : ""} onClick={() => setSection("coverage")}>机构追踪</button>
            <button className={section === "method" ? "active" : ""} onClick={() => setSection("method")}>收录口径</button>
          </div>
        </nav>

        <div className="hero-grid" id="top">
          <div className="hero-copy">
            <p className="eyebrow">2026 主观日练 × 2016—2025 真题</p>
            <h1>只收主观题，<br />每道都能落笔。</h1>
            <p className="lede">纯客观选择题不入库。主客观一体材料只保留可形成完整陈述的部分，并整理为“争点—规范—涵摄—结论”的主观作答路径。</p>
          </div>
          <aside className="edition-card" aria-label="资料库版本">
            <div className="edition-top"><span className="status-dot" /><span>核验截止 {libraryJson.metadata.cutoff}</span></div>
            <strong>{dailyRecords.length + historicalRecords.length}</strong>
            <p>道结构化主观题条目</p>
            <small>题面摘要用于学习导航，原文与老师答案始终保留来源链接。</small>
          </aside>
        </div>

        <section className="stats" aria-label="资料库统计">
          <div><strong>{dailyRecords.length}</strong><span>2026 公开日练</span></div>
          <div><strong>{historicalRecords.length}</strong><span>历年分题索引</span></div>
          <div><strong>10</strong><span>覆盖年度</span></div>
          <div><strong>{libraryJson.coverage.length}</strong><span>机构与系列追踪</span></div>
        </section>
      </header>

      {section === "library" && (
        <section className="library-shell">
          <div className="toolbar">
            <label className="search-field"><span>⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setVisible(18); }} placeholder="搜索案情、争点、科目、老师……" aria-label="搜索题库" /></label>
            <div className="segmented" aria-label="资料分类">
              {["全部", "2026 每日一题", "历年真题"].map((item) => <button key={item} className={shelf === item ? "active" : ""} onClick={() => { setShelf(item); setVisible(18); }}>{item}</button>)}
            </div>
          </div>

          <div className="content-grid">
            <aside className="filter-panel">
              <div className="filter-heading"><p>精细筛选</p><button onClick={resetFilters}>重置</button></div>
              <label>科目<select value={subject} onChange={(event) => { setSubject(event.target.value); setVisible(18); }}><option>全部科目</option>{subjects.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>年份<select value={year} onChange={(event) => { setYear(event.target.value); setVisible(18); }}><option>全部年份</option>{years.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>机构 / 卷别<select value={institution} onChange={(event) => { setInstitution(event.target.value); setVisible(18); }}><option>全部来源</option>{institutions.map((item) => <option key={item}>{item}</option>)}</select></label>
              <div className="filter-note"><strong>答案怎么读</strong><p>“来源答案”是公开解析的压缩；“主观作答框架”是本库标准化整理。两者不混写。</p></div>
            </aside>

            <section className="records" aria-live="polite">
              <div className="section-heading"><div><p className="eyebrow">SUBJECTIVE ONLY</p><h2>可检索的主观题工作台</h2></div><span>找到 {filtered.length} 条</span></div>
              <div className="record-list">
                {filtered.slice(0, visible).map((record) => (
                  <article className="question-card" key={record.id}>
                    <div className="card-topline"><div className="card-meta"><span>{record.shelf}</span><span>{record.year}</span><span>{record.subject}</span><span className={`confidence ${confidenceTone(record.confidence)}`}>{record.confidence}</span></div><span className="answer-state">{record.answerState}</span></div>
                    <p className="topic">{record.topic}</p>
                    <h3>{record.title}</h3>
                    <p className="byline">{record.institution} · {record.teacher} · {record.platform}</p>
                    <div className="prompt-block"><span>题面摘要</span><p>{record.questionSummary}</p></div>
                    <details>
                      <summary><span>展开答案与作答框架</span><span aria-hidden="true">＋</span></summary>
                      <div className="answer-panel">
                        <section><h4>来源答案摘要</h4><p>{record.sourceAnswer}</p></section>
                        <section><h4>主观作答框架</h4><ol>{record.organizedAnswer.map((step) => <li key={step}>{step}</li>)}</ol></section>
                        <aside className="pitfall"><strong>易错提醒</strong><p>{record.pitfall}</p></aside>
                        {record.note && <p className="record-note">卷别说明：{record.note}</p>}
                        <div className="source-links"><a href={record.sourceUrl} target="_blank" rel="noreferrer">查看题目来源 ↗</a>{record.answerUrl && record.answerUrl !== record.sourceUrl && <a href={record.answerUrl} target="_blank" rel="noreferrer">查看答案来源 ↗</a>}</div>
                      </div>
                    </details>
                  </article>
                ))}
              </div>
              {filtered.length === 0 && <div className="empty-state"><strong>没有匹配条目</strong><p>试试清空筛选，或改用“被告”“担保”“证据”等争点关键词。</p><button onClick={resetFilters}>清空筛选</button></div>}
              {visible < filtered.length && <button className="load-more" onClick={() => setVisible((count) => count + 18)}>继续显示 · 还剩 {filtered.length - visible} 条</button>}
            </section>
          </div>
        </section>
      )}

      {section === "coverage" && (
        <section className="standalone-panel">
          <div className="panel-intro"><p className="eyebrow">COVERAGE</p><h2>机构覆盖与缺口，不拿客观题凑数。</h2><p>“持续追踪”表示截至核验日尚未找到无需登录、能够逐题确认题面和答案的公开主观题归档，并不表示机构没有相关课程。</p></div>
          <div className="coverage-grid">
            {libraryJson.coverage.map((item) => <article key={`${item.institution}-${item.teachers}`}><div><span className={`coverage-status ${item.status.includes("收录") ? "included" : item.status.includes("排除") ? "excluded" : "watch"}`}>{item.status}</span><h3>{item.institution}</h3></div><p className="teachers">{item.teachers}</p><p>{item.detail}</p><a href={item.sourceUrl} target="_blank" rel="noreferrer">查看公开依据 ↗</a></article>)}
          </div>
        </section>
      )}

      {section === "method" && (
        <section className="standalone-panel method-panel">
          <div className="panel-intro"><p className="eyebrow">METHOD</p><h2>这不是一份“越多越好”的网盘目录。</h2><p>{libraryJson.metadata.methodology}</p></div>
          <div className="method-grid">
            <article><span>01</span><h3>题型门槛</h3><p>纯客观选择题不入库。主客观一体材料必须能独立整理为有结论、有理由的主观问答。</p></article>
            <article><span>02</span><h3>来源分层</h3><p>2016—2017 使用官方公开题面；2018—2025 明确标记为回忆版；2026 日练以教师或机构公开账号为先。</p></article>
            <article><span>03</span><h3>答案分层</h3><p>先忠实压缩来源答案，再给标准化作答框架；无法核验的图片答案或缺失答案直接标“待核验”。</p></article>
            <article><span>04</span><h3>受限平台</h3><p>遇登录、付费或 App 限制，只追踪公开搜索、公开转载和官网目录，不绕过访问控制。</p></article>
          </div>
          <aside className="legal-note"><strong>重要说明</strong><p>{libraryJson.metadata.notice}</p></aside>
        </section>
      )}

      <footer><p>法考主观题资料库 · 版本 {libraryJson.metadata.cutoff}</p><p>学习整理用途 · 原题与原答案版权归各自来源方</p></footer>
    </main>
  );
}
