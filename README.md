# Character Profile

一个用于创建和修改结构化角色档案的 Agent Skill，提供 DSH（DeepSeek Harness）组合包和 Codex 插件安装入口。它可以结合官方资料、用户提供的材料和用户决定，逐步整理角色设定，并明确区分事实、合理推演与待确认内容。

## 功能

- 按统一模板分模块创建或修改角色档案
- 整理官方角色资料并保留来源边界
- 在写入前展示草稿并等待用户确认
- 支持《明日方舟：终末地》《原神》《崩坏：星穹铁道》《鸣潮》和《绝区零》的独立官方资料规则

## 安装

支持作为 DSH 组合包、Codex 插件或独立 skill 安装。各入口使用内容一致的技能文件。

### DSH（DeepSeek Harness）

在 DSH 的插件管理页中，使用以下安装来源：

```text
github:muchuanhehua/character-profile
```

也可以使用 DSH CLI。桌面版通常使用 `desktop` profile：

```shell
dsh plugin --profile desktop add github:muchuanhehua/character-profile
```

Web 版将 `desktop` 改为实际使用的 profile 名称，例如 `web`。

仓库通过 `package.json` 中的 `dsh.bundle.patch` 声明 DSH 组合包，安装后挂载 `character-profile-skill`，将技能及其参考资料目录注册到 DSH 的技能服务。安装不需要构建步骤。

如果此前安装过缺少组合包声明的旧副本，请在 DSH 插件页重新安装此来源；替换已加载的插件代码后，重启 DSH。只刷新 GitHub 页面不会更新本机已安装的副本。

### Codex

添加此仓库提供的 marketplace，然后安装插件：

```shell
codex plugin marketplace add muchuanhehua/character-profile
codex plugin add character-profile@character-profile-marketplace
```

如果已经克隆仓库，也可以在仓库根目录使用本地来源安装：

```shell
codex plugin marketplace add .
codex plugin add character-profile@character-profile-marketplace
```

marketplace 名称为 `character-profile-marketplace`，显示名称为 `Character Profile`，其中包含 `character-profile` 插件。安装后新建聊天以加载技能。

### 作为独立 skill 安装

对于支持直接安装 Agent Skills 的软件，可安装以下仓库**根目录**中的 skill，技能名称指定为 `character-profile`：

```text
https://github.com/muchuanhehua/character-profile
```

也可以将仓库中的 `SKILL.md`、`agents/` 和 `references/` 复制到目标环境的 `.agents/skills/character-profile/`。这些文件的相对位置应保持不变。

## 使用

DSH 中可通过技能菜单或以下命令调用：

```text
/character-profile
```

作为 Codex 插件安装后，显式调用带插件前缀的技能名称：

```text
Use $character-profile:character-profile to create or revise a character profile from the provided materials.
```

作为独立 skill 安装时，仍使用原来的名称：

```text
Use $character-profile to create or revise a character profile from the provided materials.
```

也可以直接要求当前 Agent 创建角色档案、修改人物设定、整理角色官方资料或制作角色模板。

## 结构

```text
.agents/
└── plugins/
    └── marketplace.json
.codex-plugin/
└── plugin.json
package.json
dsh/
├── cordis.patch.yml
├── index.js
├── icon.svg
└── locale/
SKILL.md
agents/
└── openai.yaml
references/
├── character-profile-template.md
├── nsfw-guide.md
└── official-source-rules/
skills/
└── character-profile/    # 从根目录原始技能生成的插件内容
scripts/
└── sync_plugin.py
```

`package.json` 和 `dsh/` 提供 DSH 的组合包声明、加载入口和展示资源。`.codex-plugin/plugin.json` 通过 `skills: "./skills/"` 加载 Codex 插件内的技能，`.agents/plugins/marketplace.json` 提供 Codex 的插件目录。两种插件都读取 `skills/character-profile/`；原始 `SKILL.md`、`agents/` 和 `references/` 的内容及路径保持不变，独立 skill 安装仍以它们为准。

## 维护插件内容

修改根目录原始技能后，重新生成插件副本并检查：

```shell
python scripts/sync_plugin.py
python scripts/sync_plugin.py --check
```

将生成后的 `skills/character-profile/` 一同提交。不要直接编辑生成目录；检查命令会比较文件列表及每个文件的完整内容，发现缺失、差异或多余文件时返回失败。脚本只使用 Python 标准库，安装和使用技能不需要执行它。

修改 DSH 加载入口后可运行：

```shell
npm install --ignore-scripts
npm test
```

测试使用 DSH `0.2.1-rc.2` 的真实组合包读取器和技能注册表，检查组合包声明、技能正文、参考资料路径、已有技能的优先级和卸载行为。发布时保持 `package.json` 与 `.codex-plugin/plugin.json` 的版本号一致，并检查 `npm pack --dry-run` 的文件列表。

打包格式参考 [DSH 官方组合包说明](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/preset/agent-preset/skills/cordis-plugin-development/references/host-plugin.md)及 [Codex 官方插件文档](https://developers.openai.com/plugins/build/plugins)。
