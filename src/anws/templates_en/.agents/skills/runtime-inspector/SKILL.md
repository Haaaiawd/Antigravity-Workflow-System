---
name: runtime-inspector
description: Analyze runtime behavior, process boundaries, and IPC mechanisms to detect protocol drift risk and process lifecycle issues.
---

# The Wiretapper's Casebook

> "Code can lie, but processes do not. A single `.spawn()` reveals more than a thousand lines of comments." -- Old wiretapper proverb

This skill's job is to **trace communication lines between processes**.

**Master rule**: If two processes are talking but no one defines their language, version, or format, that is a **Protocol Mismatch** disaster waiting to happen.

---

## Deep Thinking Requirement

> [!IMPORTANT]
> **Runtime analysis requires deep thinking; choose thinking mode based on model capability and task complexity.**
>
> **Core decision rules:**
> - **No CoT model** -> **must call** `sequential-thinking` CLI
> - **CoT model + simple project** (single process, clear communication) -> use guided natural CoT
> - **CoT model + complex project** (multi-process, premise corrections needed) -> call `sequential-thinking` CLI
>
> Example thinking prompts:
> 1. "How many entry points (`main` functions) are in this project? One process or many?"
> 2. "How do processes communicate? Pipe? HTTP? Shared DB?"
> 3. "If I only update process A's communication module, will process B break? Is there version handshake?"

---

## Task Goal
Identify **Runtime Boundaries** and **Communication Contracts**.

---

## Investigation Flow

### Step 1: Identify Entry Points
Each `main` function may represent an independent process.

* **Search targets**:
  * Rust: `fn main()`, `#[tokio::main]`
  * Python: `if __name__ == "__main__":`
  * Node: `require.main === module`, `bin` in package.json
  * Go: `func main()`
* **Expert intuition**: Found multiple entry points? Immediately ask: "Do they run independently, or are they managed by one parent process?"

### Step 2: Trace Spawning Chains
If process A starts process B, that is a lineage link.

* **Search targets**:
  * Rust: `Command::new(...)`, `std::process::Stdio`, `tauri-plugin-shell`
  * Python: `subprocess.Popen`, `multiprocessing.Process`
  * Node: `child_process.spawn`, `child_process.fork`
* **Expert alerts (Lifecycle Risks)**:
  * `spawn` without parent-death handling -> **Zombie Child risk**
  * child crash without restart strategy -> **Silent failure risk**

### Step 3: Tap the Wire
How do processes "talk"? Where is the protocol defined?

* **Search channels**:
  * `Pipe`, `NamedPipe`, `unix_stream`, `zmq`
  * `TcpListener`, `UdpSocket`, `websocket`, `http::server`
* **Search protocols**:
  * `Handshake`, `Version`, `MagicBytes`, `schema`
  * `protobuf`, `serde_json`, `JSON.parse`, `enum Message`

* **Contract status rules**:

  | Finding | Status | Recommendation |
  | :--- | :---: | :--- |
  | Channel + `enum Message` or Protobuf definition | Strong | Contract exists; relatively safe. |
  | Channel + `Version` or `Handshake` check | Strong | Version negotiation exists; good. |
  | Channel + only raw JSON/string | Weak | No explicit contract; one-sided changes may break peer. |
  | Channel + no protocol definition | None | Communication black hole; high risk. |

---

## IPC Risk Pattern Cheat Sheet (from security research)

| Risk Pattern | Detection Signal | Recommendation |
| :--- | :--- | :--- |
| **Protocol Mismatch** | Channel exists but no Handshake/Version | Force version-handshake tasks in planning |
| **Zombie Child** | `spawn` exists but no Kill-on-Drop/heartbeat | Flag process lifecycle management risk |
| **SPOF** | One process controls all IPC, no fault tolerance | Add reconnect/restart logic |
| **Named Pipe permission flaw (Windows)** | Named Pipe used without explicit Security Descriptor | High severity: default may allow Everyone access |
| **Race Condition** | Rapid multi-process interactions without ordering control | Add message sequence IDs or locking |

---

## Output Checklist

1. **Process Roots**: Entry points found (file path, role).
2. **Spawning Chains**: Process creation relationships (A spawns B).
3. **IPC Surfaces**: Communication channels found (type, keywords, locations).
4. **Contract Status**: `[Strong / Weak / None]` with justification.
5. **Lifecycle Risks**: Risks such as zombie processes and silent crashes.
6. **Security Flags (Windows)**: For Named Pipes, whether ACL is configured.
