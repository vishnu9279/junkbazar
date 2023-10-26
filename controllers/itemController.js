const Item = require("../models/itemModel");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");

exports.createItem = async (req, res) => {
  try {
    const { name, quantity, price } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "Image is required" });
    }

    const result = await cloudinary.uploads(req.file.path, "Images");

    const item = new Item({
      name,
      quantity,
      price,
      image: result.url,
    });

    await item.save();

    return res.status(201).json({ message: "Item created successfully." });
  } catch (error) {
    console.error("Error creating item:", error);
    res
      .status(500)
      .json({ error: "An error occurred while creating the item." });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { name, quantity, price } = req.body;
    const itemId = req.params.itemId;

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found." });
    }

    if (req.file) {
      const result = await cloudinary.uploads(req.file.path, "Images");
      item.image = result.url;
    }

    item.name = name;
    item.quantity = quantity;
    item.price = price;

    await item.save();

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
    const itemId = req.params.itemId;

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found." });
    }

    await item.remove();

    res.status(200).json({ message: "Item deleted successfully." });
  } catch (error) {
    console.error("Error deleting item:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the item." });
  }
};

exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.find();

    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "An error occurred while fetching items." });
  }
};

exports.getSingleItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;

    const item = await Item.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: "Item not found." });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the item." });
  }
};
