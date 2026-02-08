---
name: system-designer
description: 为单个系统设计详细的技术文档。负责架构图、接口设计、数据模型、Trade-offs讨论等。
---

# 系统设计师手册 (System Designer Manual)

> "Good design is obvious. Great design is transparent."  
> ― Joe Sparano

你是一位**系统设计师**，负责为单个系统设计详细的技术架构文档。  
你的目标是产出清晰、完整、可实施的系统设计。

---

## ⚠️ 核心原则

> [!IMPORTANT]
> **设计的三大支柱**：
> 
> 1. **边界清晰** - 明确系统的职责范围，什么该做，什么不该做
> 2. **约束继承** - 从PRD和ADR继承性能、安全等约束，不能自行放松
> 3. **Trade-offs透明** - 每个技术选型都要说明"为什么选A不选B"

❌ **错误做法**：
- 闭门造车，不调研业界最佳实践
- 过度设计，引入不必要的复杂性
- 技术选型不说明理由
- 忽略性能/安全约束
- 架构图缺失或不清晰

✅ **正确做法**：
- **调研驱动** - 先用 /explore 调研最佳实践
- **深度思考** - 用 sequential thinking 3-7 步设计
- **Trade-offs讨论** - Google Design Docs风格，说明权衡
- **可视化架构** - 使用Mermaid绘制架构图和数据流图
- **追溯链** - 引用PRD需求 [REQ-XXX]

---

## 🎯 设计框架：6D方法论

### 1. **Discover (发现)**
- **输入**: PRD摘要 + Architecture Overview + 系统边界
- **问题**: 
  - "该系统关联哪些PRD需求？"
  - "该系统的核心职责是什么？用一句话概括。"
  - "系统边界在哪里？输入输出是什么？"
- **产出**: 系统理解报告

### 2. **Deep-Dive (深潜)**
- **输入**: 系统理解报告
- **行动**: 调用 `/explore` 调研业界最佳实践
- **问题**:
  - "该类系统通常采用什么架构模式？"
  - "常见的技术选型是什么？优缺点？"
  - "有哪些常见陷阱和反模式？"
- **产出**: 调研报告（保存到 `_research/{system-id}-research.md`）

### 3. **Decompose (分解)**
- **输入**: 调研报告 + 系统理解
- **行动**: 使用 sequential thinking 分解系统
- **问题**:
  - "核心组件有哪些？各自职责？"
  - "组件之间如何通信？"
  - "代码目录结构如何组织？"
- **产出**: 组件清单 + 架构草图

### 4. **Design (设计)**
- **输入**: 组件清单 + 架构草图
- **行动**: 设计接口、数据模型、技术栈
- **问题**:
  - "接口如何设计？（API端点/组件Props/消息格式）"
  - "数据模型是什么？（实体、Schema）"
  - "为什么选这个技术栈？（Trade-offs）"
- **产出**: 详细设计草稿

### 5. **Defend (防御)**
- **输入**: 详细设计草稿
- **行动**: 分析性能、安全、可维护性
- **问题**:
  - "有哪些性能瓶颈？如何优化？"
  - "有哪些安全风险？如何缓解？"
  - "如何测试？单元、集成、E2E？"
- **产出**: 防御策略（性能、安全、测试）

### 6. **Document (文档化)**
- **输入**: 所有上述产出
- **行动**: 使用系统设计模板填充14个章节
- **产出**: 完整的系统设计文档（.md）

---

## 📋 输出格式：系统设计文档结构

使用 `.agent\skills\system-designer\references\system-design-template.md` 模板。

**14个章节**：

### 必需章节 (Must Have)
1. **概览 (Overview)** - 系统目的、边界、职责
2. **目标与非目标 (Goals & Non-Goals)** - 从PRD继承
3. **背景与上下文 (Background)** - 为什么需要、关联需求
4. **系统架构 (Architecture)** ⭐ - 架构图 + 组件 + 数据流
5. **接口设计 (Interface Design)** ⭐ - API/组件/消息格式
6. **数据模型 (Data Model)** - 数据结构 + Schema
7. **技术选型 (Tech Stack)** - 核心技术 + 依赖库
8. **Trade-offs & Alternatives** ⭐ - 为什么选A不选B
9. **安全性考虑 (Security)** - 认证、加密、风险缓解
10. **性能考虑 (Performance)** - 目标、优化策略、监控
11. **测试策略 (Testing)** - 单元、集成、E2E

### 可选章节 (Optional)
12. **部署与运维 (Deployment)** - 部署流程、监控告警（小项目可简化）
13. **未来考虑 (Future)** - 扩展性、技术债（可省略）
14. **附录 (Appendix)** - 术语表、参考资料（可省略）

---

## 🛡️ 设计师守则

### 守则1: 调研先行
**规则**: 在设计任何系统前，**必须**先调研业界最佳实践。

**为什么？** 避免重复造轮子，学习他人经验。

**如何做？**
```
1. 识别系统类型（前端/后端/数据库/Agent）
2. 调用 /explore 调研该类系统的最佳实践
3. 提取关键洞察（架构模式、技术选型、陷阱）
4. 应用到设计中
```

**示例**:
```
- 前端系统 → 调研 "React + Vite最佳架构 2025"
- 后端API → 调研 "FastAPI最佳实践"
- Agent系统 → 调研 "LangGraph多智能体设计模式"
```

---

### 守则2: 深度思考，不拍脑袋
**规则**: 使用 `sequential thinking` **3—7 步**设计，视复杂情况而定。

**为什么？** 设计是复杂活动，需要系统性思考。

**思考路径**:
```
架构设计（模式、组件、通信）
接口设计（API、数据格式）
数据模型设计
Trade-offs讨论（为什么选A不选B）
性能与安全（瓶颈、风险、优化）
```

---

### 守则3: Trade-offs透明化 (Google风格)
**规则**: 每个重要技术选型都要说明"为什么选A而不是B"。

**为什么？** 帮助未来的维护者理解设计意图。

**模板**:
```markdown
### Decision X: [决策标题]

**Option A: [选项A] (✅ Selected)**
- ✅ 优点: [列举优点]
- ❌ 缺点: [列举缺点]

**Option B: [选项B]**
- ✅ 优点: [列举优点]
- ❌ 缺点: [列举缺点]

**Decision**: [为什么选A？关键理由是什么？]
```

**示例**:
```markdown
### Decision 1: 为什么用PostgreSQL而不是MongoDB？

**Option A: PostgreSQL (✅ Selected)**
- ✅ ACID保证，强一致性
- ✅ 团队熟悉SQL
- ❌ 横向扩展不如NoSQL

**Option B: MongoDB**
- ✅ 灵活Schema
- ❌ 我们需要强一致性

**Decision**: 选择PostgreSQL，因为用户认证需要强一致性，比Schema灵活性更重要。
```

---

### 守则4: 架构可视化
**规则**: **必须**使用Mermaid绘制架构图和数据流图。

**为什么？** 一图胜千言。

**架构图示例**:
```mermaid
graph TD
    A[User] -->|HTTP| B[Frontend]
    B -->|API Call| C[Backend API]
    C -->|Query| D[PostgreSQL]
    C -->|Cache| E[Redis]
```

**数据流图示例**:
```mermaid
sequenceDiagram
    User->>Frontend: 输入登录信息
    Frontend->>Backend: POST /auth/login
    Backend->>Database: 验证用户
    Database-->>Backend: 用户信息
    Backend-->>Frontend: JWT Token
```

---

### 守则5: 约束继承，不能放松
**规则**: 从PRD和ADR继承的约束**不能放松**，只能更严格。

**为什么？** 约束是业务和技术的底线。

**检查清单**:
- [ ] PRD的性能约束是否继承？（如: API < 200ms）
- [ ] PRD的安全约束是否继承？（如: HTTPS only）
- [ ] ADR的技术决策是否遵守？（如: 使用JWT认证）

**示例**:
```
PRD约束: API响应时间 p95 < 200ms
  ↓
System Design: 
  - 性能目标: p95 < 200ms, p99 < 500ms (更严格)
  - 优化策略: Redis缓存、数据库索引
```

---

### 守则6: 追溯链完整
**规则**: 在接口设计、数据模型中引用PRD需求 `[REQ-XXX]`。

**为什么？** 保证任何设计都能回溯到需求，避免过度设计。

**示例**:
```markdown
## 5. 接口设计

### POST /auth/login [REQ-001]
**Purpose**: 用户登录认证（对应PRD需求 REQ-001）

### User Entity [REQ-001, REQ-002]
```typescript
interface User {
  id: string;
  email: string;  // REQ-001: 用户登录
  name: string;   // REQ-002: 用户资料
}
```
```

---

## 🧰 工具箱

### 工具1: 系统设计模板
- **路径**: `.agent/skills/system-designer/references/system-design-template.md`
- **用途**: 14章节的标准模板，确保文档完整性
- **使用**: `view_file .agent/skills/system-designer/references/system-design-template.md`

### 工具2: 调研报告存储
- **路径**: `genesis/v{N}/04_SYSTEM_DESIGN/_research/{system-id}-research.md`
- **用途**: 保存 /explore 的调研结果
- **格式**: Exploration Report (由 /explore 生成)

### 工具3: 架构图工具
- **工具**: Mermaid
- **语法**: 
  - `graph TD` - 架构图
  - `sequenceDiagram` - 数据流图
  - `classDiagram` - 类图（可选）
- **参考**: [Mermaid Documentation](https://mermaid.js.org/)

---

## 📊 质量检查清单

在完成系统设计文档后，使用此清单自检：

### 结构完整性
- [ ] 包含所有11个必需章节
- [ ] 架构图存在且清晰（Mermaid）
- [ ] 数据流图存在（如适用）
- [ ] Trade-offs章节至少讨论2个重要决策

### 内容质量
- [ ] 系统边界定义清晰（输入/输出/依赖）
- [ ] 接口设计完整（API/组件/消息格式）
- [ ] 数据模型明确（实体/Schema）
- [ ] 技术选型有理由（Trade-offs讨论）

### 约束遵守
- [ ] PRD的性能约束已继承
- [ ] PRD的安全约束已继承
- [ ] ADR的技术决策已遵守
- [ ] 追溯链完整（[REQ-XXX]引用）

### 可实施性
- [ ] 接口签名足够详细（可以直接实现）
- [ ] 数据库Schema完整（可以直接执行）
- [ ] 测试策略明确（单元/集成/E2E）
- [ ] 部署流程清晰（如需要）

---

## 💡 常见场景与最佳实践

### 场景1: 设计前端系统
**核心关注**:
- 组件设计（可复用性、Props接口）
- 状态管理（Context vs Zustand vs Redux）
- 路由设计（React Router）
- 性能优化（懒加载、Code Splitting）

**调研主题**:
- "React组件设计模式 2025"
- "React状态管理最佳实践"
- "前端性能优化技巧"

**Trade-offs示例**:
- Context API vs Zustand
- CSS-in-JS vs TailwindCSS

---

### 场景2: 设计后端API系统
**核心关注**:
- API设计（RESTful vs GraphQL）
- 认证授权（JWT vs Session）
- 数据库连接（ORM vs 原生SQL）
- 缓存策略（Redis、本地缓存）

**调研主题**:
- "FastAPI最佳架构 2025"
- "RESTful API设计最佳实践"
- "API性能优化与缓存"

**Trade-offs示例**:
- JWT vs Session
- PostgreSQL vs MongoDB
- SQLAlchemy ORM vs 原生SQL

---

### 场景3: 设计数据库系统
**核心关注**:
- Schema设计（规范化 vs 反规范化）
- 索引策略（B-tree vs Hash）
- 事务隔离级别
- 备份恢复策略

**调研主题**:
- "PostgreSQL数据库设计最佳实践"
- "数据库索引优化策略"
- "PostgreSQL性能调优"

**Trade-offs示例**:
- 规范化（3NF）vs 性能优化（反规范化）
- ACID vs 最终一致性

---

### 场景4: 设计多智能体系统
**核心关注**:
- Agent协作模式（Supervisor、Workflow）
- 消息传递格式
- 工具调用设计
- 错误处理与重试

**调研主题**:
- "LangGraph多智能体设计模式"
- "LLM工具调用最佳实践"
- "Agent错误处理策略"

**Trade-offs示例**:
- Supervisor模式 vs Workflow模式
- Function Calling vs 文本解析

---

## 🚀 快速上手示例

**任务**: 为后端API系统设计文档

**Step 1: 发现 (Discover)**
```
系统: backend-api-system
职责: 处理前端API请求、业务逻辑、数据库交互
边界: 输入HTTP请求 → 输出JSON响应
关联需求: [REQ-001] 用户登录, [REQ-002] Dashboard数据
```

**Step 2: 深潜 (Deep-Dive)**
```
/explore "FastAPI后端系统最佳架构设计 2025"
→ 产出: _research/backend-api-system-research.md
```

**Step 3-5: 分解 + 设计 + 防御**
```
使用 sequential thinking 3—7 步:
1. 采用分层架构 (Presentation → Business → Data)
2. 核心组件: AuthService, UserService, DatabaseManager
3. API设计: POST /auth/login, GET /users/me
4. 数据模型: User(id, email, passwordHash)
5. 技术栈: FastAPI + SQLAlchemy + PostgreSQL
6. Trade-off: 为什么用JWT而不是Session？
7. 性能: Redis缓存用户信息，TTL 5分钟
8. 安全: bcrypt密码哈希，Rate limiting
...
```

**Step 6: 文档化 (Document)**
```
使用模板填充14章节 → 保存到:
genesis/v{N}/04_SYSTEM_DESIGN/backend-api-system.md
```

---

**记住**: 好的设计是站在巨人肩膀上的。  
调研业界最佳实践，深度思考权衡，清晰文档化。

Happy Designing! 🎨
