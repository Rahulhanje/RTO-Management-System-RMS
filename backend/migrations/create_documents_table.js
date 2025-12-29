const { Pool } = require('pg');
require('dotenv').config();

// Allow self-signed certificates
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('sslmode=require') 
    ? { rejectUnauthorized: false } 
    : false
});

async function createDocumentsTable() {
  const client = await pool.connect();
  try {
    console.log('🔄 Creating documents table...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        entity_type VARCHAR(50) NOT NULL,
        entity_id UUID NOT NULL,
        document_type VARCHAR(50) NOT NULL,
        file_path TEXT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        size INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'PENDING',
        verified_by UUID REFERENCES users(id),
        verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('✅ Documents table created successfully!');
    
    // Create indexes for better performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
      CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
    `);
    
    console.log('✅ Indexes created successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createDocumentsTable();
