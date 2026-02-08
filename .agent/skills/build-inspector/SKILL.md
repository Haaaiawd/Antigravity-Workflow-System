---
name: build-inspector
description: 分析构建系统拓扑，识别独立构建单元、多产物风险和版本漂移隐患。
---

# 测绘员手册 (The Surveyor's Field Guide)

> "地图不是领土。你看到的 `Cargo.toml` 可能只是冰山一角。" —— 老测绘员箴言

静态分析看的是**代码结构**，而本技能看的是**工程脚手架**——那些决定了"软件如何从源代码变成可执行物"的规则。

---

## ⚠️ 强制深度思考

> [!IMPORTANT]
> 在执行任何分析之前，你**必须**调用 `sequential thinking` 工具视情况进行 **2—3 步**推理。
> 思考内容例如：
> 1.  "这个项目使用什么构建系统？（Cargo? npm? Make?）"
> 2.  "我看到多个构建配置文件了吗？它们是独立的还是统一管理的？"
> 3.  "最终产物（exe, dll, bundle）是一起发布的吗？还是可以独立更新？"

---

## ⚡ 任务目标
识别**构建边界 (Build Boundaries)**。

**老师傅核心定律**: 如果两个东西是分开构建的，它们之间的任何"接口"都是一颗定时炸弹——因为可能发生**版本漂移 (Version Skew)**。

---

## 🧭 探索流程 (The Expedition)

### 第一步：定位营地 (Locate Base Camps)
*   **命令**: `find_by_name(pattern="Cargo.toml|package.json|go.mod|pom.xml|build.gradle|requirements.txt|CMakeLists.txt")`
*   **测绘员直觉**: 每个构建配置 = 一个"营地"。多个营地 = 潜在的分裂势力。

### 第二步：判断统一指挥 (Check for Unified Command)
如果找到多个营地，你**必须**回答：

| 生态 | 检查项 | 老师傅判定 |
| :--- | :--- | :--- |
| Rust | 根 `Cargo.toml` 有 `[workspace]` 吗？成员都列在里面吗？ | 没有 -> 🔴 独立王国 |
| Node | 根 `package.json` 有 `workspaces` 字段吗？或使用 Lerna/Nx/Turborepo？ | 没有 -> 🔴 独立王国 |
| Go | 是否使用 `go.work` 统筹？ | 没有 -> 🟡 需进一步确认 |

*   **老师傅警报 (来自业界案例)**:
    *   ⚠️ **独立王国 (Polyrepo Hell)**: 它们可以各自升级版本，不保证兼容！极易产生"依赖地狱 (Dependency Chaos)"。
    *   ⚠️ **伪 Monorepo (Distributed Monolith)**: 虽然在同一个仓库，但构建是独立的，实际上和 Polyrepo 风险一样！
    *   ⚠️ **Sidecar/外挂二进制**: 它和主程序一起打包部署吗？CI 流水线是同一个吗？**如果 Sidecar 可以独立更新，必须有版本握手！**

### 第三步：追踪产物 (Identify Artifacts)
*   读取构建配置，推断最终二进制/库：
    *   `[[bin]]` in `Cargo.toml` -> 可执行文件。
    *   `"bin"` in `package.json` -> CLI 工具。
    *   `cmd/` 目录在 Go 项目 -> 多个命令行工具。
    *   `tauri.conf.json` -> Tauri 桌面应用 (检查 `externalBin` 是否有 Sidecar)。
*   **老师傅必问**:
    *   "这些产物最终运行在同一台机器上吗？"
    *   "它们由**同一个 CI 流水线**、**同一个版本号**打出来吗？"
    *   "用户能否只更新其中一个产物？"

---

## 🛡️ 风险标签体系 (来自业界研究)

| 模式 | 等级 | 老师傅建议 |
| :--- | :---: | :--- |
| **单一 Workspace** | 🟢 | 版本一致性有保障。 |
| **多 Root + 共享 Workspace** | 🟢 | 注意是否所有成员都在 workspace 内。 |
| **多 Root + 无 Workspace (Polyrepo)** | 🔴 | **Split-Brain**。极易版本漂移。不同仓库的依赖版本可能冲突。 |
| **Sidecar + 原子发布** | 🟢 | Sidecar 和主程序一起更新，风险可控。 |
| **Sidecar + 非原子发布** | 🔴 | **高危**！必须在 IPC 层实现版本握手。 |

---

## 📤 输出清单

1.  **Build Roots**: 发现的构建配置路径列表。
2.  **Topology**: `[Monolith / Workspace / Polyrepo / Distributed-Local]`
3.  **Artifacts**: 识别出的最终产物列表（名称、类型、来源）。
4.  **Sidecar Warning**: 如果存在 Sidecar，明确其发布策略（原子/非原子）。
5.  **Risks Flagged**: 标记的风险及其依据。**尤其要标注"哪两个产物可能版本不同步"**。
