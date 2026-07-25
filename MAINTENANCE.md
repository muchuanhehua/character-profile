# Character Profile 维护说明

本文档用于长期维护、迁移、安装和同步本 skill。仓库地址：

```text
https://github.com/muchuanhehua/character-profile
```

仓库根目录 `character-profile-skill/` 是本地维护工作区；`character-profile-skill/character-profile/` 才是完整、可安装的 skill 目录。二者的职责不要混淆。

## 维护边界

- `character-profile/SKILL.md` 只保留触发条件、共通规则、资料路由和工作流程。
- `character-profile/references/character-profile-template.md` 是角色档案结构的唯一模板。
- `character-profile/references/official-source-rules/` 中每个作品使用独立文件；不得合并、互相引用或类推其他作品的接口和页面结构。
- `character-profile/references/nsfw-guide.md` 只负责成人私密模块；不得扩展到未成年角色。
- `character-profile/agents/openai.yaml` 只保存界面元数据，不承载工作流程。
- 不引入特定聊天前端、角色卡格式或平台宏。需要指代操作者时，正文使用“用户”；输出格式如需占位符，应先由使用方决定。
- 不恢复与角色档案模板重复的 `profile-writing-guide.md`。
- 不提交缓存、临时验证文件、凭据、令牌或本地环境配置。

## 常用维护流程

开始修改前：

```powershell
Set-Location "D:\path\to\character-profile-skill"
git pull --ff-only
git status -sb
```

修改时按文件职责控制范围：

1. 共通流程变化：修改 `character-profile/SKILL.md`。
2. 档案字段变化：修改 `character-profile/references/character-profile-template.md`，并确认模块推进规则仍适用。
3. 单个作品的接口或模块变化：只修改对应的官方资料取材规则。
4. 成人私密模块变化：修改 `character-profile/references/nsfw-guide.md`，并保持模板中的读取条件一致。
5. 界面名称或默认提示变化：修改 `character-profile/agents/openai.yaml`。

修改完成后：

```powershell
git status -sb
git diff
git add <本次修改的文件>
git commit -m "简短说明本次修改"
git push
```

`git push` 完成后，GitHub 仓库会立即更新；未提交或未推送的本地变化不会上传。

## 验证清单

每次提交前至少确认：

- `character-profile/SKILL.md` 的 YAML frontmatter 只包含有效的 `name` 和 `description`。
- skill 名称保持为 `character-profile`。
- `character-profile/SKILL.md` 引用的文件和目录真实存在。
- `character-profile/agents/openai.yaml` 的 `default_prompt` 显式包含 `$character-profile`。
- 五个作品的取材规则仍然互相独立。
- 新增接口使用可直接到达、可复核的固定路径，不通过枚举或猜测寻找页面。
- 仓库中没有缓存、临时文件或疑似密钥。
- 创建流程仍然先展示当前模块的资料分析、推演方向和草稿，再与用户探讨并等待确认。

可让 Codex 执行官方结构验证：

```text
使用 $skill-creator 的 quick_validate.py 验证 character-profile/；
如果缺少 PyYAML，只临时安装依赖，不修改全局 Python 环境。
```

Windows 上读取中文文件时，应让 Python 使用 UTF-8：

```powershell
$skillCreator = Join-Path $env:USERPROFILE ".codex\skills\.system\skill-creator"
$env:PYTHONUTF8 = "1"
python (Join-Path $skillCreator "scripts\quick_validate.py") ".\character-profile"
```

## 新增作品取材规则

1. 在 `character-profile/references/official-source-rules/` 新建：

   ```text
   <作品英文全名>-official-wiki-rules.md
   ```

2. 文件只描述该作品的官方来源、固定接口路径、身份复核、模块读取和异常停止条件。
3. 使用一名角色完成实际提取验证，确认接口能直接到达，不依赖多路径试探。
4. 检查提取模块能落入角色档案模板；没有正文落点的资料不纳入规则。
5. 在 README 的支持列表中加入作品名称。
6. 运行结构验证和一次独立调用测试后再提交。

## 迁移维护工作区

在新电脑或新项目位置克隆仓库：

```powershell
gh repo clone muchuanhehua/character-profile "D:\Codex\character-profile-skill"
Set-Location "D:\Codex\character-profile-skill"
git status -sb
```

然后把 `D:\Codex\character-profile-skill` 作为独立 Codex 项目打开。这里是用于修改和推送的维护工作区，不会自动安装其中的 skill。

## 安装和更新 skill

推荐使用 Codex 的 `$skill-installer`，从仓库的 `character-profile/` 子目录安装，安装名称保持为 `character-profile`。公开仓库和具备访问权限的私密仓库都可以使用这种方式。

手动安装时，只复制 `character-profile/` 子目录：

```powershell
Copy-Item -Recurse -Force `
  ".\character-profile" `
  "$env:USERPROFILE\.agents\skills\character-profile"
```

维护工作区与安装目录是两份独立副本，不使用目录链接，也不会自动同步。仓库更新后，如需让已安装版本获得变化，应重新运行安装或更新流程；手动安装则重新复制该子目录。更新后如果 Codex 没有立即显示变化，重启 Codex。

## 在新对话中维护

从 `character-profile-skill` 项目中新建 Codex 对话即可维护这份仓库。推荐在首条消息中明确目标：

```text
维护 character-profile skill。先读取 README.md、MAINTENANCE.md
和 character-profile/SKILL.md，只修改本次涉及的文件；
完成后运行 skill 验证并同步到 GitHub。
```

“维护仓库”和“调用已安装 skill”是两件独立的事：

- 在 `character-profile-skill` 项目中打开对话：可以修改、验证并推送仓库。
- 通过安装流程部署 `character-profile/`：可以在其他项目中调用 skill。

## GitHub 连接与恢复

检查登录和远程：

```powershell
gh auth status
git remote -v
git branch -vv
```

如果已有完整仓库但缺少远程：

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
