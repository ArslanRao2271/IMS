import { Fragment, useContext, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { PlusIcon } from "@heroicons/react/24/outline";
import AuthContext from "../AuthContext";

export default function AddProduct({
  addProductModalSetting,
  handlePageUpdate,
}) {
  const authContext = useContext(AuthContext);
  const [product, setProduct] = useState({
    userId: authContext.user,
    name: [],
    manufacturer: "",
    description: "",
    stock: "",
    price:"",
    size:[]
  });
  console.log("Product to add", product);
  const [open, setOpen] = useState(true);
  const cancelButtonRef = useRef(null);
  const productNameOptions = [
    { value: "Empty Water", label: "Empty Water" },
    { value: "Empty Juice Cap", label: "Empty Juice Cap" },
    { value: "Short Neck Red", label: "Short Neck Red" },
    { value: "Short Neck Green", label: "Short Neck Green" },
    { value: "Short Neck Black", label: "Short Neck Black" },
    { value: "Short Neck Blue", label: "Short Neck Blue" },
    { value: "Short Neck Yellow", label: "Short Neck Yellow" },
    { value: "Fruit Juice Label", label: "Fruit Juice Label" },
    { value: "Empty Water Cap", label: "Empty Water Cap" },
    { value: "Flavour Juice Label", label: "Flavour Juice Label" },
    { value: "Water Label", label: "Water Label" },
    { value: "Juice Tray", label: "Juice Tray" },
    { value: "Juice Carton", label: "Juice Carton" },
    { value: "CSD Label", label: "CSD Label" },
    { value: "Shrink Packaging", label: "Shrink Packaging" },
    { value: "Torque", label: "Torque" },
    { value: "Cola", label: "Cola" },
    { value: "Funky", label: "Funky" },
    { value: "Sting", label: "Sting" },
    { value: "Thunder", label: "Thunder" },
    { value: "Anar", label: "Anar" },
    { value: "Lemony", label: "Lemony" },
    { value: "White", label: "White" },
    { value: "Green", label: "Green" },
  ];
  const productSizes = {
    "100ml":"100ml",
    "150ml":"150ml",
   "200ml":"200ml",
   "225ml":"225ml",
   "250ml":"250ml",
   "300ml":"300ml",
   "345ml":"345ml",
   "500ml":"500ml",
    "1000ml":"1000ml",
    "1500ml":"1500ml",
    "2000ml":"2000ml",
    "2250ml":"2250ml",
    "5000ml":"5000ml",
"30mm":"30mm",
"28mm":"28mm",
"44mm":"44mm",
    "19LTR":"19LTR"
  }
  const handleInputChange = (key, value) => {
    setProduct((prevState)=>({ ...prevState, [key]: value }));
  };

  const addProduct = () => {
    const selectedProducts = product.name;  
    const selectedSizes = product.size;     

    const promises = selectedProducts.flatMap((productName) => 
      selectedSizes.map((productSize) => {
        const productData = {
          userId: authContext.user,
          name: productName,
          manufacturer: product.manufacturer,
          price: product.price,
          size: productSize,
          stock: product.stock,
          description: product.description,
        };

        return fetch("https://test-backend-cyan.vercel.app/api/product/add", {
          method: "POST",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify(productData),
        });
      })
    );

   
    Promise.all(promises)
      .then(() => {
        alert("Products added successfully!");
        handlePageUpdate();
        addProductModalSetting();
      })
      .catch((err) => {
        console.error("Error adding products:", err);
      });
  };
  return (
    // Modal
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <PlusIcon
                        className="h-6 w-6 text-blue-400"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left ">
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-semibold leading-6 text-gray-900 "
                      >
                        Add Product
                      </Dialog.Title>
                      <form onSubmit={(e) => e.preventDefault()}>
      <div className="grid gap-4 mb-4 sm:grid-cols-2">
        {/* Product Name Selection */}
        <div>
          <label
            htmlFor="name"
            className="block mt-2 mb-2 text-sm font-medium text-gray-900"
          >
            Name
          </label>
          <select
            name="name"
            id="name"
            value={product.name}
            onChange={(e) =>
              handleInputChange(
                e.target.name,
                Array.from(e.target.selectedOptions, (option) => option.value)
              )
            }
            multiple
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
          >
            <option value="">Select Product Name</option>
            {productNameOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Manufacturer */}
        <div>
          <label
            htmlFor="manufacturer"
            className="block mt-2 mb-2 text-sm font-medium text-gray-900"
          >
            Manufacturer
          </label>
          <input
            type="text"
            name="manufacturer"
            id="manufacturer"
            value={product.manufacturer}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
            placeholder="Manufacturer"
          />
        </div>

        {/* Price */}
        <div>
          <label
            htmlFor="price"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Price
          </label>
          <input
            type="number"
            name="price"
            id="price"
            value={product.price}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
            placeholder="PKR"
          />
        </div>

        {/* Size Selection */}
        <div>
          <label
            htmlFor="size"
            className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
          >
            Size
          </label>
          <select
            name="size"
            id="size"
            value={product.size}
            onChange={(e) =>
              handleInputChange(
                e.target.name,
                Array.from(e.target.selectedOptions, (option) => option.value)
              )
            }
            multiple
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
          >
            <option value="">Select Size</option>
            {Object.entries(productSizes).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label
            htmlFor="stock"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Quantity
          </label>
          <input
            type="number"
            name="stock"
            id="stock"
            value={product.stock}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
            placeholder="Quantity"
          />
        </div>

        {/* Description */}
        <div className="sm:col-span-2">
          <label
            htmlFor="description"
            className="block mb-2 text-sm font-medium text-gray-900"
          >
            Description
          </label>
          <textarea
            id="description"
            rows="5"
            name="description"
            className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
            placeholder="Write a description..."
            value={product.description}
            onChange={(e) => handleInputChange(e.target.name, e.target.value)}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="button"
          onClick={addProduct}
          className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
        >
          Add Product
        </button>
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
