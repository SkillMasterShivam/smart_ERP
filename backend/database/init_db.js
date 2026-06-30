const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// URL encode the password to handle special characters like '@'
const connectionString = 'postgresql://postgres.rkdqgyolxhunpbnrqhis:Shivam%404881@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres';

async function run() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to database');
    
    const files = [
      '01_init_users.sql',
      '02_init_companies.sql',
      '03_init_ledgers.sql',
      '04_init_groups.sql',
      '05_init_inventory.sql'
    ];

    for (const file of files) {
      const filePath = path.join(__dirname, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      console.log(`Executing ${file}...`);
      await client.query(sql);
      console.log(`Successfully executed ${file}`);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

run();
