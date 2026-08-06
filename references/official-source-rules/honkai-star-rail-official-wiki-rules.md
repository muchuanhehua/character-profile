# 《崩坏：星穹铁道》官方百科取材规则

## 取材范围

从米游社《崩坏：星穹铁道》官方百科提取角色档案材料。提取范围以 `references/character-profile-template.md` 的最新版为准，不保留没有正文落点的资料，也不纳入命途、属性、星级、养成、配队和攻略信息。

官方主站：

```text
https://bbs.mihoyo.com/sr/wiki/?bbs_presentation_style=no_header
```

## 固定接口路径

对每个角色只使用以下链路：

```text
search/content → 精确筛选角色词条 → content/info
```

正常取材固定为两次请求。两个接口都必须保留 `app_sn=sr_wiki`；请求无需配置站点专用字段，使用客户端默认请求头。

不得枚举、猜测或轮询其他端点、参数组合、页面路径，也不使用网页搜索、页面正文解析或第三方来源补全结果。

### 1. 搜索并筛选词条

```text
GET https://act-api-takumi-static.mihoyo.com/common/blackboard/sr_wiki/v1/search/content?app_sn=sr_wiki&keyword=<URL 编码后的角色名>
```

只读取首次响应的 `data.list`，不翻页、不调整返回数量，忽略 `data.total`。

角色词条同时满足：

1. `title` 精确等于目标角色名。
2. `channels[].name` 包含 `角色`。

唯一匹配时读取搜索结果的 `id`。没有匹配或出现多个匹配时，列出当前候选的 `id`、`title`、`summary` 和频道并停止，不继续试探其他路径。

同名开拓者词条以 `summary` 中的男女标记供用户选择，不自动判定。

### 2. 读取并复核详情

```text
GET https://act-api-takumi-static.mihoyo.com/common/blackboard/sr_wiki/v1/content/info?app_sn=sr_wiki&content_id=<词条ID>
```

复核以下字段：

- `data.content.id` 等于搜索结果 ID。
- `data.content.title` 等于已选择的词条名。
- `data.content.rpg_new_tmp_content.type` 等于 `role`。
- `data.channel_list[].slice[].name` 包含 `角色`。

接口失败、响应结构变化或身份不一致时，报告当前结果并停止。

词条页面仅用于记录来源和人工复核：

```text
https://bbs.mihoyo.com/sr/wiki/content/<词条ID>/detail?bbs_presentation_style=no_header
```

## 详情读取

角色基础块：

```text
data.content.rpg_new_tmp_content.base.userInfo
```

角色模块：

```text
data.content.rpg_new_tmp_content.modules[]
```

每个模块读取 `id`、`name`、`components[].componentId` 和 `components[].data`。`components[].data` 是 JSON 字符串，必须解析后再读取具体字段。

先列出当前词条实际存在且能进入角色档案模板的模块，给出模块用途；用户确认后再提取内容。提取结果保留词条 ID、词条名、频道、模块 ID、模块名、组件类型和页面链接。

## 模块匹配

不要把页面序号作为稳定规则。序号只用于临时沟通。

长期匹配优先级：

1. 稳定键
2. 模块名或匹配条件
3. 组件类型
4. 仅在名称或组件类型不足以区分时使用模块 ID 补强

## 角色基础块

| 稳定键 | 数据位置 | 用途 |
| --- | --- | --- |
| role_base | `base.userInfo` | 提取姓名；头像和立绘只作外貌线索；跳过角色内部 ID、命途、属性和星级 |

## 角色本体页保留模块

| 稳定键 | 模块名 | 模块 ID | `componentId` | 主要数据入口 | 用途 |
| --- | --- | ---: | --- | --- | --- |
| character_info | 角色信息 | 11 | character_info | `list[].rightKey`、`list[].rightValue` | 提取阵营、身份、称号和简介类信息；跳过实装日期、定位等机制信息 |
| character_story | 角色故事 | 19 | character_story | `detail`、`list[].tabName`、`list[].desc` | 个人经历、个人喜好、人际牵绊、性格特质 |
| voice | 角色语音 | 20 | role_voice | `list[tabName=中].table[].name`、`content` | 个人喜好、人际牵绊、性格特质、台词与表达；只读取中文页签 |
| character_relation | 角色关系 | 21 | character_relation | `list[].table[]` | 人际牵绊；没有有效关系数据时跳过 |

