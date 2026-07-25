# Character Profile

用于创建和修改结构化角色档案的 Codex skill。它以角色档案模板为主体，将官方资料事实、合理推演和用户决定分开处理，并按模块逐步与用户确认。

## 主要内容

- `SKILL.md`：定义触发条件、基本规则、资料路由和工作流程。
- `agents/openai.yaml`：定义 Codex 中显示的名称、简介和默认提示。
- `references/character-profile-template.md`：角色档案的统一结构模板。
- `references/nsfw-guide.md`：成人私密模块的独立写作规则。
- `references/official-source-rules/`：各作品互不混用的官方资料取材规则。
- `MAINTENANCE.md`：维护、验证、迁移和 GitHub 同步说明。

## 已支持的官方资料

- 《明日方舟：终末地》
- 《原神》
- 《崩坏：星穹铁道》
- 《鸣潮》
- 《绝区零》

其他作品需要先建立独立的官方资料取材规则，再接入 `SKILL.md` 的统一流程。

## 使用方式

在 Codex 中显式调用：

```text
Use $character-profile to create or revise a character profile.
```

也可以直接提出创建角色档案、修改角色档案、整理角色官方资料或制作角色模板等请求，由 Codex 根据 skill 描述自动匹配。

## 维护

修改文件、新增作品规则、迁移项目或重新连接 GitHub 时，请阅读 [MAINTENANCE.md](MAINTENANCE.md)。
