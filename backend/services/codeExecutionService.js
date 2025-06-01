const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

class CodeExecutionService {
  constructor() {
    this.tempDir = path.join(__dirname, '../temp');
    this.ensureTempDir();
  }

  async ensureTempDir() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Error creating temp directory:', error);
    }
  }

  async executeCode(code, language, testCases, timeLimit = 2000, memoryLimit = 128) {
    const results = {
      testResults: [],
      passedTestCases: 0,
      status: 'pending',
      executionTime: 0,
      memoryUsed: 0,
      errorMessage: null
    };

    try {
      // If Judge0 API is available, use it
      if (process.env.JUDGE0_API_KEY) {
        return await this.executeWithJudge0(code, language, testCases, timeLimit);
      }

      // Otherwise, use local execution
      return await this.executeLocally(code, language, testCases, timeLimit, memoryLimit);
    } catch (error) {
      results.status = 'runtime_error';
      results.errorMessage = error.message;
      return results;
    }
  }

  async executeWithJudge0(code, language, testCases, timeLimit) {
    const languageMap = {
      'javascript': 63,
      'python': 71,
      'java': 62,
      'cpp': 54,
      'c': 50
    };

    const languageId = languageMap[language];
    if (!languageId) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const results = {
      testResults: [],
      passedTestCases: 0,
      status: 'pending',
      executionTime: 0,
      memoryUsed: 0,
      errorMessage: null
    };

    try {
      for (const testCase of testCases) {
        const submission = {
          source_code: Buffer.from(code).toString('base64'),
          language_id: languageId,
          stdin: Buffer.from(testCase.input).toString('base64'),
          expected_output: Buffer.from(testCase.expectedOutput).toString('base64')
        };

        const response = await axios.post(
          'https://judge0-ce.p.rapidapi.com/submissions',
          submission,
          {
            headers: {
              'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
              'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
              'Content-Type': 'application/json'
            }
          }
        );

        const token = response.data.token;
        
        // Poll for result
        let result;
        let attempts = 0;
        do {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const resultResponse = await axios.get(
            `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
            {
              headers: {
                'X-RapidAPI-Key': process.env.JUDGE0_API_KEY,
                'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
              }
            }
          );
          result = resultResponse.data;
          attempts++;
        } while (result.status.id <= 2 && attempts < 30);

        const testResult = {
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: result.stdout ? Buffer.from(result.stdout, 'base64').toString() : '',
          passed: result.status.id === 3, // Accepted
          executionTime: parseFloat(result.time) || 0,
          memoryUsed: parseInt(result.memory) || 0
        };

        results.testResults.push(testResult);
        if (testResult.passed) results.passedTestCases++;
        results.executionTime = Math.max(results.executionTime, testResult.executionTime);
        results.memoryUsed = Math.max(results.memoryUsed, testResult.memoryUsed);
      }

      // Determine overall status
      if (results.passedTestCases === testCases.length) {
        results.status = 'accepted';
      } else {
        results.status = 'wrong_answer';
      }

      return results;
    } catch (error) {
      throw new Error(`Judge0 execution failed: ${error.message}`);
    }
  }

  async executeLocally(code, language, testCases, timeLimit, memoryLimit) {
    const results = {
      testResults: [],
      passedTestCases: 0,
      status: 'pending',
      executionTime: 0,
      memoryUsed: 0,
      errorMessage: null
    };

    const fileName = `temp_${Date.now()}`;
    let filePath, execPath;

    try {
      switch (language) {
        case 'javascript':
          filePath = path.join(this.tempDir, `${fileName}.js`);
          await fs.writeFile(filePath, code);
          break;
        case 'python':
          filePath = path.join(this.tempDir, `${fileName}.py`);
          await fs.writeFile(filePath, code);
          break;
        case 'java':
          filePath = path.join(this.tempDir, `${fileName}.java`);
          await fs.writeFile(filePath, code);
          // Compile Java
          await this.executeCommand('javac', [filePath], timeLimit);
          execPath = path.join(this.tempDir, fileName);
          break;
        case 'cpp':
          filePath = path.join(this.tempDir, `${fileName}.cpp`);
          execPath = path.join(this.tempDir, fileName);
          await fs.writeFile(filePath, code);
          // Compile C++
          await this.executeCommand('g++', ['-o', execPath, filePath], timeLimit);
          break;
        case 'c':
          filePath = path.join(this.tempDir, `${fileName}.c`);
          execPath = path.join(this.tempDir, fileName);
          await fs.writeFile(filePath, code);
          // Compile C
          await this.executeCommand('gcc', ['-o', execPath, filePath], timeLimit);
          break;
        default:
          throw new Error(`Unsupported language: ${language}`);
      }

      // Execute against test cases
      for (const testCase of testCases) {
        const startTime = Date.now();
        
        try {
          let command, args;
          switch (language) {
            case 'javascript':
              command = 'node';
              args = [filePath];
              break;
            case 'python':
              command = 'python3';
              args = [filePath];
              break;
            case 'java':
              command = 'java';
              args = ['-cp', this.tempDir, fileName];
              break;
            case 'cpp':
            case 'c':
              command = execPath;
              args = [];
              break;
          }

          const output = await this.executeCommand(command, args, timeLimit, testCase.input);
          const executionTime = Date.now() - startTime;
          
          const testResult = {
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: output.trim(),
            passed: output.trim() === testCase.expectedOutput.trim(),
            executionTime,
            memoryUsed: 0 // Local execution doesn't measure memory
          };

          results.testResults.push(testResult);
          if (testResult.passed) results.passedTestCases++;
          results.executionTime = Math.max(results.executionTime, executionTime);
        } catch (error) {
          const testResult = {
            input: testCase.input,
            expectedOutput: testCase.expectedOutput,
            actualOutput: '',
            passed: false,
            executionTime: Date.now() - startTime,
            memoryUsed: 0
          };
          results.testResults.push(testResult);
          
          if (error.message.includes('timeout')) {
            results.status = 'time_limit_exceeded';
          } else {
            results.status = 'runtime_error';
            results.errorMessage = error.message;
          }
        }
      }

      // Determine overall status
      if (results.status === 'pending') {
        if (results.passedTestCases === testCases.length) {
          results.status = 'accepted';
        } else {
          results.status = 'wrong_answer';
        }
      }

      return results;
    } finally {
      // Cleanup temp files
      try {
        if (filePath) await fs.unlink(filePath);
        if (execPath) await fs.unlink(execPath);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }

  executeCommand(command, args, timeLimit, input = '') {
    return new Promise((resolve, reject) => {
      const process = spawn(command, args);
      let stdout = '';
      let stderr = '';

      const timer = setTimeout(() => {
        process.kill();
        reject(new Error('Time limit exceeded'));
      }, timeLimit);

      process.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      process.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      process.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(stderr || `Process exited with code ${code}`));
        }
      });

      process.on('error', (error) => {
        clearTimeout(timer);
        reject(error);
      });

      if (input) {
        process.stdin.write(input);
        process.stdin.end();
      }
    });
  }
}

module.exports = new CodeExecutionService();