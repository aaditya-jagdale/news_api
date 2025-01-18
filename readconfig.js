import fs from 'fs';
import { exec } from 'child_process';

// Directly specify the absolute path to your config.json
const configPath = 'D:/news-api/news_api/config.json';

// Read config.json
try {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  console.log('Config loaded successfully:', config);

  // Set environment variables based on config.json
  process.env.MY_VARIABLE = config.myVariable;  // Example

} catch (error) {
  console.error('Error reading config:', error);
}
