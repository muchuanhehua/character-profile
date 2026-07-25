# Character Profile 维护说明

本文档用于长期维护、迁移和同步本 skill。仓库地址：

```text
https://github.com/muchuanhehua/character-profile
```

## 维护边界

- `SKILL.md` 只保留触发条件、共通规则、资料路由和工作流程。
- `references/character-profile-template.md` 是角色档案结构的唯一模板。
- `references/official-source-rules/` 中每个作品使用独立文件；不得合并、互相引用或类推其他作品的接口和页面结构。
- `references/nsfw-guide.md` 只负责成人私密模块；不得扩展到未成年角色。
- `agents/openai.yaml` 只保存界面元数据，不承载工作流程。
- 不引入特定聊天前端、角色卡格式或平台宏。需要指代操作者时，正文使用“用户”；输出格式如需占位符，应先由使用方决定。
- 不恢复与角色档案模板重复的 `profile-writing-guide.md`。
- 不提交缓存、临时验证文件、凭据、令牌或本地环境配置。

## 常用维护流程

开始修改前：

```powershell
Set-Location "D:\path\to\character-profile"
git pull --ff-only
git status -sb
```

修改时按文件职责控制范围：

1. 共通流程变化：修改 `SKILL.md`。
2. 档案字段变化：修改 `references/character-profile-template.md`，并确认 `SKILL.md` 的模块推进规则仍适用。
3. 单个作品的接口或模块变化：只修改对应的官方资料取材规则。
4. 成人私密模块变化：修改 `references/nsfw-guide.md`，并保持模板中的读取条件一致。
5. 界面名称或默认提示变化：修改 `agents/openai.yaml`。

修改完成后：

```powershell
git status -sb
git diff
git add <本次修改的文件>
git commit -m "简短说明本次修改"
git push
```

`git push` 完成后，GitHub 私密仓库会立即更新；本地文件变化不会自动上传。

## 验证清单

每次提交前至少确认：

- `SKILL.md` 的 YAML frontmatter 只包含有效的 `name` 和 `description`。
- skill 名称保持为 `character-profile`。
- `SKILL.md` 引用的文件和目录真实存在。
- `agents/openai.yaml` 的 `default_prompt` 显式包含 `$character-profile`。
- 五个作品的取材规则仍然互相独立。
- 新增接口使用可直接到达、可复核的固定路径，不通过枚举或猜测寻找页面。
- 仓库中没有缓存、临时文件或疑似密钥。
- 创建流程仍然先展示当前模块的资料分析、推演方向和草稿，再与用户探讨并等待确认。

可让 Codex 执行官方结构验证：

```text
使用 $skill-creator 的 quick_validate.py 验证当前 character-profile skill；
如果缺少 PyYAML，只临时安装依赖，不修改全局 Python 环境。
```

Windows 上读取中文文件时，应让 Python 使用 UTF-8：

```powershell
$skillCreator = Join-Path $env:USERPROFILE ".codex\skills\.system\skill-creator"
$env:PYTHONUTF8 = "1"
python (Join-Path $skillCreator "scripts\quick_validate.py") .
```

## 新增作品取材规则

1. 在 `references/official-source-rules/` 新建：

   ```text
   <作品英文全名>-official-wiki-rules.md
   ```

2. 文件只描述该作品的官方来源、固定接口路径、身份复核、模块读取和异常停止条件。
3. 使用一名角色完成实际提取验证，确认接口能直接到达，不依赖多路径试探。
4. 检查提取模块能落入角色档案模板；没有正文落点的资料不纳入规则。
5. 在 README 的支持列表中加入作品名称。
6. 运行结构验证和一次独立调用测试后再提交。

## 迁移到新项目

### 方式一：作为项目级 skill

适合只在某个项目内使用和维护。进入新项目根目录后：

```powershell
New-Item -ItemType Directory -Force ".agents\skills" | Out-Null
gh repo clone muchuanhehua/character-profile ".agents\skills\character-profile"
```

然后从该项目目录新建 Codex 对话。Codex 会从当前目录向仓库根目录扫描 `.agents/skills`。

### 方式二：作为用户级 skill

适合在所有项目中使用：

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.agents\skills" | Out-Null
gh repo clone muchuanhehua/character-profile "$env:USERPROFILE\.agents\skills\character-profile"
```

这份克隆既是可维护的 Git 仓库，也是 Codex 自动发现的用户级 skill。不要再复制出第二份工作副本，以免两处内容不同步。

Codex 通常会自动发现 skill 更新；如果新建或修改后没有显示，重启 Codex。

## 在新对话中维护

只要新对话所属的本地项目包含这份仓库，Codex 就能读取和修改文件。推荐在首条消息中明确目标：

```text
维护 character-profile skill。先读取 README.md、MAINTENANCE.md 和 SKILL.md，
只修改本次涉及的文件；完成后运行 skill 验证并同步到 GitHub。
```

“能够维护仓库”和“能够自动调用 skill”是两件事：

- 仓库位于项目可访问目录中：可以维护。
- 仓库位于 `.agents/skills/character-profile`，或以链接方式接入该位置：可以被 Codex 自动发现和调用。

## GitHub 连接与恢复

检查登录和远程：

```powershell
gh auth status
git remote -v
git branch -vv
```

如果迁移时还没有本地仓库，优先使用 `gh repo clone`，它会自动配置 `origin`。如果已有完整仓库但缺少远程：

```powershell
git remote add origin https://github.com/muchuanhehua/character-profile.git
git fetch origin
git branch --set-upstream-to=origin/main main
```

执行 `git pull --ff-only` 前先确认本地是否有未提交修改。出现分歧时不要强制覆盖，先查看：

```powershell
git status
git log --oneline --graph --decorate --all -20
```

再决定提交本地修改、拉取远程更新或建立独立分支。
