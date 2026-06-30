const { Client } = require('pg');

const connectionString = 'postgresql://postgres.rkdqgyolxhunpbnrqhis:Shivam%404881@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres';

async function run() {
  const client = new Client({ connectionString });
  try {
    await client.connect();
    console.log('Connected to database to fix permissions');
    
    const sql = `
      GRANT USAGE ON SCHEMA public TO anon, authenticated;
      GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated;
      GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
    `;
    
    await client.query(sql);
    console.log('Successfully granted permissions to anon and authenticated roles.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

run();
