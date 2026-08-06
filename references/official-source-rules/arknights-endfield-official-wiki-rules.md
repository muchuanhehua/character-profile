# 《明日方舟：终末地》官方 WIKI 取材规则

## 取材范围

只从森空岛《明日方舟：终末地》官方 WIKI 的干员本体页提取角色档案材料。

提取范围以 `references/character-profile-template.md` 为准，不纳入养成、配队、攻略或运营内容。

官方主站：
https://wiki.skland.com/endfield?header=0

## 固定接口路径

API 主机：

```text
https://zonai.skland.com
```

给定角色名后，只执行以下链路：

```text
refresh → signed search → 精确筛选 → signed info
```

不得枚举、猜测或轮询其他端点，不得为验证路径而反复尝试不同 URL，也不得在固定链路可用时改走网页 DOM、搜索引擎或第三方资料。任一步失败时，报告失败步骤及接口返回并停止；不要自动扩展取材路径。

1. 获取临时凭证：

   ```text
   GET /web/v1/auth/refresh
   ```

   后续请求使用 `data.token` 和 `refresh.timestamp`。同一次取材先获取一次凭证，不为搜索与详情分别刷新。

2. 搜索角色：

   ```text
   GET /web/v1/wiki/item/search?keyword=<URL 编码后的角色名>
   ```

3. 在 `data.items` 中精确筛选：

   ```text
   name == <角色名>
   mainType.name == 终末地百科
   subType.name == 干员
   ```

   结果必须唯一。没有结果或出现多个结果时，列出当前返回的候选项并停止，不搜索其他页面。

4. 使用唯一结果的 `itemId` 获取详情：

   ```text
   GET /web/v1/wiki/item/info?id=<itemId>
   ```

   确认 `data.item.brief.name` 与目标角色一致。

词条页面只用于记录来源或人工核对，不作为默认提取接口：

```text
https://wiki.skland.com/endfield/detail?mainTypeId=1&subTypeId=1&gameEntryId=<itemId>&header=0
```

## 请求签名

`search` 和 `info` 使用同一个临时 token 与 `refresh.timestamp`。请求头：

```text
platform: 3
timestamp: <refresh.timestamp>
vName: 1.0.0
sign: <计算结果>
```

签名：

```text
headerSubset = {"platform":"3","timestamp":"<refresh.timestamp>","dId":"","vName":"1.0.0"}
signSource = path + query + timestamp + JSON.stringify(headerSubset)
sign = md5(hex(hmac_sha256(signSource, token)))
```

- `path` 不含域名。
- `query` 不含开头的 `?`，并且必须与实际发送的查询字符串完全一致。
- `headerSubset` 使用上示字段顺序与紧凑 JSON，不插入空格。
- `dId` 固定为空字符串。

## 详情提取

按以下位置读取：

```text
条目头部：data.item.brief
补充信息：data.item.document.extraInfo
页面分组：data.item.document.chapterGroup
模块数据：data.item.document.widgetCommonMap
文档数据：data.item.document.documentMap
```

模块按“页面分组 → 模块名或匹配条件 → 组件类型 → 数据字段”定位。widget ID 只可用于当前响应内关联数据，不得写成长期规则。

文本块从 `documentMap[contentId].blockMap` 按 `blockIds` 顺序递归读取。表格继续读取 `cellMap.childIds` 指向的子块，不能只取顶层文本。

完成详情读取后：

1. 只列出下表中实际存在的模块，等待用户确认。
2. 确认后提取对应内容。
3. 记录词条 ID、词条名、页面分组、模块名、组件类型和词条页面链接。

## 干员本体页保留模块

| 稳定键 | 页面分组 | 模块名 / 匹配条件 | 组件类型 | 备注 |
| --- | --- | --- | --- | --- |
| entry_header | 条目头部 | `brief.description` / `document.extraInfo` | brief | 提取角色简介、身份摘要、经历概述；封面和立绘只作外貌线索 |
| operator_info | 干员资料 | 干员信息 | table | 提取代号、性别、身份认证、生日、种族；跳过词缀、获取方式、上线时间等游戏机制或运营字段 |
| operator_profile | 干员档案 | 干员情报 | common | 提取阵营、身份、专长、爱好；对应 `基本信息`、`个人喜好`、`性格特质` |
| archive | 干员档案 | 档案 | common | 对应 `个人经历`、`个人喜好`、`人际牵绊`、`性格特质` |
| voice | 语音记录 | 干员语音 | audio | 对应 `个人喜好`、`人际牵绊`、`性格特质`、`台词与表达` |
| others_comment | 语音记录 | `关于<角色名>，干员们说......` | common | 对应外界评价、关系侧写、人际牵绊；读取 `cellMap.childIds` 中的文本 |
| baker_audio | 官方情报 | Baker通信音频 | audio | 官方情报中只默认提取此模块；对应关系表达、人际牵绊、台词与表达 |

