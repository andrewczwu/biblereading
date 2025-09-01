const { db } = require('../config/firebase');

async function updateTemplateStructure() {
  try {
    console.log('Updating bellevueYPNT template structure...\n');
    console.log('- Renaming documents from day-001 to integer IDs (1, 2, 3...)');
    console.log('- Removing date, dayNumber, and dayOfWeek fields\n');
    
    // Step 1: Get all current daily readings
    console.log('Step 1: Reading current template structure...');
    
    const dailyReadingsSnapshot = await db
      .collection('readingTemplates')
      .doc('bellevueYPNT')
      .collection('dailyReadings')
      .orderBy('dayNumber')
      .get();
    
    console.log(`✓ Found ${dailyReadingsSnapshot.size} daily readings to update`);
    
    // Step 2: Create new documents with integer IDs and clean data
    console.log('\nStep 2: Creating new documents with integer IDs...');
    
    const batchSize = 500;
    let batch = db.batch();
    let batchCount = 0;
    let processedCount = 0;
    
    for (const doc of dailyReadingsSnapshot.docs) {
      const data = doc.data();
      const dayNumber = data.dayNumber;
      
      // Create new document with integer ID
      const newDocRef = db
        .collection('readingTemplates')
        .doc('bellevueYPNT')
        .collection('dailyReadings')
        .doc(dayNumber.toString());
      
      // Clean the data - remove date fields
      const cleanedData = {
        startBookName: data.startBookName,
        startBookId: data.startBookId,
        endBookName: data.endBookName,
        endBookId: data.endBookId,
        portions: data.portions,
        createdAt: data.createdAt,
        updatedAt: new Date().toISOString()
      };
      
      // Keep rawReading if it exists
      if (data.rawReading) {
        cleanedData.rawReading = data.rawReading;
      }
      
      batch.set(newDocRef, cleanedData);
      batchCount++;
      processedCount++;
      
      if (batchCount >= batchSize) {
        await batch.commit();
        console.log(`✓ Created batch of ${batchCount} new documents`);
        batch = db.batch();
        batchCount = 0;
      }
    }
    
    // Commit final batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`✓ Created final batch of ${batchCount} new documents`);
    }
    
    console.log(`✅ Created ${processedCount} new documents with integer IDs`);
    
    // Step 3: Delete old documents with day-### format
    console.log('\nStep 3: Deleting old documents with day-### format...');
    
    let deleteBatch = db.batch();
    let deleteCount = 0;
    
    for (const doc of dailyReadingsSnapshot.docs) {
      // Only delete if the document ID starts with "day-"
      if (doc.id.startsWith('day-')) {
        deleteBatch.delete(doc.ref);
        deleteCount++;
        
        if (deleteCount >= batchSize) {
          await deleteBatch.commit();
          console.log(`✓ Deleted batch of ${deleteCount} old documents`);
          deleteBatch = db.batch();
          deleteCount = 0;
        }
      }
    }
    
    // Commit final delete batch
    if (deleteCount > 0) {
      await deleteBatch.commit();
      console.log(`✓ Deleted final batch of ${deleteCount} old documents`);
    }
    
    // Step 4: Verify new structure
    console.log('\nStep 4: Verifying new template structure...');
    
    const newReadingsSnapshot = await db
      .collection('readingTemplates')
      .doc('bellevueYPNT')
      .collection('dailyReadings')
      .get();
    
    console.log(`✓ Template now has ${newReadingsSnapshot.size} daily readings with integer IDs`);
    
    // Show some sample documents
    const doc1 = await db.collection('readingTemplates').doc('bellevueYPNT').collection('dailyReadings').doc('1').get();
    const doc2 = await db.collection('readingTemplates').doc('bellevueYPNT').collection('dailyReadings').doc('2').get();
    const doc299 = await db.collection('readingTemplates').doc('bellevueYPNT').collection('dailyReadings').doc('299').get();
    const sampleDocs = { docs: [doc1, doc2, doc299].filter(d => d.exists) };
    
    console.log('\n✓ Sample documents:');
    sampleDocs.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  Document ID: ${doc.id}`);
      console.log(`    Books: ${data.startBookName} → ${data.endBookName}`);
      console.log(`    Portions: ${data.portions.length}`);
      console.log(`    Raw: ${data.rawReading || 'N/A'}`);
      console.log(`    Has date field: ${data.date ? 'YES (ERROR)' : 'NO (CORRECT)'}`);
      console.log(`    Has dayNumber field: ${data.dayNumber ? 'YES (ERROR)' : 'NO (CORRECT)'}`);
      console.log(`    Has dayOfWeek field: ${data.dayOfWeek ? 'YES (ERROR)' : 'NO (CORRECT)'}`);
    });
    
    console.log('\n🎉 Successfully updated bellevueYPNT template structure!');
    console.log('📋 Template now uses integer document IDs and has no date-specific fields');
    
  } catch (error) {
    console.error('❌ Error updating template structure:', error);
    throw error;
  }
}

if (require.main === module) {
  updateTemplateStructure()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Template update failed:', error);
      process.exit(1);
    });
}

module.exports = { updateTemplateStructure };