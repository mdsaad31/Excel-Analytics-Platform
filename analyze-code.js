#!/usr/bin/env node

/**
 * Simple Code Analysis Script for Excel Analytics Platform
 *
 * This script analyzes the codebase and provides insights about:
 * - File statistics (counts, types, sizes)
 * - Code complexity metrics
 * - Dependencies analysis
 * - Component structure
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
        totalCodeSize: 0
      }
    };
  }

  /**
   * Main analysis method
   */
  async analyze() {
    console.log('🔍 Starting code analysis...\n');

    // Analyze file structure
    this.analyzeFileStructure();

    // Analyze dependencies
    this.analyzeDependencies();

    // Analyze code organization
    this.analyzeCodeOrganization();

    // Run ESLint
    this.runESLint();

    // Calculate metrics
    this.calculateMetrics();

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
      const lines = content.split('\n').length;
      const size = fs.statSync(filePath).size;
      const ext = path.extname(filePath);

      // Update stats
      this.stats.totalFiles++;
      this.stats.totalLines += lines;

      // Count by type
      this.stats.filesByType[ext] = (this.stats.filesByType[ext] || 0) + 1;

      // Count by directory
      const dir = path.dirname(relativePath);
      this.stats.filesByDirectory[dir] = (this.stats.filesByDirectory[dir] || 0) + 1;

      // Track largest files
      this.stats.largestFiles.push({
        path: relativePath,
        lines,
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
    }
  }

  /**
   * Generate analysis report
   */
  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 CODE ANALYSIS REPORT');
    console.log('='.repeat(80) + '\n');

    // Overview
    console.log('📈 OVERVIEW');
    console.log('-'.repeat(80));
    console.log(`Total Files: ${this.stats.totalFiles}`);
    console.log(`Total Lines of Code: ${this.stats.totalLines.toLocaleString()}`);
    console.log(`Total Code Size: ${(this.stats.codeMetrics.totalCodeSize / 1024).toFixed(2)} KB`);
    console.log(`Average Lines per File: ${this.stats.codeMetrics.avgLinesPerFile}`);
    console.log(`Average File Size: ${this.stats.codeMetrics.avgFileSize} KB\n`);

    // Files by Type
    console.log('📄 FILES BY TYPE');
    console.log('-'.repeat(80));
    Object.entries(this.stats.filesByType)
      .sort((a, b) => b[1] - a[1])
      .forEach(([ext, count]) => {
        console.log(`${ext.padEnd(10)} : ${count} files`);
      });
    console.log();

    // Files by Directory
    console.log('📁 FILES BY DIRECTORY');
    console.log('-'.repeat(80));
    Object.entries(this.stats.filesByDirectory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([dir, count]) => {
        console.log(`${dir.padEnd(40)} : ${count} files`);
      });
    console.log();

    // Largest Files
    console.log('📏 LARGEST FILES (Top 10)');
    console.log('-'.repeat(80));
    this.stats.largestFiles.forEach((file, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${file.path}`);
      console.log(`    Lines: ${file.lines}, Size: ${file.sizeKB} KB`);
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

    // Component List
    if (this.stats.components.length > 0) {
      console.log('Components:');
      this.stats.components.slice(0, 10).forEach(comp => {
        console.log(`  - ${comp}`);
      });
      if (this.stats.components.length > 10) {
        console.log(`  ... and ${this.stats.components.length - 10} more`);
      }
      console.log();
    }

    // Routes List
    if (this.stats.routes.length > 0) {
      console.log('API Routes:');
      this.stats.routes.forEach(route => {
        console.log(`  - ${route}`);
      });
      console.log();
    }

    // Models List
    if (this.stats.models.length > 0) {
      console.log('Database Models:');
      this.stats.models.forEach(model => {
        console.log(`  - ${model}`);
      });
      console.log();
    }

    // ESLint Results
    console.log('🔎 ESLINT ANALYSIS');
    console.log('-'.repeat(80));
    console.log(`Status: ${this.stats.eslintIssues.status.toUpperCase()}`);
    console.log(`Message: ${this.stats.eslintIssues.message}`);
    if (this.stats.eslintIssues.output) {
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
