# 变更日志 - .anws v7

> 此文件记录 v7 文档建立与后续微调。v7 由 /genesis 创建，用于承接目标矩阵真理修正与新 target 扩展。

## 2026-03-17 - v7 初始化

- [ADD] 创建 `.anws/v7`，以当前实现为主重建目标矩阵真理
- [ADD] 正式将 `GitHub Copilot` 定义为 `prompts + skills`
- [ADD] 正式将 `Codex` 定义为 `skills-only bundle`，workflow 折叠进 `anws-system` 技能包
- [ADD] 正式将 `OpenCode` 纳入目标矩阵
- [ADD] 新增 `Trae` 适配方向：`.trae/skills/`，工作流折叠进 skill bundle，并保留 YAML frontmatter / triggers 语义
- [ADD] 新增 `Qoder` 适配方向：`.qoder/commands/` + `.qoder/skills/`
- [ADD] 新增 `Kilo Code` 适配方向：`.kilocode/workflows/` + `.kilocode/skills/`
- [ADD] 正式记录 `update` 的 sentinel 扫描模型与 `.anws/install-lock.json` 状态优先语义
- [ADD] 将 `init` 可能整体覆盖根目录 `AGENTS.md` 并导致 AUTO 区块丢失的问题升级为显式缺陷与任务

## 2026-03-17 - /change 微调：skills-only 导航壳与 lock 重建语义

- [CHANGE] 将 `Codex / Trae` 的 skills-only bundle 文档表述明确为 `anws-system/SKILL.md` 导航壳 + `references/*.md` workflow 明细
- [CHANGE] 调整 `T1.2.1 / T4.1.1 / T6.2.1` 的任务定义，显式纳入 fallback 扫描后的 `install-lock` 重建语义
- [CHANGE] 调整 `T2.1.2 / T3.1.1 / T3.1.2` 的任务定义，使文档与当前 `anws-system` skill-only 导航结构一致
- [CHANGE] 本次微调基于实现核查发现：当前 `update` 在 lock 缺失但已最新版本时不会自动重建 lock，需在后续实现阶段明确闭环

## 2026-04-01 - /change 微调：update 的 agent-friendly 显式目标模式

- [CHANGE] 调整 `T1.1.1` 的任务定义，要求 `anws --help` 明确区分人类默认交互流与 AI/agent 推荐的显式参数流
- [CHANGE] 调整 `T1.2.1` 的任务定义，为 `anws update` 补充 `--target` 显式目标限定模式，但保留默认更新全部命中 targets 的既有主逻辑
- [CHANGE] 调整 `T6.2.1` 的任务定义，补充 `update --target <subset>` 的集成测试覆盖，验证显式子集更新与默认全量更新并存
- [CHANGE] 用户原话要求："update 的逻辑似乎不太一样，一般是直接更新完全，你需要按照实际的 update 逻辑来做"，因此本次修改明确采用“默认全量更新、显式参数仅作可选限定”的收敛方案

## 2026-04-01 - /change 微调：移除 update 确认交互并压缩多 target changelog 噪音

- [CHANGE] 调整 `src/anws/lib/update.js`，移除 `anws update` 在执行前的确认交互，保留 logo、target selection、处理过程与结果摘要输出
- [CHANGE] 保留 `.anws/install-lock.json` 中的 `lastUpdateSummary`，不改变“已是最新版本则不更新”的既有判断
- [CHANGE] 调整 `src/anws/lib/diff.js` 与 `src/anws/lib/changelog.js`，为变更项补充 canonical source 元数据，并在生成 changelog 时按“同源 + 同 diff”聚合多 target 重复内容
- [CHANGE] 本次修正聚焦用户指出的根因：多 IDE 下内容级变更详情重复展开，导致 `/upgrade` 读取升级记录时噪音过大，而不是更改 changelog 的按版本记录策略

## 研究来源

- `d:\PROJECTALL\Workflow\note.txt`
- 当前实现：`src/anws/lib/adapters/index.js`
- 当前实现：`src/anws/lib/manifest.js`
- 当前实现：`src/anws/lib/init.js`
- 当前实现：`src/anws/lib/update.js`
- 当前实现：`src/anws/lib/agents.js`
- 当前实现：`src/anws/lib/install-state.js`
