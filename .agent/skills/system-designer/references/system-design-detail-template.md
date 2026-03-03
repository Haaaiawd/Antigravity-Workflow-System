# {System Name} — 实现细节 (detail)

> **文件性质**: L1 实现层  
> **对应 L0**: [`{system}.md`](./{system}.md)  
> 本文件仅在 `/forge` 任务的 `**输入**` 字段明确引用时加载。  
> 日常阅读、系统概览、任务规划请优先阅读 L0 层文件。

---

## 版本历史

> 所有版本变更记录集中于此，不再散落在代码注释中。

| 版本 | 日期         | Changelog |
| ---- | ------------ | --------- |
| v1.0 | {YYYY-MM-DD} | 初始版本  |

---

## §1 配置常量 (Config Constants)

> 所有硬编码配置、枚举映射、查找表集中放在此处。

```python
# ── 示例: 单位配置表 ──
# 每行格式: UnitType: {atk, def, hp, mov, range, cost, tech, behavior, move_type}
UNIT_CONFIG = {
    # UnitType.WARRIOR: {...},
    # ...
}

# ── 示例: 地形配置表 ──
TERRAIN_CONFIG = {
    # TerrainType.PLAIN: {move_cost: 1, passable: "land", buildings: [...]}
    # ...
}

# ── 示例: 建筑配置表 ──
BUILDING_CONFIG = {
    # BuildingType.FARM: {cost: 5, tech: "farming", rp_bonus: 1}
    # ...
}
```

---

## §2 核心数据结构完整定义 (Full Data Structures)

> 包含方法实现的完整类定义（L0 层只放无方法的属性声明）。

```python
# ── 示例: 完整类定义（含方法） ──

@dataclass
class ExampleEntity:
    id: str
    # ... 字段

    def some_method(self) -> bool:
        """方法说明"""
        # 完整逻辑...
        pass
```

---

## §3 核心算法伪代码 (Non-Trivial Algorithm Pseudocode)

> [!IMPORTANT]
> **严格准入门槛 — 不满足任意一条，禁止写入本节**:
>
> | 准入条件 | 说明 |
> |---------|------|
> | 函数体估计 **> 15 行** | 短函数的意图从 L0 操作契约表格已可理解，不需要伪代码 |
> | 含**不明显的业务规则** | 如战斗伤害公式、路径寻找、状态机分支、复杂校验逻辑 |
> | 含**多步骤副作用链** | 如"A→检查→B→更新C→触发D"且顺序不能颠倒 |
> | **同事看签名猜不出实现** | 若函数名+参数名已能清楚表达意图，则不需要伪代码 |
>
> **反例（禁止写入 §3）**:
> ```python
> # ❌ 太简单，不需要伪代码
> def get_nation_stars(nation: Nation) -> int:
>     return nation.stars
>
> # ❌ 5行setter，从签名已可理解
> def set_military_target(self, target: str) -> None:
>     self.military_target = target
>     self.last_updated_turn = world.turn
> ```

每个小节对应 L0 操作契约表格中的一行，提供完整函数体。

### §3.1 {操作名称}

**对应契约**: L0 §{章节} 操作契约表 — `{function_name}()`  
**准入理由**: {为什么这个函数需要伪代码，满足了哪条准入条件}

```python
def function_name(param1: Type, param2: Type, ...) -> ReturnType:
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

**关键设计注意事项**:
- 注意点1 (如: 深拷贝、竞争条件、顺序依赖等)

---

### §3.2 {操作名称}

```python
# ...
```

---

## §4 决策树详细逻辑 (Decision Tree Details)

> 对应 L0 层 Mermaid 决策树的文字展开 + 完整伪代码。

### §4.1 {决策场景名称}

**对应 L0 Mermaid**: `{system}.md §{章节}`

```python
def plan_or_decide(...):
    """
    决策逻辑完整实现。
    """
    # Step 1: 检查高优先级条件
    # ...
    
    # Step 2: 分支逻辑
    # ...
    pass
```

---

## §5 边缘情况与注意事项 (Edge Cases & Gotchas)

> 实现时必须处理的非显而易见的情况。

| 场景           | 风险       | 处理方式       |
| -------------- | ---------- | -------------- |
| {边缘情况描述} | {潜在 Bug} | {正确处理方式} |

### §5.1 {具体边缘情况}

```python
# ❌ 错误做法 (会导致什么问题)
# cloned_unit.embarked_unit = unit.embarked_unit  # 浅拷贝导致状态污染!

# ✅ 正确做法
# cloned_unit.embarked_unit = deepcopy(unit.embarked_unit) if unit.embarked_unit else None
```

---

## §6 测试辅助 (Test Helpers)

> 单元测试中复用的工厂函数、fixtures 或测试场景说明。

```python
# 示例: 测试用工厂函数
def make_test_unit(type=UnitType.WARRIOR, hp=10, pos=(0,0)) -> Unit:
    """创建测试用 Unit 对象"""
    pass

def make_test_world(size=8) -> World:
    """创建测试用 World 对象"""
    pass
```

---

<!-- ⚠️ 使用指南
**何时填写本文件**:
- 触发了 R1-R5 任意一条提取规则时
- L0 的操作契约表对应的实现需要 > 30 行伪代码时

**§ 编号约定**:
- §1 配置常量: 始终是第一节
- §2 数据结构: 含方法的完整类
- §3 算法伪代码: 按照函数顺序编号 (§3.1, §3.2...)
- §4 决策树展开: 对应 L0 Mermaid 图的文字版
- §5 边缘情况: 从文档注释中提取的 "# ⚠️ 注意" 类内容
- §6 测试辅助: 可选
-->
