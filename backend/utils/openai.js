const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateProblemPrompt = (difficulty, topics) => {
  return `Create a coding problem with the following specifications:
- Difficulty: ${difficulty}
- Topics: ${topics.join(', ')}

Please provide the response in the following JSON format:
{
  "title": "Problem title",
  "description": "Detailed problem description including the task, constraints, and examples",
  "inputFormat": "Description of input format",
  "outputFormat": "Description of output format",
  "constraints": "List of constraints",
  "sampleTestCases": [
    {
      "input": "Sample input",
      "output": "Expected output",
      "explanation": "Explanation of the test case"
    }
  ],
  "hiddenTestCases": [
    {
      "input": "Hidden test input",
      "output": "Expected output"
    }
  ],
  "timeLimit": "Time limit in milliseconds",
  "memoryLimit": "Memory limit in MB",
  "difficulty": "${difficulty}",
  "topics": ${JSON.stringify(topics)},
  "hints": ["Hint 1", "Hint 2"]
}`;
};

const generateProblem = async (difficulty, topics) => {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert competitive programming problem setter. Create challenging but fair problems that test algorithmic and problem-solving skills."
        },
        {
          role: "user",
          content: generateProblemPrompt(difficulty, topics)
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    const problemData = JSON.parse(completion.choices[0].message.content);
    return problemData;
  } catch (error) {
    console.error('Error generating problem with OpenAI:', error);
    throw error;
  }
};

const generateSolution = async (problem, language) => {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert programmer. Provide efficient and well-commented solutions to coding problems."
        },
        {
          role: "user",
          content: `Write a solution for the following problem in ${language}:
          
Problem: ${problem.title}
Description: ${problem.description}
Input Format: ${problem.inputFormat}
Output Format: ${problem.outputFormat}
Constraints: ${problem.constraints}

Please provide a well-commented, efficient solution that handles all the test cases.`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return {
      language,
      code: completion.choices[0].message.content,
      timeComplexity: "O(n)", // This should be analyzed based on the solution
      spaceComplexity: "O(n)" // This should be analyzed based on the solution
    };
  } catch (error) {
    console.error('Error generating solution with OpenAI:', error);
    throw error;
  }
};

module.exports = {
  generateProblem,
  generateSolution
}; 