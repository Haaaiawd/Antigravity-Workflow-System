---
name: git-forensics
description: 分析 Git 历史，发现"逻辑耦合"（总一起改的文件）和"热点"（高频修改的复杂模块）。基于 Adam Tornhill 的《Your Code as a Crime Scene》方法论。
---

# 考古学家手册 (The Archaeologist's Field Notes)

> "历史不会重复，但会押韵。静态分析告诉你结构，Git 取证告诉你痛苦的真相。" —— Adam Tornhill

本技能基于 **Adam Tornhill 的《Your Code as a Crime Scene》** 方法论。
核心思想：代码的**演化历史**比代码本身更能揭示设计问题。

---

## ⚠️ 强制深度思考

> [!IMPORTANT]
> 在执行任何分析之前，你**必须**调用 `sequential thinking` 工具，视情况进行 **2—3 步**推理。
> 思考内容例如：
> 1.  "这个项目的 Git 历史有多深？是否需要 `git fetch --unshallow`？"
> 2.  "我应该关注哪个时间范围？（最近 3 个月？1 年？）"
> 3.  "有没有明显的'噪音文件'（如 `package-lock.json`）需要排除？"

---

## ⚡ 快速启动
1.  **耦合分析**: `python scripts/git_forensics.py --repo . --threshold 0.3`
2.  **热点探测**: `python scripts/git_hotspots.py --repo . --days 180`

---

## 🧭 探索流程 (The Dig)

### 第一步：感知时间流 (The Tornhill Method)
*   **老师傅箴言**: "代码的价值不是它是什么，而是它是如何变成这样的。"
*   运行 `git log --oneline -n 100`，快速感知项目近期活跃度。
*   **关键推断**: 如果最近 50 次提交都只涉及一两个目录，那就是"震中"——最可能藏有风险的地方。

### 第二步：发现隐性耦合 (Temporal Coupling / Change Coupling)
*   **核心问题**: "有没有两个文件，它们在代码里**没有** `import`/`use` 关系，但 **70%** 的提交都一起出现？"
*   **老师傅警报 (来自 Adam Tornhill)**:
    *   ⚠️ **逻辑耦合但物理分离** -> 这是"架构腐烂 (Architectural Decay)"的强信号！
    *   ⚠️ **跨构建根的耦合** -> 如果 `service/ipc.rs` 总和 `gui/api.ts` 一起改，但它们属于不同构建根，这是**版本漂移**的温床！
    *   **处方**: 要么合并它们到同一模块，要么抽象出共享的 Schema/契约层。

### 第三步：定位热点 (Hotspot Analysis - CodeScene Methodology)
*   **公式**: 热点 = 高变更频率 (Churn) × 高复杂度 (Complexity)
*   **老师傅策略矩阵 (来自 CodeScene)**:

    | | 低复杂度 | 高复杂度 |
    | :---: | :---: | :---: |
    | **高 Churn** | 配置/生成代码，可忽略 | 🔴 **优先重构！Bug 温床，ROI 最高** |
    | **低 Churn** | 稳定模块，别动 | 🟡 遗留雷区，小心翼翼 |

*   **老师傅建议**: 重构资源有限时，**只攻高 Churn + 高 Complexity 的象限**。这是投资回报率最高的地方。

---

## 🛡️ 老师傅守则

1.  **先取消浅克隆**: `git fetch --unshallow`。没有历史 = 没有数据 = 你是盲人。
2.  **过滤噪音**: 忽略 `package-lock.json`, `Cargo.lock`, `*.min.js`, `dist/` 等生成物。它们会污染你的分析结果。
3.  **警惕大规模重命名**: 重命名 (`git mv`) 会干扰追踪。如果发现诡异的耦合数据，手动检查是否是重命名导致。
4.  **关联构建信息**: 在输出耦合对时，**标注它们分别属于哪个构建根**。这是连接 Git 分析和 Build 分析的关键桥梁。

---

## 📤 输出清单

1.  **Coupling Pairs (耦合对)**: Score > 0.7 的文件对。**标注它们的构建根**。
2.  **Cross-Root Couplings (跨根耦合)**: 重点标记！如果两个高耦合文件属于不同构建根，这是**头号风险**。
3.  **Hotspots (热点)**: 高风险模块列表 (高 Churn + 高 Complexity)。
4.  **Orphans (孤儿)**: 超过 1 年无人触碰的文件（知识腐烂警告）。
5.  **Refactoring Priority**: 根据 Churn/Complexity 矩阵给出建议的重构优先级。
