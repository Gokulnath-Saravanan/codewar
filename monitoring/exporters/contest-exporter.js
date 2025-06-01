const express = require('express');
const prometheus = require('prom-client');
const mongoose = require('mongoose');

// Initialize Express app
const app = express();
const port = process.env.METRICS_PORT || 9090;

// Initialize Prometheus metrics
const register = new prometheus.Registry();
prometheus.collectDefaultMetrics({ register });

// Define custom metrics
const activeParticipants = new prometheus.Gauge({
  name: 'contest_active_participants',
  help: 'Number of active participants in the contest',
  labelNames: ['contest_id']
});

const submissionsTotal = new prometheus.Counter({
  name: 'contest_submissions_total',
  help: 'Total number of contest submissions',
  labelNames: ['contest_id', 'status']
});

const submissionDuration = new prometheus.Histogram({
  name: 'contest_submission_duration_seconds',
  help: 'Duration of submission evaluations',
  labelNames: ['contest_id'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

const averageScore = new prometheus.Gauge({
  name: 'contest_average_score',
  help: 'Average score of all participants',
  labelNames: ['contest_id']
});

const participantsByCountry = new prometheus.Gauge({
  name: 'contest_participants_by_country',
  help: 'Number of participants by country',
  labelNames: ['contest_id', 'country']
});

// Register custom metrics
register.registerMetric(activeParticipants);
register.registerMetric(submissionsTotal);
register.registerMetric(submissionDuration);
register.registerMetric(averageScore);
register.registerMetric(participantsByCountry);

// Database schemas
const submissionSchema = new mongoose.Schema({
  contestId: String,
  userId: String,
  status: String,
  score: Number,
  duration: Number,
  createdAt: Date
});

const userSchema = new mongoose.Schema({
  country: String,
  lastActive: Date
});

const Submission = mongoose.model('Submission', submissionSchema);
const User = mongoose.model('User', userSchema);

// Function to update metrics
async function updateMetrics() {
  try {
    // Get active contests
    const activeContests = await mongoose.connection.db
      .collection('contests')
      .find({ status: 'active' })
      .toArray();

    for (const contest of activeContests) {
      const contestId = contest._id.toString();

      // Update active participants
      const activeUsers = await User.countDocuments({
        lastActive: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // Active in last 30 minutes
      });
      activeParticipants.set({ contest_id: contestId }, activeUsers);

      // Update submissions metrics
      const submissions = await Submission.find({ contestId });
      const submissionStatuses = await Submission.aggregate([
        { $match: { contestId } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      submissionStatuses.forEach(({ _id: status, count }) => {
        submissionsTotal.labels(contestId, status).inc(count);
      });

      // Update average score
      const avgScore = await Submission.aggregate([
        { $match: { contestId } },
        { $group: { _id: null, avg: { $avg: '$score' } } }
      ]);
      if (avgScore.length > 0) {
        averageScore.set({ contest_id: contestId }, avgScore[0].avg);
      }

      // Update participants by country
      const participantCountries = await User.aggregate([
        { $group: { _id: '$country', count: { $sum: 1 } } }
      ]);
      participantCountries.forEach(({ _id: country, count }) => {
        participantsByCountry.set({ contest_id: contestId, country }, count);
      });

      // Update submission duration metrics
      submissions.forEach(submission => {
        if (submission.duration) {
          submissionDuration.observe({ contest_id: contestId }, submission.duration);
        }
      });
    }
  } catch (error) {
    console.error('Error updating metrics:', error);
  }
}

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
  
  // Update metrics every minute
  setInterval(updateMetrics, 60 * 1000);
  
  // Initial metrics update
  updateMetrics();
}).catch(error => {
  console.error('MongoDB connection error:', error);
  process.exit(1);
});

// Metrics endpoint
app.get('/contest/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    res.status(500).end(error.message);
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Contest metrics exporter listening on port ${port}`);
}); 