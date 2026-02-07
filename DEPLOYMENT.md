# 图片处理工具 - 部署说明

## 项目概述

这是一个基于纯前端技术的图片处理工具，支持图片对齐、缩放、旋转、辅助线等功能。

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- 无后端依赖

## 本地运行

### 方法一：Python HTTP 服务器

```bash
cd d:\workshop\sy
python -m http.server 8000
```

访问：http://localhost:8000

### 方法二：Node.js HTTP 服务器

```bash
cd d:\workshop\sy
npx http-server -p 8000
```

访问：http://localhost:8000

### 方法三：VS Code Live Server

1. 安装 Live Server 扩展
2. 右键点击 index.html
3. 选择 "Open with Live Server"

## 生产环境部署方案

### 方案一：静态网站托管平台

#### 1. GitHub Pages

1. 创建 GitHub 仓库
2. 推送项目文件
3. 在仓库设置中启用 GitHub Pages
4. 选择主分支作为源

#### 2. Netlify

1. 访问 https://www.netlify.com
2. 拖拽项目文件夹到部署区域
3. 自动部署完成

#### 3. Vercel

1. 访问 https://vercel.com
2. 导入项目或拖拽部署
3. 自动配置并部署

### 方案二：传统 Web 服务器

#### Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /path/to/d/workshop/sy;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Apache 配置

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    DocumentRoot /path/to/d/workshop/sy
    
    <Directory /path/to/d/workshop/sy>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### 方案三：云服务器部署

#### 阿里云/腾讯云/AWS

1. 购买云服务器
2. 安装 Nginx 或 Apache
3. 上传项目文件到服务器
4. 配置 Web 服务器
5. 绑定域名

## 部署注意事项

1. **文件路径**：确保所有文件（index.html, style.css, script.js）在同一目录下
2. **浏览器兼容性**：建议使用现代浏览器（Chrome, Firefox, Safari, Edge）
3. **HTTPS**：生产环境建议使用 HTTPS
4. **CDN**：可以考虑使用 CDN 加速静态资源
5. **压缩**：生产环境可以压缩 CSS 和 JS 文件

## 功能特性

- 图片上传和预览
- 图片对齐和调整
- 缩放和旋转控制
- 辅助线功能
- 分辨率自定义
- 图片导出功能

## 浏览器要求

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 技术支持

如有问题，请检查：
1. 浏览器控制台是否有错误
2. 文件路径是否正确
3. 浏览器版本是否符合要求