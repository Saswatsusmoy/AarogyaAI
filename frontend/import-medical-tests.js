const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function importMedicalTests() {
  try {
    console.log('🔄 Starting medical tests import...');
    
    // Check if database is accessible
    await prisma.$connect();
    console.log('✅ Connected to database');
    
    // Check if MedicalTests table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'MedicalTests'
      );
    `;
    
    if (!tableExists[0].exists) {
      console.log('❌ MedicalTests table does not exist. Please run "npx prisma db push" first.');
      return;
    }
    
    console.log('✅ MedicalTests table exists');
    
    // Read the JSON file from parent directory
    const fs = require('fs');
    const path = require('path');
    const parentDir = path.join(__dirname, '..');
    
    // Look for JSON files in the parent directory
    const jsonFiles = fs.readdirSync(parentDir).filter(file => file.endsWith('.json'));
    
    if (jsonFiles.length === 0) {
      console.log('❌ No JSON files found in the parent directory');
      console.log('Please place your JSON file in the project root directory and run this script again');
      return;
    }
    
    console.log('📁 Found JSON files:', jsonFiles);
    
    // Use the first JSON file found (you can modify this to specify a particular file)
    const jsonFile = jsonFiles[0];
    const jsonPath = path.join(parentDir, jsonFile);
    console.log(`📖 Reading from: ${jsonPath}`);
    
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Handle different JSON structures
    let medicalTests = [];
    
    if (Array.isArray(jsonData)) {
      // If JSON is directly an array
      medicalTests = jsonData;
    } else if (jsonData.tests && Array.isArray(jsonData.tests)) {
      // If JSON has a 'tests' property
      medicalTests = jsonData.tests;
    } else if (jsonData.medicalTests && Array.isArray(jsonData.medicalTests)) {
      // If JSON has a 'medicalTests' property
      medicalTests = jsonData.medicalTests;
    } else {
      console.log('❌ JSON structure not recognized. Expected format:');
      console.log('   Option 1: [{"TestName": "Test 1"}, {"TestName": "Test 2"}]');
      console.log('   Option 2: {"tests": [{"TestName": "Test 1"}]}');
      console.log('   Option 3: {"medicalTests": [{"TestName": "Test 1"}]}');
      console.log('   Actual structure:', Object.keys(jsonData));
      return;
    }
    
    console.log(`📊 Found ${medicalTests.length} medical tests to import`);
    
    // Clear existing data (optional - remove this if you want to keep existing data)
    console.log('🗑️  Clearing existing medical tests...');
    await prisma.medicalTests.deleteMany({});
    console.log('✅ Existing data cleared');
    
    // Import the data
    console.log('📥 Importing medical tests...');
    
    for (let i = 0; i < medicalTests.length; i++) {
      const test = medicalTests[i];
      
      // Handle different property names
      const testName = test.TestName || test.testName || test.name || test.Name;
      
      if (!testName) {
        console.log(`⚠️  Skipping item ${i + 1}: No test name found`);
        continue;
      }
      
      try {
        await prisma.medicalTests.create({
          data: {
            TestName: testName
          }
        });
        console.log(`✅ Imported: ${testName}`);
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⚠️  Skipped (duplicate): ${testName}`);
        } else {
          console.log(`❌ Error importing ${testName}:`, error.message);
        }
      }
    }
    
    // Verify import
    const count = await prisma.medicalTests.count();
    console.log(`🎉 Import completed! Total medical tests in database: ${count}`);
    
  } catch (error) {
    console.error('❌ Error during import:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importMedicalTests()
  .then(() => {
    console.log('✅ Import script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Import failed:', error);
    process.exit(1);
  });
