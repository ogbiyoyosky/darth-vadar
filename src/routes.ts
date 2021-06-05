import { Router } from "express";

import env from './helpers/env';



const router = Router();

router.get("/welcome", (req, res) => {
  return res.status(200).send({
    message: "welcome to starwars",
  });
});

// router.use('/api/auth', authRouter);
// router.use('/api/users', userRouter);


export default router;
