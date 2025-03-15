import React, { useState, useEffect, useContext } from "react";
import AddProduct from "../components/AddProduct";
import UpdateProduct from "../components/UpdateProduct";
import AuthContext from "../AuthContext";
import BulkUpload from "../components/BulkUpload";

function Inventory() {
   
    // const [rawMaterials, setRawMaterials] = useState([]);
    // Add state for inventory type selection
    const [selectedInventoryType, setSelectedInventoryType] = useState('all');
    const [showProductModal, setShowProductModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [updateProduct, setUpdateProduct] = useState([]);
    const [products, setAllProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState();
    const [updatePage, setUpdatePage] = useState(true);
    const [stores, setAllStores] = useState([]);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const authContext = useContext(AuthContext);
   useEffect(() => {
     fetchProductsData();
     fetchSalesData();
   }, [updatePage]);
 
   // Fetching Data of All Products
   const fetchProductsData = () => {
     fetch(`http://localhost:4000/api/product/get/${authContext.user}`)
       .then((response) => response.json())
       .then((data) => {
         console.log(data)
         setAllProducts(data);
       })
       .catch((err) => console.log(err));
   };
   const fetchSearchData = () => {
    fetch(`https://test-backend-cyan.vercel.app/api/product/search?searchTerm=${searchTerm}`)
      .then((response) => response.json())
      .then((data) => {
        setAllProducts(data);
      })
      .catch((err) => console.log(err));
  };

  // Fetching all stores data
  const fetchSalesData = () => {
    fetch(`http://localhost:4000/api/store/get/${authContext.user}`)
      .then((response) => response.json())
      .then((data) => {
        setAllStores(data);
      });
  };

  // Modal for Product ADD
  const addProductModalSetting = () => {
    setShowProductModal(!showProductModal);
  };

  // Modal for Product UPDATE
  const updateProductModalSetting = (selectedProductData) => {
    console.log("Clicked: edit");
    setUpdateProduct(selectedProductData);
    setShowUpdateModal(!showUpdateModal);
  };

  // Delete item
  const deleteItem = (id) => {
    console.log("Product ID: ", id);
    console.log(`https://test-backend-cyan.vercel.app/api/product/delete/${id}`);
    fetch(`https://test-backend-cyan.vercel.app/api/product/delete/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setUpdatePage(!updatePage);
      });
  };

     // Handle Page Update
  const handlePageUpdate = () => {
    setUpdatePage(!updatePage);
  };

  // Handle Search Term
  const handleSearchTerm = (e) => {
    setSearchTerm(e.target.value);
    fetchSearchData();
  };
  
    // Filter products based on selection
    const rawMaterials = products.filter(p => p.type === 'raw');
    const readyProducts = products.filter(p => p.type === 'ready');
  
    return (
      <div className="col-span-12 lg:col-span-10 flex justify-center">
        <div className="flex flex-col gap-5 w-11/12">
          {/* ... existing overall inventory section ... */}
  
          {/* Inventory Type Selector */}
          <div className="flex justify-between items-center">
            <select 
              value={selectedInventoryType}
              onChange={(e) => setSelectedInventoryType(e.target.value)}
              className="p-2 border rounded-md"
            >
              <option value="all">All Inventory</option>
              <option value="raw">Raw Materials</option>
              <option value="ready">Ready Products</option>
            </select>
            
            <div className="flex gap-4">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded"
                onClick={addProductModalSetting}
              >
                Add Product
              </button>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold p-2 text-xs rounded"
                onClick={() => setShowBulkModal(true)}
              >
                Bulk Upload (Excel)
              </button>
            </div>
          </div>
  
          {/* Raw Materials Table */}
          {(selectedInventoryType === 'all' || selectedInventoryType === 'raw') && (
            <div className="overflow-x-auto rounded-lg border bg-white border-gray-200">
              <h3 className="p-3 font-bold">Raw Materials</h3>
              <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Manufacturer</th>
                    <th>Stock</th>
                    <th>Unit Type</th>
                    <th>Size</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rawMaterials.map(element => (
                    <tr key={element._id}>
                      <td>{element.name}</td>
                      <td>{element.manufacturer}</td>
                      <td>{element.stock}</td>
                      <td>{element.unitType}</td>
                      <td>{element.size}</td>
                      <td>{element.description}</td>
                      <td>
                        <button onClick={() => updateProductModalSetting(element)}>
                          Edit
                        </button>
                        <button onClick={() => deleteItem(element._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
  
          {/* Ready Products Table */}
          {(selectedInventoryType === 'all' || selectedInventoryType === 'ready') && (
            <div className="overflow-x-auto rounded-lg border bg-white border-gray-200">
              <h3 className="p-3 font-bold">Ready Products</h3>
              <table className="min-w-full divide-y-2 divide-gray-200 text-sm">
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Manufacturer</th>
                    <th>Stock</th>
                    <th>Ingredients</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {readyProducts.map(element => (
                    <tr key={element._id}>
                      <td>{element.name}</td>
                      <td>{element.manufacturer}</td>
                      <td>{element.stock}</td>
                      <td>
                        {element.ingredients?.map((ingredient, idx) => {
                          const material = rawMaterials.find(m => m._id === ingredient.material);
                          return (
                            <div key={idx} className="text-xs">
                              {material?.name}: {ingredient.quantity}{material?.size} 
                              (Waste: {ingredient.waste}{material?.size})
                            </div>
                          );
                        })}
                      </td>
                      <td>${element.price}</td>
                      <td>
                        <button onClick={() => updateProductModalSetting(element)}>
                          Edit
                        </button>
                        <button onClick={() => deleteItem(element._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
  
          {/* ... existing modals ... */}
        </div>
      </div>
    );
  }
  export default Inventory;
