import express from 'express';
import { loginGameUser, registerGameUser, getGameUserCategories, logoutGameUser, lockUnlockImage, completeImage } from '../controllers/GameUserController.js';
import gameUserAuth from '../middlewares/gameUserAuth.js';

const router = express.Router();

router.post('/register', registerGameUser);

router.post('/login', loginGameUser);

router.get('/categories', gameUserAuth, getGameUserCategories);

router.get('/logout', gameUserAuth, logoutGameUser);

router.post('/image-lock-unlock', gameUserAuth, lockUnlockImage);

router.post('/image-complete', gameUserAuth, completeImage);

export default router;
