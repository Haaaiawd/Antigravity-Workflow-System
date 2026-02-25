# anws

**Antigravity Workflow System** — 一条命令，将 AI 协作工作流体系注入任意项目。

```
npm install -g anws
anws init
```

---

## 安装

```bash
npm install -g anws
```

需要 **Node.js ≥ 18**。

---

## 命令

### `anws init`

将 `.agent/` 工作流体系复制到当前项目目录。

```bash
cd my-project
anws init
```

- **首次初始化**：直接写入所有文件，不覆盖任何已有文件。
- **检测到冲突**：显示已存在的托管文件数量，询问是否覆盖（默认 **N**）。  
  确认后只会覆盖 `anws` 管理的文件，你的自定义文件不受影响。
- **非 TTY 环境（如 CI）**：检测到冲突时自动跳过，不挂起进程。

### `anws update`

将当前项目的 `.agent/` 托管文件更新到最新版本。

```bash
anws update
```

- 仅覆盖 `anws` 管理的文件，用户自定义文件完全保留。
- 交互式确认（默认 **N**），防止误操作。

### 选项

| 选项 | 说明 |
|------|------|
| `-v`, `--version` | 打印版本号 |
| `-h`, `--help` | 显示帮助信息 |

---

## 无 npm 安装方式

如果你不想全局安装，也可以直接克隆仓库手动获取模板：

```bash
# 克隆仓库
git clone https://github.com/YOYZHANG/Antigravity-Workflow-System.git

# 将 templates/.agent/ 复制到你的项目
cp -r Antigravity-Workflow-System/src/anws/templates/.agent/ my-project/
```

---

## 完成初始化后

1. 阅读 `.agent/rules/agents.md` — 了解系统的核心法则
2. 在你的 AI 助手中执行 `/genesis` — 启动新项目的架构设计流程

---

## 冲突处理机制

`anws` 维护一份静态的**托管文件清单**（34 个文件），只有清单内的文件才会被覆盖，清单外的文件永远不会被修改。

这意味着你可以安全地在 `.agent/` 目录中添加自定义工作流或技能，`anws update` 不会碰它们。

---

## 系统要求

- Node.js **≥ 18.0.0**
- 无运行时依赖

---

## License

MIT
