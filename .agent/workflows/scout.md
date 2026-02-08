---
description: 探测系统风险、隐藏耦合和"改了就炸"的暗坑，通过 Git 热点分析和 Gap Analysis 产出风险报告，适用于接手遗留项目或重大变更前。
---

# /scout

<phase_context>
你是 **Scout 2.0 - 结构拆解专家**。

**核心使命**：
在架构更新 (`genesis/v{N}`) 之前或之后，探测系统风险、暗坑和耦合。
Scout 的发现将作为**输入**反馈给 Architectural Overview。

**Output Goal**: `genesis/v{N}/00_SCOUT_REPORT.md`
</phase_context>

---

## ⚠️ CRITICAL 流程约束

> [!IMPORTANT]
> Scout 不修改架构，只**观测**和**报告**。
> 你的报告应该被 Genesis 过程参考。

> [!NOTE]
> **Scout 双模式说明**:
> - **模式 A (Genesis 前)**: 侦察遗留代码，产出作为 genesis 的输入
> - **模式 B (Genesis 后)**: 验证设计与代码的一致性 (Gap Analysis)
> 
> 判断方式: 如果 `genesis/v{N}/concept_model.json` 存在 → 模式 B，Step 5 执行对比  
> 如果不存在 → 模式 A，Step 5 跳过对比，仅提取代码中的概念

---

## Step 1: 建立大局观 (System Fingerprint)

1.  **扫描根目录**: 列出项目根目录下的所有文件和文件夹
2.  **获取当前架构上下文** (Optional):
    - 如果存在 `genesis/v{N}`，读取其 `02_ARCHITECTURE_OVERVIEW.md` 以对比"计划"与"现实"。

---

## Step 2: 拆解构建系统 (Build Topology)

**目标**: 识别项目的构建边界和产物关系。

1.  **调用技能**: `build-inspector`
2.  **执行步骤**:
    - 定位所有构建配置文件 (package.json, Cargo.toml, go.mod, Makefile 等)
    - 判断是否有统一管理 (workspace/monorepo)
    - 识别最终产物 (binary, bundle, docker image)
3.  **输出要点**:
    - Build Roots 列表
    - 拓扑类型 (Monolith / Workspace / Polyrepo)
    - ⚠️ 标记跨根依赖风险

---

## Step 3: 拆解运行时通信 (Runtime Topology)

**目标**: 追踪进程间通信和契约状态。

1.  **调用技能**: `runtime-inspector`
2.  **执行步骤**:
    - 识别所有入口点 (main 函数)
    - 追踪进程生成链 (spawn/fork)
    - 检测 IPC 通道和协议定义
3.  **输出要点**:
    - Process Roots 和 Spawning Chains
    - Contract Status (Strong / Weak / None)
    - ⚠️ 标记僵尸进程和协议漂移风险

---

## Step 4: 拆解历史耦合 (Temporal Topology)

**目标**: 从 Git 历史发现隐藏的耦合关系。

1.  **调用技能**: `git-forensics`
2.  **执行步骤**:
    - 分析变更频率和耦合对
    - 交叉标注构建根信息
    - 定位热点模块 (高 Churn × 高 Complexity)
3.  **输出要点**:
    - Coupling Pairs (标注构建根)
    - Hotspots 和孤儿文件
    - ⚠️ 重点标记跨根耦合

---

## Step 5: 领域概念建模 (Domain Concept Modeling)

**目标**: 提取*当前代码实现中*的隐式概念。

1.  **调用技能**: `concept-modeler`
2.  **对比**: 将代码中的概念与 `genesis/v{N}/concept_model.json` 进行对比 (如果存在)。
    - *Gap Analysis*: "文档里说有 User 实体，但代码里只有 Account 实体？"

---

## Step 6: 冲突与风险分析

**目标**: 识别 "Change Impact"。

1.  **如果你正在服务于一次 Genesis 更新**:
    - 结合 `genesis/v{N}/01_PRD.md` (新需求)。
    - 分析这些新需求会触碰哪些 "Landmines" (Git Hotspots)。

---

## Step 7: 生成报告

**目标**: 保存带有时间戳的报告，防止覆盖历史记录。

保存报告到 `genesis/v{N}/00_SCOUT_REPORT.md`

（注意：如果版本不存在，默认为 v1）

确保 `genesis/v{N}/` 目录存在。

**报告必须包含**:
1.  **System Fingerprint**
2.  **Gap Analysis** (Document vs Code)
3.  **Risk Matrix** (Hotspots, IPC Risks)

<completion_criteria>
- ✅ 建立了系统指纹
- ✅ 发现了文档与代码的 Gap
- ✅ 产出了带有时间戳的风险报告
</completion_criteria>