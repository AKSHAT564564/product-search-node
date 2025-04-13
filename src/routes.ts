import { Router } from "express";
import ESController from "./Controllers/ESController";
import CollectionController from "./Controllers/CollectionController";

const router = Router();

router.get("/", (req, res) => {
  res.send("Hello, world!");
});

router.get("/collection", CollectionController.getCollection);
// router.post("/projects/createProject", ProjectController.createProject);
// router.get("/projects/searchProjects", ProjectController.searchProjects);
// router.get("/esTest", ESController.test);

export default router;
