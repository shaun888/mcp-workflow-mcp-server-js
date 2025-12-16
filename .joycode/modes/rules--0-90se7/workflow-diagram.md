# 柯南智能体工作流程图

## 完整四阶段工作流程

```mermaid
graph TD
    A[用户输入PRD] --> B{PRD输入方式}
    
    B -->|JoySpace链接| C1[浏览器访问JoySpace]
    B -->|直接输入文本| C2[解析输入文本]
    B -->|粘贴文档内容| C3[解析粘贴内容]
    
    C1 --> D1[检查访问权限]
    D1 -->|权限正常| E[获取PRD内容]
    D1 -->|权限不足| F[提示扫码登录]
    F --> E
    
    C2 --> E
    C3 --> E
    
    %% 第一阶段：PRD分析
    E --> G[第一阶段：PRD分析阶段]
    G --> G1[加载PRD分析规则]
    G1 --> G2[提取业务背景和目标]
    G2 --> G3[提取功能需求清单]
    G3 --> G4[提取技术架构要求]
    G4 --> G5[提取数据模型设计]
    G5 --> G6[提取接口定义]
    G6 --> G7[提取异常处理机制]
    G7 --> G8[生成PRD分析文档]
    G8 --> G9[保存到logs/prd-analysis/]
    
    %% 第二阶段：流程图生成
    G9 --> H[第二阶段：流程图生成阶段]
    H --> H1[加载流程图生成规则]
    H1 --> H2[读取PRD分析结果]
    H2 --> H3[生成业务流程图]
    H3 --> H4[生成用户操作流程图]
    H4 --> H5[生成数据流向图]
    H5 --> H6[生成系统架构图]
    H6 --> H7[生成模块依赖图]
    H7 --> H8[生成API调用链路图]
    H8 --> H9[保存流程图到logs/flowcharts/]
    
    %% 第三阶段：用户确认
    H9 --> I[第三阶段：用户确认阶段]
    I --> I1[展示PRD分析文档]
    I1 --> I2[展示生成的流程图]
    I2 --> I3[等待用户确认]
    I3 --> I4{用户是否确认?}
    
    I4 -->|不满意| I5[重新分析或修改]
    I5 --> G
    I4 -->|确认满意| J[第四阶段：开发工作阶段]
    
    %% 第四阶段：开发工作
    J --> J1[加载前三阶段分析结果]
    J1 --> J2[分析现有代码结构]
    J2 --> J3[按JoyCoderRules执行开发]
    J3 --> J4{开发任务类型}
    
    J4 -->|代码分析| K1[分析代码架构和模块]
    J4 -->|模块查看| K2[查看相关模块代码]
    J4 -->|链路梳理| K3[梳理业务和技术链路]
    J4 -->|新功能开发| K4[开发新功能模块]
    J4 -->|代码修改优化| K5[优化现有代码]
    
    K1 --> L[开发工作完成]
    K2 --> L
    K3 --> L
    K4 --> L
    K5 --> L
    
    L --> M[生成开发日志]
    M --> N[任务完成]
    
    %% 样式定义
    classDef stage1 fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef stage2 fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef stage3 fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef stage4 fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef decision fill:#ffebee,stroke:#c62828,stroke-width:2px
    
    class G,G1,G2,G3,G4,G5,G6,G7,G8,G9 stage1
    class H,H1,H2,H3,H4,H5,H6,H7,H8,H9 stage2
    class I,I1,I2,I3,I5 stage3
    class J,J1,J2,J3,K1,K2,K3,K4,K5,L,M stage4
    class B,D1,I4,J4 decision
```

## 数据流向图

```mermaid
graph LR
    A[PRD原始内容] --> B[PRD分析文档]
    B --> C[业务流程图]
    B --> D[技术架构图]
    C --> E[用户确认结果]
    D --> E
    E --> F[开发上下文]
    F --> G[代码分析结果]
    F --> H[新功能代码]
    F --> I[优化后代码]
    G --> J[开发日志]
    H --> J
    I --> J
    
    %% 文件存储位置标注
    B -.-> B1[fop/.joycode/logs/prd-analysis/]
    C -.-> C1[fop/.joycode/logs/flowcharts/business/]
    D -.-> D1[fop/.joycode/logs/flowcharts/technical/]
    J -.-> J1[fop/.joycode/logs/development/]
```

## 阶段依赖关系图

```mermaid
graph TD
    A[Stage 1: PRD分析阶段] --> B[Stage 2: 流程图生成阶段]
    B --> C[Stage 3: 用户确认阶段]
    C --> D[Stage 4: 开发工作阶段]
    
    A1[PRD内容获取] --> A
    A2[分析规则加载] --> A
    
    B1[PRD分析结果] --> B
    B2[流程图规则] --> B
    
    C1[分析文档] --> C
    C2[流程图文件] --> C
    
    D1[确认结果] --> D
    D2[JoyCoderRules] --> D
    D3[现有代码库] --> D
    
    %% 约束条件
    E[约束：阶段独立执行] -.-> A
    E -.-> B
    E -.-> C
    E -.-> D
    
    F[约束：用户确认必需] -.-> C
    G[约束：不访问外部文档] -.-> D
```

## 配置文件关系图

```mermaid
graph TD
    A[fop-agent-config.json<br/>主配置文件] --> B[workflow配置]
    A --> C[joyspace配置]
    A --> D[logging配置]
    
    B --> E[四个阶段定义]
    B --> F[阶段依赖关系]
    B --> G[输入输出规则]
    
    H[prd-analysis-rules.json] --> I[PRD分析规则]
    J[flowchart-generation-rules.json] --> K[流程图生成规则]
    L[code-generation-rules.json] --> M[代码生成规则]
    
    N[agentDefinition.md] --> O[智能体定义规范]
    P[joycode-mcp.json] --> Q[MCP服务器配置]
    
    %% 文件引用关系
    A -.->|引用| H
    A -.->|引用| J
    A -.->|引用| L
    O -.->|定义规范| A
    Q -.->|服务支持| A