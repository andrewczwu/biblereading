const { db } = require('./config/firebase');
const readingScheduleData = require('./nt_reading_schedule_crossbook.json');

async function createNewtestamentyp() {
  try {
    console.log('Creating newtestamentyp reading plan collection...');
    
    // Create the main reading plan document
    const planData = {
      name: 'Young People New Testament',
      description: 'Young People Bible Reading Schedule for New Testament - School Year (Sept-Dec)',
      durationDays: readingScheduleData.length,
      testament: 'New',
      audience: 'Young People',
      startDate: readingScheduleData[0]?.date || '2024-09-16',
      endDate: readingScheduleData[readingScheduleData.length - 1]?.date || '2024-12-31',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Set the main collection document
    await db.collection('readingPlans').doc('newtestamentyp').set(planData);
    console.log('✓ Created newtestamentyp reading plan document');
    
    // Create daily reading documents in batches
    const batchSize = 500; // Firestore batch limit
    let batch = db.batch();
    let batchCount = 0;
    let totalDays = 0;
    
    for (const dayData of readingScheduleData) {
      const dayId = `day-${String(dayData.dayNumber).padStart(3, '0')}`;
      const dayRef = db.collection('readingPlans')
        .doc('newtestamentyp')
        .collection('dailyReadings')
        .doc(dayId);
      
      // Format the day data to match the existing schema
      const formattedDayData = {
        dayNumber: dayData.dayNumber,
        date: dayData.date,
        dayOfWeek: dayData.dayOfWeek,
        startBookName: dayData.startBookName,
        startBookId: dayData.startBookId,
        endBookName: dayData.endBookName,
        endBookId: dayData.endBookId,
        portions: dayData.portions.map(portion => ({
          bookId: portion.bookId,
          bookName: portion.bookName,
          startChapter: portion.startChapter,
          startVerse: portion.startVerse,
          endChapter: portion.endChapter,
          endVerse: portion.endVerse,
          portionOrder: portion.portionOrder
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add any raw reading text if available for debugging
      if (dayData.rawReading) {
        formattedDayData.rawReading = dayData.rawReading;
      }
      
      batch.set(dayRef, formattedDayData);
      batchCount++;
      totalDays++;
      
      // Commit batch when it reaches the limit
      if (batchCount >= batchSize) {
        await batch.commit();
        console.log(`✓ Committed batch of ${batchCount} daily readings`);
        batch = db.batch();
        batchCount = 0;
      }
    }
    
    // Commit any remaining items in the final batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`✓ Committed final batch of ${batchCount} daily readings`);
    }
    
    console.log(`\n✅ Successfully created newtestamentyp reading plan with ${totalDays} daily readings!`);
    console.log(`Plan duration: ${planData.startDate} to ${planData.endDate}`);
    
    // Update the plan document with accurate end date
    await db.collection('readingPlans').doc('newtestamentyp').update({
      endDate: readingScheduleData[readingScheduleData.length - 1]?.date,
      updatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error creating newtestamentyp reading plan:', error);
    throw error;
  }
}

async function verifyUpload() {
  try {
    console.log('\nVerifying upload...');
    
    // Check the main document
    const planDoc = await db.collection('readingPlans').doc('newtestamentyp').get();
    if (!planDoc.exists) {
      throw new Error('Main reading plan document not found');
    }
    
    console.log('✓ Main reading plan document exists');
    console.log('Plan data:', planDoc.data());
    
    // Check some daily readings
    const dailyReadingsSnapshot = await db
      .collection('readingPlans')
      .doc('newtestamentyp')
      .collection('dailyReadings')
      .limit(5)
      .get();
    
    console.log(`✓ Found ${dailyReadingsSnapshot.size} daily readings (showing first 5)`);
    
    dailyReadingsSnapshot.forEach(doc => {
      const data = doc.data();
      console.log(`  Day ${data.dayNumber} (${data.date}): ${data.portions?.length || 0} portions`);
      if (data.rawReading) {
        console.log(`    Raw: ${data.rawReading}`);
      }
    });
    
    // Get total count
    const totalSnapshot = await db
      .collection('readingPlans')
      .doc('newtestamentyp')
      .collection('dailyReadings')
      .get();
    
    console.log(`\n✅ Total daily readings uploaded: ${totalSnapshot.size}`);
    
  } catch (error) {
    console.error('Error verifying upload:', error);
    throw error;
  }
}

// Run the upload
if (require.main === module) {
  createNewtestamentyp()
    .then(() => verifyUpload())
    .then(() => {
      console.log('\n🎉 NT reading schedule upload completed successfully!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Upload failed:', error);
      process.exit(1);
    });
}

module.exports = {
  createNewtestamentyp,
  verifyUpload
};