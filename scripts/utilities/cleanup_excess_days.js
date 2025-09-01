const { db } = require('./config/firebase');

async function removeExcessDays() {
  try {
    console.log('Removing day-300+ entries from newtestamentyp/dailyReadings...');
    
    // Get all documents in the dailyReadings collection
    const dailyReadingsRef = db.collection('readingPlans')
      .doc('newtestamentyp')
      .collection('dailyReadings');
    
    const snapshot = await dailyReadingsRef.get();
    console.log(`Found ${snapshot.size} daily reading documents`);
    
    const batch = db.batch();
    let deletedCount = 0;
    
    snapshot.forEach((doc) => {
      const docId = doc.id;
      
      // Extract day number from document ID (format: day-XXX)
      const dayMatch = docId.match(/day-(\d+)/);
      if (dayMatch) {
        const dayNumber = parseInt(dayMatch[1]);
        
        // Delete if day number is 300 or higher
        if (dayNumber >= 300) {
          console.log(`Marking ${docId} (day ${dayNumber}) for deletion`);
          batch.delete(doc.ref);
          deletedCount++;
        }
      }
    });
    
    if (deletedCount > 0) {
      await batch.commit();
      console.log(`✓ Deleted ${deletedCount} daily reading documents (day-300+)`);
    } else {
      console.log('✓ No documents found with day-300 or higher');
    }
    
    // Verify the cleanup
    const finalSnapshot = await dailyReadingsRef.get();
    console.log(`\n✅ Final count: ${finalSnapshot.size} daily reading documents remain`);
    
    // Show the highest day number remaining
    let maxDay = 0;
    finalSnapshot.forEach(doc => {
      const dayMatch = doc.id.match(/day-(\d+)/);
      if (dayMatch) {
        const dayNumber = parseInt(dayMatch[1]);
        if (dayNumber > maxDay) {
          maxDay = dayNumber;
        }
      }
    });
    
    console.log(`Highest day number remaining: day-${String(maxDay).padStart(3, '0')}`);
    
  } catch (error) {
    console.error('Error removing excess days:', error);
    throw error;
  }
}

if (require.main === module) {
  removeExcessDays()
    .then(() => {
      console.log('\n🎉 Cleanup completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Cleanup failed:', error);
      process.exit(1);
    });
}

module.exports = { removeExcessDays };