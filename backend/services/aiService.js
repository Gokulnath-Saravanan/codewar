const OpenAI = require('openai');
const Problem = require('../models/Problem');

class AIService {
  constructor() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async generateDailyProblem() {
    if (!this.openai) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const difficulties = ['easy', 'medium', 'hard'];
      const categories = ['Array', 'String', 'Dynamic Programming', 'Graph', 'Tree', 'Math'];
      
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];

      const prompt = `Generate a coding problem with the following specifications:
      - Difficulty: ${difficulty}
      - Category: ${category}
      - Include a clear problem statement
      - Provide 3-5 test cases with inputs and expected outputs
      - Add constraints and examples
      - Make it suitable for a coding contest

      Format the response as JSON with the following structure:
      {
        "title": "Problem Title",
        "description": "Detailed problem description",
        "difficulty": "${difficulty}",
        "category": "${category}",
        "constraints": "List of constraints",
        "examples": [
          {
            "input": "sample input",
            "output": "expected output",
            "explanation": "explanation of the example"
          }
        ],
        "testCases": [
          {
            "input": "test input",
            "expectedOutput": "expected output",
            "isHidden": false
          }
        ],
        "hints": ["hint1", "hint2"],
        "tags": ["tag1", "tag2"]
      }`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an expert coding problem creator. Generate high-quality programming problems suitable for coding contests."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      const problemData = JSON.parse(response.choices[0].message.content);
      
      // Add metadata
      problemData.aiGenerated = true;
      problemData.points = difficulty === 'easy' ? 100 : difficulty === 'medium' ? 200 : 300;
      problemData.timeLimit = 2000;
      problemData.memoryLimit = 128;

      return problemData;
    } catch (error) {
      console.error('AI problem generation error:', error);
      throw new Error('Failed to generate problem using AI');
    }
  }

  async createDailyProblem(adminUserId) {
    try {
      const problemData = await this.generateDailyProblem();
      problemData.createdBy = adminUserId;

      const problem = new Problem(problemData);
      await problem.save();

      return problem;
    } catch (error) {
      console.error('Create daily problem error:', error);
      throw error;
    }
  }

  async generateMultipleProblems(count = 1, adminUserId) {
    const problems = [];
    
    for (let i = 0; i < count; i++) {
      try {
        const problem = await this.createDailyProblem(adminUserId);
        problems.push(problem);
        
        // Add delay to avoid rate limiting
        if (i < count - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error generating problem ${i + 1}:`, error);
      }
    }

    return problems;
  }
}

module.exports = new AIService();