import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function RawMaterialForm({ authContext, onSuccess }) {
  const [rawMaterial, setRawMaterial] = useState({
    userID: authContext.user,
    name: "",
    unitType: "discrete",
    manufacturer: "",
    description: "",
    stock: 0,
    price: 0,
    size: "units",
  });

  const handleInputChange = (key, value) => {
    setRawMaterial(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://test-backend-cyan.vercel.app/api/product/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authContext.token}`,
        },
        body: JSON.stringify({
          ...rawMaterial,
          type: "raw",
          userID: authContext.user,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to add raw material");
      
      alert("Raw material added successfully!");
      onSuccess();
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Material Name
          </label>
          <input
            type="text"
            value={rawMaterial.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        {/* Unit Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Measurement Type
          </label>
          <select
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          value={rawMaterial.unitType}
          onChange={(e) => setRawMaterial({ ...rawMaterial, unitType: e.target.value })}
        >
          <option value="discrete">Individual Items</option>
          <option value="bulk">Bulk Material</option>
        </select>
        </div>

        {/* Size (Conditional) */}
        {rawMaterial.unitType === "bulk" && (
          <div>
          <label className="block text-sm font-medium text-gray-700">
            Unit Size
          </label>
          <select
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={rawMaterial.size}
            onChange={(e) => setRawMaterial({ ...rawMaterial, size: e.target.value })}
          >
            <option value="kg">Kilograms (kg)</option>
            <option value="g">Grams (g)</option>
            <option value="L">Liters (L)</option>
            <option value="mL">Milliliters (mL)</option>
          </select>
        </div>
          // <div>
          //   <label className="block text-sm font-medium text-gray-700">
          //     Unit Size
          //   </label>
          //   <input
          //     type="text"
          //     value={rawMaterial.size}
          //     onChange={(e) => handleInputChange("size", e.target.value)}
          //     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          //     placeholder="e.g., 1kg, 500ml"
          //     required
          //   />
          // </div>
        )}
{/* Stock */}
<div>
          <label className="block text-sm font-medium text-gray-700">
            Stock Quantity
          </label>
          <input
          type="number"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          step={rawMaterial.unitType === 'bulk' ? 0.1 : 1}
          value={rawMaterial.stock}
          onChange={(e) => setRawMaterial({ ...rawMaterial, stock: e.target.value })}
        />
        
        </div>

        {/* Manufacturer */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Manufacturer
          </label>
          <input
            type="text"
            value={rawMaterial.manufacturer}
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
            value={rawMaterial.price}
            onChange={(e) => handleInputChange("price", Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        

        {/* Description */}
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            value={rawMaterial.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows="3"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      <button
        type="submit"
        className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-500 focus:outline-none"
      >
        Add Raw Material
      </button>
    </form>
  );
}