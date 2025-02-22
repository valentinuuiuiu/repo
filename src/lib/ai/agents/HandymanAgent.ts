import { Project, Node, SourceFile } from "ts-morph";
import { semanticSearch } from "./utils/embeddings"; 
import ts from 'typescript';

interface AgentResponse {
  success: boolean;
  data: any;
  error?: string;
  metadata: {
    confidence: number;
    processingTime: number;
    modelUsed?: string;
  };
}

interface CodeAnalysis {
  issues: string[];
  metrics: {
    complexity: number;
    maintainability: number;
    duplicateCode: number;
  };
  suggestions: string[];
}

interface SearchResult {
  scores: number[];
  metadatas: Array<Array<CodeFix>>;
  documents?: string[];
}

interface CodeFix {
  success: boolean;
  fix: string;
}

// Helper function to extract diagnostic message
function extractDiagnosticMessage(messageText: string | ts.DiagnosticMessageChain | (() => string | ts.DiagnosticMessageChain)): string {
  // If it's a function, call it first
  if (typeof messageText === 'function') {
    messageText = messageText();
  }

  // If it's a string, return it directly
  if (typeof messageText === 'string') {
    return messageText;
  }

  // If it has getMessageText method (ts-morph DiagnosticMessageChain)
  if (typeof messageText === 'object' && messageText !== null && 
      'getMessageText' in messageText && 
      typeof (messageText as { getMessageText(): string }).getMessageText === 'function') {
    return (messageText as { getMessageText(): string }).getMessageText();
  }

  // If it's a TypeScript DiagnosticMessageChain
  if (typeof messageText === 'object' && 'messageText' in messageText) {
    let message = messageText;
    let result = message.messageText;
    
    while (message.next && message.next.length > 0) {
      message = message.next[0];
      result = message.messageText;
    }

    return typeof result === 'string' ? result : 'Unknown diagnostic message';
  }

  return 'Unknown diagnostic message';
}

export class HandymanAgent {
  private project: Project;
  private readonly COLLECTION_NAME = 'code_patterns';

  constructor(config?: any) {
    this.project = new Project({
      useInMemoryFileSystem: true,
      skipLoadingLibFiles: true, // Skip loading lib files to avoid file system access
      compilerOptions: {
        target: ts.ScriptTarget.Latest,
        module: ts.ModuleKind.ESNext,
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        noLib: true, // Prevents TypeScript from looking for the standard library
        types: [] // Prevents TypeScript from looking for @types packages
      }
    });

    // If a specific file needs to be analyzed, add it to the in-memory file system
    if (config?.filePath) {
      try {
        const fileContent = localStorage.getItem(`code:${config.filePath}`);
        if (fileContent) {
          this.project.createSourceFile(config.filePath, fileContent, { overwrite: true });
        }
      } catch (error) {
        console.error('Error loading file to in-memory file system:', error);
      }
    }
  }

  async analyzeCodingStyle(): Promise<AgentResponse> {
    try {
      // In browser, use localStorage to get source files
      const sourceFileContents = Object.keys(localStorage)
        .filter(key => key.startsWith('code:'))
        .map(key => ({
          path: key.replace('code:', ''),
          content: localStorage.getItem(key) || ''
        }));

      const analysis: CodeAnalysis = {
        issues: [],
        metrics: {
          complexity: 0,
          maintainability: 0,
          duplicateCode: 0
        },
        suggestions: []
      };

      // Add source files to in-memory file system
      sourceFileContents.forEach(file => {
        this.project.createSourceFile(file.path, file.content);
      });

      const sourceFiles = this.project.getSourceFiles();
      for (const sourceFile of sourceFiles) {
        await this.analyzeFileWithHistory(sourceFile, analysis);
      }

      return {
        success: true,
        data: analysis,
        metadata: {
          confidence: 0.9,
          processingTime: 0,
          modelUsed: "typescript-analyzer"
        }
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          confidence: 0,
          processingTime: 0
        }
      };
    }
  }

  async suggestOptimizations(filePath: string): Promise<AgentResponse> {
    try {
      // Try to get file content from localStorage
      const fileContent = localStorage.getItem(`code:${filePath}`);
      if (!fileContent) {
        throw new Error(`File not found in browser storage: ${filePath}`);
      }

      // Create source file in memory
      const sourceFile = this.project.createSourceFile(filePath, fileContent);

      const suggestions = this.analyzeSyntaxTree(sourceFile);

      return {
        success: true,
        data: {
          suggestions,
          file: filePath
        },
        metadata: {
          confidence: 0.85,
          processingTime: 0,
          modelUsed: "typescript-optimizer"
        }
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          confidence: 0,
          processingTime: 0
        }
      };
    }
  }

  async fixTypescriptErrors(filePath: string): Promise<AgentResponse> {
    try {
      // Try to get file content from localStorage
      const fileContent = localStorage.getItem(`code:${filePath}`);
      if (!fileContent) {
        throw new Error(`File not found in browser storage: ${filePath}`);
      }

      // Create source file in memory
      const sourceFile = this.project.createSourceFile(filePath, fileContent);

      const diagnostics = sourceFile.getPreEmitDiagnostics();

      const fixes = await Promise.all(diagnostics.map(async diagnostic => {
        const start = diagnostic.getStart() || 0;
        const node = sourceFile.getDescendantAtPos(start);
        
        const messageText = diagnostic.getMessageText();
        let finalMessage: string | ts.DiagnosticMessageChain;
        
        if (typeof messageText === 'string') {
          finalMessage = messageText;
        } else if (typeof messageText === 'object' && messageText !== null && 
                   'getMessageText' in messageText && 
                   typeof (messageText as { getMessageText(): string }).getMessageText === 'function') {
          finalMessage = {
            messageText: (messageText as { getMessageText(): string }).getMessageText(),
            category: ts.DiagnosticCategory.Error,
            code: 0,
            next: []
          };
        } else {
          finalMessage = 'Unknown error';
        }

        const tsDiagnostic: ts.Diagnostic = {
          messageText: finalMessage,
          start: start,
          length: diagnostic.getLength() || 0,
          category: ts.DiagnosticCategory.Error,
          code: diagnostic.getCode() || 0,
          file: diagnostic.getSourceFile()?.compilerNode
        };

        const suggestedFix = await this.generateFixWithHistory(node, tsDiagnostic);
        
        const lineAndChar = sourceFile.getLineAndColumnAtPos(start);
        
        return {
          message: extractDiagnosticMessage(tsDiagnostic.messageText),
          location: lineAndChar,
          suggestedFix
        };
      }));

      return {
        success: true,
        data: {
          fixes,
          file: filePath
        },
        metadata: {
          confidence: 0.8,
          processingTime: 0,
          modelUsed: "typescript-fixer"
        }
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          confidence: 0,
          processingTime: 0
        }
      };
    }
  }

  private async analyzeFileWithHistory(sourceFile: SourceFile, analysis: CodeAnalysis): Promise<void> {
    const fileContent = sourceFile.getFullText();
    const similarPatterns = await semanticSearch(
      this.COLLECTION_NAME,
      fileContent,
      5
    ) as SearchResult;

    this.analyzeFile(sourceFile, analysis);

    const { scores, metadatas } = similarPatterns;
    
    for (let i = 0; i < scores.length; i++) {
      if (scores[i] > 0.8 && metadatas[i]?.[0]) {
        const pattern = metadatas[i][0];
        if (pattern.success) {
          analysis.suggestions.push(
            `Consider applying pattern: ${pattern.fix} (based on historical success)`
          );
        }
      }
    }
  }

  private analyzeFile(sourceFile: SourceFile, analysis: CodeAnalysis): void {
    sourceFile.forEachDescendant(node => {
      const compilerNode = node.compilerNode;
      if (ts.isFunctionDeclaration(compilerNode) || ts.isMethodDeclaration(compilerNode)) {
        analysis.metrics.complexity += this.calculateComplexity(node);
      }
    });

    this.checkCodeStyle(sourceFile, analysis);
    analysis.metrics.maintainability = this.calculateMaintainability(sourceFile);
  }

  private analyzeSyntaxTree(sourceFile: SourceFile): string[] {
    const suggestions: string[] = [];
    
    sourceFile.forEachDescendant(node => {
      const compilerNode = node.compilerNode;
      
      // Check for long functions
      if (ts.isFunctionDeclaration(compilerNode) || ts.isMethodDeclaration(compilerNode)) {
        const body = node.getChildrenOfKind(ts.SyntaxKind.Block)[0];
        if (body && body.getFullText().split('\n').length > 30) {
          suggestions.push(`Consider breaking down large function ${node.getText().split('(')[0]} into smaller functions`);
        }
      }
      
      // Check for deeply nested conditionals
      if (ts.isIfStatement(compilerNode)) {
        let depth = 0;
        let parent = node.getParent();
        while (parent) {
          if (ts.isIfStatement(parent.compilerNode)) {
            depth++;
          }
          parent = parent.getParent();
        }
        if (depth > 3) {
          suggestions.push(`Consider refactoring deeply nested if statements at line ${node.getStartLineNumber()}`);
        }
      }
    });
    
    return suggestions;
  }

  private calculateComplexity(node: Node): number {
    let complexity = 1;
    node.forEachDescendant(child => {
      const compilerNode = child.compilerNode;
      if (
        ts.isIfStatement(compilerNode) ||
        ts.isForStatement(compilerNode) ||
        ts.isWhileStatement(compilerNode) ||
        ts.isCaseClause(compilerNode) ||
        ts.isCatchClause(compilerNode)
      ) {
        complexity++;
      }
    });
    return complexity;
  }

  private checkCodeStyle(sourceFile: SourceFile, analysis: CodeAnalysis): void {
    sourceFile.forEachDescendant(node => {
      const compilerNode = node.compilerNode;
      
      // Check variable naming conventions
      if (ts.isVariableDeclaration(compilerNode) && compilerNode.name) {
        const name = compilerNode.name.getText();
        if (!/^[a-z][a-zA-Z0-9]*$/.test(name)) {
          analysis.issues.push(`Variable "${name}" should use camelCase naming convention`);
        }
      }

      // Check function length
      if (ts.isFunctionDeclaration(compilerNode) || ts.isMethodDeclaration(compilerNode)) {
        const body = node.getChildrenOfKind(ts.SyntaxKind.Block)[0];
        if (body && body.getFullText().split('\n').length > 30) {
          analysis.issues.push(`Function is too long (> 30 lines)`);
        }
      }
    });
  }

  /**
   * Generate department-specific AI insights
   * @param department The department to generate insights for
   * @returns Insights and recommendations for the specific department
   */
  async generateDepartmentInsights(department: string): Promise<AgentResponse> {
    try {
      // Department-specific insight generation logic
      switch(department.toLowerCase()) {
        case 'engineering':
          return {
            success: true,
            data: {
              codeQualityScore: await this.analyzeCodingStyle(),
              optimizationSuggestions: await this.suggestOptimizations('src/main.tsx'),
              technicalDebt: this.calculateTechnicalDebt()
            },
            metadata: {
              confidence: 0.85,
              processingTime: Date.now(),
              modelUsed: 'engineering-insights'
            }
          };
        
        case 'product':
          return {
            success: true,
            data: {
              featureComplexity: this.analyzeFeatureComplexity(),
              performanceMetrics: this.calculatePerformanceMetrics(),
              userImpactPotential: this.assessUserImpactPotential()
            },
            metadata: {
              confidence: 0.75,
              processingTime: Date.now(),
              modelUsed: 'product-insights'
            }
          };
        
        case 'design':
          return {
            success: true,
            data: {
              componentConsistency: this.checkDesignSystemConsistency(),
              accessibilityScore: this.calculateAccessibilityScore(),
              uiComplexityAnalysis: this.analyzeUIComplexity()
            },
            metadata: {
              confidence: 0.80,
              processingTime: Date.now(),
              modelUsed: 'design-insights'
            }
          };
        
        default:
          return {
            success: false,
            data: null,
            error: `No insights available for department: ${department}`,
            metadata: {
              confidence: 0,
              processingTime: 0
            }
          };
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error in department insights',
        metadata: {
          confidence: 0,
          processingTime: 0
        }
      };
    }
  }

  /**
   * Calculate technical debt based on code analysis
   * @returns Technical debt score and details
   */
  private calculateTechnicalDebt(): number {
    // Implement technical debt calculation logic
    // Could use complexity metrics, code smells, etc.
    return 0; // Placeholder
  }

  /**
   * Analyze feature complexity
   * @returns Feature complexity metrics
   */
  private analyzeFeatureComplexity(): Record<string, any> {
    // Implement feature complexity analysis
    return {}; // Placeholder
  }

  /**
   * Calculate performance metrics
   * @returns Performance-related metrics
   */
  private calculatePerformanceMetrics(): Record<string, any> {
    // Implement performance metrics calculation
    return {}; // Placeholder
  }

  /**
   * Assess potential user impact of features
   * @returns User impact potential score
   */
  private assessUserImpactPotential(): number {
    // Implement user impact potential assessment
    return 0; // Placeholder
  }

  /**
   * Check design system consistency
   * @returns Design system consistency score
   */
  private checkDesignSystemConsistency(): number {
    // Implement design system consistency check
    return 0; // Placeholder
  }

  /**
   * Calculate accessibility score
   * @returns Accessibility score
   */
  private calculateAccessibilityScore(): number {
    // Implement accessibility scoring
    return 0; // Placeholder
  }

  /**
   * Analyze UI complexity
   * @returns UI complexity metrics
   */
  private analyzeUIComplexity(): Record<string, any> {
    // Implement UI complexity analysis
    return {}; // Placeholder
  }

  /**
   * Calculate maintainability index based on code metrics
   * Uses a simplified version of the maintainability index formula
   * MI = 171 - 5.2 * ln(HV) - 0.23 * CC - 16.2 * ln(LOC)
   * where:
   * HV = Halstead Volume
   * CC = Cyclomatic Complexity
   * LOC = Lines of Code
   */
  private calculateMaintainability(sourceFile: SourceFile): number {
    let linesOfCode = sourceFile.getFullText().split('\n').length;
    let cyclomaticComplexity = 0;
    let halsteadVolume = 0;
    
    // Calculate cyclomatic complexity
    sourceFile.forEachDescendant(node => {
      const compilerNode = node.compilerNode;
      if (
        ts.isIfStatement(compilerNode) ||
        ts.isForStatement(compilerNode) ||
        ts.isWhileStatement(compilerNode) ||
        ts.isCaseClause(compilerNode) ||
        ts.isCatchClause(compilerNode) ||
        ts.isConditionalExpression(compilerNode)
      ) {
        cyclomaticComplexity++;
      }
    });

    // Simplified Halstead volume calculation
    const uniqueOperators = new Set<string>();
    const uniqueOperands = new Set<string>();
    
    sourceFile.forEachDescendant(node => {
      if (ts.isIdentifier(node.compilerNode)) {
        uniqueOperands.add(node.getText());
      } else if (ts.isBinaryExpression(node.compilerNode)) {
        uniqueOperators.add(node.compilerNode.operatorToken.getText());
      }
    });

    // Basic Halstead volume calculation
    halsteadVolume = (uniqueOperators.size + uniqueOperands.size) * 
                     Math.log2(uniqueOperators.size + uniqueOperands.size);

    // Calculate maintainability index (normalized to 0-100 scale)
    const maintainabilityIndex = Math.max(0, Math.min(100,
      (171 - 
       5.2 * Math.log(Math.max(1, halsteadVolume)) - 
       0.23 * cyclomaticComplexity - 
       16.2 * Math.log(Math.max(1, linesOfCode))) * 100 / 171
    ));

    return maintainabilityIndex;
  }

  private async generateFixWithHistory(node: Node | undefined, diagnostic: ts.Diagnostic): Promise<string> {
    if (!node) {
      return "Unable to generate fix - node not found";
    }

    const nodeText = node.getText();
    const diagnosticMessage = extractDiagnosticMessage(diagnostic.messageText);

    const searchResult = await semanticSearch(
      this.COLLECTION_NAME,
      `${nodeText} ${diagnosticMessage}`,
      1
    ) as SearchResult;

    if (searchResult.scores.length > 0 && 
        searchResult.scores[0] > 0.8 && 
        searchResult.metadatas.length > 0 &&
        searchResult.metadatas[0].length > 0 &&
        searchResult.metadatas[0][0].success) {
      return searchResult.metadatas[0][0].fix;
    }

    if (diagnosticMessage.includes("does not exist on type")) {
      return `Add the missing property or method to the type definition`;
    }
    
    if (diagnosticMessage.includes("is not assignable to type")) {
      return `Ensure the types match or add appropriate type conversion`;
    }

    return `Review the code and fix the issue: ${diagnosticMessage}`;
  }
}