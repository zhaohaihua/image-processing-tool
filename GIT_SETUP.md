# Git远程仓库配置指南

## 前置条件

### 1. 安装Git

#### Windows系统

**方法一：使用winget安装**
```powershell
winget install --id Git.Git -e --source winget
```

**方法二：使用Chocolatey安装**
```powershell
choco install git
```

**方法三：手动下载安装**
1. 访问 https://git-scm.com/download/win
2. 下载Windows版本安装包
3. 运行安装程序，使用默认设置

#### 验证安装
```bash
git --version
```

### 2. 配置Git用户信息

```bash
git config --global user.name "您的用户名"
git config --global user.email "您的邮箱"
```

## 配置远程仓库

### 步骤1：初始化本地仓库

```bash
cd d:\workshop\sy
git init
```

### 步骤2：创建.gitignore文件

```bash
# 创建.gitignore文件
echo .vscode/ > .gitignore
echo .trae/ >> .gitignore
```

### 步骤3：添加文件到暂存区

```bash
git add .
```

### 步骤4：创建初始提交

```bash
git commit -m "初始提交：图片处理工具"
```

### 步骤5：创建远程仓库

#### GitHub

1. 访问 https://github.com/new
2. 创建新仓库（命名为 `image-processing-tool`）
3. **不要**初始化README、.gitignore或license
4. 创建后复制仓库URL

#### Gitee（码云）

1. 访问 https://gitee.com/projects/new
2. 创建新仓库
3. 复制仓库URL

#### GitLab

1. 访问 https://gitlab.com/projects/new
2. 创建新项目
3. 复制项目URL

### 步骤6：关联远程仓库

```bash
# GitHub
git remote add origin https://github.com/用户名/image-processing-tool.git

# Gitee
git remote add origin https://gitee.com/用户名/image-processing-tool.git

# GitLab
git remote add origin https://gitlab.com/用户名/image-processing-tool.git
```

### 步骤7：推送到远程仓库

```bash
# 首次推送（设置上游分支）
git push -u origin master

# 或者使用main分支
git push -u origin main
```

## 常用Git命令

### 查看状态
```bash
git status
```

### 查看提交历史
```bash
git log --oneline
```

### 查看远程仓库
```bash
git remote -v
```

### 拉取最新代码
```bash
git pull origin master
```

### 推送更改
```bash
git add .
git commit -m "提交信息"
git push
```

## SSH密钥配置（可选）

### 生成SSH密钥
```bash
ssh-keygen -t ed25519 -C "您的邮箱"
```

### 查看公钥
```bash
cat ~/.ssh/id_ed25519.pub
```

### 添加到GitHub/Gitee

1. 复制公钥内容
2. 访问设置 → SSH and GPG keys
3. 添加新的SSH密钥

### 使用SSH URL
```bash
git remote set-url origin git@github.com:用户名/image-processing-tool.git
```

## 分支管理

### 创建新分支
```bash
git checkout -b feature/新功能
```

### 切换分支
```bash
git checkout master
```

### 合并分支
```bash
git merge feature/新功能
```

## .gitignore模板

```gitignore
# IDE
.vscode/
.idea/
*.swp
*.swo

# 操作系统
.DS_Store
Thumbs.db

# 日志
*.log
npm-debug.log*

# 临时文件
*.tmp
*.temp

# 项目特定
.trae/
```

## 故障排除

### 推送失败：认证错误
- 检查用户名和密码是否正确
- 使用个人访问令牌代替密码（GitHub）
- 考虑使用SSH密钥

### 推送失败：分支不匹配
```bash
# 重命名分支
git branch -M master

# 或切换到main
git checkout -b main
```

### 连接超时
- 检查网络连接
- 尝试使用SSH代替HTTPS
- 检查防火墙设置

## 自动化脚本

### Windows PowerShell脚本

```powershell
# setup-git.ps1
$repoName = "image-processing-tool"
$username = Read-Host "输入GitHub用户名"

git init
git add .
git commit -m "初始提交"
git remote add origin "https://github.com/$username/$repoName.git"
git branch -M main
git push -u origin main
```

使用方法：
```powershell
powershell -ExecutionPolicy Bypass -File setup-git.ps1
```

## 部署到GitHub Pages

1. 推送代码到GitHub
2. 访问仓库设置
3. 找到 "Pages" 设置
4. 选择 "main" 分支和 "root" 目录
5. 保存设置
6. 等待几分钟，访问 https://用户名.github.io/image-processing-tool