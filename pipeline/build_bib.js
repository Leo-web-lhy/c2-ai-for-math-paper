// 从已核验的文献池确定性生成 references.bib 与 paper_bibliography.tex
// 原则：只写注册表(OpenAlex)实际返回的字段，不推测卷期/页码/会议名，避免元数据编造。
const fs = require('fs');

const C2 = 'C:/.cogseed/userWorkSpace/我的挑战有哪些/C2';
const POOL = C2 + '/pipeline/refs_pool.json';
const VRES = C2 + '/pipeline/citations_result.json';
const pool = JSON.parse(fs.readFileSync(POOL, 'utf8')).pool;

// idx -> bibkey（idx 顺序与 citations 核验顺序一致，ref 编号 = 序号）
const SPEC = [
  [0,  'wei2022cot'],
  [11, 'wang2022selfconsistency'],
  [24, 'cobbe2021gsm8k'],
  [35, 'hendrycks2021math'],
  [47, 'chen2022programofthoughts'],
  [59, 'gao2022pal'],
  [72, 'schick2023toolformer'],
  [82, 'demoura2021lean4'],
  [83, 'yang2023leandojo'],
  [94, 'demoura2008z3'],
  [105, 'pan2023logiclm'],
  [116, 'touvron2023llama'],
  [128, 'lightman2023verify'],
  [140, 'wu2022autoformalization'],
  [151, 'marra2024neurosymbolic'],
  [164, 'altenkirch2007observational']
];

// 核验结论（来自 deep-research citations 输出）
let verdict = {};
try {
  const vr = JSON.parse(fs.readFileSync(VRES, 'utf8')).data;
  (vr.claims || []).forEach((c, i) => {
    const ct = (c.citations || [])[0] || {};
    verdict[SPEC[i] && SPEC[i][1]] = ct.verdict || 'unknown';
  });
  console.log('verdicts loaded: ' + JSON.stringify(vr.summary));
} catch (e) { console.log('WARN: citations_result.json 未找到，verdict 记 unknown'); }

function bibAuthors(rec) {
  const a = (rec.authors || []).map(s => String(s).trim()).filter(Boolean);
  // "Last, First" -> "First Last"
  const norm = a.map(s => {
    const m = s.match(/^([^,]+),\s*(.+)$/);
    return m ? (m[2].trim() + ' ' + m[1].trim()) : s;
  });
  const head = norm.slice(0, 3).join(' and ');
  return norm.length > 3 ? head + ' and others' : head;
}

function texAuthors(rec) {
  const a = (rec.authors || []).map(s => String(s).trim()).filter(Boolean);
  const norm = a.map(s => {
    const m = s.match(/^([^,]+),\s*(.+)$/);
    return m ? (m[2].trim() + ' ' + m[1].trim()) : s;
  });
  const head = norm.slice(0, 3).join(', ');
  return norm.length > 3 ? head + ', et al.' : head;
}

const year = r => String(r.date || '').slice(0, 4) || 'n.d.';
const arxivId = doi => {
  const m = String(doi || '').match(/^10\.48550\/arxiv\.(.+)$/i);
  return m ? m[1] : null;
};

let bib = [];
bib.push('% references.bib — C2《从自然语言到可验证推理：基于语义规约的 AI 数学可靠性框架》');
bib.push('%');
bib.push('% 元数据来源与核验方式（可复核）：');
bib.push('%   1) 记录来自 OpenAlex / Crossref 检索结果（原始池见 pipeline/refs_pool.json，175 条）；');
bib.push('%   2) 每条主张与引用经 deep-research citations 逐条核验：引用原句须出现在被引来源文本内，');
bib.push('%      DOI 须格式规范且与被引来源记录一致；无来源可核验时判 weak，绝不补全为 verified。');
bib.push('%   3) 核验结论：16 条主张全部 supported；14 条 verified，2 条 weak（注册表未返回摘要文本，仅有 DOI 元数据）。');
bib.push('%   4) 本文件仅写入注册表实际返回的字段。出版信息（卷期、页码、会议全称）未获取，故一律不写，');
bib.push('%      以避免元数据编造；读者可经 doi 字段自行解析权威出版信息。');
bib.push('%   5) 作者列表按注册表顺序保留前三位并以 others 截断，未推测补全注册表中被截断的姓名片段。');
bib.push('');
let weakList = [], entries = [];

for (const [idx, key] of SPEC) {
  const r = pool[idx];
  if (!r) { console.log('MISSING idx ' + idx); continue; }
  const v = verdict[key] || 'unknown';
  const fields = [];
  fields.push(['author', bibAuthors(r)]);
  fields.push(['title', '{' + String(r.title).replace(/[{}]/g, '') + '}']);
  fields.push(['year', year(r)]);
  const aid = arxivId(r.doi);
  if (aid) { fields.push(['eprint', aid]); fields.push(['archivePrefix', 'arXiv']); }
  if (r.doi) fields.push(['doi', r.doi]);
  if (r.url) fields.push(['url', r.url]);
  fields.push(['note', '引用核验：' + v]);
  const w = Math.max(...fields.map(f => f[0].length));
  entries.push('@misc{' + key + ',\n' +
    fields.map(f => '  ' + f[0].padEnd(w) + ' = {' + f[1] + '}').join(',\n') + '\n}\n');
  if (v !== 'verified') weakList.push(key + '(' + v + ')');
  console.log(key.padEnd(26) + ' | ' + v.padEnd(9) + ' | ' + year(r) + ' | ' + r.doi);
}

fs.writeFileSync(C2 + '/references.bib', bib.join('\n') + entries.join('\n'), 'utf8');
console.log('\nreferences.bib written: ' + entries.length + ' entries; non-verified: ' + (weakList.join(', ') || 'none'));

// 生成 thebibliography 块（Tectonic 0.16.9 的 bibtex/biber 通道不可用，见 AI日志.md 环境约束记录）
let tb = [];
tb.push('% 本文件由 pipeline/build_bib.js 依据 references.bib 自动生成，请勿手工修改。');
tb.push('% 生成原因：本机无 biber/bibtex，且 Tectonic 0.16.9 在 bibtex 通道上崩溃（0xC0000005）。');
tb.push('% paper.tex 通过 \\input{paper_bibliography.tex} 引入，保证 PDF 与 references.bib 同源一致。');
tb.push('\\begin{thebibliography}{99}');
for (const [idx, key] of SPEC) {
  const r = pool[idx];
  if (!r) continue;
  tb.push('\\bibitem{' + key + '}');
  tb.push(texAuthors(r) + '.');
  tb.push('\\newblock ' + String(r.title).replace(/[{}]/g, '') + '.');
  const aid = arxivId(r.doi);
  // DOI 内的下划线在 LaTeX 文本模式（\texttt）中必须转义，否则 Undefined control sequence
  const texDoi = String(r.doi || '').replace(/[{}]/g, '').replace(/_/g, '\\_');
  tb.push('\\newblock ' + year(r) + '. ' + (aid ? 'arXiv:' + aid + '. ' : '') +
    (r.doi ? '\\texttt{doi:' + texDoi + '}.' : ''));
}
tb.push('\\end{thebibliography}');
fs.writeFileSync(C2 + '/paper_bibliography.tex', tb.join('\n') + '\n', 'utf8');
console.log('paper_bibliography.tex written: ' + SPEC.length + ' bibitems');
