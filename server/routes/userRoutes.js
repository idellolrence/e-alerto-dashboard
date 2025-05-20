import express from 'express'
import userAuth from '../middleware/userAuth.js';
import { getUserData, listAllUsers, deleteUser, updateUser, getOneUser} from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/data', userAuth, getUserData);
userRouter.get('/list-all', userAuth, listAllUsers);
userRouter.delete('/delete/:id', userAuth, deleteUser);
userRouter.put('/update/:id', userAuth, updateUser);
userRouter.get("/get/:id", userAuth, getOneUser);

export default userRouter;