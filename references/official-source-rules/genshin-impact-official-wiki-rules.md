# 原神官方百科取材规则

## 取材范围

从米哈游《原神》官方百科提取角色档案材料。提取范围以 `references/character-profile-template.md` 的最新版为准，不保留没有正文落点的资料，也不提取星级、战斗定位等游戏机制信息。

官方主站：

```text
https://baike.mihoyo.com/ys/obc/?bbs_presentation_style=no_header&visit_device=pc
```

## 固定接口路径

对每个角色只使用以下链路：

```text
search → 精确筛选角色本体与可选逸闻 → entry_page
```

角色没有逸闻页时共两次请求；存在逸闻页时共三次请求。不得枚举、猜测或轮询其他端点、参数组合、页面路径，也不使用网页搜索、页面正文解析或第三方来源补全结果。

请求只保留两个必要请求头：

```text
User-Agent: Mozilla/5.0
Referer: https://baike.mihoyo.com/ys/obc/?bbs_presentation_style=no_header&visit_device=pc
```

### 1. 搜索并筛选词条

```text
GET https://act-api-takumi-static.mihoyo.com/hoyowiki/genshin/wapi/search?keyword=<URL 编码后的角色名>
```

只读取首次响应的 `data.list`，不翻页、不调整返回数量，忽略 `data.total`。

逐条规范化结果：

1. 对 `name` 去除 HTML 标签，再进行 HTML 实体解码。
2. 从 `menus[].name` 读取频道。
3. 角色本体：规范化名称精确等于 `<角色名>`，频道为 `角色`。
4. 角色逸闻：规范化名称精确等于 `<角色名>【逸闻】`，频道为 `角色逸闻`。

角色本体必须唯一匹配。缺失或出现多个匹配时，列出当前 `data.list` 中的候选词条并停止，不继续试探其他路径。

角色逸闻允许缺失。没有匹配时记录“无角色逸闻页”并继续读取角色本体，不追加搜索；出现多个匹配时列出候选并停止。

### 2. 读取匹配词条

对每个已匹配的词条 ID 各请求一次：

```text
GET https://act-api-takumi-static.mihoyo.com/hoyowiki/genshin/wapi/entry_page?entry_page_id=<词条ID>
```

使用 `data.page.id`、`data.page.name` 与 `data.page.menus[].name` 复核词条身份。接口失败、响应结构变化或身份不一致时，报告当前结果并停止。

词条页面仅用于记录来源和人工复核：

```text
https://baike.mihoyo.com/ys/obc/content/<词条ID>/detail?bbs_presentation_style=no_header
```

## 详情读取

模块位于：

```text
data.page.modules[]
```

每个模块读取：

- `id`
- `name`
- `components[].component_id`
- `components[].data`

`components[].data` 是 JSON 字符串，必须解析后再读取具体字段。常用组件的数据入口如下：

| 组件类型 | 主要数据入口 |
| --- | --- |
| role_base_info | `attr` |
| collapse_panel | `rich_text` |
| role_voice | `list` |
| rich_base_info | `list` |
| interactive_dialogue | `root_id`、`child_ids`、`contents`、`list` |

先列出当前词条实际存在且可进入角色档案模板的模块，给出模块用途；用户确认后再提取内容。提取结果保留词条 ID、词条名、频道、模块名和页面链接。

## 模块匹配

不要把页面序号作为稳定规则。序号只用于临时沟通。

长期匹配优先级：

1. 稳定键
2. 模块名或匹配条件
3. 组件类型
4. 仅在名称随角色变化时使用模块 ID 补强

角色本体页与角色逸闻页出现重复材料时，按角色档案模板的目标合并，不重复收录。

## 角色本体页保留模块

| 稳定键 | 模块名 / 匹配条件 | 组件类型 | 用途 |
| --- | --- | --- | --- |
| base_info | 基础信息 | role_base_info | 提取姓名、称号、生日、身份、所属等基本信息；跳过元素属性、武器类型、星级和战斗定位 |
| extra_desc | 更多描述 | collapse_panel | 基本信息、性格特质 |
| role_detail | 角色详细 | collapse_panel | 基本信息、个人经历、性格特质 |
| voice | 配音展示 | role_voice | 个人喜好、性格特质、台词与表达 |
| story_1 | 角色故事1 | collapse_panel | 个人经历、性格特质 |
| story_2 | 角色故事2 | collapse_panel | 个人经历、性格特质 |
| story_3 | 角色故事3 | collapse_panel | 个人经历、性格特质 |
| story_4 | 角色故事4 | collapse_panel | 个人经历、性格特质 |
| story_5 | 角色故事5 | collapse_panel | 个人经历、性格特质 |
| personal_object | 模块 ID `436` | collapse_panel | 个人喜好、珍视之物；模块名可能是个人物件、载具或纪念物 |
| vision | 神之眼 | collapse_panel | 个人经历、性格特质；不单列属性或能力模块 |
| related_voice | 角色关联语音 | collapse_panel | 人际牵绊、台词与表达 |
| birthday_mail | 生日邮件 | collapse_panel | 个人喜好、人际牵绊、台词与表达 |

## 角色逸闻页保留模块

| 稳定键 | 模块名 / 匹配条件 | 组件类型 | 用途 |
| --- | --- | --- | --- |
| anecdote_record | 逸闻纪事 | rich_base_info | 个人经历、性格特质、人际牵绊 |
| anecdote_dialogue | 逸闻纪事对话 | interactive_dialogue | 台词与表达、人际牵绊 |
| story_easter_egg | 剧情彩蛋 | rich_base_info | 个人经历、人际牵绊 |
| story_easter_egg_dialogue | 剧情彩蛋对话 | interactive_dialogue | 台词与表达、人际牵绊 |
| theater_dialogue | 幻想真境剧诗对话 | interactive_dialogue | 台词与表达、性格特质、人际牵绊 |
| teapot_dialogue | 角色洞天对话 | interactive_dialogue | 台词与表达、个人喜好、人际牵绊 |

