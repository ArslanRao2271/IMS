import React, { useState, useContext } from "react";
import { useDropzone } from "react-dropzone";
import readXlsxFile from "read-excel-file";
import AuthContext from "../AuthContext";

export default function BulkUpload({ closeModal, handlePageUpdate }) {
  const authContext = useContext(AuthContext);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [templateLink] = useState("/bulk-upload-template.xlsx");

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    multiple: false,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      
      setUploading(true);
      try {
        const rows = await readXlsxFile(acceptedFiles[0]);
        
        // Validate header
        const expectedHeaders = ["Name", "Manufacturer", "Stock", "Size", "Description", "Price"];
        const headerRow = rows[0];
        if (!expectedHeaders.every((h, i) => h === headerRow[i])) {
          throw new Error("Invalid file format. Please use the template.");
        }

        // Process data
        const materials = rows.slice(1).map((row, index) => {
          if (row.length !== expectedHeaders.length) {
            throw new Error(`Row ${index + 2}: Incorrect number of columns`);
          }
          
          return {
            name: row[0],
            manufacturer: row[1],
            stock: Number(row[2]),
            size: row[3]?.toString(),
            description: row[4]?.toString(),
            price: Number(row[5]) || 0
          };
        });

        // Send to backend
        const response = await fetch("https://test-backend-cyan.vercel.app/api/product/bulk-upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: authContext.user,
            materials
          })
        });

        const data = await response.json();
        
        if (!response.ok) throw new Error(data.error || "Upload failed");
        
        handlePageUpdate();
        closeModal();
      } catch (error) {
        setErrors([error.message]);
      } finally {
        setUploading(false);
      }
    }
  });

  return (
    <div className="p-6">
      <div className="mb-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
        >
          <input {...getInputProps()} />
          <p className="text-gray-600">
            {isDragActive ? "Drop Excel file here" : "Drag & drop Excel file, or click to select"}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Supported format: .xlsx (Excel) | 
            <a href={templateLink} download className="text-blue-600 ml-1">
              Download Template
            </a>
          </p>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 rounded-lg">
          {errors.map((error, index) => (
            <p key={index} className="text-red-600">• {error}</p>
          ))}
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={closeModal}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
        >
          Cancel
        </button>
        <div className="text-sm text-gray-500 mt-2">
          {uploading && "Processing..."}
        </div>
      </div>
    </div>
  );
}