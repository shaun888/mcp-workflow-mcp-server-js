# @ToolMapping 和 @McpServerEndpoint 注解详解

## @McpServerEndpoint 注解

**作用**：将一个Controller类标记为MCP服务器端点，使其能够通过MCP协议对外提供服务。

**关键参数**：
- `channel = McpChannel.STREAMABLE`：指定通信通道类型为可流式传输
- `mcpEndpoint = "/mcp/case1"`：定义MCP服务的访问端点路径

**功能**：
- 启用MCP协议支持
- 将普通的Controller转换为MCP服务器
- 支持与MCP客户端的双向通信
- 提供标准化的MCP服务接口

## @ToolMapping 注解

**作用**：将Controller中的方法标记为可供MCP客户端调用的工具方法。

**关键参数**：
- `description`：工具方法的功能描述，帮助客户端理解该工具的用途

**功能**：
- 将Java方法暴露为MCP工具
- 提供方法的元数据信息
- 支持参数自动映射和类型转换
- 生成工具的使用文档

## 示例代码分析

```java
@Controller
@McpServerEndpoint(channel = McpChannel.STREAMABLE, mcpEndpoint = "/mcp/case1")
public class DemoController {
    @ToolMapping(description = "查询天气预报")
    public String getWeather(@Param(description = "城市位置") String location) {
        return "晴，14度";
    }
}
```

**工作原理**：
1. `@McpServerEndpoint` 将整个类注册为MCP服务端点
2. `@ToolMapping` 将 `getWeather` 方法暴露为可调用的工具
3. `@Param` 为参数提供描述信息，增强工具的可用性
4. 客户端可以通过MCP协议调用这个天气查询工具

## 使用场景

**适用于**：
- 创建可复用的业务工具服务
- 构建微服务间的标准化通信接口
- 提供AI Agent可调用的功能模块
- 实现跨系统的工具集成

**优势**：
- 标准化的MCP协议支持
- 自动化的参数处理和类型转换
- 内置的错误处理和异常管理
- 完善的工具发现和文档生成机制