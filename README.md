# C2 AI for Math 论文

- 挑战：C2 AI for Math 论文（`ch-20260717031343-8ot0ji`）
- 选题：**AI4Math 可靠性框架——双向一致性校验**
- 学号：2023108610260 ｜ 完成日期：2026-09-29 ｜ 截止：2026-12-31
- 公开仓库：https://github.com/Leo-web-lhy/c2-ai-for-math-paper

## 一、这份作业做了什么

以"AI 做数学（AI4Math）"的**可靠性**为研究对象，提出一个可落地的框架：让同一条题面走两条相互独立的求解链（自然语言推理链 / 形式化-工具链），再用**双向一致性校验**把两条链的中间结论互相约束——只有两条链都过的一致结论才被采信，不一致处降级为"待人工复核"。论文给出形式化定义、算法流程、应用场景、实验设计与讨论。

论文正文约 **20,830 字符 / 606 行**，编译产物 **13 页**。

## 二、交付物索引

| 文件 | 说明 |
|---|---|
| `paper.tex` | 论文正文（七部分结构：摘要/引言/相关工作/方法/框架/分析/结论+参考文献） |
| `references.bib` | BibTeX 引用库，**16 条**，全部来自真实检索记录，无一条凭记忆生成 |
| `paper_bibliography.tex` | 与 `.bib` 同源生成的排版用文献表（16 条 `\bibitem`） |
| `AI日志.md` | AI 协作日志：任务 / 协作方式 / 产出物 / 人工介入，含逐阶段耗时 |
| `AAR.md` | 七维 AAR 复盘：学到什么 / 流程 / 与 AI 协作 / 完成了什么 / 卡点与突破 / 改进方向 / KSTAR 学习信号 |
| `选题与贡献边界.md` | 选题收敛过程与贡献边界声明（哪些是本文的、哪些不是） |
| `pipeline/` | 可复现流水线：文献池、引用核验结果、文献表生成脚本 |

## 三、怎么编译（可复核）

`paper.tex` 第 1 行声明了引擎，请用 XeLaTeX 系列引擎（含中文宏包 `ctex`）：

```tex
% !TEX program = xelatex
```

本地实测：**Tectonic 0.16.9（XeLaTeX 内核）** 编译 → `EXIT 0`，产出 13 页 PDF，编译器日志中 **0 条 LaTeX 报错**（仅剩字体/断行的外观提示）。

```bash
tectonic -X compile paper.tex --outdir out --keep-logs
```

> 注意：交付说明里同时写了 `pdflatex`。本文使用 `ctex` + `fontspec` 相关路径，**XeLaTeX 是已验证路径**；本机没有 `pdflatex`，因此 **pdfLaTeX 未经本地验证**——这一点在 `AI日志.md` 中已如实标注，不写成"已通过"。

## 四、引用可追溯性（防造假红线）

16 条引用全部由检索结果生成，来源为 OpenAlex 开放学术记录，逐条留下可核验的标识与链接：

| # | 文献 | 核验状态 |
|---|---|---|
| 1 | Chain-of-Thought Prompting（Wei et al., 2022） | ⚠ 弱（DOI 存疑） |
| 2 | Self-Consistency（Wang et al., 2022） | ✓ |
| 3 | Training Verifiers / GSM8K（Cobbe et al., 2021） | ✓ |
| 4 | MATH 数据集（Hendrycks et al., 2021） | ✓ |
| 5 | Program of Thoughts（Chen et al., 2022） | ✓ |
| 6 | PAL（Gao et al., 2022） | ✓ |
| 7 | Toolformer（Schick et al., 2023） | ✓ |
| 8 | Lean 4（de Moura & Ullrich, 2021） | ✓ |
| 9 | LeanDojo（Yang et al., 2023） | ✓ |
| 10 | Z3（de Moura & Bjørner, 2008） | ⚠ 弱（DOI 存疑） |
| 11 | Logic-LM（Pan et al., 2023） | ✓ |
| 12 | LLaMA（Touvron et al., 2023） | ✓ |
| 13 | Let's Verify Step by Step（Lightman et al., 2023） | ✓ |
| 14 | Autoformalization（Wu et al., 2022） | ✓ |
| 15 | From statistical relational to neurosymbolic AI（Marra et al., 2024） | ✓ |
| 16 | Observational equality, now!（Altenkirch et al., 2007） | ✓ |

汇总：`{"claims":16,"supported":16,"unsupported":0,"verified":14,"weak":2,"flagged":0}`

两条"弱"是因为自动核验拿不到可靠 DOI，**没有**被降级处理成"已验证"，也没有被悄悄丢弃——缺陷保留在交付物里，可被复核者直接看到。

## 五、可复现流水线

```bash
node pipeline/build_bib.js     # 由 refs_pool.json + citations_result.json 生成 references.bib 与 paper_bibliography.tex
```

`pipeline/` 中保留了原始检索池与核验结果，任何第三方都可以重跑生成脚本，比对 `references.bib` 是否与论文中的引用一致。
