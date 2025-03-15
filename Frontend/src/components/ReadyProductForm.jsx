import { useState, useEffect } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";

export default function ReadyProductForm({ authContext, onSuccess }) {
  const [product, setProduct] = useState({
    name: "",
    manufacturer: "",
    description: "",
    stock: 0,
    size:"units",
    price: 0,
    ingredients: [],
  });
  const [rawMaterials, setRawMaterials] = useState([]);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const response = await fetch(
          `https://test-backend-cyan.vercel.app/api/product/get-raw-materials/${authContext.user}`
        );
        if (!response.ok) throw new Error('Failed to fetch materials');
        const data = await response.json();
        setRawMaterials(data);
      } catch (error) {
        console.error('Error:', error);
        alert(`Error loading materials: ${error.message}`);
      }
    };

    if (authContext.user) fetchMaterials();
  }, [authContext.user]);

  const handleInputChange = (key, value) => {
    setProduct(prev => ({ 
      ...prev, 
      [key]: typeof value === 'number' ? (isNaN(value) ? 0 : value) : value 
    }));
  };

    const removeIngredient = (index) => {
    setProduct((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };
  const handleIngredientChange = (index, field, value) => {
    setProduct(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => {
        if (i === index) {
          // Handle material selection differently from numeric fields
          if (field === "material") {
            return { 
              ...ingredient, 
              [field]: value // Store the material ID directly
            };
          }
          
          // Handle numeric fields (quantity/waste)
          const numericValue = value === "" ? 0 : Number(value);
          return { 
            ...ingredient, 
            [field]: numericValue 
          };
        }
        return ingredient;
      })
    }));
  };

  const addIngredient = () => {
    setProduct(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { 
        material: "", 
        quantity: 0, 
        waste: 0 
      }]
    }));
  };

  const validateIngredients = () => {
    for (const ingredient of product.ingredients) {
      const material = rawMaterials.find(m => m._id === ingredient.material);
      
      if (!material) return { valid: false, error: "Please select a valid material" };
      if (isNaN(ingredient.quantity) || ingredient.quantity <= 0) 
        return { valid: false, error: "Invalid quantity value" };
      if (isNaN(ingredient.waste) || ingredient.waste < 0) 
        return { valid: false, error: "Invalid waste value" };
    }
    return { valid: true };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateIngredients();
    if (!validation.valid) return alert(validation.error);

    try {
      const response = await fetch(`https://test-backend-cyan.vercel.app/api/product/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authContext.token}`
        },
        body: JSON.stringify({
          ...product,
          type: "ready",
          userID: authContext.user
        }),
      });

      // Handle non-JSON responses
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) throw new Error(data.error || "Server error");

      alert("Product added successfully!");
      onSuccess();
    } catch (error) {
      console.error("Submission error:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        {/* Product fields... */}
   {/* Product Name */}
   <div>
          <label className="block text-sm font-medium text-gray-700">
            Product Name
          </label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        {/* Manufacturer */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Manufacturer
          </label>
          <input
            type="text"
            value={product.manufacturer}
            onChange={(e) => handleInputChange("manufacturer", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price
          </label>
          <input
            type="number"
            value={product.price}
            onChange={(e) => handleInputChange("price", Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Stock Quantity
          </label>
          <input
            type="number"
            value={product.stock}
            onChange={(e) => handleInputChange("stock", Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>
       
        {/* Ingredients Section */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ingredients
          </label>
          {product.ingredients.map((ingredient, index) => {
            const selectedMaterial = rawMaterials.find(m => m._id === ingredient.material);
            const unitType = selectedMaterial?.unitType || 'discrete';
            const unitSymbol = selectedMaterial?.size || 'units';

            return (
              <div key={index} className="flex gap-2 mb-2 items-center">
                <div>
                <label className="block text-sm font-medium text-gray-700">
                  Raw Material
          </label>
                <select
                  value={ingredient.material || ""}
                  onChange={(e) => handleIngredientChange(index, "material", e.target.value)}
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                >
                  <option value="">Select Raw Material</option>
                  {rawMaterials.map(material => (
                    <option key={material._id} value={material._id}>
                      {material.name} ({material.unitType === 'bulk' ? material.size : 'units'})
                    </option>
                  ))}
                </select>
        </div>
                {/* Quantity Input */}
                <div>
                <label className="block text-sm font-medium text-gray-700">
             Quantity
          </label>
                <input
                  type="number"
                  step={unitType === 'bulk' ? 0.1 : 1}
                  min="0"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, "quantity", e.target.value)}
                  placeholder={`Quantity (${unitSymbol}/unit)`}
                  className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
        </div>
                {/* Waste Input */}
                <div >
                <label className="block text-sm font-medium text-gray-700">
            Waste Quantity
          </label>
                <input
                  type="number"
                  step={unitType === 'bulk' ? 0.1 : 1}
                  min="0"
                  value={ingredient.waste}
                  onChange={(e) => handleIngredientChange(index, "waste", e.target.value)}
                  placeholder={`Waste (${unitSymbol}/unit)`}
                  className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  required
                />
        </div>
        <div  className="mt-2">
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="text-red-500 hover:text-red-700 p-1"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
                </div>
              </div>
            );
          })}
          
          <button
            type="button"
            onClick={addIngredient}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Ingredient
          </button>
        </div>

        {/* Description field... */}
      </div>

      <button
        type="submit"
        className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus:outline-none"
      >
        Add Ready Product
      </button>
    </form>
  );
}