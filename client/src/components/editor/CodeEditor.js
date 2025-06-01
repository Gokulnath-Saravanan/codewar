    // components/editor/CodeEditor.js
import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Settings } from 'lucide-react';

const CodeEditor = ({ 
  code, 
  language, 
  onChange, 
  onSubmit, 
  loading = false,
  testResults = null 
}) => {
  const [localCode, setLocalCode] = useState(code || '');
  const [fontSize, setFontSize] = useState(14);
  const [theme, setTheme] = useState('light');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setLocalCode(code || '');
  }, [code]);

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setLocalCode(newCode);
    onChange?.(newCode);
  };

  const handleSubmit = () => {
    onSubmit?.(localCode);
  };

  const handleReset = () => {
    const defaultCode = getDefaultCode(language);
    setLocalCode(defaultCode);
    onChange?.(defaultCode);
  };

  const getDefaultCode = (lang) => {
    const templates = {
      python: `def solve():
    # Write your code here
    pass

# Test your solution
if __name__ == "__main__":
    solve()`,
      javascript: `function solve() {
    // Write your code here
}

// Test your solution
solve();`,
      java: `public class Solution {
    public static void main(String[] args) {
        // Write your code here
    }
}`,
      cpp: `#include <iostream>
using namespace std;

int main() {
    // Write your code here
    return 0;
}`,
      c: `#include <stdio.h>

int main() {
    // Write your code here
    return 0;
}`
    };
    return templates[lang] || '// Write your code here';
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Language:</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {language}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
            title="Reset Code"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run & Submit
              </>
            )}
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Font Size:</label>
              <select
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value={12}>12px</option>
                <option value={14}>14px</option>
                <option value={16}>16px</option>
                <option value={18}>18px</option>
                <option value={20}>20px</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Theme:</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Code Editor */}
      <div className="relative">
        <textarea
          value={localCode}
          onChange={handleCodeChange}
          className={`w-full h-96 p-4 font-mono resize-none border-none outline-none ${
            theme === 'dark' 
              ? 'bg-gray-900 text-green-400' 
              : 'bg-white text-gray-900'
          }`}
          style={{ fontSize: `${fontSize}px` }}
          placeholder="Write your code here..."
          spellCheck={false}
        />
        
        {/* Line numbers */}
        <div className={`absolute left-0 top-0 w-12 h-full ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
        } border-r border-gray-300 flex flex-col text-xs text-gray-500 pt-4`}>
          {localCode.split('\n').map((_, index) => (
            <div key={index} className="px-2 leading-6">
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="border-t border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Test Results</h3>
          <div className="space-y-3">
            {testResults.map((result, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  result.passed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Test Case {index + 1}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    result.passed 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {result.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                
                {!result.passed && (
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Expected:</span>
                      <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                        {result.expected}
                      </code>
                    </div>
                    <div>
                      <span className="font-medium">Got:</span>
                      <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                        {result.actual}
                      </code>
                    </div>
                    {result.error && (
                      <div>
                        <span className="font-medium text-red-600">Error:</span>
                        <code className="ml-2 bg-red-100 px-2 py-1 rounded text-red-800">
                          {result.error}
                        </code>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium">
                Overall: {testResults.filter(r => r.passed).length}/{testResults.length} tests passed
              </span>
              {testResults.every(r => r.passed) && (
                <span className="text-green-600 font-medium">All tests passed! 🎉</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;