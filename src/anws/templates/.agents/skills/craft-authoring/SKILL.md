---
name: craft-authoring
description: 执行 /craft 时必读：提供 Workflow / Skill / Prompt 的脚手架模板、防护语法、填充与验证清单；长模板与自检细节不在 craft workflow 内重复，一律以本 skill 为准。
---

# Craft Authoring — 脚手架与自检

本 skill 承接 **`/craft` workflow** 中「怎么写」的细节；`/craft` 只保留仪式与步骤路由。**禁止**在 workflow 里复述本节全文。

## Workflow 骨架（最小可用）

```markdown
---
description: [一句话，列表展示用]
---

# /name

<phase_context>
你是 **[角色]**。
**使命**：…
**能力**：…
**限制**：…
**原则**：…
**与用户的关系**：…
**Output Goal**: `路径`
</phase_context>

---

## CRITICAL …

> [!IMPORTANT]
> **为什么**：…
> - …
> - …

---

## Step 1: …

**目标**：…

> [!IMPORTANT]
> 你**必须**… **为什么？** …

**思考引导**:
1. …
2. …

---

<completion_criteria>
- …
</completion_criteria>
```

## Skill 骨架（description 必须是触发条件）

```markdown
---
name: kebab-name
description: 当 [具体触发场景] 时加载。[一句话能力概括]
---

# 标题

## 硬边界 / 原则
…

## 输入 / 输出契约
…
```

**description 忌**：泛泛「我能处理 PDF」；**宜**：「当用户要读取/编辑 PDF 时」。

## Prompt 骨架

```markdown
# 标题

## 角色
…

## 任务
…

## 约束
…

## 输出格式
…
```

## 防护语法速查


| 机制                      | 用途       |
| ----------------------- | -------- |
| `[!IMPORTANT]`          | 不可跳过节点   |
| `##  CRITICAL`        | 边界醒目     |
| `你**必须**`               | 强制动作     |
| 具体引导问题                  | 替代「好好想想」 |
| `<completion_criteria>` | 完成定义     |


重要约束建议包含：**做什么 / 为什么 / 违反时长什么样**。

## 填充内容（Step 5 等价）

用 `sequential-thinking` 组织 **3–5 个 thought**，覆盖：目标、最易错点、每步 I/O、引导问题、模板复用、调研结论如何打入文档。

**质量扫一眼**：目标是否逐步清晰、约束是否有「为什么」、是否有输出模板、关键处有 / 对照（如需）。

## 验证清单（输出前）

**结构**：frontmatter、`phase_context`（workflow）、CRITICAL 块、每步有目标、`<completion_criteria>`。

**内容**：路径含 `.anws/v{N}/` 若适用、kebab-case、工具调用语法正确。

## 自我批评（输出前最后一道）

用 `sequential-thinking` **3–5 thought**：用户会在哪卡住？AI 可能在哪偷懒跳过？与 `/challenge` 级质量相比缺什么？随后迭代修复再交付。