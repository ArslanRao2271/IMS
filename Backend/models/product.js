const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    type: {
      type: String,
      enum: ['raw', 'ready'],
      required: true,
      default: 'raw'
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    manufacturer: {
      type: String,
      required: [true, 'Manufacturer is required']
    },
    stock: {
      type: Number,
      required: [true, 'Stock is required'],
      min: [0, 'Stock cannot be negative']
    },
    price: Number,
    size: String,
    description: String,
    ingredients: [
      {
        material: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'product'
        },
        quantity: Number
      }
    ]
  },
  { timestamps: true }
);

const Product = mongoose.model("product", ProductSchema);
module.exports = Product;