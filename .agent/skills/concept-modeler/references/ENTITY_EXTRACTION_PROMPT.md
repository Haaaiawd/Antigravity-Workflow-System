# 实体提取 Prompt 模板 - 完整版

## 概述

此 Prompt 用于从用户的自然语言描述中提取系统的逻辑模型。基于 2024 年 LLM Prompt 工程最佳实践设计。

## 设计原则

基于调研的最佳实践：

1. **明确指令**：清晰陈述任务和期望的实体类型
2. **Few-shot 示例**：提供示例帮助模型理解格式
3. **Chain-of-Thought**：引导模型逐步推理
4. **Role Prompting**：赋予模型专家身份
5. **JSON 输出**：明确指定结构化输出格式
6. **"Give LLM an Out"**：允许模型表示不确定性

---

## 主 Prompt 模板

```markdown
# 角色定义

你是一名拥有 15 年经验的资深系统架构师。你的专长是：
- 从模糊需求中提取精确的系统模型
- 识别用户遗漏的关键组件
- 预判潜在的架构风险和耦合问题
- 设计可扩展、可维护的系统架构

# 任务

用户想要构建以下系统/功能：

---
{{USER_INPUT}}
---

请执行以下 **结构化分析**，按步骤推理：

## 第 1 步：实体提取 (Entity Extraction)

列出这个系统中必须存在的所有核心"名词"。

思考方向：
- 用户/角色类：谁会使用这个系统？
- 数据/资源类：系统处理什么数据？
- 服务/组件类：需要哪些独立的服务模块？
- 外部依赖类：需要对接哪些外部 API 或服务？
- 基础设施类：需要什么存储、缓存、队列？

对于每个实体，评估其 **必要性**：
- [必须] = 没有这个系统无法运行
- [应该] = 没有这个会严重影响体验
- [可选] = 增强功能，可后续添加

## 第 2 步：数据流分析 (Data Flow Analysis)

描述数据如何在这些实体之间流转。

使用格式：
```
[源实体] --[动作/数据]--> [目标实体]
```

重点考虑：
- 主流程（Happy Path）是什么？
- 数据在哪些点会被转换或处理？
- 哪些是同步操作，哪些应该异步？

## 第 3 步：缺失检测 (Missing Component Detection)

**这是最关键的一步**。根据你的经验，主动识别用户描述中 **遗漏** 的关键组件：

检查清单：
- [ ] **错误处理**：如果 X 失败了怎么办？重试？回滚？
- [ ] **数据持久化**：数据存在哪里？需要备份吗？
- [ ] **认证授权**：谁能访问什么？如何验证身份？
- [ ] **日志监控**：如何知道系统状态？如何调试问题？
- [ ] **队列/缓存**：是否需要异步处理？是否需要缓存热点数据？
- [ ] **配置管理**：hardcode 还是外部配置？环境差异如何处理？
- [ ] **限流/熔断**：高并发时如何保护系统？
- [ ] **幂等性**：重复请求会怎样？

对于每个缺失项，解释 **为什么需要** 以及 **如果没有会怎样**。

## 第 4 步：风险识别 (Risk Identification)

预判潜在的问题（即使用户没问）：

风险类型：
- **耦合风险**：哪些组件之间可能产生不健康的依赖？
- **性能风险**：哪里可能成为瓶颈？
- **可靠性风险**：哪里可能导致级联故障？
- **安全风险**：哪里可能有安全漏洞？
- **扩展性风险**：当规模增长 10 倍时，哪里会先出问题？

## 第 5 步：边界定义 (Boundary Definition)

建议如何划分模块边界以降低耦合：

- 哪些组件应该放在一起（高内聚）？
- 哪些组件应该分离（低耦合）？
- 接口应该如何设计？

---

# 输出格式

严格按照以下 JSON 格式输出：

```json
{
  "entities": [
    {
      "name": "实体名称",
      "type": "用户|数据|服务|外部|基础设施",
      "necessity": "必须|应该|可选",
      "description": "简要描述"
    }
  ],
  "data_flows": [
    {
      "from": "源实体",
      "action": "动作描述",
      "to": "目标实体",
      "data": "传递的数据",
      "sync": true
    }
  ],
  "missing_components": [
    {
      "component": "缺失组件名称",
      "category": "错误处理|持久化|安全|监控|性能|配置",
      "reason": "为什么需要",
      "impact_if_missing": "如果没有会怎样",
      "priority": "高|中|低"
    }
  ],
  "potential_risks": [
    {
      "risk_type": "耦合|性能|可靠性|安全|扩展性",
      "description": "风险描述",
      "affected_entities": ["相关实体"],
      "mitigation": "建议的缓解措施"
    }
  ],
  "boundary_recommendations": [
    {
      "module_name": "模块名称",
      "contains": ["包含的实体"],
      "rationale": "为什么这样划分"
    }
  ],
  "questions_for_user": [
    "如果有不确定的地方，列出需要用户澄清的问题"
  ]
}
```

# 重要提示

1. **不要编造**：如果信息不足，在 `questions_for_user` 中列出问题
2. **保守估计**：宁可多识别缺失组件，也不要遗漏
3. **解释推理**：对每个判断提供理由
4. **实际经验**：基于真实系统设计经验，而不是理论
```

---

## Few-Shot 示例

### 示例输入

```
我想做一个"视频摘要生成器"：用户上传视频，系统用 Whisper 转文字，
然后用 GPT 生成摘要，最后返回给用户。
```

### 示例输出

```json
{
  "entities": [
    {"name": "User", "type": "用户", "necessity": "必须", "description": "上传视频并获取摘要的用户"},
    {"name": "VideoFile", "type": "数据", "necessity": "必须", "description": "用户上传的视频文件"},
    {"name": "VideoUploader", "type": "服务", "necessity": "必须", "description": "处理视频上传的服务"},
    {"name": "TranscriptionService", "type": "服务", "necessity": "必须", "description": "调用 Whisper API 转文字"},
    {"name": "SummaryService", "type": "服务", "necessity": "必须", "description": "调用 GPT 生成摘要"},
    {"name": "WhisperAPI", "type": "外部", "necessity": "必须", "description": "OpenAI Whisper 语音识别"},
    {"name": "GPT_API", "type": "外部", "necessity": "必须", "description": "OpenAI GPT 文本生成"},
    {"name": "FileStorage", "type": "基础设施", "necessity": "必须", "description": "存储上传的视频和生成的摘要"},
    {"name": "TaskQueue", "type": "基础设施", "necessity": "应该", "description": "异步处理视频任务"}
  ],
  "data_flows": [
    {"from": "User", "action": "上传", "to": "VideoUploader", "data": "视频文件", "sync": true},
    {"from": "VideoUploader", "action": "存储", "to": "FileStorage", "data": "视频文件", "sync": true},
    {"from": "VideoUploader", "action": "创建任务", "to": "TaskQueue", "data": "任务ID", "sync": true},
    {"from": "TaskQueue", "action": "触发", "to": "TranscriptionService", "data": "视频路径", "sync": false},
    {"from": "TranscriptionService", "action": "调用", "to": "WhisperAPI", "data": "音频数据", "sync": true},
    {"from": "TranscriptionService", "action": "传递", "to": "SummaryService", "data": "文字内容", "sync": true},
    {"from": "SummaryService", "action": "调用", "to": "GPT_API", "data": "文字内容", "sync": true},
    {"from": "SummaryService", "action": "存储", "to": "FileStorage", "data": "摘要结果", "sync": true}
  ],
  "missing_components": [
    {
      "component": "任务状态追踪",
      "category": "监控",
      "reason": "用户上传后需要知道处理进度",
      "impact_if_missing": "用户无法知道视频是否处理完成，体验极差",
      "priority": "高"
    },
    {
      "component": "API 调用重试机制",
      "category": "错误处理",
      "reason": "Whisper/GPT API 可能超时或失败",
      "impact_if_missing": "单次失败导致整个任务失败，浪费用户时间",
      "priority": "高"
    },
    {
      "component": "视频大小/时长限制",
      "category": "性能",
      "reason": "大视频会导致处理时间过长和成本过高",
      "impact_if_missing": "用户可能上传几GB的视频导致系统崩溃",
      "priority": "高"
    },
    {
      "component": "费用追踪/计费",
      "category": "配置",
      "reason": "API 调用有成本，需要追踪",
      "impact_if_missing": "无法控制成本，可能产生意外账单",
      "priority": "中"
    }
  ],
  "potential_risks": [
    {
      "risk_type": "性能",
      "description": "视频处理是 CPU/内存密集型，大视频可能导致 OOM",
      "affected_entities": ["TranscriptionService"],
      "mitigation": "限制视频大小，使用流式处理"
    },
    {
      "risk_type": "可靠性",
      "description": "如果 TaskQueue 宕机，所有待处理任务丢失",
      "affected_entities": ["TaskQueue"],
      "mitigation": "使用持久化队列（如 Redis + 持久化）"
    },
    {
      "risk_type": "耦合",
      "description": "TranscriptionService 和 SummaryService 如果同步调用，一个慢会拖慢整个流程",
      "affected_entities": ["TranscriptionService", "SummaryService"],
      "mitigation": "考虑将两个服务通过队列解耦"
    }
  ],
  "boundary_recommendations": [
    {
      "module_name": "上传模块",
      "contains": ["VideoUploader", "FileStorage"],
      "rationale": "上传和存储紧密相关，应该放在一起"
    },
    {
      "module_name": "处理模块",
      "contains": ["TranscriptionService", "SummaryService", "TaskQueue"],
      "rationale": "视频处理流程，通过队列异步执行"
    },
    {
      "module_name": "外部集成层",
      "contains": ["WhisperAPI", "GPT_API"],
      "rationale": "所有外部 API 调用应该通过统一的适配层，方便切换供应商"
    }
  ],
  "questions_for_user": [
    "视频支持的最大时长/大小是多少？",
    "用户是否需要实时查看处理进度？",
    "摘要结果需要保留多久？"
  ]
}
```

---

## 追问策略

如果初始分析不够深入，使用以下追问：

1. **边界追问**："如果 [实体A] 出错了，[实体B] 会怎样？"
2. **规模追问**："如果有 10000 个用户同时使用，哪里会先崩？"
3. **演化追问**："6 个月后如果要加 [新功能]，需要改动哪些组件？"
4. **成本追问**："这个架构的运维成本主要在哪里？"
5. **安全追问**："如果有恶意用户尝试攻击，最薄弱的环节是哪里？"

---

## 与其他 Skills 的配合

- 对于 **Brownfield** 模式：先用 `build-inspector` 分析构建边界，用 `runtime-inspector` 分析 IPC，再用此 Prompt 分析新功能
- 分析结果应传递给 Scout 的功能冲突分析（Step 6）和最终报告生成
- 识别的缺失组件应在后续 Blueprint 阶段详细设计

