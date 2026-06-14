import express from 'express';
import { listUsers } from '../controllers/userListController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, listUsers);

export default router;