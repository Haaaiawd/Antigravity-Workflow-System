---

## name: craft-authoring
description: 执行 /craft 时必读。提供 Workflow / Skill / Prompt 骨架与质量护栏。以判断准绳替代堆砌步骤。

# Craft Authoring - 脚手架与自检

本 skill 承接 `/craft` 中“如何写成”的细节。  
`/craft` 给方向，这里给落地。方向如果没有落地，会变成口号；落地如果没有方向，会变成机械动作。

## 全局写作协议

1. 禁止使用 emoji。
2. 允许拟人叙事，但语气必须克制、理性、专业。
3. 使用短句，每句表达单一语义。
4. 每个 Step 固定回答：做什么 / 为什么 / 怎么验收。
5. 先给意义，再给规则，再给验证。禁止只写漂亮话。

**判断准绳**：

- 好文档让执行者更清醒、更稳定、更可复现。
- 坏文档让执行者更兴奋，却更依赖临场发挥。

---

## Workflow 骨架（最小可用）

```markdown
---
description: [一句话说明用途]
---

# /name

<phase_context>
你是 **[角色]**。
**使命**：...
**能力**：...
**限制**：...
**与用户的关系**：...
**Output Goal**: `路径`
</phase_context>

---

## CRITICAL 写作约束

> [!IMPORTANT]
> 写作约束由 `/craft` 主 workflow 统一定义，此处不重复展开。

---

## Step 1: [标题]

### 做什么
...

### 为什么
...

### 怎么验收
- ...
- ...

---

<completion_criteria>
- [可验证完成标准]
</completion_criteria>
```

## Skill 骨架（description 必须是触发条件）

```markdown
---
name: kebab-name
description: 当 [具体触发场景] 时加载。[能力概括]
---

# 标题

## 做什么
...

## 为什么
...

## 怎么验收
- 输入契约：...
- 输出契约：...
```

**description 忌**：泛化能力标签。  
**description 宜**：明确触发场景与边界。

**判断准绳**：  
一个好的 description 像门禁，不像标语。  
它要决定“何时进入”，也要决定“何时不进入”。

## Prompt 骨架

```markdown
# 标题

## 做什么
...

## 为什么
...

## 怎么验收
- 约束：...
- 输出格式：...
```

## 防护语法速查


| 机制                      | 用途     |
| ----------------------- | ------ |
| `[!IMPORTANT]`          | 不可跳过节点 |
| `## CRITICAL`           | 边界醒目   |
| `你**必须**`               | 强制动作   |
| `<completion_criteria>` | 完成定义   |


重要约束至少写清：做什么、为什么、偏航信号。

## 填充内容（Step 5 等价）

用 `sequential-thinking` 组织 3-5 个 thought，覆盖目标、易错点、每步 I/O、调研结论落点。

质量快检：

- 章节是否单问题回答
- 约束是否写明为什么
- 输出是否可验证

**判断准绳**：  
如果一个段落不能告诉执行者“该做什么”，它就是噪声。  
如果一个段落不能告诉执行者“为何如此”，它就是命令。  
如果一个段落不能告诉执行者“如何验证”，它就是祈祷。

## 验证清单（输出前）

结构：

- frontmatter
- `phase_context`（workflow 场景）
- `CRITICAL` 块
- `<completion_criteria>`

内容：

- 路径与命名正确
- 触发条件清晰
- 输入输出契约完整
- 失败信号可被外部观察

## 评分闸门（发布前）

发布前必须执行静态评分：

- 读取 `references/PROMPT_QUALITY_RUBRIC.md`
- 生成 `references/SCORECARD_TEMPLATE.md` 对应的评分卡
- 输出 Tier（T0/T1/T2/T3）与七维加权得分

硬门规则：

- 若触发 Hard Fail Gate，结论必须为 `Infeasible`
- 若未触发 Hard Fail 且总分 < 4.0，必须回炉一次再评分

## 自我批评（输出前最后一道）

用 `sequential-thinking` 做 3-5 个 thought：

- 用户会卡在哪一步
- AI 可能跳过哪条约束
- 哪一节仍存在多问题混写
- 修复后再交付

最后问自己一句：  
如果这份文档真的会被反复执行，你敢不敢为它的后果负责？