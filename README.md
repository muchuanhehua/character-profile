# Character Profile

一个用于创建和修改结构化角色档案的 Codex skill。它可以结合官方资料、用户提供的材料和用户决定，逐步整理角色设定，并明确区分事实、合理推演与待确认内容。

## 功能

- 按统一模板分模块创建或修改角色档案
- 整理官方角色资料并保留来源边界
- 在写入前展示草稿并等待用户确认
- 支持《明日方舟：终末地》《原神》《崩坏：星穹铁道》《鸣潮》和《绝区零》的独立官方资料规则

## 安装

在 Codex 中通过以下 GitHub 仓库安装此 skill：

```text
https://github.com/muchuanhehua/character-profile
```

## 使用

显式调用：

```text
Use $character-profile to create or revise a character profile from the provided materials.
```

也可以直接要求 Codex 创建角色档案、修改人物设定、整理角色官方资料或制作角色模板。

## 结构

```text
SKILL.md
agents/
└── openai.yaml
references/
├── character-profile-template.md
├── nsfw-guide.md
└── official-source-rules/
```
