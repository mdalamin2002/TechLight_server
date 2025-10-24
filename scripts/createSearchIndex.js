/**
 * Migration Script: Create MongoDB Text Search Index
 * Run this once to optimize product search performance
 * 
 * Usage:
 *   node scripts/createSearchIndex.js
 */

const { createSearchIndex } = require('../controllers/productControllers/searchController');
const { client } = require('../config/mongoDB');

async function runMigration() {
  try {
    console.log('Starting search index creation...\n');
    
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB\n');
    
    // Create search index
    await createSearchIndex();
    
    console.log('\n Migration completed successfully!');
    console.log(' Search functionality is now optimized.\n');
    
  } catch (error) {
    console.error(' Migration failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    // Close connection
    await client.close();
    console.log(' Database connection closed.\n');
    process.exit(0);
  }
}

// Run migration
runMigration();
