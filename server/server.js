const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;
const STORIES_FILE = path.join(__dirname, 'stories.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// 确保必要的目录存在
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

if (!fs.existsSync(STORIES_FILE)) {
    fs.writeFileSync(STORIES_FILE, '[]', 'utf-8');
}

// 配置multer用于文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// 中间件
app.use(bodyParser.json());
app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(UPLOADS_DIR));

// 辅助函数：读取故事数据
function readStories() {
    const data = fs.readFileSync(STORIES_FILE, 'utf-8');
    return JSON.parse(data);
}

// 辅助函数：保存故事数据
function saveStories(stories) {
    fs.writeFileSync(STORIES_FILE, JSON.stringify(stories, null, 2), 'utf-8');
}

// 获取故事列表API
app.get('/api/stories', (req, res) => {
    try {
        const { page = 1, limit = 5, generation, search } = req.query;
        const stories = readStories();
        
        // 过滤
        let filtered = [...stories];
        if (generation) {
            filtered = filtered.filter(s => s.generation === generation);
        }
        if (search) {
            const keyword = search.toLowerCase();
            filtered = filtered.filter(s => 
                (s.title && s.title.toLowerCase().includes(keyword)) || 
                (s.content && s.content.toLowerCase().includes(keyword))
            );
        }
        
        // 分页
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginated = filtered.slice(startIndex, endIndex);
        
        res.json({
            total: filtered.length,
            page: parseInt(page),
            totalPages: Math.ceil(filtered.length / limit),
            data: paginated
        });
    } catch (error) {
        console.error('获取故事列表失败:', error);
        res.status(500).json({ error: '获取故事列表失败' });
    }
});

// 提交故事API
app.post('/api/stories', upload.single('photo'), (req, res) => {
    try {
        const { name, generation, title, content, contact } = req.body;
        
        if (!name || !title || !content) {
            return res.status(400).json({ error: '姓名、标题和内容为必填项' });
        }
        
        const stories = readStories();
        const newStory = {
            id: Date.now().toString(),
            name,
            generation,
            title,
            content,
            contact,
            date: new Date().toISOString(),
            imageUrl: req.file ? `/uploads/${req.file.filename}` : ''
        };
        
        stories.unshift(newStory);
        saveStories(stories);
        
        res.status(201).json(newStory);
    } catch (error) {
        console.error('提交故事失败:', error);
        res.status(500).json({ error: '提交故事失败' });
    }
});

// 获取单个故事详情API
app.get('/api/stories/:id', (req, res) => {
    try {
        const stories = readStories();
        const story = stories.find(s => s.id === req.params.id);
        
        if (story) {
            res.json(story);
        } else {
            res.status(404).json({ error: '故事未找到' });
        }
    } catch (error) {
        console.error('获取故事详情失败:', error);
        res.status(500).json({ error: '获取故事详情失败' });
    }
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ error: '服务器内部错误' });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`服务器已启动，访问地址: http://localhost:${PORT}`);
    console.log(`静态文件服务: http://localhost:${PORT}/public/stories.html`);
});