<!-- skills/scripts/README.md -->

# 脚本目录说明

> 本文档为 AI Agent 提供 scripts 目录下所有可执行脚本和命令文件的用途说明。
> Agent 在需要执行数据库操作、查看开发命令时，应先阅读本文档以确定应使用哪个脚本。

## 文件清单

| 文件 | 类型 | 用途 | 何时使用 |
|------|------|------|----------|
| `dev.md` | 命令备忘录 | 常用开发命令（启动、构建、数据库登录、Git） | 用户需要快速复制粘贴命令时 |
| `migrate.sh` | 可执行脚本 | 数据库结构变更（添加字段、修改表） | 用户要求修改表结构、添加字段时 |
| `init-db.sh` | 可执行脚本 | 数据库快速初始化（导入 init.sql） | 全新部署、重置数据库时 |

## 各脚本详细说明

### dev.md

- **性质**：纯文本命令清单，不可执行。
- **内容**：前端/后端启动、构建、数据库登录、Git 操作等常用命令。
- **Agent 使用方式**：直接引用其中的命令给用户，或根据模板生成类似命令。
- **示例**：用户问“怎么启动后端？”，Agent 从本文件找到 `cd server && node app.js` 并回复。

### migrate.sh

- **性质**：可执行的 Bash 脚本（Windows 下可用 Git Bash 或 WSL 运行）。
- **参数**：
  - `backup`：备份当前数据库。
  - `up`：执行迁移（需先编辑脚本中的 SQL 语句）。
  - `down`：回滚迁移（需手动编写回滚 SQL）。
  - `status`：查看当前表列表。
- **典型工作流**：
  1. 用户：“给 users 表加个字段”。
  2. Agent 编辑 `migrate.sh`，在 `do_up()` 中写入 `ALTER TABLE ...`。
  3. Agent 告诉用户：“请执行 `bash scripts/migrate.sh up`”。
- **注意事项**：
  - 执行前会自动备份。
  - 需要用户确认（脚本内有 `read -p` 交互）。
  - Windows 环境若无法运行 bash，需改用 `migrate.ps1`（PowerShell 版本）。

### init-db.sh

- **性质**：可执行的 Bash 脚本。
- **参数**：
  - 接受一个可选的 SQL 文件路径（默认为 `server/db/init.sql`）。
- **用途**：全新部署或彻底重置数据库时使用。
- **典型工作流**：
  1. 用户：“我要重置数据库”。
  2. Agent 告诉用户：“请执行 `bash scripts/init-db.sh server/db/init.sql`”。
- **注意事项**：
  - 执行前会自动备份当前数据库。
  - 会清空所有表并重新创建。
  - 需要用户确认。

## Windows 用户特别说明

由于用户服务器为 Windows Server，Bash 脚本可能无法直接执行。提供以下替代方案：

- **Git Bash**（推荐）：安装 Git for Windows 后，右键项目目录选择 “Git Bash Here”，即可运行 `.sh` 脚本。
- **PowerShell 版本**：若用户明确要求，Agent 可为 `migrate.sh` 和 `init-db.sh` 生成对应的 `.ps1` 版本。
- **手动执行**：Agent 应始终提供纯 SQL 语句作为备选，用户可手动复制到 MySQL 命令行执行。