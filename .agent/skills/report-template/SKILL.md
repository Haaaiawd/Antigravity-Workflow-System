---
name: report-template
description: 综合 Scout 阶段所有分析（build-inspector, runtime-inspector, git-forensics, concept-modeler），生成决策就绪的系统风险报告。
---

# 综合者手册 (The Synthesizer's Manual)

> "数据不是信息。信息不是知识。知识不是智慧。" —— T.S. Eliot

你的目标是将原始分析数据转化为**架构师可用的智慧**。

---

## ⚠️ 强制自检 (Mandatory Self-Correction)

> [!IMPORTANT]
> 在生成报告之前，你**必须**进行自我检查：
> 1.  "build-inspector 发现的构建边界和 runtime-inspector 发现的 IPC 边界是否一致？"
> 2.  "git-forensics 发现的高耦合文件对是否跨越了构建边界？"
> 3.  "concept-modeler 识别的缺失组件是否与已发现的风险相关？"
> 4.  "这份报告是否足够完整？"

---

## ⚡ Quick Start

1.  **读取模板 (MANDATORY)**: 使用 `view_file references/REPORT_TEMPLATE.md`。你的报告**必须**完全匹配此结构。
2.  **综合所有发现**: 汇总来自以下来源的输出：
    *   `build-inspector` → Build Roots, Topology
    *   `runtime-inspector` → IPC Surfaces, Contract Status
    *   `git-forensics` → Coupling Pairs, Hotspots
    *   `concept-modeler` → Entities, Missing Components
3.  **起草报告**: 按照模板组织逻辑连接。
4.  **发布 (CRITICAL)**: 你**必须**使用 `write_to_file` 保存到 `genesis/v{N}/00_SCOUT_REPORT.md`。**禁止**仅打印到聊天。确保 `genesis/v{N}/` 目录存在。

---

## ✅ 完成检查清单

在进入下一阶段之前，验证：
- [ ] 输出文件已创建: `genesis/v{N}/00_SCOUT_REPORT.md`
- [ ] 包含: System Fingerprint, Component Map, Risk Matrix, Feature Landing Guide
- [ ] 用户已确认发现

---

## 🛠️ 综合仪式

### 1. 执行摘要 (Executive Summary)
*   **电梯演讲**: 用 30 秒描述系统的健康状况。
*   **聚焦点**: 技术债务、关键风险、可靠性。

### 2. 暗物质检测
*   不仅仅列出存在的东西。**列出缺失的东西**。
*   检查清单: 日志？错误处理？CI/CD？密钥管理？版本握手？

### 3. 交叉验证 (Cross-Verification)
*   **build-inspector** 说 "Workspace 统一管理"？
*   **git-forensics** 说 "高耦合跨越构建根"？
*   **结论**: 发现隐藏的逻辑耦合 → **重构目标**。

### 4. 人工检查点
*   强制用户确认: "这份报告完整吗？"
*   **在此报告签字前，禁止进入 Blueprint 阶段**。

---

## 🛡️ 老师傅守则

1.  **禁止幻觉**: 每个声明必须链接到源文件。
2.  **残酷诚实**: 直言不讳。如果是一团糟，就说是一团糟。
3.  **行动导向**: 列出的每个问题都必须暗示一个解决方案 (重构/重写/保留)。

---

## 🧰 工具箱

*   `references/REPORT_TEMPLATE.md`: 报告主模板。

---

## Consumers (消费者)

这份报告的直接消费者是 `/blueprint` 阶段的:
*   **System Architect**: 依赖你的风险清单来设计规避策略。
*   **Complexity Guard**: 依赖你的发现来审计 RFC 复杂度。

你的分析质量**直接决定**下一阶段的设计质量。
