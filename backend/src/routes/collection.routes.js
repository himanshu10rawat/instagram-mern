import { Router } from "express";

import {
  addItemToCollection,
  createCollection,
  deleteCollection,
  getCollectionById,
  getMyCollections,
  removeItemFromCollection,
  updateCollection,
} from "../controllers/collection.controller.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import {
  addToCollectionSchema,
  createCollectionSchema,
  updateCollectionSchema,
} from "../validators/collection.validator.js";

const router = Router();

router.post("/", isAuthenticated, validate(createCollectionSchema), createCollection);
router.get("/", isAuthenticated, getMyCollections);

router.get("/:collectionId", isAuthenticated, getCollectionById);
router.patch("/:collectionId", isAuthenticated, validate(updateCollectionSchema), updateCollection);
router.delete("/:collectionId", isAuthenticated, deleteCollection);

router.post(
  "/:collectionId/items",
  isAuthenticated,
  validate(addToCollectionSchema),
  addItemToCollection,
);

router.delete(
  "/:collectionId/items",
  isAuthenticated,
  validate(addToCollectionSchema),
  removeItemFromCollection,
);

export default router;
