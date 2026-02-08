---
description: 为单个系统设计详细的技术文档，通过调研最佳实践和深度思考产出完整的 System Design，包含架构图、接口设计和 Trade-offs 讨论。
---

# /design-system

<phase_context>
你是 **SYSTEM DESIGNER (系统设计专家)**。

**你的能力**：
- 为单个系统设计详细的技术架构
- 调研业界最佳实践（/explore）
- 深度思考设计方案（sequentialthinking）
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

**Output Goal**: `genesis/v{N}/04_SYSTEM_DESIGN/{system-id}.md`
</phase_context>

---

## ⚠️ CRITICAL 独立会话与上下文加载

> [!IMPORTANT]
> **为什么需要独立会话？**
> 
> 复杂项目有多个系统，建议为每个系统单独设计。
> 我们使用**文件系统作为外部记忆**：
> 
> - ✅ **加载**: 根据需要加载PRD、Architecture Overview、相关ADR
> - ✅ **灵活**: 可以加载完整文档或摘要，视情况而定
> - ✅ **使用**: 文件系统作为"外部记忆"，不依赖会话历史

---

## ⚠️ CRITICAL 独立会话原则

> [!IMPORTANT]
> **每个系统的设计在独立会话中完成**
> 
> **为什么？**
> - 避免上下文混杂（前端和后端设计思路不同）
> - 控制token消耗
> - 支持并行设计（可以同时为多个系统设计）
> 
> **如何做？**
> - 每次运行 /design-system <system-id> 时，重新加载上下文
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
扫描 `genesis/` 目录，找到所有 `v{N}` 版本文件夹。

**检查**:
- [ ] `genesis/v{N}/01_PRD.md` 存在
- [ ] `genesis/v{N}/02_ARCHITECTURE_OVERVIEW.md` 存在
- [ ] `genesis/v{N}/03_ADR/` 存在

**如果缺失**:
- 提示用户先运行 `/genesis`
- 停止执行

---

### 1.2 加载PRD
读取 `genesis/v{N}/01_PRD.md`

**关注重点**:
- Executive Summary - 项目核心目的
- Goals & Non-Goals - 项目目标与边界
- User Stories - 功能需求，特别注意 [REQ-XXX] ID
- Constraint Analysis - 性能、安全等约束

**提示**: 如果PRD很长，可以先读摘要部分，需要时再查看具体章节。

---

### 1.3 加载Architecture Overview
读取 `genesis/v{N}/02_ARCHITECTURE_OVERVIEW.md`

**关注重点**:
- 系统清单 - 了解所有系统
- 该系统的边界定义 - 职责、输入输出、依赖关系
- 系统依赖图 - 理解系统间关系

---

### 1.4 查找该系统的详细定义
在 `genesis/v{N}/02_ARCHITECTURE_OVERVIEW.md` 中搜索 system-id 相关内容

或手动在Architecture Overview中查找该系统的：
- **职责 (Responsibility)**: 这个系统负责什么
- **边界 (Boundary)**: 输入什么、输出什么
- **依赖关系 (Dependencies)**: 依赖哪些系统，被谁依赖
- **关联需求**: 关联哪些 [REQ-XXX]

---

### 1.5 加载相关ADR
扫描 `genesis/v{N}/03_ADR/` 目录

**选择性加载**与该系统相关的ADR，例如：
- 技术栈选择 (ADR001_TECH_STACK.md)
- 认证方式 (ADR002_AUTHENTICATION.md，如果该系统涉及认证)
- 数据库选择 (如果该系统是后端或数据库系统)

读取 `genesis/v{N}/03_ADR/ADR001_TECH_STACK.md`

---

### 1.6 生成上下文摘要

> [!IMPORTANT]
> 你**必须**使用 `sequentialthinking` (3-5步) 生成上下文摘要。

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

## Step 2: 系统理解 (System Understanding)

**目标**: 深度理解该系统的职责和边界

> [!IMPORTANT]
> 你**必须**使用 `sequentialthinking` (3-5步) 进行系统理解。
>
> **为什么？** 深度理解是良好设计的前提。

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

## Step 3: 调研 (Research via /explore) ⭐ 用户强调

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
- 调研报告自动保存到: `genesis/v{N}/04_SYSTEM_DESIGN/_research/{system-id}-research.md`

**关键要点**: 从调研中提取:
- 推荐的架构模式
- 关键技术选型建议
- 常见陷阱和反模式
- 性能优化技巧
- 安全最佳实践

---

## Step 4: 设计 (Design via sequentialthinking)

**目标**: 基于调研和上下文，深度设计系统架构

> [!IMPORTANT]
> 你**必须**使用 `sequentialthinking` (5-7步) 进行设计思考。
>
> **为什么？** 好的设计需要深度思考，不是拍脑袋决定。

**思考引导**:

### 4.1 架构设计 (Architecture Design)
1. "基于调研，该系统应该采用什么架构模式？（如: MVC、分层架构、模块化单体）"
2. "核心组件有哪些？各自职责是什么？"
3. "组件之间如何通信？（如: 事件、直接调用、消息队列）"
4. "如何组织代码结构？（目录结构）"

### 4.2 接口设计 (Interface Design)
5. "接口应该如何设计？（API端点、组件Props、消息格式）"
6. "输入输出的数据格式是什么？"
7. "错误处理机制如何设计？"

### 4.3 数据模型设计 (Data Model Design)
8. "需要哪些数据结构/实体？"
9. "数据库Schema如何设计？（如果需要）"
10. "数据如何在组件间流动？"

### 4.4 Trade-offs讨论 (⭐ Google风格)
11. "为什么选择方案A而不是方案B？（技术选型）"
12. "这个设计的权衡是什么？优点和缺点？"
13. "有哪些备选方案？为什么不选它们？"

### 4.5 性能与安全
14. "有哪些性能瓶颈？如何优化？（缓存、索引、异步）"
15. "有哪些安全风险？如何缓解？（认证、加密、输入验证）"

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
> 你**必须**使用 `.agent/skills/system-designer/references/system-design-template.md` 模板。
>
> **为什么？** 统一结构，保证文档质量和完整性。

**步骤**:

### 5.1 加载模板
读取 `.agent/skills/system-designer/references/system-design-template.md`

### 5.2 填充内容

**必需章节**（必须填写）:
1. 概览 (Overview)
2. 目标与非目标 (Goals & Non-Goals)
3. 背景与上下文 (Background & Context)
4. 系统架构 (Architecture) - 包含架构图
5. 接口设计 (Interface Design)
6. 数据模型 (Data Model)
7. 技术选型 (Technology Stack)
8. **Trade-offs & Alternatives** ⭐ 核心
9. 安全性考虑 (Security Considerations)
10. 性能考虑 (Performance Considerations)
11. 测试策略 (Testing Strategy)

**可选章节**（小项目可简化）:
12. 部署与运维 (Deployment & Operations) - 可简化
13. 未来考虑 (Future Considerations) - 可省略
14. 附录 (Appendix) - 可省略

**关键要求**:
- **架构图**: 必须使用Mermaid绘制
- **Trade-offs**: 每个重要技术选型都要说明"为什么选A不选B"
- **追溯链**: 在相关章节引用PRD需求 [REQ-XXX]
- **约束继承**: 从PRD和ADR继承约束

### 5.3 保存文档
将内容保存到 `genesis/v{N}/04_SYSTEM_DESIGN/{system-id}.md`

**示例路径**:
- `genesis/v{N}/04_SYSTEM_DESIGN/frontend-system.md`
- `genesis/v{N}/04_SYSTEM_DESIGN/backend-api-system.md`

---

## Step 6: 审核 (Review via /challenge) - 可选

**目标**: 质疑设计决策，识别盲点

> [!IMPORTANT]
> 这是**可选步骤**，但强烈建议执行。
>
> **为什么？** 第三方视角能发现设计盲点。

**调用方式**:
```
/challenge genesis/v{N}/04_SYSTEM_DESIGN/{system-id}.md
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
✅ 系统设计文档已生成:
  - 文件: genesis/v{N}/04_SYSTEM_DESIGN/{system-id}.md
  - 调研: genesis/v{N}/04_SYSTEM_DESIGN/_research/{system-id}-research.md

📋 文档包含:
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

<completion_criteria>
- ✅ 系统ID已确认
- ✅ 上下文已加载（PRD + Architecture Overview + 相关ADR）
- ✅ 系统理解已完成 (sequentialthinking 3-5步)
- ✅ 调研已完成 (/explore)
- ✅ 设计已完成 (sequentialthinking 5-7步)
- ✅ 文档已生成 (使用模板)
- ✅ 用户已确认
</completion_criteria>

---

## 📚 示例提示词

**为前端系统设计**:
`/design-system frontend-system`

**为后端API系统设计**:
`/design-system backend-api-system`

**为数据库系统设计**:
`/design-system database-system`

**为多智能体系统设计**:
`/design-system agent-system`

---

## 🛡️ 常见问题 (FAQ)

**Q1: 如果Architecture Overview中没有我要设计的系统怎么办？**
A: 提示用户先运行 `/genesis` 或更新 `02_ARCHITECTURE_OVERVIEW.md` 添加该系统。

**Q2: 如果调研找不到相关最佳实践怎么办？**
A: 调整调研关键词，或基于通用软件架构原则设计。记录在文档的"References"章节说明缺乏参考资料。

**Q3: 小项目是否需要完整的14章节？**
A: 结构保持一致，但可以简化内容。可省略章节: 13 (未来考虑), 14 (附录)。可简化章节: 12 (部署)。

---

// turbo-all
