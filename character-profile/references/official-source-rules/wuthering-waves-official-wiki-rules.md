# 《鸣潮》官方 WIKI 取材规则

## 取材范围

从库街区《鸣潮》官方 WIKI 提取共鸣者角色档案材料。提取范围以 `references/character-profile-template.md` 的最新版为准，不保留没有正文落点的资料，也不纳入养成、配队、攻略和战斗机制信息。

官方主站：

```text
https://wiki.kurobbs.com/mc/home?bbs_clientSource=12
```

## 固定接口路径

API 主机：

```text
https://api.kurobbs.com
```

对每个角色只使用以下链路：

```text
getPage（共鸣者目录）→ 精确匹配名称 → getEntryDetail
```

正常取材固定为两次请求。两个接口都使用：

```text
Content-Type: application/x-www-form-urlencoded
wiki_type: 9
```

不发送其他站点专用请求头。不得调用全局搜索、目录树或其他候选详情，也不翻页、枚举、猜测或轮询备用路径。

### 1. 读取并筛选共鸣者目录

```text
POST https://api.kurobbs.com/wiki/core/catalogue/item/getPage

catalogueId=1105
```

`1105` 对应当前官方目录树中的 `游戏图鉴 > 共鸣者`。只读取首次响应的 `data.results.records`；接口当前一次返回完整目录，不发送会被忽略的 `keyword`、`page` 或 `limit`。

按 `name` 与目标角色名精确比较。唯一匹配时读取 `entryId`，并立即转为字符串保存，避免超长整数精度丢失。

普通 `id` 是目录项目 ID，不用于词条详情。没有匹配或出现多个匹配时，列出当前目录中名称相关的 `name` 与 `entryId` 候选并停止，不继续试探其他路径。

### 2. 读取并复核词条详情

```text
POST https://api.kurobbs.com/wiki/core/catalogue/item/getEntryDetail

id=<entryId>
```

复核：

- `data.id` 等于所选 `entryId`。
- `data.name` 等于所选目录项名称。
- `data.orgFullName` 等于 `角色组 > 共鸣者`。

目录失效、接口失败、响应结构变化或身份不一致时，报告当前结果并停止。

词条页面仅用于记录来源和人工复核：

```text
https://wiki.kurobbs.com/mc/item/<entryId>
```

## 详情读取

页面分组：

```text
data.content.modules[]
```

分组读取 `modules[].title` 与 `components[]`；组件读取 `components[].title`、`components[].type` 及对应内容字段。

`basic-component.content` 与 `tabs-component.tabs[].content` 是 HTML 字符串。提取可见文本并进行 HTML 实体解码，不保留展示样式。

先列出当前词条实际存在且能进入角色档案模板的模块，给出模块用途；用户确认后再提取内容。提取结果保留 `entryId`、词条名、页面分组、组件名、组件类型和页面链接。

## 模块匹配

不要把模块 ID 或组件 ID 作为稳定规则。若现场调试需要，可临时查看 ID；不要写入长期规则表。

长期匹配优先级：

1. 页面分组 `title`
2. 组件 `title` 或匹配条件
3. 组件类型
4. 数据字段

## 共鸣者本体页保留模块

| 稳定键 | 页面分组 | 组件名 / 匹配条件 | 组件类型 | 主要数据入口 | 用途 |
| --- | --- | --- | --- | --- | --- |
| role_profile | 基础资料 | 角色组件 | role-component | `role.title`、`role.info[].text`、`role.roleDescription` | 姓名、身份、所属、称号和简介；`role.figures` 只作外貌线索 |
| other_info | 基础资料 | 其他信息 | basic-component | `content` HTML | 性别、身份、所属和特殊料理等补充信息；跳过 CV、实装版本和战斗机制 |
| inspection | 角色档案 | 共鸣能力鉴定报告 / 检验鉴定 | basic-component | `content` HTML | 共鸣能力、频谱检验、共鸣源、超频诊断及身体或能力特征；用于个人经历和性格特质，不转写为战斗机制 |
| precious_items | 角色档案 | 珍贵之物 | tabs-component | `tabs[].title`、`tabs[].content` | 旧物、纪念物、象征物和特殊料理；用于珍视之物、个人喜好和个人经历 |
| character_story | 角色档案 | 角色故事 | tabs-component | `tabs[].title`、`tabs[].content` | 经历、关系、选择、创伤、愿望和人物底色；用于个人经历、人际牵绊和性格特质 |
| voice | 角色语音 | 个性语音 / 战斗语音 | audio-component | 中文 `mediaTabs[].mediaList[].id`、`content` | 心声、喜好、烦恼、关于某人、生日祝福、自我介绍和表达习惯 |

## 语音标题合并

只读取 `mediaTabs[].title` 以 `中文：` 开头的页签。组件语音条目位于：

```text
audio-component.mediaTabs[].mediaList[]
```

使用字符串形式的音频 `id`，与全局标题索引合并：

```text
data.content.mediaList[].id/title
```

全局 `mediaList` 不是独立取材模块。无法匹配标题的语音条目保留正文并标记标题缺失，不根据文件名推测。

