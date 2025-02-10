const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth');

// Get all events
router.get('/', auth, async (req, res) => {
  try {
    const { category, date, search } = req.query;
    let query = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (date === 'upcoming') {
      query.date = { $gte: new Date() };
    } else if (date === 'past') {
      query.date = { $lt: new Date() };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const events = await Event.find(query)
      .populate('organizer', 'name')
      .sort({ date: 1 });

    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create event
router.post('/', auth, async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      organizer: req.user.userId
    });

    await event.save();
    
    // Populate organizer details
    await event.populate('organizer', 'name');
    
    // Emit socket event
    req.app.get('io').emit('eventCreated', event);
    
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update event
router.put('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    Object.assign(event, req.body);
    await event.save();
    
    // Populate organizer details
    await event.populate('organizer', 'name');
    
    // Emit socket event
    req.app.get('io').emit('eventUpdated', event);
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.organizer.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await event.remove();
    
    // Emit socket event
    req.app.get('io').emit('eventDeleted', req.params.id);
    
    res.json({ message: 'Event removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Attend event
router.post('/:id/attend', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const attendeeIndex = event.attendees.indexOf(req.user.userId);
    
    if (attendeeIndex === -1) {
      // Add attendee
      if (event.attendees.length >= event.capacity) {
        return res.status(400).json({ message: 'Event is at capacity' });
      }
      event.attendees.push(req.user.userId);
    } else {
      // Remove attendee
      event.attendees.splice(attendeeIndex, 1);
    }

    await event.save();
    
    // Emit socket event
    req.app.get('io').emit('attendeeUpdated', {
      eventId: event._id,
      attendeeCount: event.attendees.length
    });
    
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;