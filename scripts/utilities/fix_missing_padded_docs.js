const { db } = require('../config/firebase');
const readingScheduleData = require('../nt_reading_schedule_crossbook.json');

async function fixMissingPaddedDocs() {
  try {
    console.log('Fixing missing zero-padded documents in bellevueYPNT template...\n');
    
    // Step 1: Check which documents are missing
    console.log('Step 1: Checking for missing documents...');
    
    const currentSnapshot = await db
      .collection('readingTemplates')
      .doc('bellevueYPNT')
      .collection('dailyReadings')
      .get();
    
    const existingIds = new Set(currentSnapshot.docs.map(doc => doc.id));
    console.log(`✓ Found ${currentSnapshot.size} existing documents`);
    
    const missing = [];
    for (let i = 1; i <= 299; i++) {
      const paddedId = String(i).padStart(3, '0');
      if (!existingIds.has(paddedId)) {
        missing.push(i);
      }
    }
    
    console.log(`✓ Found ${missing.length} missing documents: ${missing.slice(0, 10).join(', ')}${missing.length > 10 ? '...' : ''}`);
    
    if (missing.length === 0) {
      console.log('✅ All documents are present!');
      return;
    }
    
    // Step 2: Create missing documents from original data
    console.log('\nStep 2: Creating missing documents from original data...');
    
    const batchSize = 500;
    let batch = db.batch();
    let batchCount = 0;
    let createdCount = 0;
    
    for (const dayNum of missing) {
      // Find the corresponding data from the original schedule
      const dayData = readingScheduleData.find(d => d.dayNumber === dayNum);
      
      if (!dayData) {
        console.error(`❌ Could not find data for day ${dayNum}`);
        continue;
      }
      
      const paddedId = String(dayNum).padStart(3, '0');
      const docRef = db
        .collection('readingTemplates')
        .doc('bellevueYPNT')
        .collection('dailyReadings')
        .doc(paddedId);
      
      // Create clean template data (no date fields)
      const templateData = {
        startBookName: dayData.startBookName,
        startBookId: dayData.startBookId,
        endBookName: dayData.endBookName,
        endBookId: dayData.endBookId,
        portions: dayData.portions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Keep rawReading if it exists
      if (dayData.rawReading) {
        templateData.rawReading = dayData.rawReading;
      }
      
      batch.set(docRef, templateData);
      batchCount++;
      createdCount++;
      
      if (batchCount >= batchSize) {
        await batch.commit();
        console.log(`✓ Created batch of ${batchCount} missing documents`);
        batch = db.batch();
        batchCount = 0;
      }
    }
    
    // Commit final batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`✓ Created final batch of ${batchCount} missing documents`);
    }
    
    console.log(`✅ Created ${createdCount} missing documents`);
    
    // Step 3: Verify all documents are now present
    console.log('\nStep 3: Verifying complete template...');
    
    const finalSnapshot = await db
      .collection('readingTemplates')
      .doc('bellevueYPNT')
      .collection('dailyReadings')
      .get();
    
    console.log(`✓ Template now has ${finalSnapshot.size} total documents`);
    
    // Check for any still missing
    const finalIds = new Set(finalSnapshot.docs.map(doc => doc.id));
    const stillMissing = [];
    for (let i = 1; i <= 299; i++) {
      const paddedId = String(i).padStart(3, '0');
      if (!finalIds.has(paddedId)) {
        stillMissing.push(paddedId);
      }
    }
    
    if (stillMissing.length > 0) {
      console.error(`❌ Still missing ${stillMissing.length} documents:`, stillMissing.slice(0, 10));
    } else {
      console.log('✅ All 299 documents are now present!');
    }
    
    // Test sorting
    const sortedIds = Array.from(finalIds).sort();
    console.log('\n✓ Natural sorting verification:');
    console.log(`  First 10: ${sortedIds.slice(0, 10).join(', ')}`);
    console.log(`  Around 100: ${sortedIds.slice(98, 103).join(', ')}`);
    console.log(`  Last 5: ${sortedIds.slice(-5).join(', ')}`);
    
    console.log('\n🎉 Successfully fixed all missing zero-padded documents!');
    
  } catch (error) {
    console.error('❌ Error fixing missing documents:', error);
    throw error;
  }
}

if (require.main === module) {
  fixMissingPaddedDocs()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fix failed:', error);
      process.exit(1);
    });
}

module.exports = { fixMissingPaddedDocs };