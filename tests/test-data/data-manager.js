const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

class TestDataManager {
  constructor() {
    this.testData = {
      users: [],
      contests: [],
      submissions: []
    };
  }

  // Initialize test data
  async init() {
    await this.cleanup();
    await this.createUsers();
    await this.createContests();
    await this.createSubmissions();
  }

  // Clean up test data
  async cleanup() {
    await mongoose.connection.dropDatabase();
    this.testData = {
      users: [],
      contests: [],
      submissions: []
    };
  }

  // User data generation
  async createUsers(count = 10) {
    const users = [];
    const hashedPassword = await bcrypt.hash('testPassword123', 10);

    // Create admin user
    users.push({
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      name: 'Admin User',
      country: 'US'
    });

    // Create regular users
    for (let i = 0; i < count - 1; i++) {
      users.push({
        email: faker.internet.email(),
        password: hashedPassword,
        role: 'user',
        name: faker.person.fullName(),
        country: faker.location.countryCode()
      });
    }

    this.testData.users = await mongoose.models.User.insertMany(users);
    return this.testData.users;
  }

  // Contest data generation
  async createContests(count = 5) {
    const contests = [];
    const statuses = ['draft', 'active', 'completed'];
    const difficulties = ['easy', 'medium', 'hard'];

    for (let i = 0; i < count; i++) {
      const startDate = faker.date.future();
      contests.push({
        title: faker.lorem.words(3),
        description: faker.lorem.paragraph(),
        startDate,
        endDate: new Date(startDate.getTime() + 24 * 60 * 60 * 1000),
        status: statuses[i % statuses.length],
        difficulty: difficulties[i % difficulties.length],
        maxParticipants: faker.number.int({ min: 50, max: 200 }),
        problemStatement: {
          description: faker.lorem.paragraphs(2),
          inputFormat: faker.lorem.paragraph(),
          outputFormat: faker.lorem.paragraph(),
          constraints: faker.lorem.lines(3),
          sampleTests: [
            {
              input: '5\n1 2 3 4 5',
              output: '15'
            }
          ],
          timeLimit: 1000,
          memoryLimit: 256
        }
      });
    }

    this.testData.contests = await mongoose.models.Contest.insertMany(contests);
    return this.testData.contests;
  }

  // Submission data generation
  async createSubmissions(count = 20) {
    const submissions = [];
    const languages = ['javascript', 'python', 'java'];
    const statuses = ['pending', 'processing', 'completed', 'error'];

    for (let i = 0; i < count; i++) {
      const user = this.testData.users[i % this.testData.users.length];
      const contest = this.testData.contests[i % this.testData.contests.length];

      submissions.push({
        userId: user._id,
        contestId: contest._id,
        language: languages[i % languages.length],
        code: faker.lorem.lines(5),
        status: statuses[i % statuses.length],
        score: faker.number.int({ min: 0, max: 100 }),
        executionTime: faker.number.int({ min: 100, max: 1000 }),
        memoryUsed: faker.number.int({ min: 1000, max: 10000 }),
        submittedAt: faker.date.recent(),
        testResults: Array.from({ length: 5 }, () => ({
          status: Math.random() > 0.8 ? 'failed' : 'passed',
          executionTime: faker.number.int({ min: 10, max: 100 }),
          memoryUsed: faker.number.int({ min: 1000, max: 5000 }),
          output: faker.lorem.lines(1)
        }))
      });
    }

    this.testData.submissions = await mongoose.models.Submission.insertMany(submissions);
    return this.testData.submissions;
  }

  // Get test data by type and filters
  async getData(type, filters = {}) {
    return this.testData[type].filter(item => {
      return Object.entries(filters).every(([key, value]) => item[key] === value);
    });
  }

  // Get random item from test data
  async getRandomItem(type) {
    const items = this.testData[type];
    return items[Math.floor(Math.random() * items.length)];
  }

  // Create custom test data
  async createCustomData(type, data) {
    const model = mongoose.models[type.charAt(0).toUpperCase() + type.slice(1)];
    const created = await model.create(data);
    this.testData[type].push(created);
    return created;
  }

  // Update test data
  async updateData(type, id, updates) {
    const model = mongoose.models[type.charAt(0).toUpperCase() + type.slice(1)];
    const updated = await model.findByIdAndUpdate(id, updates, { new: true });
    const index = this.testData[type].findIndex(item => item._id.equals(id));
    if (index !== -1) {
      this.testData[type][index] = updated;
    }
    return updated;
  }

  // Delete test data
  async deleteData(type, id) {
    const model = mongoose.models[type.charAt(0).toUpperCase() + type.slice(1)];
    await model.findByIdAndDelete(id);
    this.testData[type] = this.testData[type].filter(item => !item._id.equals(id));
  }

  // Get test data statistics
  getStats() {
    return {
      users: this.testData.users.length,
      contests: this.testData.contests.length,
      submissions: this.testData.submissions.length,
      submissionsPerUser: this.testData.submissions.length / this.testData.users.length,
      submissionsPerContest: this.testData.submissions.length / this.testData.contests.length
    };
  }
}

// Export singleton instance
module.exports = new TestDataManager(); 