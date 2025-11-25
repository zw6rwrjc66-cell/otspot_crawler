# 📸 网页截图与智能内容提取功能

## ✅ 已完成的功能

### 1️⃣ Playwright 集成
- **安装**: 已安装 Playwright 和 Chromium 浏览器
- **用途**: 模拟真实浏览器访问动态网页，解决 JavaScript 渲染问题

### 2️⃣ 自动截图功能
- **全页截图**: 自动捕获完整网页截图
- **存储位置**: `backend/static/screenshots/`
- **文件命名**: `screenshot_{timestamp}.png`
- **访问方式**: 通过 `/static/screenshots/` 路径访问

### 3️⃣ 增强的内容提取
- **动态内容**: 等待页面完全加载（包括 AJAX 请求）
- **文本提取**: 提取页面主体文本内容
- **内容清理**: 自动去除多余空白，限制长度（5000字符）

### 4️⃣ 前端展示
- **截图显示**: 在详情弹窗中展示网页截图
- **响应式布局**: 截图自适应容器宽度
- **高度限制**: 最大高度 600px，保持比例

## 📖 使用方法

### 基本操作流程

1. **打开热点列表**
   - 访问 http://localhost:5173
   - 查看热点数据

2. **查看详情**
   - 点击任意热点的 "View Details" 按钮
   - 弹出详情窗口

3. **获取截图和内容**
   - 点击 "Fetch Details & Summary" 按钮
   - 系统将：
     - 启动无头浏览器
     - 访问热点链接
     - 等待页面加载完成
     - 截取全页面截图
     - 提取文本内容
     - 生成摘要

4. **查看结果**
   - **Summary**: 显示页面标题和摘要
   - **Full Content**: 显示提取的文本内容
   - **📸 Page Screenshot**: 显示完整网页截图

## 🔧 技术细节

### 后端实现

#### Playwright 配置
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto(url, wait_until="networkidle", timeout=30000)
    page.wait_for_timeout(2000)  # 等待动态内容
    page.screenshot(path=screenshot_path, full_page=True)
    content = page.inner_text('body')
    browser.close()
```

#### 静态文件服务
```python
from fastapi.staticfiles import StaticFiles

app.mount("/static", StaticFiles(directory="static"), name="static")
```

### 前端实现

#### 截图显示
```jsx
{currentRecord.media_paths && (
    <div>
        <h4>📸 Page Screenshot</h4>
        <img 
            src={`http://localhost:8000${currentRecord.media_paths}`} 
            alt="Page Screenshot" 
            style={{ width: '100%', maxHeight: '600px', objectFit: 'contain' }}
        />
    </div>
)}
```

## 🎯 功能特点

### 1. 解决动态网页问题
- ✅ 支持 JavaScript 渲染的页面
- ✅ 等待 AJAX 请求完成
- ✅ 捕获完整加载后的页面状态

### 2. 完整的视觉记录
- ✅ 全页面截图
- ✅ 保留原始页面布局
- ✅ 包含图片、视频等多媒体元素

### 3. 智能内容提取
- ✅ 提取可见文本内容
- ✅ 自动清理格式
- ✅ 限制长度避免过大

### 4. 高性能
- ✅ 无头模式运行（不显示浏览器窗口）
- ✅ 30秒超时保护
- ✅ 自动资源清理

## ⚠️ 注意事项

### 1. 性能考虑
- 每次截图需要 5-10 秒
- 建议不要频繁触发
- 截图文件较大（通常 500KB - 2MB）

### 2. 存储空间
- 截图会持续累积
- 建议定期清理旧截图
- 可以设置自动清理策略

### 3. 网络要求
- 需要稳定的网络连接
- 某些网站可能有反爬虫机制
- 可能需要配置代理

### 4. 浏览器依赖
- 需要系统支持 Chromium
- Linux 服务器可能需要额外依赖
- 已自动安装所需组件

## 🚀 后续优化方向

### 1. AI 摘要生成
当前使用简单的标题摘要，可以集成：
- OpenAI GPT-4
- Google Gemini
- Claude API
- 本地 LLM 模型

### 2. 图片识别
可以添加：
- OCR 文字识别
- 图片内容分析
- 关键信息提取

### 3. 视频处理
- 视频缩略图
- 视频下载
- 关键帧提取

### 4. 智能筛选
- 自动识别主要内容区域
- 过滤广告和无关内容
- 提取关键段落

## 📝 示例场景

### 场景1: 抖音热搜详情
```
1. 点击抖音热搜 "View Details"
2. 点击 "Fetch Details & Summary"
3. 系统打开无头浏览器访问抖音
4. 等待页面加载完成
5. 截取完整页面
6. 提取视频标题、描述等文本
7. 显示截图和内容
```

### 场景2: 今日头条新闻
```
1. 点击头条新闻 "View Details"
2. 获取详情
3. 截图显示完整新闻页面
4. 提取新闻正文
5. 生成新闻摘要
```

## 📊 数据流程

```
用户点击 "Fetch Details"
    ↓
前端调用 API: POST /hotspots/{id}/fetch_details
    ↓
后端启动 Playwright
    ↓
访问目标 URL
    ↓
等待页面加载 (networkidle + 2秒)
    ↓
截取全页面截图 → 保存到 static/screenshots/
    ↓
提取页面文本 → 清理格式
    ↓
生成摘要 (当前为简单标题，可接入 AI)
    ↓
更新数据库 (content, media_paths, summary)
    ↓
返回前端显示
```

## 🔍 故障排查

### 问题1: 截图失败
**可能原因**: 
- 网络超时
- 目标网站反爬虫
- Chromium 未正确安装

**解决方案**:
```bash
# 重新安装 Playwright 浏览器
cd backend
source venv/bin/activate
playwright install chromium
```

### 问题2: 图片无法显示
**可能原因**:
- 静态文件路径错误
- CORS 问题

**解决方案**:
- 检查 `media_paths` 字段格式
- 确认后端静态文件服务正常

### 问题3: 内容提取不完整
**可能原因**:
- 页面加载时间不足
- 内容在 iframe 中

**解决方案**:
- 增加 `wait_for_timeout` 时间
- 针对特定网站定制选择器

---

## 📝 更新日志

### v1.6.0 (2025-11-25)
- ✅ 集成 Playwright 浏览器自动化
- ✅ 实现全页面截图功能
- ✅ 增强动态内容提取能力
- ✅ 添加静态文件服务
- ✅ 前端显示截图预览
