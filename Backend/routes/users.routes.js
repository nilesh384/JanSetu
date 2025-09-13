import { Router } from "express";
import {registerUser, loginUser, updateUser} from '../controllers/users.controllers.js';

const router = Router();

router.route('/registerUser').post(registerUser);
router.route('/loginUser/:id').get(loginUser);
router.route('/updateUser/:id').put(updateUser);

export default router;