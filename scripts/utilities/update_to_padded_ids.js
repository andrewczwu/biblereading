const { db } = require('../config/firebase');

async function updateToPaddedIds() {
  try {
    console.log('Updating bellevueYPNT template to use zero-padded document IDs...\n');
    console.log('Converting: 1, 2, 3... → 001, 002, 003...\n');
    
    // Step 1: Get all current documents
    console.log('Step 1: Reading current documents with integer IDs...');
    
    const dailyReadingsSnapshot = await db
      .collection('readingTemplates')
      .doc('bellevueYPNT')
      .collection('dailyReadings')
      .get();
    
    console.log(`✓ Found ${dailyReadingsSnapshot.size} documents to update`);
    
    // Sort documents by their numeric ID to maintain order
    const sortedDocs = dailyReadingsSnapshot.docs.sort((a, b) => {
      return parseInt(a.id) - parseInt(b.id);
    });
    
    console.log(`✓ Sorted documents from ${sortedDocs[0].id} to ${sortedDocs[sortedDocs.length - 1].id}`);
    
    // Step 2: Create new documents with zero-padded IDs
    console.log('\nStep 2: Creating documents with zero-padded IDs...');
    
    const batchSize = 500;
    let batch = db.batch();
    let batchCount = 0;
    let processedCount = 0;
    
    for (const doc of sortedDocs) {
      const data = doc.data();
      const dayNumber = parseInt(doc.id);
      const paddedId = String(dayNumber).padStart(3, '0'); // 001, 002, 003...
      
      // Create new document with padded ID
      const newDocRef = db
        .collection('readingTemplates')
        .doc('bellevueYPNT')
        .collection('dailyReadings')
        .doc(paddedId);
      
      // Copy data with updated timestamp
      const updatedData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      
      batch.set(newDocRef, updatedData);
      batchCount++;
      processedCount++;
      
      if (batchCount >= batchSize) {
        await batch.commit();
        console.log(`✓ Created batch of ${batchCount} zero-padded documents`);
        batch = db.batch();
        batchCount = 0;
      }
    }
    
    // Commit final batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`✓ Created final batch of ${batchCount} zero-padded documents`);
    }
    
    console.log(`✅ Created ${processedCount} documents with zero-padded IDs`);
    
    // Step 3: Delete old documents with integer IDs
    console.log('\nStep 3: Deleting old integer ID documents...');
    
    let deleteBatch = db.batch();
    let deleteCount = 0;
    
    for (const doc of sortedDocs) {
      deleteBatch.delete(doc.ref);
      deleteCount++;
      
      if (deleteCount >= batchSize) {
        await deleteBatch.commit();
        console.log(`✓ Deleted batch of ${deleteCount} old documents`);
        deleteBatch = db.batch();
        deleteCount = 0;
      }
    }
    
    // Commit final delete batch
    if (deleteCount > 0) {
      await deleteBatch.commit();
      console.log(`✓ Deleted final batch of ${deleteCount} old documents`);
    }
    
    // Step 4: Verify new structure and sorting
    console.log('\nStep 4: Verifying zero-padded structure and sorting...');
    
    const newReadingsSnapshot = await db
      .collection('readingTemplates')
      .doc('bellevueYPNT')
      .collection('dailyReadings')
      .get();
    
    console.log(`✓ Template now has ${newReadingsSnapshot.size} documents with zero-padded IDs`);
    
    // Test natural sorting by getting first few documents
    const firstFewDocs = await db
      .collection('readingTemplates')
      .doc('bellevueYPNT')
      .collection('dailyReadings')
      .limit(5)
      .get();
    
    console.log('\n✓ First 5 documents (natural sort order):');
    firstFewDocs.forEach(doc => {
      const data = doc.data();
      console.log(`  ${doc.id}: ${data.rawReading || `${data.startBookName} → ${data.endBookName}`}`);
    });
    
    // Test some specific documents
    const testDocs = ['001', '010', '100', '299'];
    console.log('\n✓ Sample zero-padded documents:');
    
    for (const docId of testDocs) {
      const doc = await db
        .collection('readingTemplates')
        .doc('bellevueYPNT')
        .collection('dailyReadings')
        .doc(docId)
        .get();
      
      if (doc.exists) {
        const data = doc.data();
        console.log(`  ${docId}: ${data.rawReading || `${data.startBookName} → ${data.endBookName}`}`);
      }
    }
    
    console.log('\n🎉 Successfully updated to zero-padded document IDs!');
    console.log('📋 Documents now sort naturally: 001, 002, 003... 010, 011... 100, 101... 299');
    
  } catch (error) {
    console.error('❌ Error updating to padded IDs:', error);
    throw error;
  }
}

if (require.main === module) {
  updateToPaddedIds()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Padded ID update failed:', error);
      process.exit(1);
    });
}

module.exports = { updateToPaddedIds };