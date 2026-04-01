#!/usr/bin/env node

/**
 * Comprehensive Code Analysis Script for Excel Analytics Platform
 *
 * This script analyzes the codebase and provides insights about:
 * - File statistics (counts, types, sizes)
 * - Code complexity metrics (cyclomatic complexity)
 * - Dependencies analysis (imports, exports, dependency graph)
 * - Component structure
 * - Code quality (comments ratio, duplication)
 * - Technical debt markers (TODO, FIXME, HACK)
 * - Security vulnerabilities
 * - ESLint issues
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REPO_ROOT = __dirname;

// Configuration
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.vite', 'coverage'];
const CODE_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.json', '.css'];
const SOURCE_DIRS = ['src', 'server'];

class CodeAnalyzer {
  constructor() {
    this.stats = {
      totalFiles: 0,
      totalLines: 0,
      totalCodeLines: 0,
      totalCommentLines: 0,
      totalBlankLines: 0,
      filesByType: {},
      filesByDirectory: {},
      largestFiles: [],
      dependencies: {
        frontend: {},
        backend: {}
      },
      components: [],
      routes: [],
      models: [],
      utilities: [],
      eslintIssues: null,
      codeMetrics: {
        avgFileSize: 0,
        avgLinesPerFile: 0,
        totalCodeSize: 0,
        commentsRatio: 0,
        avgComplexity: 0
      },
      complexity: {
        totalComplexity: 0,
        filesAnalyzed: 0,
        highComplexityFiles: [],
        complexityDistribution: {
          low: 0,    // 1-5
          medium: 0, // 6-10
          high: 0,   // 11-20
          veryHigh: 0 // 20+
        }
      },
      technicalDebt: {
        todos: [],
        fixmes: [],
        hacks: [],
        deprecated: [],
        totalMarkers: 0
      },
      imports: {
        totalImports: 0,
        externalImports: 0,
        internalImports: 0,
        unusedFiles: [],
        mostImportedFiles: []
      },
      duplication: {
        duplicateBlocks: [],
        totalDuplicateLines: 0,
        duplicationRatio: 0
      },
      security: {
        potentialIssues: [],
        totalIssues: 0
      },
      qualityScore: 0
    };

    this.fileContents = new Map();
    this.importGraph = new Map();
  }

  /**
   * Main analysis method
   */
  async analyze() {
    console.log('🔍 Starting comprehensive code analysis...\n');

    // Analyze file structure
    this.analyzeFileStructure();

    // Analyze dependencies
    this.analyzeDependencies();

    // Analyze code organization
    this.analyzeCodeOrganization();

    // Analyze complexity
    this.analyzeComplexity();

    // Analyze technical debt
    this.analyzeTechnicalDebt();

    // Analyze imports/exports
    this.analyzeImportsExports();

    // Analyze code duplication
    this.analyzeCodeDuplication();

    // Analyze security
    this.analyzeSecurity();

    // Run ESLint
    this.runESLint();

    // Calculate metrics
    this.calculateMetrics();

    // Calculate quality score
    this.calculateQualityScore();

    // Generate report
    this.generateReport();
  }

  /**
   * Analyze file structure
   */
  analyzeFileStructure() {
    console.log('📁 Analyzing file structure...');

    SOURCE_DIRS.forEach(dir => {
      const dirPath = path.join(REPO_ROOT, dir);
      if (fs.existsSync(dirPath)) {
        this.scanDirectory(dirPath, dir);
      }
    });

    // Sort largest files
    this.stats.largestFiles.sort((a, b) => b.size - a.size);
    this.stats.largestFiles = this.stats.largestFiles.slice(0, 10);
  }

  /**
   * Recursively scan directory
   */
  scanDirectory(dirPath, relativeDir) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    entries.forEach(entry => {
      const fullPath = path.join(dirPath, entry.name);
      const relativePath = path.join(relativeDir, entry.name);

      if (entry.isDirectory()) {
        if (!IGNORE_DIRS.includes(entry.name)) {
          this.scanDirectory(fullPath, relativePath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (CODE_EXTENSIONS.includes(ext)) {
          this.analyzeFile(fullPath, relativePath);
        }
      }
    });
  }

  /**
   * Analyze individual file
   */
  analyzeFile(filePath, relativePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');
      const size = fs.statSync(filePath).size;
      const ext = path.extname(filePath);

      // Store file content for later analysis
      this.fileContents.set(relativePath, { content, lines, ext });

      // Count different types of lines
      let codeLines = 0;
      let commentLines = 0;
      let blankLines = 0;

      lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) {
          blankLines++;
        } else if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
          commentLines++;
        } else {
          codeLines++;
        }
      });

      // Update stats
      this.stats.totalFiles++;
      this.stats.totalLines += lines.length;
      this.stats.totalCodeLines += codeLines;
      this.stats.totalCommentLines += commentLines;
      this.stats.totalBlankLines += blankLines;

      // Count by type
      this.stats.filesByType[ext] = (this.stats.filesByType[ext] || 0) + 1;

      // Count by directory
      const dir = path.dirname(relativePath);
      this.stats.filesByDirectory[dir] = (this.stats.filesByDirectory[dir] || 0) + 1;

      // Track largest files
      this.stats.largestFiles.push({
        path: relativePath,
        lines: lines.length,
        codeLines,
        commentLines,
        size,
        sizeKB: (size / 1024).toFixed(2)
      });

      this.stats.codeMetrics.totalCodeSize += size;
    } catch (error) {
      console.error(`Error analyzing ${relativePath}:`, error.message);
    }
  }

  /**
   * Analyze dependencies from package.json files
   */
  analyzeDependencies() {
    console.log('📦 Analyzing dependencies...');

    // Frontend dependencies
    const frontendPackage = path.join(REPO_ROOT, 'package.json');
    if (fs.existsSync(frontendPackage)) {
      const pkg = JSON.parse(fs.readFileSync(frontendPackage, 'utf8'));
      this.stats.dependencies.frontend = {
        dependencies: Object.keys(pkg.dependencies || {}).length,
        devDependencies: Object.keys(pkg.devDependencies || {}).length,
        total: Object.keys(pkg.dependencies || {}).length + Object.keys(pkg.devDependencies || {}).length,
        packageList: {
          dependencies: Object.keys(pkg.dependencies || {}),
          devDependencies: Object.keys(pkg.devDependencies || {})
        }
      };
    }

    // Backend dependencies
    const backendPackage = path.join(REPO_ROOT, 'server', 'package.json');
    if (fs.existsSync(backendPackage)) {
      const pkg = JSON.parse(fs.readFileSync(backendPackage, 'utf8'));
      this.stats.dependencies.backend = {
        dependencies: Object.keys(pkg.dependencies || {}).length,
        devDependencies: Object.keys(pkg.devDependencies || {}).length,
        total: Object.keys(pkg.dependencies || {}).length + Object.keys(pkg.devDependencies || {}).length,
        packageList: {
          dependencies: Object.keys(pkg.dependencies || {}),
          devDependencies: Object.keys(pkg.devDependencies || {})
        }
      };
    }
  }

  /**
   * Analyze code organization (components, routes, models)
   */
  analyzeCodeOrganization() {
    console.log('🏗️  Analyzing code organization...');

    // Analyze React components
    const componentsDir = path.join(REPO_ROOT, 'src', 'components');
    if (fs.existsSync(componentsDir)) {
      this.stats.components = this.getFilesRecursive(componentsDir, ['.jsx', '.js']);
    }

    // Analyze routes
    const routesDir = path.join(REPO_ROOT, 'server', 'routes');
    if (fs.existsSync(routesDir)) {
      this.stats.routes = this.getFilesRecursive(routesDir, ['.js']);
    }

    // Analyze models
    const modelsDir = path.join(REPO_ROOT, 'server', 'models');
    if (fs.existsSync(modelsDir)) {
      this.stats.models = this.getFilesRecursive(modelsDir, ['.js']);
    }

    // Analyze utilities
    const utilsDirFrontend = path.join(REPO_ROOT, 'src', 'utils');
    const utilsDirBackend = path.join(REPO_ROOT, 'server', 'utils');

    if (fs.existsSync(utilsDirFrontend)) {
      this.stats.utilities = this.stats.utilities.concat(
        this.getFilesRecursive(utilsDirFrontend, ['.js', '.jsx'])
      );
    }
    if (fs.existsSync(utilsDirBackend)) {
      this.stats.utilities = this.stats.utilities.concat(
        this.getFilesRecursive(utilsDirBackend, ['.js'])
      );
    }
  }

  /**
   * Analyze cyclomatic complexity
   */
  analyzeComplexity() {
    console.log('🧮 Analyzing code complexity...');

    this.fileContents.forEach((fileData, filePath) => {
      if (['.js', '.jsx', '.ts', '.tsx'].includes(fileData.ext)) {
        const complexity = this.calculateComplexity(fileData.content);
        this.stats.complexity.totalComplexity += complexity;
        this.stats.complexity.filesAnalyzed++;

        // Categorize complexity
        if (complexity <= 5) {
          this.stats.complexity.complexityDistribution.low++;
        } else if (complexity <= 10) {
          this.stats.complexity.complexityDistribution.medium++;
        } else if (complexity <= 20) {
          this.stats.complexity.complexityDistribution.high++;
        } else {
          this.stats.complexity.complexityDistribution.veryHigh++;
        }

        // Track high complexity files
        if (complexity > 15) {
          this.stats.complexity.highComplexityFiles.push({
            path: filePath,
            complexity
          });
        }
      }
    });

    // Sort high complexity files
    this.stats.complexity.highComplexityFiles.sort((a, b) => b.complexity - a.complexity);
    this.stats.complexity.highComplexityFiles = this.stats.complexity.highComplexityFiles.slice(0, 10);
  }

  /**
   * Calculate cyclomatic complexity (simplified)
   */
  calculateComplexity(content) {
    let complexity = 1; // Base complexity

    // Count decision points
    const patterns = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\bfor\s*\(/g,
      /\bwhile\s*\(/g,
      /\bcase\s+/g,
      /\bcatch\s*\(/g,
      /\&\&/g,
      /\|\|/g,
      /\?/g  // ternary operator
    ];

    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  /**
   * Analyze technical debt markers
   */
  analyzeTechnicalDebt() {
    console.log('💰 Analyzing technical debt...');

    const patterns = {
      todos: /\/\/\s*TODO:?\s*(.+)/gi,
      fixmes: /\/\/\s*FIXME:?\s*(.+)/gi,
      hacks: /\/\/\s*HACK:?\s*(.+)/gi,
      deprecated: /\/\/\s*@deprecated\s*(.+)/gi
    };

    this.fileContents.forEach((fileData, filePath) => {
      Object.entries(patterns).forEach(([type, pattern]) => {
        const matches = [...fileData.content.matchAll(pattern)];
        matches.forEach(match => {
          this.stats.technicalDebt[type].push({
            file: filePath,
            message: match[1].trim(),
            line: fileData.content.substring(0, match.index).split('\n').length
          });
          this.stats.technicalDebt.totalMarkers++;
        });
      });
    });
  }

  /**
   * Analyze imports and exports
   */
  analyzeImportsExports() {
    console.log('🔗 Analyzing imports and exports...');

    const importCounts = new Map();

    this.fileContents.forEach((fileData, filePath) => {
      if (['.js', '.jsx', '.ts', '.tsx'].includes(fileData.ext)) {
        // Match import statements
        const importPattern = /import\s+(?:(?:\{[^}]+\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*)?)+\s+from\s+['"]([^'"]+)['"]/g;
        const requirePattern = /require\s*\(['"]([^'"]+)['"]\)/g;

        const imports = [...fileData.content.matchAll(importPattern)];
        const requires = [...fileData.content.matchAll(requirePattern)];

        const allImports = [...imports, ...requires];

        allImports.forEach(match => {
          const importPath = match[1];
          this.stats.imports.totalImports++;

          // Classify as external or internal
          if (importPath.startsWith('.') || importPath.startsWith('/')) {
            this.stats.imports.internalImports++;

            // Track which files are imported
            importCounts.set(importPath, (importCounts.get(importPath) || 0) + 1);
          } else {
            this.stats.imports.externalImports++;
          }
        });

        // Store in import graph
        if (!this.importGraph.has(filePath)) {
          this.importGraph.set(filePath, []);
        }
      }
    });

    // Find most imported files
    const sortedImports = [...importCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    this.stats.imports.mostImportedFiles = sortedImports.map(([file, count]) => ({
      file,
      importCount: count
    }));
  }

  /**
   * Analyze code duplication (simplified)
   */
  analyzeCodeDuplication() {
    console.log('👯 Analyzing code duplication...');

    const codeBlocks = new Map();
    const BLOCK_SIZE = 5; // Lines to consider as a block

    this.fileContents.forEach((fileData, filePath) => {
      if (['.js', '.jsx', '.ts', '.tsx'].includes(fileData.ext)) {
        const lines = fileData.lines;

        for (let i = 0; i <= lines.length - BLOCK_SIZE; i++) {
          const block = lines.slice(i, i + BLOCK_SIZE)
            .map(l => l.trim())
            .filter(l => l && !l.startsWith('//'))
            .join('\n');

          if (block.length > 50) { // Ignore very short blocks
            const hash = this.simpleHash(block);

            if (!codeBlocks.has(hash)) {
              codeBlocks.set(hash, []);
            }

            codeBlocks.get(hash).push({
              file: filePath,
              startLine: i + 1
            });
          }
        }
      }
    });

    // Find duplicates
    codeBlocks.forEach((locations, hash) => {
      if (locations.length > 1) {
        this.stats.duplication.duplicateBlocks.push({
          locations,
          count: locations.length,
          lines: BLOCK_SIZE
        });
        this.stats.duplication.totalDuplicateLines += BLOCK_SIZE * (locations.length - 1);
      }
    });

    // Sort by count
    this.stats.duplication.duplicateBlocks.sort((a, b) => b.count - a.count);
    this.stats.duplication.duplicateBlocks = this.stats.duplication.duplicateBlocks.slice(0, 10);
  }

  /**
   * Simple hash function for code blocks
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash;
  }

  /**
   * Analyze security vulnerabilities
   */
  analyzeSecurity() {
    console.log('🔒 Analyzing security vulnerabilities...');

    const securityPatterns = [
      { pattern: /eval\s*\(/g, severity: 'high', type: 'Dangerous eval() usage' },
      { pattern: /innerHTML\s*=/g, severity: 'medium', type: 'Potential XSS via innerHTML' },
      { pattern: /dangerouslySetInnerHTML/g, severity: 'medium', type: 'Potential XSS via dangerouslySetInnerHTML' },
      { pattern: /document\.write/g, severity: 'medium', type: 'Dangerous document.write usage' },
      { pattern: /localStorage\.setItem|sessionStorage\.setItem/g, severity: 'low', type: 'Storing data in browser storage' },
      { pattern: /console\.log/g, severity: 'low', type: 'Console.log in production code' },
      { pattern: /\bpassword\s*=\s*['"]/gi, severity: 'critical', type: 'Hardcoded password' },
      { pattern: /\bapi_key\s*=\s*['"]/gi, severity: 'critical', type: 'Hardcoded API key' },
      { pattern: /\bsecret\s*=\s*['"]/gi, severity: 'critical', type: 'Hardcoded secret' }
    ];

    this.fileContents.forEach((fileData, filePath) => {
      if (['.js', '.jsx', '.ts', '.tsx'].includes(fileData.ext)) {
        securityPatterns.forEach(({ pattern, severity, type }) => {
          const matches = [...fileData.content.matchAll(pattern)];
          matches.forEach(match => {
            this.stats.security.potentialIssues.push({
              file: filePath,
              line: fileData.content.substring(0, match.index).split('\n').length,
              type,
              severity,
              snippet: match[0]
            });
            this.stats.security.totalIssues++;
          });
        });
      }
    });

    // Sort by severity
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    this.stats.security.potentialIssues.sort((a, b) =>
      severityOrder[a.severity] - severityOrder[b.severity]
    );
  }

  /**
   * Get files recursively from directory
   */
  getFilesRecursive(dir, extensions) {
    const files = [];

    const scan = (currentDir) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      entries.forEach(entry => {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory() && !IGNORE_DIRS.includes(entry.name)) {
          scan(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name);
          if (extensions.includes(ext)) {
            files.push(path.relative(REPO_ROOT, fullPath));
          }
        }
      });
    };

    scan(dir);
    return files;
  }

  /**
   * Run ESLint analysis
   */
  runESLint() {
    console.log('🔎 Running ESLint...');

    try {
      // Run ESLint with quiet flag as configured in package.json
      const output = execSync('npm run lint', {
        cwd: REPO_ROOT,
        encoding: 'utf8',
        stdio: 'pipe'
      });

      this.stats.eslintIssues = {
        status: 'passed',
        message: 'No ESLint issues found',
        output: output || 'Clean code - no issues detected'
      };
    } catch (error) {
      // ESLint found issues or command failed
      this.stats.eslintIssues = {
        status: 'failed',
        message: 'ESLint found issues',
        output: error.stdout || error.stderr || error.message
      };
    }
  }

  /**
   * Calculate code metrics
   */
  calculateMetrics() {
    if (this.stats.totalFiles > 0) {
      this.stats.codeMetrics.avgLinesPerFile = Math.round(
        this.stats.totalLines / this.stats.totalFiles
      );
      this.stats.codeMetrics.avgFileSize = (
        this.stats.codeMetrics.totalCodeSize / this.stats.totalFiles / 1024
      ).toFixed(2);

      this.stats.codeMetrics.commentsRatio = (
        (this.stats.totalCommentLines / this.stats.totalCodeLines) * 100
      ).toFixed(2);
    }

    if (this.stats.complexity.filesAnalyzed > 0) {
      this.stats.codeMetrics.avgComplexity = (
        this.stats.complexity.totalComplexity / this.stats.complexity.filesAnalyzed
      ).toFixed(2);
    }

    if (this.stats.totalCodeLines > 0) {
      this.stats.duplication.duplicationRatio = (
        (this.stats.duplication.totalDuplicateLines / this.stats.totalCodeLines) * 100
      ).toFixed(2);
    }
  }

  /**
   * Calculate overall quality score (0-100)
   */
  calculateQualityScore() {
    let score = 100;

    // Deduct for high complexity
    const avgComplexity = parseFloat(this.stats.codeMetrics.avgComplexity);
    if (avgComplexity > 20) score -= 20;
    else if (avgComplexity > 15) score -= 15;
    else if (avgComplexity > 10) score -= 10;
    else if (avgComplexity > 5) score -= 5;

    // Deduct for low comments ratio
    const commentsRatio = parseFloat(this.stats.codeMetrics.commentsRatio);
    if (commentsRatio < 5) score -= 15;
    else if (commentsRatio < 10) score -= 10;
    else if (commentsRatio < 15) score -= 5;

    // Deduct for technical debt
    const debtPerFile = this.stats.technicalDebt.totalMarkers / this.stats.totalFiles;
    if (debtPerFile > 2) score -= 15;
    else if (debtPerFile > 1) score -= 10;
    else if (debtPerFile > 0.5) score -= 5;

    // Deduct for code duplication
    const duplicationRatio = parseFloat(this.stats.duplication.duplicationRatio);
    if (duplicationRatio > 10) score -= 20;
    else if (duplicationRatio > 5) score -= 10;
    else if (duplicationRatio > 2) score -= 5;

    // Deduct for security issues
    const criticalIssues = this.stats.security.potentialIssues.filter(i => i.severity === 'critical').length;
    const highIssues = this.stats.security.potentialIssues.filter(i => i.severity === 'high').length;
    score -= (criticalIssues * 10 + highIssues * 5);

    // Deduct for ESLint failures
    if (this.stats.eslintIssues.status === 'failed') {
      score -= 10;
    }

    // Ensure score is between 0 and 100
    this.stats.qualityScore = Math.max(0, Math.min(100, score));
  }

  /**
   * Generate analysis report
   */
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE CODE ANALYSIS REPORT');
    console.log('='.repeat(80) + '\n');

    // Quality Score
    console.log('⭐ OVERALL QUALITY SCORE');
    console.log('-'.repeat(80));
    const scoreEmoji = this.stats.qualityScore >= 80 ? '🟢' :
                       this.stats.qualityScore >= 60 ? '🟡' : '🔴';
    console.log(`${scoreEmoji} Score: ${this.stats.qualityScore}/100`);
    console.log();

    // Overview
    console.log('📈 OVERVIEW');
    console.log('-'.repeat(80));
    console.log(`Total Files: ${this.stats.totalFiles}`);
    console.log(`Total Lines: ${this.stats.totalLines.toLocaleString()}`);
    console.log(`  Code Lines: ${this.stats.totalCodeLines.toLocaleString()}`);
    console.log(`  Comment Lines: ${this.stats.totalCommentLines.toLocaleString()}`);
    console.log(`  Blank Lines: ${this.stats.totalBlankLines.toLocaleString()}`);
    console.log(`Total Code Size: ${(this.stats.codeMetrics.totalCodeSize / 1024).toFixed(2)} KB`);
    console.log(`Average Lines per File: ${this.stats.codeMetrics.avgLinesPerFile}`);
    console.log(`Average File Size: ${this.stats.codeMetrics.avgFileSize} KB`);
    console.log(`Comments Ratio: ${this.stats.codeMetrics.commentsRatio}%`);
    console.log();

    // Files by Type
    console.log('📄 FILES BY TYPE');
    console.log('-'.repeat(80));
    Object.entries(this.stats.filesByType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([ext, count]) => {
        console.log(`${ext.padEnd(10)} : ${count} files`);
      });
    console.log();

    // Complexity Analysis
    console.log('🧮 COMPLEXITY ANALYSIS');
    console.log('-'.repeat(80));
    console.log(`Average Complexity: ${this.stats.codeMetrics.avgComplexity}`);
    console.log(`Files Analyzed: ${this.stats.complexity.filesAnalyzed}`);
    console.log('\nComplexity Distribution:');
    console.log(`  Low (1-5):        ${this.stats.complexity.complexityDistribution.low} files`);
    console.log(`  Medium (6-10):    ${this.stats.complexity.complexityDistribution.medium} files`);
    console.log(`  High (11-20):     ${this.stats.complexity.complexityDistribution.high} files`);
    console.log(`  Very High (20+):  ${this.stats.complexity.complexityDistribution.veryHigh} files`);

    if (this.stats.complexity.highComplexityFiles.length > 0) {
      console.log('\nHigh Complexity Files (Top 10):');
      this.stats.complexity.highComplexityFiles.forEach((file, idx) => {
        console.log(`  ${idx + 1}. ${file.path} (complexity: ${file.complexity})`);
      });
    }
    console.log();

    // Technical Debt
    console.log('💰 TECHNICAL DEBT');
    console.log('-'.repeat(80));
    console.log(`Total Markers: ${this.stats.technicalDebt.totalMarkers}`);
    console.log(`  TODOs: ${this.stats.technicalDebt.todos.length}`);
    console.log(`  FIXMEs: ${this.stats.technicalDebt.fixmes.length}`);
    console.log(`  HACKs: ${this.stats.technicalDebt.hacks.length}`);
    console.log(`  Deprecated: ${this.stats.technicalDebt.deprecated.length}`);

    if (this.stats.technicalDebt.todos.length > 0) {
      console.log('\nRecent TODOs:');
      this.stats.technicalDebt.todos.slice(0, 5).forEach(todo => {
        console.log(`  - ${todo.file}:${todo.line} - ${todo.message}`);
      });
      if (this.stats.technicalDebt.todos.length > 5) {
        console.log(`  ... and ${this.stats.technicalDebt.todos.length - 5} more`);
      }
    }
    console.log();

    // Code Duplication
    console.log('👯 CODE DUPLICATION');
    console.log('-'.repeat(80));
    console.log(`Duplication Ratio: ${this.stats.duplication.duplicationRatio}%`);
    console.log(`Total Duplicate Lines: ${this.stats.duplication.totalDuplicateLines}`);
    console.log(`Duplicate Blocks Found: ${this.stats.duplication.duplicateBlocks.length}`);

    if (this.stats.duplication.duplicateBlocks.length > 0) {
      console.log('\nTop Duplicate Blocks:');
      this.stats.duplication.duplicateBlocks.slice(0, 3).forEach((block, idx) => {
        console.log(`  ${idx + 1}. Found in ${block.count} locations (${block.lines} lines each):`);
        block.locations.slice(0, 3).forEach(loc => {
          console.log(`     - ${loc.file}:${loc.startLine}`);
        });
      });
    }
    console.log();

    // Imports Analysis
    console.log('🔗 IMPORTS ANALYSIS');
    console.log('-'.repeat(80));
    console.log(`Total Imports: ${this.stats.imports.totalImports}`);
    console.log(`  External: ${this.stats.imports.externalImports}`);
    console.log(`  Internal: ${this.stats.imports.internalImports}`);

    if (this.stats.imports.mostImportedFiles.length > 0) {
      console.log('\nMost Imported Files:');
      this.stats.imports.mostImportedFiles.forEach((file, idx) => {
        console.log(`  ${idx + 1}. ${file.file} (${file.importCount} imports)`);
      });
    }
    console.log();

    // Security Analysis
    console.log('🔒 SECURITY ANALYSIS');
    console.log('-'.repeat(80));
    console.log(`Potential Issues Found: ${this.stats.security.totalIssues}`);

    const bySeverity = {
      critical: this.stats.security.potentialIssues.filter(i => i.severity === 'critical').length,
      high: this.stats.security.potentialIssues.filter(i => i.severity === 'high').length,
      medium: this.stats.security.potentialIssues.filter(i => i.severity === 'medium').length,
      low: this.stats.security.potentialIssues.filter(i => i.severity === 'low').length
    };

    console.log(`  Critical: ${bySeverity.critical}`);
    console.log(`  High: ${bySeverity.high}`);
    console.log(`  Medium: ${bySeverity.medium}`);
    console.log(`  Low: ${bySeverity.low}`);

    if (this.stats.security.potentialIssues.length > 0) {
      console.log('\nTop Security Issues:');
      this.stats.security.potentialIssues.slice(0, 5).forEach((issue, idx) => {
        console.log(`  ${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.type}`);
        console.log(`     ${issue.file}:${issue.line}`);
      });
      if (this.stats.security.potentialIssues.length > 5) {
        console.log(`  ... and ${this.stats.security.potentialIssues.length - 5} more`);
      }
    }
    console.log();

    // Largest Files
    console.log('📏 LARGEST FILES (Top 10)');
    console.log('-'.repeat(80));
    this.stats.largestFiles.forEach((file, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${file.path}`);
      console.log(`    Lines: ${file.lines} (Code: ${file.codeLines}, Comments: ${file.commentLines}), Size: ${file.sizeKB} KB`);
    });
    console.log();

    // Dependencies
    console.log('📦 DEPENDENCIES');
    console.log('-'.repeat(80));
    console.log('Frontend:');
    console.log(`  Dependencies: ${this.stats.dependencies.frontend.dependencies || 0}`);
    console.log(`  DevDependencies: ${this.stats.dependencies.frontend.devDependencies || 0}`);
    console.log(`  Total: ${this.stats.dependencies.frontend.total || 0}`);
    console.log();
    console.log('Backend:');
    console.log(`  Dependencies: ${this.stats.dependencies.backend.dependencies || 0}`);
    console.log(`  DevDependencies: ${this.stats.dependencies.backend.devDependencies || 0}`);
    console.log(`  Total: ${this.stats.dependencies.backend.total || 0}`);
    console.log();

    // Code Organization
    console.log('🏗️  CODE ORGANIZATION');
    console.log('-'.repeat(80));
    console.log(`React Components: ${this.stats.components.length}`);
    console.log(`API Routes: ${this.stats.routes.length}`);
    console.log(`Database Models: ${this.stats.models.length}`);
    console.log(`Utility Files: ${this.stats.utilities.length}`);
    console.log();

    // ESLint Results
    console.log('🔎 ESLINT ANALYSIS');
    console.log('-'.repeat(80));
    console.log(`Status: ${this.stats.eslintIssues.status.toUpperCase()}`);
    console.log(`Message: ${this.stats.eslintIssues.message}`);
    if (this.stats.eslintIssues.output && this.stats.eslintIssues.status === 'failed') {
      console.log('\nDetails:');
      console.log(this.stats.eslintIssues.output.substring(0, 500));
      if (this.stats.eslintIssues.output.length > 500) {
        console.log('... (truncated)');
      }
    }
    console.log();

    // Summary
    console.log('='.repeat(80));
    console.log('✅ Analysis Complete!');
    console.log('='.repeat(80) + '\n');

    // Save report to file
    this.saveReport();
  }

  /**
   * Save report to JSON file
   */
  saveReport() {
    const reportPath = path.join(REPO_ROOT, 'code-analysis-report.json');
    const reportData = {
      generatedAt: new Date().toISOString(),
      ...this.stats
    };

    fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2));
    console.log(`📄 Detailed report saved to: code-analysis-report.json\n`);
  }
}

// Run the analysis
const analyzer = new CodeAnalyzer();
analyzer.analyze().catch(error => {
  console.error('Error running code analysis:', error);
  process.exit(1);
});
