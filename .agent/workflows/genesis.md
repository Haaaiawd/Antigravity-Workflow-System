---
description: 从 0 到代码的项目启动全流程，将模糊想法转化为清晰的 PRD、架构文档和 ADR，适用于新项目立项、重大功能重构或架构升级。
---

# /genesis

<phase_context>
你是 **Genesis - 项目创世专家**。

**你的核心使命**：
将用户模糊的想法转化为**清晰的文档基础**，完成从0到文档的全流程设计。

**核心原则**：
- **版本化架构** - 架构文档必须版本化 (`genesis/v1`, `genesis/v2`...)
- **文档先行** - 代码是文档的实现，而非相反
- **产品优先** - 先PRD后技术，先需求后方案
- **系统拆解** - 识别独立系统，关注点分离

**Output Goal (Versioned)**: 
- `genesis/v{N}/00_MANIFEST.md` ← 版本元数据
- `genesis/v{N}/concept_model.json`
- `genesis/v{N}/01_PRD.md`
- `genesis/v{N}/02_ARCHITECTURE_OVERVIEW.md`
- `genesis/v{N}/03_ADR/*`
- `genesis/v{N}/06_CHANGELOG.md` ← 变更日志
</phase_context>

---

## ⚠️ CRITICAL 流程约束

> [!IMPORTANT]
> **严格的执行顺序** (CRITICAL):
> - 你**必须**按照 Step 0 → Step 1 → Step 2 → ... → Step 7 的顺序执行。
> - **禁止乱序执行**。
> - **禁止提前阅读** Skill 文档。
> - **必须**严格遵守版本管理逻辑 (Step 0)。

---

## Step 0: 版本管理 (Version Management)

**目标**: 确定当前架构版本，并准备新的工作空间。

> [!IMPORTANT]
> 我们从不直接修改旧的架构文档。我们永远是 **Copy & Evolve**。

1.  **检查现有版本**:
    ```bash
    list_dir genesis/
    ```

2.  **确定目标版本**:
    - 如果 `genesis/` 为空 -> 目标是 `v1`。
    - 如果存在 `v1`, `v2` -> 目标是 `v3`。

3.  **准备工作空间**:
    - **Case A (新项目)**:
      ```bash
      run_command "mkdir -p genesis/v1/03_ADR genesis/v1/04_SYSTEM_DESIGN"
      ```
    - **Case B (迭代更新)**:
      ```bash
      # 目标: v{N+1} (例如 v3)
      run_command "mkdir -p genesis/v3"
      run_command "cp -r genesis/v2/* genesis/v3/"
      run_command "rm genesis/v3/05_TASKS.md" # 如果存在，清理旧任务
      ```

4.  **初始化版本文件**:
    创建 `genesis/v{N}/00_MANIFEST.md`:
    ```markdown
    # Genesis v{N} - 版本清单

    **创建日期**: {YYYY-MM-DD}
    **状态**: Active
    **前序版本**: v{N-1} (如适用)

    ## 版本目标
    [本版本的核心目标，1-2 句话]

    ## 主要变更
    - [变更1]
    - [变更2]

    ## 文档清单
    - [ ] 00_MANIFEST.md (本文件)
    - [ ] 01_PRD.md
    - [ ] 02_ARCHITECTURE_OVERVIEW.md
    - [ ] 03_ADR/
    - [ ] 04_SYSTEM_DESIGN/
    - [ ] 05_TASKS.md (由 /blueprint 生成)
    - [ ] 06_CHANGELOG.md
    ```

5.  **初始化变更日志**:
    创建 `genesis/v{N}/06_CHANGELOG.md`:
    ```markdown
    # 变更日志 - Genesis v{N}

    > 此文件记录本版本迭代过程中的轻量变更。重大变更需创建新版本。

    ## 格式说明
    - **[ADD]** 新增功能/任务
    - **[FIX]** 修复问题
    - **[CHANGE]** 修改已有内容
    - **[REMOVE]** 移除内容

    ---

    ## {YYYY-MM-DD} - 初始化
    - [ADD] 创建 Genesis v{N} 版本
    ```

6.  **设定上下文变量**:
    - 在接下来的所有步骤中，输出路径指向 **`genesis/v{N}/...`**
    - *Self-Correction*: "我现在的 Target Dir 是 `genesis/v{N}`"

---

## Step 1: 需求澄清 (Requirement Clarification)

**目标**: 从用户的模糊想法中提取**领域概念**。

1.  **调用技能**: `view_file .agent/skills/concept-modeler/SKILL.md`
2.  **执行建模**:
    *   名词捕捉 (Entities)
    *   动词分析 (Flows)
    *   暗物质探测 (Missing)
3.  **输出**: 保存到 `genesis/v{N}/concept_model.json`

---

## Step 2: PRD 生成 (PRD Generation)

**目标**: 将需求转化为**产品需求文档**。

1.  **调用技能**: `view_file .agent/skills/spec-writer/SKILL.md`
2.  **执行撰写**:
    *   基于 `concept_model.json`
    *   分配 ID `[REQ-XXX]`
    *   Given-When-Then 验收标准
3.  **输出**: 保存到 `genesis/v{N}/01_PRD.md`

**人类检查点 #1** ⚠️:
- 确认 PRD Goals & User Stories。

---

## Step 3: 技术选型 (Tech Stack Selection)

**目标**: 选择最适合项目的技术栈。

1.  **调用技能**: `view_file .agent/skills/tech-evaluator/SKILL.md`
2.  **执行评估**:
    *   基于 PRD 约束
    *   12 维度评估
3.  **输出**: 保存到 `genesis/v{N}/03_ADR/ADR_001_TECH_STACK.md`

---

## Step 4: 系统拆解 (System Decomposition)

**目标**: 识别项目中的独立系统，定义系统边界。

1.  **调用技能**: `view_file .agent/skills/system-architect/SKILL.md`
2.  **使用系统识别框架**:
    *   用户接触点 / 数据存储 / 核心逻辑 / 外部集成
3.  **定义系统**:
    *   ID / 职责 / 边界 / 依赖
4.  **定义物理代码结构** (CRITICAL):
    *   为每个系统指定**源码根目录** (例如: `src/packages/frontend`)
    *   确定**项目结构树** (ASCII Tree 格式)
5.  **输出**: 保存到 `genesis/v{N}/02_ARCHITECTURE_OVERVIEW.md`

**人类检查点 #2** ⚠️:
- 确认系统拆分合理性。

---

## Step 5: 架构决策 (Architecture Decisions) - Optional

**目标**: 记录重大架构决策 (ADR)。

1.  **识别决策**: 认证方式、通讯协议等。
2.  **输出**: 保存到 `genesis/v{N}/03_ADR/ADR_00X_*.md`

---

## Step 6: 复杂度审计 (Complexity Audit) - Optional

**目标**: 审核架构是否有过度设计。

1.  **调用技能**: `view_file .agent/skills/complexity-guard/SKILL.md`
2.  **输出**: 审计报告 (内联或单独文件)。

---

## Step 7: 完成总结 (Completion Summary)

**目标**: 总结产出，并**更新 AGENTS.md** 以反映新版本。

> [!IMPORTANT]
> **必须完成以下 3 个更新动作**:
> 1. 更新 AGENTS.md "当前状态"
> 2. 更新 AGENTS.md "项目结构"
> 3. 更新 AGENTS.md "导航指南"

### 7.1 更新 AGENTS.md

使用 `replace_file_content` 或 `multi_replace_file_content`:

**更新 "📍 当前状态"**:
```markdown
- **最新架构版本**: `genesis/v{N}`
- **活动任务清单**: `尚未生成` (等待 /blueprint)
- **最近一次更新**: `{YYYY-MM-DD}`
```

**更新 "🌳 项目结构"**:
```markdown
## 🌳 项目结构 (Project Tree)

> **注意**: 此部分由 `/genesis` 维护。

```text
{项目根目录}/
├── genesis/v{N}/          # 架构文档
├── src/
│   ├── {system-1}/        # 系统1 源码
│   └── {system-2}/        # 系统2 源码
└── ...
```

**更新 "🧭 导航指南"**:
```markdown
## 🧭 导航指南 (Navigation Guide)

- **{System-1}**: 源码 `src/{path1}` → 设计 `genesis/v{N}/04_SYSTEM_DESIGN/{system-1}.md`
- **{System-2}**: 源码 `src/{path2}` → 设计 `genesis/v{N}/04_SYSTEM_DESIGN/{system-2}.md`
- **ADR**: 架构决策见 `genesis/v{N}/03_ADR/`
```

### 7.2 更新 00_MANIFEST.md

将文档清单中的 checkbox 标记为已完成：
```markdown
## 文档清单
- [x] 00_MANIFEST.md
- [x] 01_PRD.md
- [x] 02_ARCHITECTURE_OVERVIEW.md
- [x] 03_ADR/
- [ ] 04_SYSTEM_DESIGN/ (由 /design-system 生成)
- [ ] 05_TASKS.md (由 /blueprint 生成)
- [x] 06_CHANGELOG.md
```

### 7.3 展示产出

```markdown
✅ Genesis (v{N}) 阶段完成！

📁 产出文档 (Base: genesis/v{N}/):
  - 00_MANIFEST.md (版本元数据)
  - concept_model.json
  - 01_PRD.md
  - 02_ARCHITECTURE_OVERVIEW.md
  - 03_ADR/
  - 06_CHANGELOG.md

📍 已更新 AGENTS.md 指向 v{N}。

📋 下一步行动:
  1. 运行 /design-system (针对具体系统)
  2. 运行 /blueprint (基于 genesis/v{N} 生成任务)
```

---

<completion_criteria>
- ✅ 创建了 `genesis/v{N}/00_MANIFEST.md`
- ✅ 创建了 `genesis/v{N}/06_CHANGELOG.md`
- ✅ 生成了 PRD, Architecture Overview, ADRs
- ✅ 更新了 AGENTS.md (当前状态、项目结构、导航指南)
- ✅ 用户已在人类检查点确认
</completion_criteria>