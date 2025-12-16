# 多阶段构建 - 构建阶段
FROM maven:3.8.6-openjdk-8-slim AS builder

# 设置工作目录
WORKDIR /app

# 复制pom.xml和源代码
COPY pom.xml .
COPY src ./src
COPY .joycode ./.joycode

# 下载依赖并构建应用
RUN mvn clean package -DskipTests -q

# 运行阶段 - 使用更小的JRE镜像
FROM openjdk:8-jre-alpine

# 设置维护者信息
LABEL maintainer="FOP Team <fop-team@jd.com>"
LABEL description="FOP工作流MCP服务器 - 提供完整的FOP开发规范和指导"
LABEL version="1.0.0"

# 安装必要的包
RUN apk add --no-cache \
    curl \
    tzdata \
    && rm -rf /var/cache/apk/*

# 设置时区
ENV TZ=Asia/Shanghai
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# 创建应用用户
RUN addgroup -g 1000 app && \
    adduser -u 1000 -G app -s /bin/sh -D app

# 设置工作目录
WORKDIR /app

# 从构建阶段复制JAR文件
COPY --from=builder /app/target/mcp-api-1.0.jar ./app.jar
COPY --from=builder /app/.joycode ./.joycode

# 创建日志目录
RUN mkdir -p /app/logs && \
    chown -R app:app /app

# 切换到应用用户
USER app

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/actuator/health || exit 1

# 设置JVM参数
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -XX:G1HeapRegionSize=16m -XX:+UseStringDeduplication"

# 启动应用
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]