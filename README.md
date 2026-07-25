# Character Profile

这是 `character-profile` Codex skill 的独立维护仓库。仓库根目录用于本地修改、验证和 GitHub 同步；可安装的完整 skill 位于 `character-profile/`。

## 目录结构

```text
character-profile-skill/
├─ README.md
├─ MAINTENANCE.md
└─ character-profile/
   ├─ SKILL.md
   ├─ agents/
   │  └─ openai.yaml
   └─ references/
      ├─ character-profile-template.md
      ├─ nsfw-guide.md
      └─ official-source-rules/
```

- `character-profile/SKILL.md`：定义触发条件、基本规则、资料路由和工作流程。
- `character-profile/agents/openai.yaml`：定义 Codex 中显示的名称、简介和默认提示。
- `character-profile/references/character-profile-template.md`：角色档案的统一结构模板。
- `character-profile/references/nsfw-guide.md`：成人私密模块的独立写作规则。
- `character-profile/references/official-source-rules/`：各作品互不混用的官方资料取材规则。
- `MAINTENANCE.md`：维护、验证、迁移、安装和 GitHub 同步说明。

## 已支持的官方资料

- 《明日方舟：终末地》
- 《原神》
- 《崩坏：星穹铁道》
- 《鸣潮》
- 《绝区零》

其他作品需要先建立独立的官方资料取材规则，再接入统一流程。

## 安装后使用

在 Codex 中显式调用：

```text
Use $character-profile to create or revise a character profile.
```

也可以直接提出创建角色档案、修改角色档案、整理角色官方资料或制作角色模板等请求，由 Codex 根据 skill 描述自动匹配。

本仓库是维护工作区，不会仅因被克隆而自动成为已安装 skill。安装、更新和迁移方法见 [MAINTENANCE.md](MAINTENANCE.md)。
