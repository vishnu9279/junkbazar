const ItemModel = require("../models/itemModel");
const cloudinary = require("../utils/cloudinary");
const mongoose = require("mongoose");
const UserModel = require("../models/userModel");

exports.createItem = async (req, res) => {
  try {
    const { name, kilogram, address, price } = req.body;
    const userDetails = await UserModel.findById(req.user.id);

    if (!userDetails) res.status(400).json({ message: "You can not perform this Operation" });
    const files = req.file;

    if (!files) {
      return res.status(400).json({ error: "Image is required" });
    }

    const result = await cloudinary.uploads(files.path, "Images");

    const item = new ItemModel({
      name,
      kilogram,
      address,
      price,
      image: result.url,
    });

    item.user = userDetails;
    item.save();

    userDetails.items.push(new mongoose.Types.ObjectId(item._id));
    userDetails.save();

    return res.status(201).json({ message: "Item created successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ error: error });
  }
};

exports.updateItem = async (req, res) => {
  try {
    // const { name, quantity, price } = req.body;
    const itemId = req.query.itemID;
    const userDetails = await UserModel.findById(req.user.id);

    if (!userDetails) res.status(400).json({ message: "You can not perform this Operation" });

    const item = await ItemModel.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found." });
    }

    if (req.file) {
      const result = await cloudinary.uploads(req.file.path, "Images");
      item.image = result.url;
    }

    await ItemModel.findByIdAndUpdate(item._id, req.body, { new: true });

    res.status(200).json({ message: "Item updated successfully." });
  } catch (error) {
    console.error("Error updating item:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the item." });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const itemId = req.query.itemID;

    const item = await ItemModel.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found." });
    }

    await ItemModel.findByIdAndDelete(item._id);

    res.status(200).json({ message: "Item deleted successfully." });
  } catch (error) {
    // console.error("Error deleting item:", error);
    res
      .status(500)
      .json({ error: error });
  }
};

exports.getAllItems = async (req, res) => {
  try {
    const items = await ItemModel.find();

    res.status(200).json(items);
  } catch (error) {
    // console.error("Error fetching items:", error);
    res.status(500).json({ error: error });
  }
};

exports.getSingleItem = async (req, res) => {
  try {
    const itemId = req.query.itemID;

    const item = await ItemModel.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found." });
    }

    res.status(200).json(item);
  } catch (error) {
    // console.error("Error fetching item:", error);
    res
      .status(500)
      .json({ error: error });
  }
};
