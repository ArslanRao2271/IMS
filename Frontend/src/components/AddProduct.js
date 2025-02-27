import { Fragment, useContext, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import AuthContext from "../AuthContext";

export default function AddProduct({
  addProductModalSetting,
  handlePageUpdate,
}) {
  const authContext = useContext(AuthContext);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [product, setProduct] = useState({
    userID: authContext.user,
    name: "",
    type: "raw",
    manufacturer: "",
    description: "",
    stock: 10,
    price: 10,
    size: "",
    ingredients: [],
  });
  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);

  useEffect(() => {
    if (product.type === "ready" && authContext.user) {
      fetch(`http://localhost:4000/api/product/get-raw-materials/${authContext.user}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch raw materials');
          return res.json();
        })
        .then(setRawMaterials)
        .catch(error => {
          console.error('Error fetching raw materials:', error);
          alert(`Error: ${error.message}`);
        });
    }
  }, [product.type, authContext.user]);
console.log(rawMaterials)
  const handleInputChange = (key, value) => {
    setProduct((prev) => ({ ...prev, [key]: value }));
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = product.ingredients.map((ingredient, i) =>
      i === index ? { ...ingredient, [field]: value } : ingredient
    );
    setProduct((prev) => ({ ...prev, ingredients: updatedIngredients }));
  };

  const addIngredient = () => {
    setProduct((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { material: "", quantity: 0 }],
    }));
  };

  const removeIngredient = (index) => {
    setProduct((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const addProduct = async () => {
    try {
      console.log("Sending request with:", product); // Verify payload
      
      const response = await fetch(`http://localhost:4000/api/product/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authContext.token}` // If using auth
        },
        body: JSON.stringify({
          ...product,
          userId: authContext.user // Ensure userId is included
        }),
      });
  
      const data = await response.json(); // Always parse JSON first
      
      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }
  
      alert("Product added successfully!");
      handlePageUpdate();
      addProductModalSetting();
    } catch (error) {
      console.error("Full error:", error);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <PlusIcon
                        className="h-6 w-6 text-blue-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold leading-6 text-gray-900"
                      >
                        Add Product
                      </Dialog.Title>
                      <form onSubmit={(e) => e.preventDefault()} className="mt-4">
                        <div className="grid gap-4 mb-4 sm:grid-cols-2">
                          {/* Product Type */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Product Type
                            </label>
                            <select
                              value={product.type}
                              onChange={(e) => handleInputChange("type", e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            >
                              <option value="raw">Raw Material</option>
                              <option value="ready">Ready Product</option>
                            </select>
                          </div>

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

                          {/* Size */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Size
                            </label>
                            <input
                              type="text"
                              value={product.size}
                              onChange={(e) => handleInputChange("size", e.target.value)}
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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

                          {/* Ingredients for Ready Products */}
                          {product.type === "ready" && (
                            <div className="sm:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ingredients
                              </label>
                              {product.ingredients.map((ingredient, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                  <select
                                    value={ingredient.material}
                                    onChange={(e) =>
                                      handleIngredientChange(index, "material", e.target.value)
                                    }
                                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    required
                                  >
                                    <option value="">Select Raw Material</option>
                                    {rawMaterials.map((material) => (
                                      <option key={material._id} value={material._id}>
                                        {material.name}
                                      </option>
                                    ))}
                                  </select>
                                  <input
                                    type="number"
                                    value={ingredient.quantity}
                                    onChange={(e) =>
                                      handleIngredientChange(
                                        index,
                                        "quantity",
                                        parseInt(e.target.value)
                                      )
                                    }
                                    placeholder="Quantity per unit"
                                    className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    required
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeIngredient(index)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                </div>
                              ))}
                              <button
                                type="button"
                                onClick={addIngredient}
                                className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                              >
                                <PlusIcon className="h-4 w-4 mr-1" />
                                Add Ingredient
                              </button>
                            </div>
                          )}

                          {/* Description */}
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Description
                            </label>
                            <textarea
                              value={product.description}
                              onChange={(e) => handleInputChange("description", e.target.value)}
                              rows="3"
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    onClick={addProduct}
                  >
                    Add Product
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => addProductModalSetting()}
                    ref={cancelButtonRef}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}