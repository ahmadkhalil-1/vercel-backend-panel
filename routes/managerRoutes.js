import express from 'express';
import {
  createManager,
  getManagers,
  updateManager,
  deleteManager
} from '../controllers/managerController.js';

const router = express.Router();

// Add manager
router.post('/', createManager);

// Get all managers
router.get('/', getManagers);

// Update manager
router.put('/:id', updateManager);

// Delete manager
router.delete('/:id', deleteManager);

export default router;
