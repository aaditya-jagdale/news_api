import express from 'express';
import newsRoutes from './routes/newsRoutes.js';
import { errorHandler } from './utils/errorHandler.js';
import cron from 'node-cron';
import { runRedditTasks, runProductHuntTasks } from '../src/services/taskrunner.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/api', newsRoutes);
app.use(errorHandler);

// Calculate next execution time for Reddit tasks
const getNextExecutionTime = (hours) => {
  const now = new Date();
  return new Date(now.getTime() + hours * 60 * 60 * 1000).toLocaleString();
};

// Initial runs
// console.log('Executing initial Reddit tasks...');
// runRedditTasks(getNextExecutionTime(4));

// console.log('Executing initial Product Hunt tasks...');
// runProductHuntTasks(getNextExecutionTime(24));

// Schedule Reddit tasks - every 4 hours
cron.schedule('0 */4 * * *', async () => {
  console.log('Executing scheduled Reddit tasks...');
  await runRedditTasks(getNextExecutionTime(4));
});

// Schedule Product Hunt tasks - daily at midnight
cron.schedule('0 0 * * *', async () => {
  console.log('Executing scheduled Product Hunt tasks...');
  await runProductHuntTasks(getNextExecutionTime(24));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
