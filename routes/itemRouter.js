const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const {
  createItem,
  updateItem,
  deleteItem,
  getAllItems,
  getSingleItem,
} = require("../controllers/itemController");

router.route("/").post(upload.single("image"), createItem).get(getAllItems);

router
  .route("/:itemId")
  .get(getSingleItem)
  .put(upload.single("image"), updateItem)
  .delete(deleteItem);

module.exports = router;
