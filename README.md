# 🔥 热点抓取系统 (Hotspot Crawler)

一个功能完整的热点新闻抓取与可视化系统，支持多平台实时热搜数据抓取。

## ✨ 功能特性

### 📡 数据源（真实数据抓取 - 仅抓取各平台热度前三）
- ✅ **微博热搜** - 实时抓取微博热搜榜 TOP 3
- ✅ **知乎热榜** - 知乎热门话题 TOP 3（需要认证）
- ✅ **百度热搜** - 百度实时热点 TOP 3
- ✅ **抖音热搜** - 抖音热门话题 TOP 3
- ✅ **今日头条** - 头条热榜 TOP 3

### 🎨 可视化界面
- 📊 热点列表展示（支持按来源筛选）
- 📈 数据统计图表（ECharts）
- 🔄 手动触发抓取
- ⏰ 自动定时抓取（每30分钟）
- 🎯 排名、标题、热度值、来源、时间展示

### 🛠️ 技术栈
- **后端**: Python 3.12 + FastAPI + SQLAlchemy + APScheduler
- **前端**: React 18 + Vite + Ant Design + ECharts
- **数据库**: SQLite
- **爬虫**: Requests + BeautifulSoup4

## 🚀 快速开始

### 方式一：使用启动脚本（推荐）
```bash
cd /home/test/hotspot_crawler
./start.sh
```

### 方式二：手动启动

#### 启动后端
```bash
cd backend
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --port 8000
```

#### 启动前端
```bash
cd frontend
npm run dev -- --host
```

## 🌐 访问地址

- **前端界面**: http://localhost:5173
- **API 文档**: http://localhost:8000/docs
- **API 端点**:
  - `GET /hotspots` - 获取热点列表
  - `GET /hotspots?source=微博热搜` - 按来源筛选
  - `POST /crawl` - 手动触发抓取
  - `GET /sources` - 获取所有数据源

## 📊 真实数据示例（仅抓取各平台热度前三）

### 微博热搜 TOP 3
1. 中国暂停租借大熊猫给日本引关注 (热度: 1147305)
2. 中国将寻找第二颗地球 (热度: 306591)
3. 我国启动聚变领域国际科学计划 (热度: 299042)

### 百度热搜 TOP 3
1. 中方回应日本部署进攻性武器 (热度: 7808718)
2. 中国将寻找第二颗地球 (热度: 7711900)
3. 我国启动聚变领域国际科学计划 (热度: 7617771)

### 抖音热搜 TOP 3
1. 高市早苗称愿意对话 中方回应 (热度: 11919084)
2. 杨瀚森NBA生涯首个三分 (热度: 11544643)
3. 我国启动聚变领域国际科学计划 (热度: 11263340)

### 今日头条 TOP 3
1. 日本机场挤满了回国的人 (热度: 21150078)
2. 中国将寻找第二颗地球 (热度: 19137382)
3. 一批"十四五"重大工程项目稳步推进 (热度: 17316219)

## 📁 项目结构

```
hotspot_crawler/
├── backend/
│   ├── main.py              # FastAPI 主应用
│   ├── crawler.py           # 爬虫逻辑（真实数据抓取）
│   ├── database.py          # 数据库模型
│   ├── requirements.txt     # Python 依赖
│   ├── hotspots.db         # SQLite 数据库
│   └── venv/               # Python 虚拟环境
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # React 主组件
│   │   ├── main.jsx        # 入口文件
│   │   └── index.css       # 样式文件
│   ├── package.json        # Node 依赖
│   └── vite.config.js      # Vite 配置
├── start.sh                # 一键启动脚本
└── README.md               # 项目文档
```

## 🔧 配置说明

### 修改抓取频率
编辑 `backend/main.py`，找到：
```python
scheduler.add_job(run_crawler_task, 'interval', minutes=30)
```
修改 `minutes` 参数即可。

### 添加新的数据源
在 `backend/crawler.py` 中添加新的 `fetch_xxx_hot()` 函数，然后在 `run_crawler_task()` 的 `crawlers` 列表中注册。

## ⚠️ 注意事项

1. **合规使用**: 仅用于学习和研究，请遵守各平台的服务条款
2. **访问频率**: 已设置合理的请求间隔，避免对目标网站造成压力
3. **反爬策略**: 部分平台（如知乎）可能需要登录认证，当前使用公开API
4. **数据准确性**: 热度值和排名以各平台实时数据为准

## 🐛 故障排查

### 知乎抓取失败（401错误）
知乎API需要认证，可以：
- 添加Cookie认证
- 使用Playwright模拟浏览器
- 暂时跳过该数据源

### 前端无法连接后端
确保后端服务运行在 8000 端口，检查防火墙设置。

### 数据库锁定
如果遇到数据库锁定，重启后端服务即可。

## 📝 更新日志

### v1.1.0 (2025-11-24)
- ✅ 优化为仅抓取各平台热度前三的数据
- ✅ 减少数据冗余，提高抓取效率

### v1.0.0 (2025-11-24)
- ✅ 实现真实数据抓取（微博、百度、抖音、今日头条）
- ✅ 完整的前后端分离架构
- ✅ 可视化Dashboard
- ✅ 自动定时抓取
- ✅ 多数据源支持

## 📄 许可证

MIT License - 仅供学习和研究使用

## 🙏 致谢

感谢各大平台提供的公开API接口。
