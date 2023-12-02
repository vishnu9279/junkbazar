const express = require("express");
const router = express.Router();
const upload = require("../utils/multer");
const {
    createItem,
    updateItem,
    deleteItem,
    getAllItems,
    getSingleItem
} = require("../controllers/itemController");
const auth = require("../utils/auth");

router.route("/create").post(upload.single("image"), auth, createItem);
router.route("/").get(getAllItems);

router.route("/details").get(getSingleItem);
router.route("/update").patch(upload.single("image"), auth, updateItem);
router.route("/delete").delete(deleteItem);

module.exports = router;
