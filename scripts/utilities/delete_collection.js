const { db } = require('../../config/firebase');

async function deleteCollection(collectionPath, batchSize = 100) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve, reject);
  });
}

async function deleteQueryBatch(query, resolve, reject) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    resolve();
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });

  await batch.commit();

  process.nextTick(() => {
    deleteQueryBatch(query, resolve, reject);
  });
}

async function deleteNewtestamentypPlan() {
  try {
    console.log('🗑️  Deleting existing newtestamentyp reading plan...\n');
    
    // First, delete all daily readings subcollection documents
    console.log('Deleting daily readings subcollection...');
    await deleteCollection('readingPlans/newtestamentyp/dailyReadings');
    console.log('✓ Daily readings deleted');
    
    // Then delete the main document
    console.log('Deleting main reading plan document...');
    await db.collection('readingPlans').doc('newtestamentyp').delete();
    console.log('✓ Main document deleted');
    
    console.log('\n✅ Successfully deleted newtestamentyp reading plan and all subcollections!');
    
  } catch (error) {
    console.error('❌ Error deleting collection:', error);
    throw error;
  }
}

if (require.main === module) {
  deleteNewtestamentypPlan()
    .then(() => {
      console.log('\n🎉 Collection deletion completed!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Deletion failed:', error);
      process.exit(1);
    });
}

module.exports = { deleteNewtestamentypPlan, deleteCollection };