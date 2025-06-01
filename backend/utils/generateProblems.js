// backend/utils/generateProblems.js
const { generateProblem } = require('../services/aiService');
const cron = require('node-cron');
const Problem = require('../models/Problem');

// Problem templates for different categories
const problemTemplates = {
  arrays: [
    {
      title: "Find Maximum Element",
      description: "Given an array of integers, find the maximum element.",
      difficulty: "easy",
      category: "Arrays",
      template: "function findMax(arr) {\n  // Your code here\n}"
    },
    {
      title: "Two Sum",
      description: "Given an array of integers and a target sum, find two numbers that add up to the target.",
      difficulty: "medium",
      category: "Arrays",
      template: "function twoSum(nums, target) {\n  // Your code here\n}"
    }
  ],
  strings: [
    {
      title: "Reverse String",
      description: "Write a function to reverse a string.",
      difficulty: "easy",
      category: "Strings",
      template: "function reverseString(s) {\n  // Your code here\n}"
    },
    {
      title: "Valid Palindrome",
      description: "Check if a string is a valid palindrome, considering only alphanumeric characters.",
      difficulty: "medium",
      category: "Strings",
      template: "function isPalindrome(s) {\n  // Your code here\n}"
    }
  ],
  algorithms: [
    {
      title: "Binary Search",
      description: "Implement binary search algorithm to find target in sorted array.",
      difficulty: "medium",
      category: "Algorithms",
      template: "function binarySearch(nums, target) {\n  // Your code here\n}"
    },
    {
      title: "Fibonacci Sequence",
      description: "Calculate the nth Fibonacci number.",
      difficulty: "easy",
      category: "Algorithms",
      template: "function fibonacci(n) {\n  // Your code here\n}"
    }
  ]
};

// Generate test cases based on problem type
const generateTestCases = (problemType, difficulty) => {
  const testCases = [];
  
  switch (problemType) {
    case 'findMax':
      testCases.push(
        { input: "[1, 3, 2, 8, 5]", output: "8" },
        { input: "[-1, -3, -2, -8, -5]", output: "-1" },
        { input: "[42]", output: "42" }
      );
      break;
      
    case 'twoSum':
      testCases.push(
        { input: "[2, 7, 11, 15], 9", output: "[0, 1]" },
        { input: "[3, 2, 4], 6", output: "[1, 2]" },
        { input: "[3, 3], 6", output: "[0, 1]" }
      );
      break;
      
    case 'reverseString':
      testCases.push(
        { input: "\"hello\"", output: "\"olleh\"" },
        { input: "\"world\"", output: "\"dlrow\"" },
        { input: "\"a\"", output: "\"a\"" }
      );
      break;
      
    case 'isPalindrome':
      testCases.push(
        { input: "\"A man a plan a canal Panama\"", output: "true" },
        { input: "\"race a car\"", output: "false" },
        { input: "\"\"", output: "true" }
      );
      break;
      
    case 'binarySearch':
      testCases.push(
        { input: "[-1,0,3,5,9,12], 9", output: "4" },
        { input: "[-1,0,3,5,9,12], 2", output: "-1" },
        { input: "[5], 5", output: "0" }
      );
      break;
      
    case 'fibonacci':
      testCases.push(
        { input: "2", output: "1" },
        { input: "3", output: "2" },
        { input: "4", output: "3" }
      );
      break;
      
    default:
      // Generate generic test cases
      testCases.push(
        { input: "1", output: "1" },
        { input: "2", output: "2" },
        { input: "3", output: "3" }
      );
  }
  
  return testCases;
};

// Generate random problem from templates
const generateRandomProblem = async (difficulty) => {
  const topics = ['arrays', 'strings', 'dynamic-programming', 'trees', 'graphs'];
  const randomTopics = topics
    .sort(() => 0.5 - Math.random())
    .slice(0, 2);

  const problem = new Problem({
    title: `Daily ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Problem`,
    description: `This is a daily ${difficulty} level problem focusing on ${randomTopics.join(', ')}.`,
    difficulty,
    topics: randomTopics,
    constraints: {
      timeLimit: 1000,
      memoryLimit: 256,
      inputFormat: 'Standard Input',
      outputFormat: 'Standard Output',
      sampleTestCases: [
        {
          input: 'Example input',
          output: 'Example output',
          explanation: 'Explanation of the example'
        }
      ]
    },
    testCases: [
      {
        input: 'Hidden test case input',
        output: 'Hidden test case output',
        isHidden: true
      }
    ],
    isDailyChallenge: true,
    dailyChallengeDate: new Date()
  });

  await problem.save();
  return problem;
};

// Generate problem for specific category and difficulty
const generateProblemByCategory = (category, difficulty) => {
  if (!problemTemplates[category]) {
    throw new Error(`Category ${category} not found`);
  }
  
  const problems = problemTemplates[category].filter(p => p.difficulty === difficulty);
  if (problems.length === 0) {
    throw new Error(`No problems found for category ${category} with difficulty ${difficulty}`);
  }
  
  const randomProblem = problems[Math.floor(Math.random() * problems.length)];
  
  return {
    ...randomProblem,
    testCases: generateTestCases(randomProblem.title.toLowerCase().replace(/\s+/g, ''), difficulty),
    timeLimit: difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 5,
    memoryLimit: 128,
    points: difficulty === 'easy' ? 100 : difficulty === 'medium' ? 200 : 300,
    tags: [category.toLowerCase()],
    createdBy: 'system'
  };
};

// Generate daily challenge problem
const generateDailyChallenge = async () => {
  try {
    console.log('Generating daily problems...');
    
    // Remove old daily challenges that are more than 7 days old
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    await Problem.deleteMany({
      isDailyChallenge: true,
      dailyChallengeDate: { $lt: oneWeekAgo }
    });

    // Generate one problem for each difficulty level
    const difficulties = ['easy', 'medium', 'hard'];
    const problems = [];

    for (const difficulty of difficulties) {
      const problem = await generateRandomProblem(difficulty);
      problems.push(problem);
    }

    console.log('Daily problems generated successfully:', problems.map(p => p.title));
    return problems;
  } catch (error) {
    console.error('Error generating daily problems:', error);
    throw error;
  }
};

// Generate contest problems
const generateContestProblems = async (count = 5, difficulties = ['easy', 'medium', 'hard']) => {
  const problems = [];
  const categories = Object.keys(problemTemplates);
  
  for (let i = 0; i < count; i++) {
    const difficulty = difficulties[i % difficulties.length];
    const category = categories[i % categories.length];
    
    try {
      const problem = generateProblemByCategory(category, difficulty);
      problems.push({
        ...problem,
        order: i + 1,
        contestProblem: true
      });
    } catch (error) {
      // Fallback to random problem
      problems.push({
        ...generateRandomProblem(),
        order: i + 1,
        contestProblem: true
      });
    }
  }
  
  return problems;
};

// Generate problem hints
const generateHints = (problemTitle, difficulty) => {
  const hints = [];
  
  switch (problemTitle.toLowerCase()) {
    case 'find maximum element':
      hints.push("Think about iterating through the array once");
      hints.push("Keep track of the maximum value seen so far");
      if (difficulty !== 'easy') {
        hints.push("Consider edge cases like empty arrays");
      }
      break;
      
    case 'two sum':
      hints.push("Consider using a hash map to store visited numbers");
      hints.push("For each number, check if its complement exists");
      hints.push("The complement is target minus current number");
      break;
      
    case 'reverse string':
      hints.push("You can use built-in string methods");
      hints.push("Or implement it manually with two pointers");
      break;
      
    case 'valid palindrome':
      hints.push("Convert to lowercase and remove non-alphanumeric characters");
      hints.push("Use two pointers from start and end");
      break;
      
    case 'binary search':
      hints.push("Array is already sorted");
      hints.push("Compare target with middle element");
      hints.push("Eliminate half of the search space each time");
      break;
      
    case 'fibonacci sequence':
      hints.push("Base cases: F(0) = 0, F(1) = 1");
      hints.push("Each number is sum of two preceding ones");
      if (difficulty !== 'easy') {
        hints.push("Consider iterative approach for better space complexity");
      }
      break;
      
    default:
      hints.push("Read the problem statement carefully");
      hints.push("Think about the algorithm step by step");
      hints.push("Consider edge cases");
  }
  
  return hints;
};

// Validate generated problem
const validateProblem = (problem) => {
  const required = ['title', 'description', 'difficulty', 'testCases'];
  const missing = required.filter(field => !problem[field]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
  
  if (!['easy', 'medium', 'hard'].includes(problem.difficulty)) {
    throw new Error('Invalid difficulty level');
  }
  
  if (!Array.isArray(problem.testCases) || problem.testCases.length === 0) {
    throw new Error('Test cases must be a non-empty array');
  }
  
  return true;
};

// Schedule daily problem generation at midnight
const scheduleDailyProblemGeneration = () => {
  // Run at 00:00 (midnight) every day
  cron.schedule('0 0 * * *', async () => {
    try {
      await generateDailyChallenge();
    } catch (error) {
      console.error('Error in scheduled daily problem generation:', error);
    }
  });
};

module.exports = {
  generateRandomProblem,
  generateProblemByCategory,
  generateDailyChallenge,
  generateContestProblems,
  generateTestCases,
  generateHints,
  validateProblem,
  problemTemplates,
  scheduleDailyProblemGeneration
};