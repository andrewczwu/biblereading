const express = require('express');
const { db } = require('../config/firebase');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, description, duration, startDate, type = 'custom', books = [] } = req.body;

    if (!name || !duration || !startDate) {
      return res.status(400).json({
        success: false,
        message: 'Name, duration, and start date are required'
      });
    }

    const readingPlan = {
      name,
      description: description || '',
      duration: parseInt(duration),
      startDate: new Date(startDate),
      type,
      books,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      progress: {
        completedDays: 0,
        currentDay: 1,
        completedBooks: [],
        currentReading: null
      }
    };

    if (type === 'whole-bible') {
      const booksSnapshot = await db.collection('books')
        .orderBy('order')
        .get();
      
      readingPlan.books = booksSnapshot.docs.map(doc => ({
        bookId: doc.id,
        name: doc.data().name,
        order: doc.data().order,
        totalChapters: doc.data().totalChapters,
        completed: false
      }));
    }

    const docRef = await db.collection('readingPlans').add(readingPlan);
    
    const createdPlan = await docRef.get();
    
    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...createdPlan.data()
      }
    });
  } catch (error) {
    console.error('Error creating reading plan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const { active, type } = req.query;
    let query = db.collection('readingPlans');

    if (active !== undefined) {
      query = query.where('isActive', '==', active === 'true');
    }

    if (type) {
      query = query.where('type', '==', type);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();

    if (snapshot.empty) {
      return res.json({
        success: true,
        data: [],
        total: 0
      });
    }

    const plans = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate()
    }));

    res.json({
      success: true,
      data: plans,
      total: plans.length
    });
  } catch (error) {
    console.error('Error fetching reading plans:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

router.get('/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    const planDoc = await db.collection('readingPlans').doc(planId).get();

    if (!planDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Reading plan not found'
      });
    }

    const planData = planDoc.data();
    res.json({
      success: true,
      data: {
        id: planDoc.id,
        ...planData,
        startDate: planData.startDate?.toDate(),
        createdAt: planData.createdAt?.toDate(),
        updatedAt: planData.updatedAt?.toDate()
      }
    });
  } catch (error) {
    console.error('Error fetching reading plan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

router.put('/:planId/progress', async (req, res) => {
  try {
    const { planId } = req.params;
    const { completedDays, currentDay, completedBooks, currentReading } = req.body;

    const planRef = db.collection('readingPlans').doc(planId);
    const planDoc = await planRef.get();

    if (!planDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Reading plan not found'
      });
    }

    const updateData = {
      'progress.completedDays': completedDays || planDoc.data().progress.completedDays,
      'progress.currentDay': currentDay || planDoc.data().progress.currentDay,
      'progress.completedBooks': completedBooks || planDoc.data().progress.completedBooks,
      'progress.currentReading': currentReading || planDoc.data().progress.currentReading,
      updatedAt: new Date()
    };

    await planRef.update(updateData);

    const updatedPlan = await planRef.get();
    
    res.json({
      success: true,
      data: {
        id: updatedPlan.id,
        ...updatedPlan.data(),
        startDate: updatedPlan.data().startDate?.toDate(),
        createdAt: updatedPlan.data().createdAt?.toDate(),
        updatedAt: updatedPlan.data().updatedAt?.toDate()
      }
    });
  } catch (error) {
    console.error('Error updating reading plan progress:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

router.delete('/:planId', async (req, res) => {
  try {
    const { planId } = req.params;
    const planRef = db.collection('readingPlans').doc(planId);
    const planDoc = await planRef.get();

    if (!planDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Reading plan not found'
      });
    }

    await planRef.delete();

    res.json({
      success: true,
      message: 'Reading plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reading plan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;