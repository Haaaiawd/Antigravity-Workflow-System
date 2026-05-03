# {System Name} — Implementation Details (L1)

> **File Type**: L1 implementation layer · **Mapped L0**: [`{system-id}.md`](./{system-id}.md)
> This file is loaded only when explicitly referenced by a `/forge` task. For daily reading and task planning, prioritize L0.
> ** Island Check**: Every section in this file must have a corresponding hyperlink entry in L0; isolated content is forbidden.

---

## Version History

> All change records are centralized here and should no longer be scattered in code comments.

| Version | Date         | Changelog |
| ---- | ------------ | --------- |
| v1.0 | {YYYY-MM-DD} | Initial version  |

---

## Section Index of This File

|   §   | Section | Mapped L0 Entry |
| :---: | -------------------------------------------------------------------- | :--------------: |
|  §1   | [Config Constants](#1-config-constants)                             |  L0 §6 Data Model  |
|  §2   | [Full Core Data Structures](#2-full-core-data-structures)         |  L0 §6 Data Model  |
|  §3   | [Core Algorithm Pseudocode](#3-core-algorithm-pseudocode-non-trivial-algorithm-pseudocode) | L0 §5 Operation Contracts |
|  §4   | [Detailed Decision Tree Logic](#4-detailed-decision-tree-logic-decision-tree-details)            |   L0 §4 Architecture Diagram   |
|  §5   | [Edge Cases & Gotchas](#5-edge-cases--gotchas-edge-cases--gotchas)      |    L0 §5 / §9    |
|  §6   | [Test Helpers](#6-test-helpers-test-helpers) *(Optional)*                        | L0 §11 Testing Strategy  |

---

## §1 Config Constants

> Centralize all hardcoded configs, enum mappings, and lookup tables here.
> **Mapped L0 Entry**: anchor at end of L0 §6 → *For full config constant dictionaries, see [L1 §1]*

```python
# -- Example: unit config table --
UNIT_CONFIG = {
    # UnitType.WARRIOR: {atk, def, hp, mov, range, cost, tech, behavior, move_type}
}

# -- Example: terrain config table --
TERRAIN_CONFIG = {
    # TerrainType.PLAIN: {move_cost: 1, passable: "land", buildings: [...]}
}

# -- Example: building config table --
BUILDING_CONFIG = {
    # BuildingType.FARM: {cost: 5, tech: "farming", rp_bonus: 1}
}
```

---

## §2 Full Core Data Structures

> Contains full class definitions including method bodies. L0 should only include field declarations and method signatures (`def foo(): ...`).
> **Mapped L0 Entry**: anchor at end of L0 §6.1 → *For full method implementations, see [L1 §2]*

```python
@dataclass
class ExampleEntity:
    id: str
    # ... fields

    def some_method(self) -> bool:
        """Method notes"""
        # Full implementation logic
        pass
```

---

## §3 Core Algorithm Pseudocode (Non-Trivial Algorithm Pseudocode)

> [!IMPORTANT]
> **Entry threshold — if none of the following is met, writing this section is forbidden**
>
> | Entry Condition | Notes |
> |---------|------|
> | Estimated function body **> 15 lines** | Short functions are already understandable from L0 operation contracts |
> | Includes **non-obvious business rules** | Damage formulas, state machine branches, complex validation |
> | Includes **multi-step side-effect chains** | A→check→B→update C→trigger D, order must not be changed |
> | **Teammates cannot infer implementation from signature** | If function name + params already clearly express intent, no need |

Each subsection maps to one row in the L0 §5 operation contracts table and provides a full function body.

### §3.1 {Operation Name}

**Mapped Contract**: L0 §5.1 — `{function_name}()`
**Entry Reason**: {which entry condition is met}

```python
def function_name(param1: Type, param2: Type) -> ReturnType:
    """
    Function description.

    Preconditions:
    1. ...

    Side effects:
    - ...
    """
    # Full implementation logic
    pass
```

> **Notes**: {critical traps like deep copy / race conditions / order dependencies}

---

## §4 Detailed Decision Tree Logic (Decision Tree Details)

> Text expansion + complete pseudocode corresponding to the L0 Mermaid decision diagram.
> **Mapped L0 Entry**: comment under L0 §4 Architecture Diagram → *For full decision logic, see [L1 §4]*

### §4.1 {Decision Scenario Name}

**Mapped L0 Mermaid**: `{system-id}.md §{section}`

```python
def plan_or_decide(...):
    # Step 1: check high-priority conditions
    # Step 2: branching logic
    pass
```

---

## §5 Edge Cases & Gotchas

> Non-obvious cases that must be handled during implementation.
> **Mapped L0 Entry**: anchor in L0 §5 or §9 Security

| Scenario           | Risk       | Handling       |
| -------------- | ---------- | -------------- |
| {Edge case description} | {Potential bug} | {Correct handling} |

### §5.1 {Specific Case}

```python
# Incorrect approach
# cloned_unit.embarked_unit = unit.embarked_unit  # shallow copy -> state contamination!

# Correct approach
# cloned_unit.embarked_unit = deepcopy(unit.embarked_unit) if unit.embarked_unit else None
```

---

## §6 Test Helpers

> Optional. Factory functions or fixtures reused in unit tests.
> **Mapped L0 Entry**: anchor in L0 §11 Testing Strategy

```python
def make_test_unit(type=UnitType.WARRIOR, hp=10, pos=(0, 0)) -> Unit:
    """Create a test Unit"""
    pass

def make_test_world(size=8) -> World:
    """Create a test World"""
    pass
```

---

<!--  AGENT Usage Guide

When to create this file: when any L0 split rule R1-R5 is triggered.
  R1 single code block > 30 lines
  R2 total code block lines > 200 lines
  R3 config constant dictionary entries > 5
  R4 version inline comments > 5 occurrences
  R5 total document lines > 500

Island check: every new section added here must also add a hyperlink anchor at corresponding position in L0.

§ numbering convention:
  §1 config constants  — always first section
  §2 data structures  — full classes with method bodies
  §3 algorithm pseudocode — numbered by function order (§3.1, §3.2 ...)
  §4 decision tree    — expansion of L0 Mermaid diagrams
  §5 edge cases  — extracted from "#  note" style code comments
  §6 test helpers  — optional
-->
