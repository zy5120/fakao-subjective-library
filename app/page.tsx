"use client";

import { useMemo, useState } from "react";
import libraryJson from "@/data/library.json";
import { buildRecords } from "@/lib/content-model.js";

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

const allRecords = buildRecords(libraryJson) as RecordItem[];
const dailyRecords = allRecords.filter((record) => record.shelf === "2026 每日一题");
const historicalRecords = allRecords.filter((record) => record.shelf === "历年真题");
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
      const haystack = [
        record.title,
        record.subject,
        record.topic,
        record.completeQuestion,
        record.sourceAnswer,
        record.completeAnswer.conclusion,
        record.completeAnswer.rules.join(" "),
        record.institution,
        record.teacher,
      ].join(" ").toLowerCase();
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
    setQuery("");
    setShelf("全部");
    setSubject("全部科目");
    setInstitution("全部来源");
    setYear("全部年份");
    setVisible(18);
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
            <h1>题面完整，<br />答案能直接落笔。</h1>
            <p className="lede">逐题呈现完整训练题面、明确设问与完整原创作答。原题和公布答案均保留直达入口，回忆版事实不足处明确使用条件式结论。</p>
          </div>
          <aside className="edition-card" aria-label="资料库版本">
            <div className="edition-top"><span className="status-dot" /><span>核验截止 {libraryJson.metadata.cutoff}</span></div>
            <strong>{allRecords.length}</strong>
            <p>道结构化主观题条目</p>
            <small>每题均含原题入口、公布答案入口和本库完整原创答案。</small>
            <div className="hero-downloads">
              <a href="/downloads/法考主观题私人自学册-完整重构题面与原创答案.pdf" download>下载 83 页学习册</a>
              <a href="/downloads/法考主观题资料库.xlsx" download>下载 Excel 题库</a>
            </div>
          </aside>
        </div>

        <section className="stats" aria-label="资料库统计">
          <div><strong>{dailyRecords.length}</strong><span>2026 公开日练</span></div>
          <div><strong>{historicalRecords.length}</strong><span>历年分题训练</span></div>
          <div><strong>10</strong><span>覆盖年度</span></div>
          <div><strong>156</strong><span>原题与答案入口</span></div>
        </section>
      </header>

      {section === "library" && (
        <section className="library-shell">
          <div className="toolbar">
            <label className="search-field"><span>⌕</span><input value={query} onChange={(event) => { setQuery(event.target.value); setVisible(18); }} placeholder="搜索案情、规则、争点、老师……" aria-label="搜索题库" /></label>
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
              <div className="filter-note"><strong>答案怎么读</strong><p>“公布答案要旨”是非逐字整理；“完整原创答案”补全规则、涵摄和争议分支。原文始终通过来源按钮核对。</p></div>
            </aside>

            <section className="records" aria-live="polite">
              <div className="section-heading"><div><p className="eyebrow">SUBJECTIVE ONLY</p><h2>完整主观题学习工作台</h2></div><span>找到 {filtered.length} 条</span></div>
              <div className="record-list">
                {filtered.slice(0, visible).map((record) => (
                  <article className="question-card" key={record.id}>
                    <div className="card-topline">
                      <div className="card-meta"><span>{record.shelf}</span><span>{record.year}</span><span>{record.subject}</span><span className={`confidence ${confidenceTone(record.confidence)}`}>{record.confidence}</span></div>
                      <span className={`answer-state ${record.completeness.tone}`}>{record.completeness.label}</span>
                    </div>
                    <p className="topic">{record.topic}</p>
                    <h3>{record.title}</h3>
                    <p className="byline">{record.institution} · {record.teacher} · {record.platform}</p>
                    <div className="source-strip"><span>公开原文留存</span><a href={record.sourceUrl} target="_blank" rel="noreferrer">打开原题发布页 ↗</a><a href={record.answerUrl ?? record.sourceUrl} target="_blank" rel="noreferrer">打开公布答案／解析原页 ↗</a></div>
                    <div className="prompt-block"><span>完整训练题面（依公开资料重构）</span><p>{record.completeQuestion}</p></div>
                    <section className="training-block"><h4>训练设问</h4><ol>{record.trainingQuestions.map((question) => <li key={question}>{question}</li>)}</ol></section>
                    <details>
                      <summary><span>展开完整答案</span><span aria-hidden="true">＋</span></summary>
                      <div className="answer-panel">
                        <section className="published-answer"><h4>公布答案要旨（非逐字稿）</h4><p>{record.sourceAnswer}</p><a href={record.answerUrl ?? record.sourceUrl} target="_blank" rel="noreferrer">回到公布答案原页核对 ↗</a></section>
                        <section>
                          <h4>完整原创答案</h4>
                          <h5>一、结论先行</h5><p>{record.completeAnswer.conclusion}</p>
                          <h5>二、适用规则与审查标准</h5><ol>{record.completeAnswer.rules.map((rule) => <li key={rule}>{rule}</li>)}</ol>
                          <h5>三、事实涵摄</h5><p>{record.completeAnswer.application}</p>
                          <h5>四、争议与条件分支</h5><p>{record.completeAnswer.branches}</p>
                        </section>
                        <section className="concise"><h4>简约归纳</h4><ul>{record.completeAnswer.conciseSummary.map((summary) => <li key={summary}>{summary}</li>)}</ul></section>
                        <aside className="pitfall"><strong>易错提醒</strong><p>{record.pitfall}</p></aside>
                        {record.note && <p className="record-note">卷别说明：{record.note}</p>}
                        <div className="source-links"><a href={record.sourceUrl} target="_blank" rel="noreferrer">查看题目原页 ↗</a><a href={record.answerUrl ?? record.sourceUrl} target="_blank" rel="noreferrer">查看公布答案原页 ↗</a></div>
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
          <div className="panel-intro"><p className="eyebrow">METHOD</p><h2>完整性来自分层，不来自补造。</h2><p>{libraryJson.metadata.methodology}</p></div>
          <div className="method-grid">
            <article><span>01</span><h3>题型门槛</h3><p>纯客观选择题不入库。主客观一体材料必须能独立整理为有结论、有理由的主观问答。</p></article>
            <article><span>02</span><h3>来源分层</h3><p>2016—2017 使用官方公开题面；2018—2025 明确标记为回忆版；2026 日练以教师或机构公开账号为先。</p></article>
            <article><span>03</span><h3>答案分层</h3><p>公布答案保留原页入口；正文另写完整原创答案。事实不全时采用条件式结论，不把推演冒充原答案。</p></article>
            <article><span>04</span><h3>受限平台</h3><p>遇登录、付费或 App 限制，只追踪公开搜索、公开转载和官网目录，不绕过访问控制。</p></article>
          </div>
          <aside className="legal-note"><strong>重要说明</strong><p>{libraryJson.metadata.notice}</p></aside>
        </section>
      )}

      <footer><p>法考主观题资料库 · 版本 {libraryJson.metadata.cutoff}</p><p>公开学习整理 · 原题与原答案版权归各自来源方</p></footer>
    </main>
  );
}
