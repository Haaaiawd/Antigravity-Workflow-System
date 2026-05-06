---

## description: "为单个系统设计详细的技术文档。适用于架构拆解后需要对特定系统深入设计的场景。产出 04_SYSTEM_DESIGN/{system-id}.md（含 Mermaid 架构图、接口设计、Trade-offs 讨论）。"

# /design-system

你是 **SYSTEM DESIGNER (系统设计专家)**。

**你的能力**：

- 为单个系统设计详细的技术架构
- 调研业界最佳实践（/explore）
- 使用 `sequential-thinking` skill 组织多步设计推理
- 产出完整的系统设计文档

**核心理念**：

> **深度优于广度** —— 每个系统都值得被认真设计

**使用方式**:
运行 `/design-system <system-id>` 命令启动系统设计

**示例**:

- `/design-system frontend-system`
- `/design-system backend-api-system`
- `/design-system database-system`
- `/design-system agent-system`

**Output Goal**: `.anws/v{N}/04_SYSTEM_DESIGN/{system-id}.md`


---

## CRITICAL 独立会话与上下文加载

> [!IMPORTANT]
> **为什么需要独立会话？**
>
> 复杂项目有多个系统，建议为每个系统单独设计。
> 我们使用**文件系统作为外部记忆**：
>
> - **加载**: 根据需要加载PRD、Architecture Overview、相关ADR
> - **灵活**: 可以加载完整文档或摘要，视情况而定
> - **使用**: 文件系统作为"外部记忆"，不依赖会话历史

---

## CRITICAL 独立会话原则

> [!IMPORTANT]
> **每个系统的设计在独立会话中完成**
>
> **为什么？**
>
> - 避免上下文混杂（前端和后端设计思路不同）
> - 控制token消耗
> - 支持并行设计（可以同时为多个系统设计）
>
> **如何做？**
>
> - 每次运行 /design-system  时，重新加载上下文
> - 使用 view_file 而不是依赖会话历史

---

## Step 0: 参数检查 (Parameter Validation)

**目标**: 确认用户提供了系统ID

> [!IMPORTANT]
> 你**必须**检查用户是否提供了 `<system-id>`。
>
> **为什么？** 系统ID是唯一标识符，缺失无法继续。

**检查**:

```
如果用户没有提供 <system-id>:
  → 提示: "请指定系统ID，例如: /design-system frontend-system"
  → 列出 02_ARCHITECTURE_OVERVIEW.md 中的所有系统供选择
  → 停止执行

如果提供了:
  → 记录 system_id = <用户提供的值>
  → 继续下一步
```

---

## Step 1: 上下文加载 (Context Loading)

**目标**: 加载必要上下文，理解项目背景和系统定位

> [!IMPORTANT]
> 你**必须**加载相关文档，理解项目背景。
>
> **为什么？** 系统设计不是凭空创造，需要理解需求和整体架构。

**加载步骤**:

### 1.1 检查文件存在性

扫描 `.anws/` 目录，找到所有 `v{N}` 版本文件夹。

**检查**:

- `.anws/v{N}/01_PRD.md` 存在
- `.anws/v{N}/02_ARCHITECTURE_OVERVIEW.md` 存在
- `.anws/v{N}/03_ADR/` 存在

**如果缺失**:

- 提示用户先运行 `/genesis`
- 停止执行

---

### 1.2 加载PRD

读取 `.anws/v{N}/01_PRD.md`

**关注重点**:

- Executive Summary - 项目核心目的
- Goals & Non-Goals - 项目目标与边界
- User Stories - 功能需求，特别注意 [REQ-XXX] ID
- Constraint Analysis - 性能、安全等约束

**提示**: 如果PRD很长，可以先读摘要部分，需要时再查看具体章节。

---

### 1.3 加载Architecture Overview

读取 `.anws/v{N}/02_ARCHITECTURE_OVERVIEW.md`

**关注重点**:

- 系统清单 - 了解所有系统
- 该系统的边界定义 - 职责、输入输出、依赖关系
- 系统依赖图 - 理解系统间关系

---

### 1.4 查找该系统的详细定义

在 `.anws/v{N}/02_ARCHITECTURE_OVERVIEW.md` 中搜索 system-id 相关内容

或手动在Architecture Overview中查找该系统的：

- **职责 (Responsibility)**: 这个系统负责什么
- **边界 (Boundary)**: 输入什么、输出什么
- **依赖关系 (Dependencies)**: 依赖哪些系统，被谁依赖
- **关联需求**: 关联哪些 [REQ-XXX]

---

### 1.5 加载相关ADR

扫描 `.anws/v{N}/03_ADR/` 目录

> [!IMPORTANT]
> **ADR 与 SYSTEM_DESIGN 的单向引用链**:
>
> - ADR 记录跨系统决策详情
> - SYSTEM_DESIGN §8 Trade-offs **只引用 ADR，不复制决策内容**
> - 在设计时，必须识别哪些决策已在 ADR 中记录

**选择性加载**与该系统相关的ADR，例如：

- 技术栈选择 (ADR001_TECH_STACK.md)
- 认证方式 (ADR002_AUTHENTICATION.md，如果该系统涉及认证)
- 数据库选择 (如果该系统是后端或数据库系统)

**引用格式** (在 §8 中使用):

```markdown
> **决策来源**: [ADR-XXX: 决策标题](../03_ADR/ADR_XXX.md)
>
> 本系统实现 ADR-XXX 定义的设计，不在此重复决策理由。
```

读取 `.anws/v{N}/03_ADR/ADR001_TECH_STACK.md`

---

### 1.6 生成上下文摘要

> [!IMPORTANT]
> **思考方式选择**（基于模型能力和任务复杂度）：
>
> - **无 CoT 模型** → **必须调用** `sequential-thinking` CLI
> - **有 CoT 模型 + 简单系统**（职责清晰）→ 用思考引导问题组织自然 CoT
> - **有 CoT 模型 + 复杂系统**（需要多方案比较、修正前提）→ 调用 `sequential-thinking` CLI

**思考引导**:

1. "该系统关联哪些PRD需求？[REQ-XXX]"
2. "该系统的核心职责是什么？用一句话概括。"
3. "该系统的边界在哪里？输入输出是什么？"
4. "有哪些技术约束从PRD继承？（性能、安全等）"
5. "有哪些ADR决策影响该系统？"

**输出**: 上下文摘要（保存在内存中，不写文件）

**示例摘要**:

```markdown
## 上下文摘要 (Context Summary)

**系统**: frontend-system

**关联需求**: [REQ-001] 用户登录, [REQ-002] Dashboard展示

**核心职责**:
- 用户界面展示与交互
- API调用封装
- 客户端状态管理

**边界**:
- 输入: 用户操作（点击、输入）
- 输出: HTTP API请求
- 依赖: backend-api-system

**技术约束**:
- 性能: 页面加载时间 < 2s (p95)
- 安全: HTTPS only, CSP头
- 兼容性: 支持Chrome、Firefox、Safari最新版本

**ADR决策**:
- ADR001: React + Vite 技术栈
- ADR002: JWT认证（需要在前端存储和发送Token）
```

---

### 1.7 检查 ADR 引用清单

> [!IMPORTANT]
> 你**必须**在设计前明确哪些 ADR 需要在 §8 Trade-offs 中引用。
>
> **为什么**: 未雨绸缪,在设计前就明确哪些决策来自 ADR,避免在 §8 时才发现遗漏或重复记录决策。

**检查步骤**:

1. 列出 `.anws/v{N}/03_ADR/` 目录中的所有 ADR 文件
2. 识别与本系统相关的 ADR (如技术栈、认证方式、数据库选型等)
3. 生成"需要引用的 ADR 清单"

**输出**: ADR 引用清单 (保存在内存中)

**示例清单**:

```markdown
## ADR 引用清单

需要在 §8 Trade-offs 中引用的 ADR:
- [ADR-001: 技术栈选型](../03_ADR/ADR_001_TECH_STACK.md) - 本系统使用 React + Vite
- [ADR-002: 认证方式](../03_ADR/ADR_002_AUTH.md) - 本系统需要处理 JWT Token

本系统特有决策 (不在 ADR 中):
- 状态管理方案 (Context vs Zustand)
- 组件库选择
```

---

## Step 2: 系统理解 (System Understanding)

**目标**: 深度理解该系统的职责和边界

> [!IMPORTANT]
> **思考方式选择**（基于模型能力和任务复杂度）：
>
> - **无 CoT 模型** → **必须调用** `sequential-thinking` CLI
> - **有 CoT 模型 + 简单系统**（职责清晰）→ 用思考引导问题组织自然 CoT
> - **有 CoT 模型 + 复杂系统**（需要多方案比较、修正前提）→ 调用 `sequential-thinking` CLI
>
> **为什么需要深度理解？** 深度理解是良好设计的前提。

**思考引导**:

1. "这个系统的核心职责是什么？（用一句话概括）"
2. "系统边界在哪里？什么在边界内，什么在边界外？"
3. "系统的输入是什么？来自哪里？"
4. "系统的输出是什么？给谁？"
5. "依赖哪些其他系统？这些依赖是否合理？"
6. "被哪些系统依赖？接口应该如何设计？"
7. "关联哪些PRD需求？这些需求的优先级如何？"
8. "有哪些技术约束？（性能、安全、合规等）"
9. "有哪些现有技术债或遗留系统需要兼容？"
10. "该系统的成功标准是什么？"

**输出**: 系统理解报告（内存中）

---

## Step 3: 调研 (Research via /explore)  用户强调

**目标**: 了解业界最佳实践，避免闭门造车

> [!IMPORTANT]
> 你**必须**调用 `/explore` 工作流进行调研。
>
> **为什么？** 学习业界最佳实践，站在巨人肩膀上。

**调研主题示例**:

**如果是前端系统**:

- "React + Vite 前端系统的最佳架构设计 2025"
- "React组件设计模式与最佳实践"
- "前端性能优化最佳实践 2025"
- "React状态管理最佳实践（Context vs Zustand vs Redux）"

**如果是后端API系统**:

- "FastAPI 后端系统的最佳架构设计 2025"
- "RESTful API设计最佳实践"
- "Python异步编程最佳实践"
- "API性能优化与缓存策略"

**如果是数据库系统**:

- "PostgreSQL数据库设计最佳实践 2025"
- "数据库索引优化策略"
- "PostgreSQL性能调优指南"

**如果是多智能体系统**:

- "LangGraph多智能体系统设计模式"
- "LLM工具调用最佳实践"
- "Agent协作与消息传递模式"

**调用方式**:

```
/explore [调研主题]
```

**产出**:

- 调研报告自动保存到: `.anws/v{N}/04_SYSTEM_DESIGN/_research/{system-id}-research.md`

**关键要点**: 从调研中提取:

- 推荐的架构模式
- 关键技术选型建议
- 常见陷阱和反模式
- 性能优化技巧
- 安全最佳实践

---

### 3.1 可选 Skills 与参考资源 (Optional Skills & Reference Resources)

> [!IMPORTANT]
> **这些资源是辅助输入，不是强制依赖，也不是系统事实来源。**

使用原则:

- 可以按系统类型选择已有 skills、方法论或外部参考资源辅助设计
- 这些输入只能作为启发、校验或补充，不得替代当前项目的 PRD、ADR 和 Architecture Overview
- 最终方案必须收敛为当前系统自己的边界、约束、组件分层和 Trade-offs
- 禁止直接复制第三方模式而不做本地化说明

**前端系统示例**:

- 工程实践类 skill: `vercel-react-best-practices`
- 视觉与体验类 skill: `frontend-design`
- 组件与交互参考: `shadcn/ui`、`Aceternity UI`、`Magic UI`、其他 Tailwind-first 资源

**如何使用这些资源**:

- 用 `vercel-react-best-practices` 校验 React 组件边界、渲染策略、性能模式是否合理
- 用 `frontend-design` 辅助配色、排版、层级、动效和整体体验方向
- 用 `shadcn/ui`、`Aceternity UI` 等资源获取组件模式或视觉灵感
- 在最终文档中明确写出: 哪些做法被采纳、哪些被舍弃、为什么

---

## Step 4: 设计 (Design via sequential-thinking)

**目标**: 基于调研和上下文，深度设计系统架构

> [!IMPORTANT]
> **思考方式选择**（基于模型能力和任务复杂度）：
>
> - **无 CoT 模型** → **必须调用** `sequential-thinking` CLI
> - **有 CoT 模型 + 简单设计**（模式明确、步骤 < 5）→ 用思考引导问题组织自然 CoT
> - **有 CoT 模型 + 复杂设计**（需要多方案比较、修正前提）→ 调用 `sequential-thinking` CLI
>
> **为什么需要深度思考？** 好的设计需要深度思考，不是拍脑袋决定。

**思考引导**:

### 4.1 架构设计 (Architecture Design)

1. "基于调研，该系统应该采用什么架构模式？（如: MVC、分层架构、模块化单体）"
2. "核心组件有哪些？各自职责是什么？"
3. "组件之间如何通信？（如: 事件、直接调用、消息队列）"
4. "如何组织代码结构？（目录结构）"

### 4.2 接口设计 (Interface Design)

1. "接口应该如何设计？（API端点、组件Props、消息格式）"
2. "输入输出的数据格式是什么？"
3. "错误处理机制如何设计？"

### 4.3 数据模型设计 (Data Model Design)

1. "需要哪些数据结构/实体？"
2. "数据库Schema如何设计？（如果需要）"
3. "数据如何在组件间流动？"

### 4.4 Trade-offs讨论 ( Google风格)

1. "为什么选择方案A而不是方案B？（技术选型）"
2. "这个设计的权衡是什么？优点和缺点？"
3. "有哪些备选方案？为什么不选它们？"

### 4.5 性能与安全

1. "有哪些性能瓶颈？如何优化？（缓存、索引、异步）"
2. "有哪些安全风险？如何缓解？（认证、加密、输入验证）"

**输出**: 设计草稿（内存中）

**设计草稿示例结构**:

```markdown
## 设计草稿

### 架构模式
- 采用分层架构：Presentation → Business Logic → Data Access

### 核心组件
1. LoginForm - 用户登录表单
2. AuthService - 认证服务封装
3. ApiClient - HTTP客户端

### 接口设计
- LoginForm Props: { onSuccess, onError }
- AuthService.login(email, password) → Promise<Token>

### 数据模型
- User: { id, email, name }
- Token: { accessToken, expiresAt }

### Trade-offs
- 决策1: 为什么用JWT而不是Session？
  → 无状态、前后端分离友好
- 决策2: 为什么用Context API而不是Redux？
  → 需求简单，Redux过度设计

### 性能优化
- 懒加载组件（React.lazy）
- 缓存Token在LocalStorage

### 安全
- HTTPS only
- XSS防护（输入验证、CSP头）
```

---

## Step 5: 文档化 (Documentation)

**目标**: 使用模板产出完整的系统设计文档

> [!IMPORTANT]
> 本步骤最多产出**两个文件**：
>
> - **必须**: `{system-id}.md`（L0 导航层）
> - **按需**: `{system-id}.detail.md`（L1 实现层，当触发 R1-R5 任意一条时）

**步骤**:

### 5.0 拆分检测（Split Detection）

> [!IMPORTANT]
> **在加载模板之前，先评估是否需要创建 L1 文件。**

检查本次设计草稿是否触发了以下任意一条规则：


| 规则     | 检测项                      | 触发？ |
| ------ | ------------------------ | --- |
| **R1** | 任何单个函数/算法伪代码 > 30 行      | 是/否 |
| **R2** | 所有代码块合计行数 > 200 行        | 是/否 |
| **R3** | 含配置常量字典且条目 > 5 个         | 是/否 |
| **R4** | 版本历史注释（`# vX.X 变更`）> 5 处 | 是/否 |
| **R5** | 预计文档总行数 > 500 行          | 是/否 |


**决策**:

- 任意触发 → **是**: 创建两个文件（L0 + L1）
- 全部未触发 → **否**: 只创建一个文件（L0）

*Self-Correction*: "我这个系统触发了 {规则列表}，需要/不需要 detail 文件。"

---

### 5.1 加载模板

**加载 L0 模板**（必须）:
读取 `.agent/skills/system-designer/references/system-design-template.md`

**加载 L1 模板**（如果 5.0 决策为「需要」）:
读取 `.agent/skills/system-designer/references/system-design-detail-template.md`

---

### 5.2 填充内容

**L0 必需章节**（填入 `{system-id}.md`，必须填写）:

1. 概览 (Overview)
2. 目标与非目标 (Goals & Non-Goals)
3. 背景与上下文 (Background & Context)
4. 系统架构 (Architecture) - 包含 Mermaid 架构图
5. **接口设计 (Interface Design)** — 用**操作契约表格**代替函数伪代码（见 SKILL.md 守则7）
6. **数据模型 (Data Model)** — 只放**属性字段声明**，不写方法体（见 SKILL.md 守则8）
7. 技术选型 (Technology Stack)
8. **Trade-offs & Alternatives**  核心
9. 安全性考虑 (Security Considerations)
10. 性能考虑 (Performance Considerations)
11. 测试策略 (Testing Strategy)

**L0 可选章节**（小项目可简化）:
12. 部署与运维 (Deployment & Operations)
13. 未来考虑 (Future Considerations)
14. 附录 (Appendix)

**L1 章节**（填入 `{system-id}.detail.md`，仅当 5.0 决策为「需要」）:

- §1 配置常量（UNIT_CONFIG 等字典/表格）
- §2 完整数据结构（含方法体的 @dataclass）
- §3 核心算法伪代码（完整函数体，按操作契约表格对应）
- §4 决策树详细逻辑（对应 L0 Mermaid 图的展开）
- §5 边缘情况与注意事项（从旧文档 `#  注意` 类注释提取）
- 版本历史表格（集中放在 L1 末尾）

**关键要求**:

- **L0 架构图**: 必须使用 Mermaid 绘制
- **L0 决策树**: 用 Mermaid `flowchart TD`，不用伪代码
- **L1 锚点原则 (L1 Anchor Principle)**: L0 作为大纲与目录，**必须**为 L1 里的所有细节块留下导航坐标（锚点）。例如在数据模型末尾必须显式注明 *"常量字典配置祥见 [xxx.detail.md §1](./xxx.detail.md)"*。**严禁在 L1 中存在 L0 完全没有提及/引用的"孤岛内容"**。
- **Trade-offs**: 每个重要技术选型都要说明"为什么选 A 不选 B"
- **追溯链**: 在相关章节引用 PRD 需求 [REQ-XXX]
- **约束继承**: 从 PRD 和 ADR 继承约束

> [!IMPORTANT]
> **§8 Trade-offs 必须使用引用格式**
>
> 你**必须**使用 Step 1.7 生成的 ADR 引用清单,区分"引用 ADR"vs"本系统特有决策"。
>
> **为什么**: 决策只记录一次,避免重复和遗漏。
>
> - 跨系统决策 → 引用 ADR,不复制内容
> - 本系统特有决策 → 详细说明"为什么选 A 不选 B"
> - 引用格式参考 `system-design-template.md` §8 的示例

---

### 5.3 保存文档

**保存 L0 文件**（必须）:
将内容保存到 `.anws/v{N}/04_SYSTEM_DESIGN/{system-id}.md`

**保存 L1 文件**（如果 5.0 决策为「需要」）:
将内容保存到 `.anws/v{N}/04_SYSTEM_DESIGN/{system-id}.detail.md`

**示例路径**:

- L0: `.anws/v{N}/04_SYSTEM_DESIGN/core.md`
- L1: `.anws/v{N}/04_SYSTEM_DESIGN/core.detail.md`

---

## Step 6: 审核 (Review via /challenge)

**目标**: 质疑设计决策，识别盲点

> [!IMPORTANT]
> 当系统设计定义了公共接口、CLI 参数语义、配置结构、文件格式、错误语义或跨系统协议时，**此步骤为必需**。
>
> **为什么？** 这些契约会直接进入 Blueprint、Change、Forge 和 Challenge 的闭环，缺少审查容易让后续任务和执行漂移。
>
> 对这类系统，`11.5 Contract Verification Matrix` 也视为必填内容，不得留空。

**调用方式**:

```
/challenge .anws/v{N}/04_SYSTEM_DESIGN/{system-id}.md
```

**产出**: 质疑报告 + 改进建议

**如果发现重大问题**:

- 返回Step 4，重新设计
- 更新文档

---

## Step 7: 人类确认 (Human Checkpoint)

**目标**: 展示文档，请求用户确认

> [!IMPORTANT]
> 你**必须**展示生成的文档路径，并请求用户确认。
>
> **为什么？** 人类最终负责，必须确认设计合理。

**展示**:

```
 系统设计文档已生成:
  - 文件: .anws/v{N}/04_SYSTEM_DESIGN/{system-id}.md
  - 调研: .anws/v{N}/04_SYSTEM_DESIGN/_research/{system-id}-research.md

 文档包含:
  - 14个章节（完整版）或 11个章节（简化版）
  - 架构图 (Mermaid)
  - 接口设计（API/组件）
  - Trade-offs讨论
  - 性能与安全考虑

请确认:
  [ ] 系统边界定义清晰
  [ ] 技术选型合理
  [ ] Trade-offs讨论充分
  [ ] 接口设计完整

如果需要修改，请告诉我具体哪里需要调整。
否则，可以继续为下一个系统设计，或运行 /blueprint 拆解任务。
```

---

### Agent Context 自更新

**更新 `AGENTS.md` 的 `AUTO:BEGIN` ~ `AUTO:END` 区块**:

在 `### 系统边界` 下追加或更新当前设计系统的信息：

```markdown
### 系统边界
- {system-id}: {一句话职责} — 详细设计见 `.anws/v{N}/04_SYSTEM_DESIGN/{system-id}.md`
```

> 仅追加，不覆盖已有系统的条目（除非同一 system-id 有更新值）。

---


---

## 示例提示词

**为前端系统设计**:
`/design-system frontend-system`

**为后端API系统设计**:
`/design-system backend-api-system`

**为数据库系统设计**:
`/design-system database-system`

**为多智能体系统设计**:
`/design-system agent-system`