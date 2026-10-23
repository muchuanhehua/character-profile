# Character Profile

用于创建和修改结构化角色档案的 Agent Skill。结合官方资料、用户材料和用户决定，按模块展示草稿，确认后写入，并区分资料事实、合理推演与待确认内容。

包含《明日方舟：终末地》《原神》《崩坏：星穹铁道》《鸣潮》和《绝区零》的独立官方资料规则。

## DSH 安装

在 DSH（DeepSeek Harness）插件管理页中安装以下来源：

```text
github:muchuanhehua/character-profile
```

也可以使用 CLI；将 `desktop` 替换为实际使用的 profile 名称：

```shell
dsh plugin --profile desktop add github:muchuanhehua/character-profile
```

更新已安装的插件后重启 DSH，通过技能菜单或 `/character-profile` 调用。

## 独立 skill 安装

使用支持 Agent Skills 的安装器安装本仓库根目录，名称指定为 `character-profile`；也可以将 `SKILL.md`、`agents/` 和 `references/` 放入目标软件的技能目录，例如 `.agents/skills/character-profile/`。

在 Codex 中可继续使用 `$character-profile` 调用独立技能。

## 文件结构

```text
SKILL.md              技能入口
agents/openai.yaml    原有界面元数据
references/           档案模板与各作品资料规则
package.json          DSH 组合包声明与包文件列表
dsh/index.js          将根目录技能注册到 DSH
dsh/cordis.patch.yml  DSH 加载补丁
```

技能内容只维护根目录这一份。DSH 直接读取原文件，安装不需要构建或同步副本。
