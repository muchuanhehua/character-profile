# 《绝区零》官方百科取材规则

## 取材范围

从米游社《绝区零》官方百科的代理人本体页提取角色档案材料。提取范围以 `references/character-profile-template.md` 的最新版为准，不保留没有正文落点的资料，也不纳入养成、配队、攻略和战斗机制信息。

官方主站：

```text
https://baike.mihoyo.com/zzz/wiki/
```

## 固定接口路径

对每个角色只使用以下链路：

```text
search/content → 精确筛选代理人词条 → entry_page
```

正常取材固定为两次请求。不得枚举、猜测或轮询其他端点、参数组合或页面路径，也不使用网页正文或第三方来源补全结果。

### 1. 搜索并筛选词条

```text
GET https://act-api-takumi-static.mihoyo.com/common/blackboard/zzz_wiki/v1/search/content?app_sn=zzz_wiki&keyword=<URL 编码后的角色全名>
```

搜索接口必须保留 `app_sn=zzz_wiki`，无需配置站点专用请求头。只读取首次响应的 `data.list`，不翻页、不调整返回数量，忽略 `data.total`。

代理人词条同时满足：

1. `title` 精确等于目标角色全名。
2. `channels[].name` 包含 `代理人`。

唯一匹配时读取 `id`、`title`、`ext` 和 `bbs_url`。没有匹配或出现多个匹配时，列出当前代理人候选的 `id`、`title`、`summary` 和频道并停止，不继续试探其他路径。普通版本与特殊版本视为不同角色，不根据简称自动选择。

### 2. 读取并复核详情

```text
GET https://act-api-takumi-static.mihoyo.com/hoyowiki/zzz/wapi/entry_page?entry_page_id=<词条ID>
```

详情接口必须携带：

```text
x-rpc-wiki_app: zzz
```

不得省略或替换该请求头；否则同一 ID 可能返回 404 或命中其他 Wiki 空间的页面。无需添加 `lang`、`app_sn` 或其他站点专用参数。

复核：

- `retcode` 等于 `0`。
- `data.page.id` 等于搜索结果 ID。
- `data.page.name` 等于所选词条名。
- `data.page.menus[].name` 包含 `代理人`。

接口失败、响应结构变化或身份不一致时，报告当前结果并停止。直接使用搜索结果的 `bbs_url` 记录来源页面。

## 详情读取

角色页模块：

```text
data.page.modules[]
```

页面分组：

```text
data.page.template_layout.tab[].module_group[]
```

模块内容：

```text
data.page.modules[].components[].data
```

`components[].data` 是 JSON 字符串，必须解析后再读取字段。`collapse_panel` 的 `rich_text` 是 HTML 字符串；提取可见文本并进行 HTML 实体解码，保留段落、列表和引语关系，不保留展示样式。

先列出当前词条实际存在且能进入角色档案模板的模块，给出模块用途；用户确认后再提取内容。提取结果保留词条 ID、词条名、频道、模块 ID、模块名、页面分组、组件类型和 `bbs_url`。

## 模块匹配

不要把模块 ID 或页面序号作为稳定规则；模块 ID 只用于来源记录和临时调试。

长期匹配优先级：

1. 页面分组
2. 模块名或匹配条件
3. `component_id`
4. 数据字段

## 基础信息

在页面分组 `基础信息` 中，找到 `component_id` 为 `role_base_info` 的组件并解析其 `data`。

| 稳定键 | 数据位置 | 用途 |
| --- | --- | --- |
| name | `role_base_info.name` | 姓名 |
| affiliation_identity | 搜索结果 `ext` 中的阵营值；`role_base_info.addition_text` | 合并为“阵营与身份”；相同内容去重，不同内容并列保留，不根据文本自行推断语义 |
| custom_field | `role_base_info.custom_field[].key/value` | 按原值提取出生日期、身高等字段；身高可作为体态数字信息 |
| appearance | `role_base_info.tachie_pc`、`tachie_m` | 只作外貌线索 |

阵营值按以下固定结构读取：

1. 解析所选搜索结果的 `ext`。
2. 读取 `c_43.filter.text` 并再次解析为 JSON 数组。
3. 取唯一一个以 `阵营/` 开头的元素并移除前缀。
4. 字段缺失或结果不唯一时标记阵营缺失，不从图片、简介或其他文本推断。

跳过 `grade`、`role_attribute`、`role_profession` 等游戏机制字段。

## 角色本体页保留模块

| 稳定键 | 页面分组 | 模块名 | `component_id` | 主要数据入口 | 用途 |
| --- | --- | --- | --- | --- | --- |
| base_info | 基础信息 | 无固定名称 | role_base_info | 解析后的基础字段 | 姓名、阵营与身份、出生日期、身高和外貌线索 |
| role_impression | 角色展示 | 角色印象 | collapse_panel | `rich_text` | 个人喜好、人际牵绊、性格特质 |
| role_story | 角色展示 | 角色故事 | collapse_panel | `rich_text` | 个人经历、个人喜好、人际牵绊、性格特质 |
| video_store_message | 角色展示 | 录像店经营留言信息 | collapse_panel | `rich_text` | 日常表达、互动口吻和生活侧面；模块不存在时跳过 |

角色介绍、CV、技能、晋升、意象影画、媒体物料、攻略和养成表不纳入角色档案。

