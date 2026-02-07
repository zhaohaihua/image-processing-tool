# Git远程仓库配置脚本

param(
    [string]$Platform = "github",
    [string]$Username = "",
    [string]$RepoName = "image-processing-tool"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Git远程仓库配置工具" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查Git是否安装
Write-Host "检查Git安装状态..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✓ Git已安装: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git未安装" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先安装Git：" -ForegroundColor Yellow
    Write-Host "  1. 访问 https://git-scm.com/download/win" -ForegroundColor White
    Write-Host "  2. 下载并安装Git" -ForegroundColor White
    Write-Host "  3. 重新运行此脚本" -ForegroundColor White
    exit 1
}

Write-Host ""

# 配置用户信息
Write-Host "配置Git用户信息..." -ForegroundColor Yellow
if (-not $Username) {
    $Username = Read-Host "请输入您的用户名"
}
$email = Read-Host "请输入您的邮箱"

git config --global user.name $Username
git config --global user.email $email
Write-Host "✓ 用户信息已配置" -ForegroundColor Green
Write-Host ""

# 初始化仓库
Write-Host "初始化Git仓库..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "✓ 仓库已存在" -ForegroundColor Green
} else {
    git init
    Write-Host "✓ 仓库已初始化" -ForegroundColor Green
}
Write-Host ""

# 添加文件
Write-Host "添加文件到暂存区..." -ForegroundColor Yellow
git add .
Write-Host "✓ 文件已添加" -ForegroundColor Green
Write-Host ""

# 创建提交
Write-Host "创建初始提交..." -ForegroundColor Yellow
git commit -m "初始提交：图片处理工具"
Write-Host "✓ 提交已创建" -ForegroundColor Green
Write-Host ""

# 构建远程仓库URL
$remoteUrl = ""
switch ($Platform.ToLower()) {
    "github" {
        $remoteUrl = "https://github.com/$Username/$RepoName.git"
    }
    "gitee" {
        $remoteUrl = "https://gitee.com/$Username/$RepoName.git"
    }
    "gitlab" {
        $remoteUrl = "https://gitlab.com/$Username/$RepoName.git"
    }
    default {
        Write-Host "✗ 不支持的平台: $Platform" -ForegroundColor Red
        Write-Host "支持的平台: github, gitee, gitlab" -ForegroundColor Yellow
        exit 1
    }
}

# 关联远程仓库
Write-Host "关联远程仓库..." -ForegroundColor Yellow
Write-Host "  平台: $Platform" -ForegroundColor White
Write-Host "  仓库: $RepoName" -ForegroundColor White
Write-Host "  URL: $remoteUrl" -ForegroundColor White

$remotes = git remote
if ($remotes -match "origin") {
    git remote set-url origin $remoteUrl
    Write-Host "✓ 远程仓库已更新" -ForegroundColor Green
} else {
    git remote add origin $remoteUrl
    Write-Host "✓ 远程仓库已添加" -ForegroundColor Green
}
Write-Host ""

# 重命名分支为main
Write-Host "配置分支..." -ForegroundColor Yellow
git branch -M main
Write-Host "✓ 分支已设置为main" -ForegroundColor Green
Write-Host ""

# 推送到远程仓库
Write-Host "推送到远程仓库..." -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  下一步操作" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 访问以下链接创建远程仓库：" -ForegroundColor Yellow
Write-Host ""

switch ($Platform.ToLower()) {
    "github" {
        Write-Host "   https://github.com/new" -ForegroundColor Cyan
    }
    "gitee" {
        Write-Host "   https://gitee.com/projects/new" -ForegroundColor Cyan
    }
    "gitlab" {
        Write-Host "   https://gitlab.com/projects/new" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "2. 创建名为 '$RepoName' 的仓库" -ForegroundColor Yellow
Write-Host "3. 运行以下命令推送代码：" -ForegroundColor Yellow
Write-Host ""
Write-Host "   git push -u origin main" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ 配置完成！" -ForegroundColor Green
Write-Host ""