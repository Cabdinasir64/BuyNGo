import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import firebase from "/firebase";
import { FaEdit, FaTrash, FaSearch, FaSpinner } from "react-icons/fa";
import AddProductTab from "./add_product";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const user = firebase.auth().currentUser;
        if (!user) return;

        const snapshot = await firebase
          .firestore()
          .collection("products")
          .where("sellerId", "==", user.uid)
          .get();

        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(productsData);
      } catch (error) {
        setErrors({ general: "Failed to fetch products" });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle product deletion
  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      setLoading(true);
      await firebase.firestore().collection("products").doc(productId).delete();

      setProducts((prev) => prev.filter((product) => product.id !== productId));
      setSuccess("Product deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setErrors({ general: "Failed to delete product" });
    } finally {
      setLoading(false);
    }
  };

  // Handle edit product
  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  // Handle update product
  const handleUpdate = async (updatedProduct) => {
    try {
      setLoading(true);
      setProducts((prev) =>
        prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
      );
      setEditingProduct(null);
      setSuccess("Product updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setErrors({ general: "Failed to update product" });
    } finally {
      setLoading(false);
    }
  };

  // Filter
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (editingProduct) {
    return (
      <div className="bg-white rounded-lg shadow-xl p-6">
        <button
          onClick={() => setEditingProduct(null)}
          className="mb-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
        >
          ← Back to Products
        </button>
        <AddProductTab
          initialProduct={editingProduct}
          onSave={handleUpdate}
          onCancel={() => setEditingProduct(null)}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-xl p-6"
    >
      <h2 className="text-xl font-semibold text-dark mb-6">All Products</h2>

      {success && (
        <motion.div
          className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-md shadow"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <p className="font-medium">{success}</p>
        </motion.div>
      )}

      {errors.general && (
        <motion.div
          className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md shadow"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <p className="font-medium">{errors.general}</p>
        </motion.div>
      )}

      {/* Search Bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search products by name..."
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full md:w-72"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-primary text-2xl mr-3" />
          <p className="text-dark-muted">Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-dark-muted">
            {searchTerm ? "No products match your search" : "No products found"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <div className="h-40 bg-gray-100 relative overflow-hidden">
                {product.mainImage ? (
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loadig="lazy"

                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FaImage className="text-4xl" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-dark text-lg mb-1 truncate">
                  {product.name}
                </h3>
                <p className="text-primary font-bold text-xl mb-1">
                  ${product.price}
                </p>
                <p className="text-dark-muted text-sm line-clamp-2 mb-2">
                  {product.description}
                </p>

                {/* Action Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={() => handleEdit(product)}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition flex items-center gap-2"
                  >
                    <FaEdit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                  >
                    <FaTrash size={14} />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default AllProducts;
