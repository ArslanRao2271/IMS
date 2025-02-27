const Product = require("../models/product");
const Purchase = require("../models/purchase");
const Sales = require("../models/sales");
const mongoose = require("mongoose");

// Add Post
const addProduct = async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    console.log('Starting transaction');

   
    const [newProduct] = await Product.create([req.body], { session });
    console.log('Created product:', newProduct);

    if (newProduct.type === 'ready') {
      console.log('Processing ingredients for ready product');
      
      for (const ingredient of newProduct.ingredients) {
        console.log('Processing ingredient:', ingredient);

      
        const rawMaterial = await Product.findById(ingredient.material)
          .session(session)
          .lean(false); 
        
        if (!rawMaterial) {
          throw new Error(`Raw material ${ingredient.material} not found`);
        }

      
        const requiredQuantity = ingredient.quantity * newProduct.stock;
        console.log(`Required quantity for ${rawMaterial.name}: ${requiredQuantity}`);

       
        if (rawMaterial.stock < requiredQuantity) {
          throw new Error(`
            Insufficient stock for ${rawMaterial.name}
            (Needed: ${requiredQuantity}, Available: ${rawMaterial.stock})
          `);
        }

        rawMaterial.stock -= requiredQuantity;
        console.log('New stock:', rawMaterial.stock);
    
        await rawMaterial.save({ session });
        console.log('Raw material updated');
      }
    }

    // 7. Commit transaction
    await session.commitTransaction();
    console.log('Transaction committed');
    res.status(201).json(newProduct);

  } catch (error) {
    // 8. Abort on error
    await session.abortTransaction();
    console.error('Transaction failed:', error);
    res.status(400).json({ 
      success: false,
      error: error.message,
      debug: {
        receivedStock: req.body.stock,
        ingredientDetails: req.body.ingredients
      }
    });
  } finally {
   
    session.endSession();
  }
};

// Get All Products
const getAllProducts = async (req, res) => {
  const findAllProducts = await Product.find({
    userID: req.params.userID,
  }).sort({ _id: -1 }); // -1 for descending;
  res.json(findAllProducts);
};

// Delete Selected Product
const deleteSelectedProduct = async (req, res) => {
  const deleteProduct = await Product.deleteOne({ _id: req.params.id });
  const deletePurchaseProduct = await Purchase.deleteOne({
    ProductID: req.params.id,
  });

  const deleteSaleProduct = await Sales.deleteOne({ ProductID: req.params.id });
  res.json({ deleteProduct, deletePurchaseProduct, deleteSaleProduct });
};

// Update Selected Product
const updateSelectedProduct = async (req, res) => {
  try {
    const updatedResult = await Product.findByIdAndUpdate(
      { _id: req.body.productID },
      {
        name: req.body.name,
        manufacturer: req.body.manufacturer,
        description: req.body.description,
        stock: req.body.stock,
      },
      { new: true }
    );
    console.log(updatedResult);
    res.json(updatedResult);
  } catch (error) {
    console.log(error);
    res.status(402).send("Error");
  }
};

// Search Products
const searchProduct = async (req, res) => {
  const searchTerm = req.query.searchTerm;
  const products = await Product.find({
    name: { $regex: searchTerm, $options: "i" },
  });
  res.json(products);
};



const getRawMaterials = async (req, res) => {
  try {
    const rawMaterials = await Product.find({
      userID: req.params.userId,
      type: 'raw'
    });
    res.json(rawMaterials);
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

const deductRawMaterials = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    product.stock -= quantity;
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateInventory = async (req, res) => {
  try {
    const { updates } = req.body;
    const operations = updates.map(update => 
      Product.findByIdAndUpdate(update.productId, { $inc: { stock: update.quantity } }, { new: true })
    );
    
    const results = await Promise.all(operations);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const bulkUploadRawMaterials = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    
    // Validate materials
    const materials = req.body.materials.map(material => {
      if (!material.name || !material.manufacturer || typeof material.stock !== 'number') {
        throw new Error(`Invalid material entry: ${JSON.stringify(material)}`);
      }
      
      return {
        ...material,
        userID: req.body.userId,
        type: 'raw',
        stock: Math.floor(material.stock) // Ensure integer stock
      };
    });

    // Insert materials
    const result = await Product.insertMany(materials, { 
      session,
      ordered: false // Continue on error
    });

    // Check for errors
    if (result.length !== materials.length) {
      throw new Error("Some entries failed to upload");
    }

    await session.commitTransaction();
    res.status(201).json({ 
      success: true, 
      insertedCount: result.length 
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({
      success: false,
      error: error.message,
      failedEntries: error.writeErrors?.map(err => ({
        index: err.index,
        error: err.errmsg
      }))
    });
  } finally {
    session.endSession();
  }
};
module.exports = {
  addProduct,
  getAllProducts,
  deleteSelectedProduct,
  updateSelectedProduct,
  searchProduct,
  updateInventory,
  getRawMaterials,
  deductRawMaterials,
  bulkUploadRawMaterials
};
