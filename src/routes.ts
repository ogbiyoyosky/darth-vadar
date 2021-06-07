
import { Router } from "express";
import env from './helpers/env';
import { authRouter } from "./components/auth";
import { filmRouter } from "./components/film";



const router = Router();

router.get("/welcome", (req, res) => {
  return res.status(200).send({
    message: "welcome to starwars",
  });
});

router.use('/api/films', filmRouter);
router.use('/api/auth', authRouter);


export default router;


