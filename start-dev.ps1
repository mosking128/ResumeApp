# ResumeApp 开发服务启动脚本
# 用法: 在项目根目录执行  .\start-dev.ps1
# 或双击 start-dev.bat

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

Write-Host '========================================' -ForegroundColor Cyan
Write-Host '  ResumeApp - 启动开发服务器' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ''

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host '[错误] 未找到 Node.js，请先安装 Node 18+ 并加入 PATH。' -ForegroundColor Red
    Write-Host '下载: https://nodejs.org/' -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path 'node_modules')) {
    Write-Host '[1/3] 首次运行：正在安装依赖 npm install ...' -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host '[错误] npm install 失败' -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host '[1/3] 依赖已存在，跳过安装' -ForegroundColor Green
}

Write-Host '[2/3] 启动 Vite ...' -ForegroundColor Yellow
Write-Host '[3/3] 浏览器将在几秒后打开 http://localhost:5173/' -ForegroundColor Yellow
Write-Host ''
Write-Host '关闭本窗口即可停止服务。' -ForegroundColor DarkGray
Write-Host ''

Start-Process 'http://localhost:5173/'

npm run dev
