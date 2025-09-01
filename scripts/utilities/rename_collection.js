const { db } = require('../config/firebase');

async function renameCollection() {
  try {
    console.log('Renaming newtestamentyp collection to newtestamentyporiginal...\n');
    
    // Step 1: Create new collection with original data
    console.log('Step 1: Reading source collection...');
    
    // Get the main document
    const sourceDoc = await db.collection('readingPlans').doc('newtestamentyp').get();
    if (!sourceDoc.exists) {
      throw new Error('Source collection newtestamentyp not found');
    }
    
    const planData = sourceDoc.data();
    console.log('✓ Found source plan document');
    
    // Get all daily readings
    const dailyReadingsSnapshot = await db
      .collection('readingPlans')
      .doc('newtestamentyp')
      .collection('dailyReadings')
      .get();
    
    console.log(`✓ Found ${dailyReadingsSnapshot.size} daily readings to copy`);
    
    // Step 2: Create new collection
    console.log('\nStep 2: Creating newtestamentyporiginal collection...');
    
    // Create the main document with updated timestamps
    await db.collection('readingPlans').doc('newtestamentyporiginal').set({
      ...planData,
      updatedAt: new Date().toISOString()
    });
    console.log('✓ Created newtestamentyporiginal plan document');
    
    // Step 3: Copy all daily readings in batches
    console.log('\nStep 3: Copying daily readings...');
    
    const batchSize = 500;
    let batch = db.batch();
    let batchCount = 0;
    let totalCopied = 0;
    
    for (const doc of dailyReadingsSnapshot.docs) {
      const dayRef = db.collection('readingPlans')
        .doc('newtestamentyporiginal')
        .collection('dailyReadings')
        .doc(doc.id);
      
      batch.set(dayRef, doc.data());
      batchCount++;
      totalCopied++;
      
      if (batchCount >= batchSize) {
        await batch.commit();
        console.log(`✓ Copied batch of ${batchCount} daily readings`);
        batch = db.batch();
        batchCount = 0;
      }
    }
    
    // Commit final batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`✓ Copied final batch of ${batchCount} daily readings`);
    }
    
    console.log(`✅ Successfully copied ${totalCopied} daily readings to newtestamentyporiginal`);
    
    // Step 4: Verify new collection
    console.log('\nStep 4: Verifying new collection...');
    
    const newDoc = await db.collection('readingPlans').doc('newtestamentyporiginal').get();
    const newDailyReadings = await db
      .collection('readingPlans')
      .doc('newtestamentyporiginal')
      .collection('dailyReadings')
      .get();
    
    console.log(`✓ New collection has ${newDailyReadings.size} daily readings`);
    
    // Step 5: Delete old collection
    console.log('\nStep 5: Deleting old newtestamentyp collection...');
    
    // Delete all daily readings first
    let deleteBatch = db.batch();
    let deleteCount = 0;
    
    for (const doc of dailyReadingsSnapshot.docs) {
      const docRef = db.collection('readingPlans')
        .doc('newtestamentyp')
        .collection('dailyReadings')
        .doc(doc.id);
      
      deleteBatch.delete(docRef);
      deleteCount++;
      
      if (deleteCount >= batchSize) {
        await deleteBatch.commit();
        console.log(`✓ Deleted batch of ${deleteCount} daily readings`);
        deleteBatch = db.batch();
        deleteCount = 0;
      }
    }
    
    // Commit final delete batch
    if (deleteCount > 0) {
      await deleteBatch.commit();
      console.log(`✓ Deleted final batch of ${deleteCount} daily readings`);
    }
    
    // Delete the main document
    await db.collection('readingPlans').doc('newtestamentyp').delete();
    console.log('✓ Deleted newtestamentyp main document');
    
    console.log('\n🎉 Successfully renamed collection from newtestamentyp to newtestamentyporiginal!');
    
  } catch (error) {
    console.error('❌ Error renaming collection:', error);
    throw error;
  }
}

if (require.main === module) {
  renameCollection()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Rename failed:', error);
      process.exit(1);
    });
}

module.exports = { renameCollection };