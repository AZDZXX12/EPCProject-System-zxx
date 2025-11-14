# 多阶段构建 - 前端构建阶段
FROM node:18-alpine AS frontend-builder

# 设置工作目录
WORKDIR /app/client

# 复制前端依赖文件
COPY client/package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制前端源码
COPY client/ ./

# 构建前端应用
RUN npm run build

# Python后端阶段
FROM python:3.11-slim AS backend

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 复制后端依赖文件
COPY server/requirements.txt ./

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制后端源码
COPY server/ ./

# 从前端构建阶段复制构建产物
COPY --from=frontend-builder /app/client/build ./static

# 创建非root用户
RUN adduser --disabled-password --gecos '' appuser && \
    chown -R appuser:appuser /app
USER appuser

# 暴露端口
EXPOSE 8000

# 健康检查
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# 启动命令
CMD ["uvicorn", "sqlite-server:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
