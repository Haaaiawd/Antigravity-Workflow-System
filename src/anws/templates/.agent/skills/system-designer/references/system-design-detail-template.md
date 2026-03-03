# {System Name} — 实现细节 (L1)

> **文件性质**: L1 实现层 · **对应 L0**: [`{system-id}.md`](./{system-id}.md)
> 本文件仅在 `/forge` 任务明确引用时加载。日常阅读和任务规划请优先看 L0。
> **⚠️ 孤岛检查**: 本文件各节均须在 L0 有对应超链接入口，禁止孤岛内容。

---

## 版本历史

> 所有变更记录集中于此，不再散落在代码注释里。

| 版本 | 日期         | Changelog |
| ---- | ------------ | --------- |
| v1.0 | {YYYY-MM-DD} | 初始版本  |

---

## 本文件章节索引

|   §   | 章节                                                                 |   对应 L0 入口   |
| :---: | -------------------------------------------------------------------- | :--------------: |
|  §1   | [配置常量](#1-配置常量-config-constants)                             |  L0 §6 数据模型  |
|  §2   | [完整数据结构](#2-核心数据结构完整定义-full-data-structures)         |  L0 §6 数据模型  |
|  §3   | [核心算法伪代码](#3-核心算法伪代码-non-trivial-algorithm-pseudocode) | L0 §5 操作契约表 |
|  §4   | [决策树详细逻辑](#4-决策树详细逻辑-decision-tree-details)            |   L0 §4 架构图   |
|  §5   | [边缘情况与注意事项](#5-边缘情况与注意事项-edge-cases--gotchas)      |    L0 §5 / §9    |
|  §6   | [测试辅助](#6-测试辅助-test-helpers) *(可选)*                        | L0 §11 测试策略  |

---

## §1 配置常量 (Config Constants)

> 所有硬编码配置、枚举映射、查找表集中放在此处。
> **L0 对应入口**: L0 §6 末尾锚点 → *配置常量字典详见 [L1 §1]*

```python
# ── 示例: 单位配置表 ──
UNIT_CONFIG = {
    # UnitType.WARRIOR: {atk, def, hp, mov, range, cost, tech, behavior, move_type}
}

# ── 示例: 地形配置表 ──
TERRAIN_CONFIG = {
    # TerrainType.PLAIN: {move_cost: 1, passable: "land", buildings: [...]}
}

# ── 示例: 建筑配置表 ──
BUILDING_CONFIG = {
    # BuildingType.FARM: {cost: 5, tech: "farming", rp_bonus: 1}
}
```

---

## §2 核心数据结构完整定义 (Full Data Structures)

> 含方法体的完整类定义。L0 层只放属性声明和方法签名（`def foo(): ...`）。
> **L0 对应入口**: L0 §6.1 末尾锚点 → *完整方法实现详见 [L1 §2]*

```python
@dataclass
class ExampleEntity:
    id: str
    # ... 字段

    def some_method(self) -> bool:
        """方法说明"""
        # 完整实现逻辑
        pass
```

---

## §3 核心算法伪代码 (Non-Trivial Algorithm Pseudocode)

> [!IMPORTANT]
> **准入门槛 — 不满足任意一条，禁止写入本节**
>
> | 准入条件 | 说明 |
> |---------|------|
> | 函数体估计 **> 15 行** | 短函数从 L0 操作契约表已可理解 |
> | 含**不明显的业务规则** | 伤害公式、状态机分支、复杂校验 |
> | 含**多步骤副作用链** | A→检查→B→更新C→触发D，顺序不可颠倒 |
> | **同事看签名猜不出实现** | 函数名+参数已能清楚表达意图则不需要 |

每个小节对应 L0 §5 操作契约表的一行，提供完整函数体。

### §3.1 {操作名称}

**对应契约**: L0 §5.1 — `{function_name}()`
**准入理由**: {满足了哪条准入条件}

```python
def function_name(param1: Type, param2: Type) -> ReturnType:
    """
    函数说明。

    前置条件:
    1. ...

    副作用:
    - ...
    """
    # 完整实现逻辑
    pass
```

> **注意事项**: {深拷贝 / 竞争条件 / 顺序依赖等关键陷阱}

---

## §4 决策树详细逻辑 (Decision Tree Details)

> 对应 L0 Mermaid 决策图的文字展开 + 完整伪代码。
> **L0 对应入口**: L0 §4 架构图注释 → *完整决策逻辑见 [L1 §4]*

### §4.1 {决策场景名称}

**对应 L0 Mermaid**: `{system-id}.md §{章节}`

```python
def plan_or_decide(...):
    # Step 1: 检查高优先级条件
    # Step 2: 分支逻辑
    pass
```

---

## §5 边缘情况与注意事项 (Edge Cases & Gotchas)

> 实现时必须处理的非显而易见情况。
> **L0 对应入口**: L0 §5 或 §9 安全性章节的锚点

| 场景           | 风险       | 处理方式       |
| -------------- | ---------- | -------------- |
| {边缘情况描述} | {潜在 Bug} | {正确处理方式} |

### §5.1 {具体情况}

```python
# ❌ 错误做法
# cloned_unit.embarked_unit = unit.embarked_unit  # 浅拷贝 → 状态污染!

# ✅ 正确做法
# cloned_unit.embarked_unit = deepcopy(unit.embarked_unit) if unit.embarked_unit else None
```

---

## §6 测试辅助 (Test Helpers)

> 可选。单元测试中复用的工厂函数或 fixtures。
> **L0 对应入口**: L0 §11 测试策略锚点

```python
def make_test_unit(type=UnitType.WARRIOR, hp=10, pos=(0, 0)) -> Unit:
    """创建测试用 Unit"""
    pass

def make_test_world(size=8) -> World:
    """创建测试用 World"""
    pass
```

---

<!-- ⚠️ AGENT 使用指南

何时创建本文件: 触发 L0 拆分规则 R1-R5 任意一条时。
  R1 单个代码块 > 30 行
  R2 代码块总行数 > 200 行
  R3 配置常量字典条目 > 5 个
  R4 版本内联注释 > 5 处
  R5 文档总行数 > 500 行

孤岛检查: 本文件每新增一节，必须同步在 L0 对应位置添加超链接锚点。

§ 编号约定:
  §1 配置常量  — 始终第一节
  §2 数据结构  — 含方法体的完整类
  §3 算法伪代码 — 按函数顺序编号 (§3.1, §3.2 ...)
  §4 决策树    — 对应 L0 Mermaid 图的展开
  §5 边缘情况  — 从代码注释中提取的 "# ⚠️ 注意" 类内容
  §6 测试辅助  — 可选
-->
