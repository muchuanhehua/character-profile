# Character Profile

一个用于创建和修改结构化角色档案的 Codex skill。它可以结合官方资料、用户提供的材料和用户决定，逐步整理角色设定，并明确区分事实、合理推演与待确认内容。

## 功能

- 按统一模板分模块创建或修改角色档案
- 整理官方角色资料并保留来源边界
- 在写入前展示草稿并等待用户确认
- 支持《明日方舟：终末地》《原神》《崩坏：星穹铁道》《鸣潮》和《绝区零》的独立官方资料规则

## 安装

支持作为 Codex 插件安装和管理，也保留独立 skill 的安装方式。插件中的技能文件由原始技能生成，内容保持一致。

### 作为插件安装

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

通过 Codex 的 skill 安装器安装以下仓库**根目录**中的 skill，技能名称指定为 `character-profile`：

```text
https://github.com/muchuanhehua/character-profile
```

也可以将仓库中的 `SKILL.md`、`agents/` 和 `references/` 复制到目标环境的 `.agents/skills/character-profile/`。这些文件的相对位置应保持不变。

## 使用

作为插件安装后，显式调用带插件前缀的技能名称：

```text
Use $character-profile:character-profile to create or revise a character profile from the provided materials.
```

作为独立 skill 安装时，仍使用原来的名称：

```text
Use $character-profile to create or revise a character profile from the provided materials.
```

也可以直接要求 Codex 创建角色档案、修改人物设定、整理角色官方资料或制作角色模板。

## 结构

```text
.agents/
└── plugins/
    └── marketplace.json
.codex-plugin/
└── plugin.json
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

`.codex-plugin/plugin.json` 使用受支持的 Codex 兼容格式，通过 `skills: "./skills/"` 加载插件内的技能。`.agents/plugins/marketplace.json` 将仓库根目录声明为插件来源。原始 `SKILL.md`、`agents/` 和 `references/` 的内容及路径保持不变，独立 skill 安装仍以它们为准。

## 维护插件内容

修改根目录原始技能后，重新生成插件副本并检查：

```shell
python scripts/sync_plugin.py
python scripts/sync_plugin.py --check
```

将生成后的 `skills/character-profile/` 一同提交。不要直接编辑生成目录；检查命令会比较文件列表及每个文件的完整内容，发现缺失、差异或多余文件时返回失败。脚本只使用 Python 标准库，安装和使用技能不需要执行它。

打包格式参考 [OpenAI 官方插件文档](https://developers.openai.com/plugins/build/plugins)。
