# 📝 内容抓取与摘要功能说明

## ✅ 已完成的基础架构

### 1️⃣ 数据库更新
- **新增字段**:
  - `content` (Text): 用于存储热点详情页的完整文本内容。
  - `media_paths` (Text): 用于存储本地保存的图片/视频文件路径（JSON格式）。
  - `summary` (Text): 用于存储 AI 生成的热点概述。
- **迁移**: 已执行数据库迁移脚本，更新了 `hotspots.db`。

### 2️⃣ 后端 API 更新
- **模型**: 更新了 `HotspotModel` Pydantic 模型，API 现在会返回新字段。

### 3️⃣ 前端界面更新
- **新增列**:
  - **Content**: 显示 "View Details" 按钮。
  - **Summary**: 显示摘要文本（如果为空显示 "Generating..."）。
- **详情模态框**:
  - 点击 "View Details" 弹出模态框。
  - 显示完整内容、摘要和媒体文件路径。

## 🚧 待实现的功能 (Next Steps)

目前的修改搭建了**存储**和**展示**的基础。要完全实现用户需求，还需要进行以下后端开发：

### 1. 详情页爬虫 (Deep Crawling)
- **挑战**: 每个平台（微博、百度、抖音、头条）的详情页结构不同，且有反爬措施。
- **任务**:
  - 针对每个平台编写解析逻辑。
  - 使用 `requests` 或 `Playwright` 获取正文。
  - 下载图片和视频到本地 `media/` 目录。

### 2. AI 摘要生成
- **任务**:
  - 集成 LLM API (如 OpenAI, Gemini, Claude)。
  - 将抓取到的 `content` 发送给 AI 生成简短摘要。
  - 将摘要保存到数据库 `summary` 字段。

## 📖 使用说明

现在刷新页面，您会看到表格中多了 "Content" 和 "Summary" 两列。
- 点击 **View Details** 可以看到详情弹窗。
- 目前由于爬虫尚未升级，内容会显示 "Content not fetched yet."，摘要会显示 "No summary available."。
