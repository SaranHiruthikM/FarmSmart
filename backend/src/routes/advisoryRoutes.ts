import { Router } from "express";
import { getAdvisories } from "../controllers/advisoryController";

const router = Router();

router.get("/", getAdvisories);

export default router;
