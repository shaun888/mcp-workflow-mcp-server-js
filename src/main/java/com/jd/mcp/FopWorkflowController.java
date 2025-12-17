package com.jd.mcp;

import org.noear.solon.ai.annotation.ToolMapping;
import org.noear.solon.ai.mcp.McpChannel;
import org.noear.solon.ai.mcp.server.annotation.McpServerEndpoint;
import org.noear.solon.annotation.Controller;
import org.noear.solon.annotation.Param;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Pattern;

/**
 * FOP工作流MCP服务器
 * 专注于提供完整的FOP开发规范和指导，支持AI模型进行高质量的需求分析、代码生成和流程图生成
 *
 * @author FOP Team
 * @version 2.0.0
 */
@Controller
@McpServerEndpoint(channel = McpChannel.STREAMABLE, mcpEndpoint = "/mcp/fop-workflow")
public class FopWorkflowController {

    private static final String CONFIG_PATH = ".joycode/fop-agent-config.json";
    private static final String RULES_PATH = ".joycode/rules/";
    private static final ObjectMapper objectMapper = new ObjectMapper();

    @ToolMapping(description = "【🎯主入口】获取FOP完整工作流规范指导 - 包含所有规范的综合指南，优先推荐使用")
    public String getFopWorkflowGuide(
            @Param(description = "工作流类型：留空获取完整指导和导航菜单，可选值：prd_analysis|code_generation|flowchart_generation|intelligent_retrieval|workflow_config", required = false)
            String workflowType) {

        try {
            JsonNode config = loadWorkflowConfig();
            
            Map<String, Object> guide = new HashMap<>();
            guide.put("guide_name", "FOP工作流规范指导");
            guide.put("version", "3.0.0");
            guide.put("description", "提供完整的FOP开发工作流规范，供AI模型参考生成");
            guide.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            
            // 根据workflowType参数返回相应内容
            if (workflowType == null || workflowType.isEmpty()) {
                // 返回完整指导和导航菜单
                guide.put("workflow_config", config);
                guide.put("usage_instruction", "这是FOP工作流的主入口，请按照以下顺序使用各个规范");
                
                // 添加导航指引
                Map<String, Object> navigation = new HashMap<>();
                navigation.put("recommended_order", Arrays.asList(
                    "1. 首先阅读完整工作流配置（当前返回内容）",
                    "2. 如需PRD分析规范，使用参数 workflowType=prd_analysis",
                    "3. 如需代码生成规范，使用参数 workflowType=code_generation",
                    "4. 如需流程图生成规范，使用参数 workflowType=flowchart_generation",
                    "5. 如需智能检索策略，使用参数 workflowType=intelligent_retrieval"
                ));
                
                Map<String, String> availableTools = new HashMap<>();
                availableTools.put("getPrdAnalysisRules", "【细分工具】获取PRD分析规范");
                availableTools.put("getCodeGenerationRules", "【细分工具】获取代码生成规范");
                availableTools.put("getFlowchartGenerationRules", "【细分工具】获取流程图生成规范");
                availableTools.put("getIntelligentRetrievalStrategy", "【细分工具】获取智能检索优化策略");
                availableTools.put("getWorkflowConfig", "【细分工具】获取工作流配置信息");
                availableTools.put("getCodeAnalysisGuidance", "【细分工具】获取代码分析指导规范");
                
                navigation.put("available_detailed_tools", availableTools);
                navigation.put("note", "建议优先使用本主入口工具，通过参数获取具体规范，而非直接调用细分工具");
                
                guide.put("navigation_guide", navigation);
                
            } else {
                // 根据参数返回具体规范内容
                switch (workflowType.toLowerCase()) {
                    case "prd_analysis":
                        return getPrdAnalysisRules();
                    case "code_generation":
                        return getCodeGenerationRules();
                    case "flowchart_generation":
                        return getFlowchartGenerationRules();
                    case "intelligent_retrieval":
                        return getIntelligentRetrievalStrategy();
                    case "workflow_config":
                        return getWorkflowConfig();
                    default:
                        guide.put("error", "不支持的工作流类型: " + workflowType);
                        guide.put("supported_types", Arrays.asList("prd_analysis", "code_generation", "flowchart_generation", "intelligent_retrieval", "workflow_config"));
                }
            }

            return objectMapper.writeValueAsString(guide);

        } catch (Exception e) {
            return createErrorResponse("获取工作流规范失败", e.getMessage(), e);
        }
    }

    @ToolMapping(description = "【细分工具】获取PRD分析规范 - 建议优先使用getFopWorkflowGuide主入口")
    public String getPrdAnalysisRules() {
        try {
            // 从磁盘加载PRD分析规则
            List<String> lines = Files.readAllLines(Paths.get(RULES_PATH + "prd-analysis-rules.json"), StandardCharsets.UTF_8);
            String rulesContent = String.join("\n", lines);
            JsonNode rules = objectMapper.readTree(rulesContent);

            Map<String, Object> result = new HashMap<>();
            result.put("rule_type", "PRD分析规范");
            result.put("version", rules.get("version").asText());
            result.put("description", rules.get("description").asText());
            result.put("rules_content", rules);
            result.put("usage_instruction", "请使用此规范指导AI模型分析PRD文档，生成符合FOP标准的需求分析报告");

            return objectMapper.writeValueAsString(result);
        } catch (Exception e) {
            return "获取PRD分析规则失败: " + e.getMessage();
        }
    }

    @ToolMapping(description = "【细分工具】获取代码生成规范 - 建议优先使用getFopWorkflowGuide主入口")
    public String getCodeGenerationRules() {
        try {
            // 从磁盘加载代码生成规则
            List<String> lines = Files.readAllLines(Paths.get(RULES_PATH + "code-generation-rules.json"), StandardCharsets.UTF_8);
            String rulesContent = String.join("\n", lines);
            JsonNode rules = objectMapper.readTree(rulesContent);

            Map<String, Object> result = new HashMap<>();
            result.put("rule_type", "代码生成规范");
            result.put("version", rules.get("version").asText());
            result.put("description", rules.get("description").asText());
            result.put("rules_content", rules);
            result.put("usage_instruction", "请使用此规范指导AI模型生成符合FOP标准的Java代码");

            return objectMapper.writeValueAsString(result);
        } catch (Exception e) {
            return "获取代码生成规则失败: " + e.getMessage();
        }
    }

    @ToolMapping(description = "【细分工具】获取流程图生成规范 - 建议优先使用getFopWorkflowGuide主入口")
    public String getFlowchartGenerationRules() {
        try {
            // 从磁盘加载流程图生成规则
            List<String> lines = Files.readAllLines(Paths.get(RULES_PATH + "flowchart-generation-rules.json"), StandardCharsets.UTF_8);
            String rulesContent = String.join("\n", lines);
            JsonNode rules = objectMapper.readTree(rulesContent);

            Map<String, Object> result = new HashMap<>();
            result.put("rule_type", "流程图生成规范");
            result.put("version", rules.get("version").asText());
            result.put("description", rules.get("description").asText());
            result.put("rules_content", rules);
            result.put("usage_instruction", "请使用此规范指导AI模型生成Mermaid流程图");

            return objectMapper.writeValueAsString(result);
        } catch (Exception e) {
            return "获取流程图生成规则失败: " + e.getMessage();
        }
    }

    @ToolMapping(description = "【细分工具】获取工作流配置信息 - 建议优先使用getFopWorkflowGuide主入口")
    public String getWorkflowConfig() {
        try {
            JsonNode config = loadWorkflowConfig();
            Map<String, Object> summary = new HashMap<>();

            summary.put("agentName", config.get("agentName").asText());
            summary.put("version", config.get("version").asText());
            summary.put("description", config.get("description").asText());

            // 工作流阶段信息
            JsonNode workflowConfig = config.get("workflowConfig");
            Map<String, String> stages = new HashMap<>();
            stages.put("stage1", workflowConfig.get("stage1_prd_analysis").get("name").asText());
            stages.put("stage2", workflowConfig.get("stage2_code_generation").get("name").asText());
            stages.put("stage3", workflowConfig.get("stage3_flowchart_generation").get("name").asText());
            summary.put("stages", stages);

            return objectMapper.writeValueAsString(summary);
        } catch (Exception e) {
            return "获取配置失败: " + e.getMessage();
        }
    }

    @ToolMapping(description = "【细分工具】获取智能检索优化策略 - 建议优先使用getFopWorkflowGuide主入口")
    public String getIntelligentRetrievalStrategy() {
        try {
            // 从磁盘加载智能检索规则
            List<String> lines = Files.readAllLines(Paths.get(RULES_PATH + "code-generation-rules.json"), StandardCharsets.UTF_8);
            String rulesContent = String.join("\n", lines);
            JsonNode rules = objectMapper.readTree(rulesContent);

            JsonNode intelligentStrategy = rules.get("intelligentRetrievalStrategy");

            Map<String, Object> result = new HashMap<>();
            result.put("strategy_name", "智能检索优化策略");
            result.put("version", "3.0.0");
            result.put("enabled", intelligentStrategy.get("enabled").asBoolean());
            result.put("description", intelligentStrategy.get("description").asText());
            result.put("strategy_details", intelligentStrategy);
            result.put("usage_instruction", "请使用此策略指导AI模型进行高效的代码分析和检索");

            return objectMapper.writeValueAsString(result);

        } catch (Exception e) {
            return "获取智能检索策略失败: " + e.getMessage();
        }
    }

    @ToolMapping(description = "【细分工具】获取代码分析指导规范 - 建议优先使用getFopWorkflowGuide主入口")
    public String getCodeAnalysisGuidance(
            @Param(description = "分析类型", required = false) String analysisType) {

        try {
            Map<String, Object> guidance = new HashMap<>();
            guidance.put("guidance_name", "代码分析指导规范");
            guidance.put("version", "2.0.0");
            guidance.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            guidance.put("usage_instruction", "请使用此指导进行系统化的代码分析");

            return objectMapper.writeValueAsString(guidance);

        } catch (Exception e) {
            return createErrorResponse("获取代码分析指导失败", e.getMessage(), e);
        }
    }

    /**
     * 加载工作流配置
     */
    private JsonNode loadWorkflowConfig() throws IOException {
        List<String> lines = Files.readAllLines(Paths.get(CONFIG_PATH), StandardCharsets.UTF_8);
        String configContent = String.join("\n", lines);
        return objectMapper.readTree(configContent);
    }

    /**
     * 创建错误响应
     */
    private String createErrorResponse(String title, String message, Exception exception) {
        try {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", true);
            errorResponse.put("title", title);
            errorResponse.put("message", message);
            errorResponse.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            
            if (exception != null) {
                errorResponse.put("exception_type", exception.getClass().getSimpleName());
            }
            
            return objectMapper.writeValueAsString(errorResponse);
        } catch (Exception e) {
            return "{\"error\": true, \"message\": \"" + message + "\"}";
        }
    }
}
