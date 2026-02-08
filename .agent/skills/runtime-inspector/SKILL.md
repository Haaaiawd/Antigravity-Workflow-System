---
name: runtime-inspector
description: 分析运行时行为、进程边界和 IPC 机制，检测"协议漂移"风险和进程生命周期问题。
---

# 窃听者手册 (The Wiretapper's Casebook)

> "代码会骗人，但进程不会。一个 `.spawn()` 暴露的比一千行注释还多。" —— 老窃听者箴言

本技能的工作是**追踪进程间的通信线路**。

**老师傅核心定律**: 如果两个进程说话，但没人规定它们说什么语言、什么版本、什么格式，那就是一场等待爆发的**协议漂移 (Protocol Mismatch)** 灾难。

---

## ⚠️ 强制深度思考

> [!IMPORTANT]
> 在执行任何分析之前，你**必须**调用 `sequential thinking` 工具，视情况进行 **3—5 步**推理。
> 思考内容例如：
> 1.  "这个项目有多少个入口点（`main` 函数）？它们是一个进程还是多个？"
> 2.  "进程之间用什么通信？Pipe？HTTP？共享数据库？"
> 3.  "如果我只更新了 A 进程的通信模块，B 进程会崩吗？有版本握手吗？"

---

## ⚡ 任务目标
识别**运行时边界 (Runtime Boundaries)** 和 **通信契约 (Communication Contracts)**。

---

## 🧭 探索流程 (The Investigation)

### 第一步：识别入口点 (Identify Entry Points)
每个 `main` 函数可能代表一个独立的进程。
*   **搜索目标**:
    *   Rust: `fn main()`, `#[tokio::main]`
    *   Python: `if __name__ == "__main__":`
    *   Node: `require.main === module`, package.json 的 `bin`
    *   Go: `func main()`
*   **老师傅直觉**: 找到多个入口点？立刻问："它们是独立运行的，还是被一个父进程管控的？"

### 第二步：追踪生成链 (Trace Spawning)
如果进程 A 拉起了进程 B，这就是一条"血缘线"。
*   **搜索目标**:
    *   Rust: `Command::new(...)`, `std::process::Stdio`, `tauri-plugin-shell`
    *   Python: `subprocess.Popen`, `multiprocessing.Process`
    *   Node: `child_process.spawn`, `child_process.fork`
*   **老师傅警报 (Lifecycle Risks)**:
    *   ⚠️ "父进程死了，子进程知道吗？有心跳吗？" -> **僵尸进程风险 (Zombie Child)**
    *   ⚠️ "子进程崩溃了，父进程会重启它吗？还是静默失败？" -> **静默故障风险**

### 第三步：窃听通信 (Tap the Wire)
进程之间用什么"说话"？协议在哪里定义？

*   **搜索 Channels (通道)**:
    *   `Pipe`, `NamedPipe`, `unix_stream`, `zmq`
    *   `TcpListener`, `UdpSocket`, `websocket`, `http::server`
*   **搜索 Protocols (协议)**:
    *   `Handshake`, `Version`, `MagicBytes`, `schema`
    *   `protobuf`, `serde_json`, `JSON.parse`, `enum Message`

*   **老师傅核心判断 (Contract Status)**:

    | 发现 | 状态 | 老师傅建议 |
    | :--- | :---: | :--- |
    | 找到 Channel + 找到 `enum Message` 或 Protobuf 定义 | 🟢 **Strong** | 契约存在，相对安全。 |
    | 找到 Channel + 找到 `Version` 或 `Handshake` 检查 | 🟢 **Strong** | 有版本协商，很好。 |
    | 找到 Channel + 只有 raw JSON/字符串 | 🟡 **Weak** | 无显式契约。改动一端可能炸另一端。 |
    | 找到 Channel + 无任何协议定义 | 🔴 **None** | **通信黑洞！** 这是高危风险。 |

---

## 🛡️ IPC 风险模式速查 (来自安全研究)

| 风险模式 | 检测特征 | 老师傅建议 |
| :--- | :--- | :--- |
| **协议漂移 (Protocol Mismatch)** | Channel 存在，但无 Handshake/Version | 在新功能规划中**强制添加版本握手任务** |
| **僵尸进程 (Zombie Child)** | `spawn` 存在，但无 `Kill on Drop` 或心跳 | 标记进程生命周期管理风险 |
| **单点故障 (SPOF)** | 一个进程管控所有 IPC，无容错 | 建议添加重连/重启逻辑 |
| **Named Pipe 权限漏洞 (Windows)** | 使用 Named Pipe 但未显式设置 Security Descriptor | 🔴 高危：默认可能允许 Everyone 访问！ |
| **竞态条件 (Race Condition)** | 多进程快速交互，无明确的消息顺序控制 | 建议添加消息序列号或锁机制 |

---

## 📤 输出清单

1.  **Process Roots**: 发现的入口点列表（文件路径、角色）。
2.  **Spawning Chains**: 进程生成关系 (A spawns B)。
3.  **IPC Surfaces**: 发现的通信通道（类型、关键词、位置）。
4.  **Contract Status**: `[Strong / Weak / None]`，并说明依据。
5.  **Lifecycle Risks**: 僵尸进程、静默崩溃等风险。
6.  **Security Flags (Windows)**: 如果是 Named Pipe，是否有 ACL 设置？
