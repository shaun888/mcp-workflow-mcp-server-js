# JoyCode MCP服务器 发布SOP

## 发布流程

1. 修改代码
2. 更新版本号
3. 本地测试
4. 发布到npm
5. 验证安装

## 版本号规则

- 主版本：大改动
- 次版本：新功能  
- 修订版：修bug

## 发布命令

```bash
# 1. 更新版本号
npm version patch   # 修bug
npm version minor   # 新功能
npm version major   # 大改动

# 2. 发布
npm publish --registry=http://registry.m.jd.com

# 3. 验证
npm info @jd/fop-workflow-mcp-server --registry=http://registry.m.jd.com
```

## 回滚

```bash
# 如果发布失败，回退版本号
npm version patch --allow-same-version
git push origin master