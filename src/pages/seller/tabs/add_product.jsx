import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import firebase from "/firebase";
import { FaTrash, FaPlus, FaImage, FaTimes, FaSpinner } from "react-icons/fa";

const categoriesData = [
  {
    name: "Electronics & Technology",
    subcategories: [
      "Smartphones & Accessories",
      "Laptops & Computers",
      "Cameras & Photography",
      "Audio & Headphones",
      "Gaming & Consoles",
      "Wearable Tech (Smartwatches, Fitness Bands)",
    ],
  },
  {
    name: "Fashion & Apparel",
    subcategories: [
      "Men's Clothing",
      "Women's Clothing",
      "Kids & Baby Clothing",
      "Shoes & Accessories (bags, watches, jewelry)",
    ],
  },
  {
    name: "Home & Living",
    subcategories: [
      "Furniture",
      "Home Decor",
      "Kitchen & Dining",
      "Lighting",
      "Bedding & Bath",
    ],
  },
  {
    name: "Health & Beauty",
    subcategories: [
      "Skincare",
      "Makeup",
      "Haircare",
      "Fragrances",
      "Personal Care Products",
    ],
  },
  {
    name: "Tools & DIY",
    subcategories: [
      "Power Tools",
      "Hand Tools",
      "Home Improvement",
      "Garden & Outdoor",
    ],
  },
  {
    name: "Food & Grocery",
    subcategories: [
      "Fresh Food",
      "Packaged Food",
      "Beverages",
      "Health Supplements",
    ],
  },
  {
    name: "Baby & Kids",
    subcategories: [
      "Toys & Games",
      "Baby Gear (strollers, car seats)",
      "Kids' Fashion",
    ],
  },
  {
    name: "Books & Media",
    subcategories: ["Books", "eBooks", "Movies & Music"],
  },
  {
    name: "Sports & Outdoors",
    subcategories: ["Sports Equipment", "Outdoor Gear", "Fitness Products"],
  },
  {
    name: "Automotive",
    subcategories: [
      "Car Accessories",
      "Motorcycle Accessories",
      "Car Parts & Tools",
    ],
  },
  {
    name: "Pet Supplies",
    subcategories: ["Food", "Toys", "Grooming Products"],
  },
  {
    name: "Other General Categories",
    subcategories: [
      "Office Supplies",
      "Stationery",
      "Gifts",
      "Art & Craft Supplies",
    ],
  },
];

const AddProduct = ({ initialProduct, onSave, onCancel, onSuccess }) => {
  const defaultProductState = {
    name: "",
    price: "",
    description: "",
    category: "",
    mainImage: "",
    images: [],
    properties: [],
    quantity: 1,
  };

  // state has 2 values or edit or not edit
  const [product, setProduct] = useState(initialProduct || defaultProductState);

  useEffect(() => {
    if (initialProduct) {
      setProduct({
        ...defaultProductState,
        ...initialProduct,
        quantity: initialProduct.quantity ?? 0,
      });
    } else {
      setProduct(defaultProductState);
    }
  }, []);

  const [newProperty, setNewProperty] = useState({ key: "", value: "" });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Handle image upload
  const handleImageUpload = async (e, isMainImage = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const uploadedImages = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "test_test");

        const res = await fetch(
          "https://api.cloudinary.com/v1_1/db8dtpaus/image/upload",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();
        if (data.secure_url) {
          uploadedImages.push(data.secure_url);
        } else {
          throw new Error(data.error.message || "Cloudinary upload failed");
        }
      }

      if (isMainImage) {
        setProduct((prev) => ({ ...prev, mainImage: uploadedImages[0] }));
      } else {
        setProduct((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedImages].slice(0, 5),
        }));
      }
    } catch (error) {
      setTimeout(() => {
        setErrors({ general: `Failed to upload images: ${error.message}` });
      }, 3000);
    }
  };

  // Handle property adding
  const handleAddProperty = () => {
    if (newProperty.key.trim() && newProperty.value.trim()) {
      setProduct((prev) => ({
        ...prev,
        properties: [...prev.properties, newProperty],
      }));
      setNewProperty({ key: "", value: "" });
    }
  };

  // Handle property removal
  const handleRemoveProperty = (index) => {
    setProduct((prev) => ({
      ...prev,
      properties: prev.properties.filter((_, i) => i !== index),
    }));
  };

  // Handle image removal
  const handleRemoveImage = (index, isMain = false) => {
    if (isMain) {
      setProduct((prev) => ({ ...prev, mainImage: "" }));
    } else {
      setProduct((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index),
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    const newErrors = {};
    if (!product.name.trim()) newErrors.name = "Product name is required";
    if (
      !product.price ||
      isNaN(parseFloat(product.price)) ||
      parseFloat(product.price) <= 0
    )
      newErrors.price = "Valid positive price is required";
    if (!product.description.trim())
      newErrors.description = "Product description is required";
    if (!product.category) newErrors.category = "Product category is required";
    if (!product.mainImage) newErrors.mainImage = "Main image is required";
    if (!product.properties.length)
      newErrors.properties = "At least one property is required";
    if (
      product.quantity === undefined ||
      isNaN(product.quantity) ||
      product.quantity < 1
    ) {
      newErrors.quantity = "Please enter a valid quantity";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);
      const productData = {
        ...product,
        price: Number(parseFloat(product.price).toFixed(2)),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      };
      if (initialProduct) {
        await firebase
          .firestore()
          .collection("products")
          .doc(initialProduct.id)
          .update(productData);
        if (onSave) onSave(productData);
      } else {
        const user = firebase.auth().currentUser;
        productData.sellerId = user.uid;
        productData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        const duplicateCheck = await firebase
          .firestore()
          .collection("products")
          .where("name", "==", productData.name)
          .where("description", "==", productData.description)
          .get();

        if (!duplicateCheck.empty) {
          setErrors({ general: "This product already exists." });
          setTimeout(() => setErrors(""), 3000);
          return;
        } else {
          await firebase.firestore().collection("products").add(productData);

          setSuccess("Product added successfully");

          setTimeout(() => {
            setSuccess("");
            if (onSuccess) onSuccess();
          }, 3000);

          setProduct({
            name: "",
            price: "",
            description: "",
            category: "",
            mainImage: "",
            images: [],
            properties: [],
          });
        }
      }
    } catch (error) {
      setErrors({ general: "Error saving product" });
      setErrors({
        general: initialProduct
          ? "Failed to update product"
          : "Failed to add product",
      });
      setTimeout(() => {
        setErrors({});
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-xl p-6 md:p-8"
    >
      <h2 className="text-2xl font-bold text-dark font-heading mb-4">
        {initialProduct ? "Edit Product" : "Add New Product"}
      </h2>
      {onCancel && (
        <button
          onClick={onCancel}
          className="px-4 py-2 mb-4 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
        >
          Cancel
        </button>
      )}

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

      <form onSubmit={handleSubmit} className="space-y-6 mt-2">
        {/* Product Name */}
        <div>
          <label
            htmlFor="productName"
            className="block text-sm font-medium text-dark-muted mb-1"
          >
            Product Name *
          </label>
          <input
            id="productName"
            type="text"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.name
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-primary focus:border-primary"
              }`}
            placeholder="Enter product name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Product Price */}
        <div>
          <label
            htmlFor="productPrice"
            className="block text-sm font-medium text-dark-muted mb-1"
          >
            Price *
          </label>
          <input
            id="productPrice"
            type="number"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: e.target.value })}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.price
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-primary focus:border-primary"
              }`}
            placeholder="Enter price (e.g., 10.99)"
            step="0.01"
            min="0.01"
          />
          {errors.price && (
            <p className="mt-1 text-sm text-red-600">{errors.price}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="productCategory"
            className="block text-sm font-medium text-dark-muted mb-1"
          >
            Category *
          </label>
          <select
            id="productCategory"
            value={product.category}
            onChange={(e) =>
              setProduct({ ...product, category: e.target.value })
            }
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors bg-white ${errors.category
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-primary focus:border-primary"
              }`}
          >
            <option value="">Select Category</option>
            {categoriesData.map((mainCat) => (
              <optgroup
                label={mainCat.name}
                key={mainCat.name}
                className="font-semibold"
              >
                {mainCat.subcategories.map((subCat) => (
                  <option
                    value={subCat}
                    key={subCat}
                    className="text-dark-muted"
                  >
                    {subCat}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>
        {/* Product Description */}
        <div>
          <label
            htmlFor="productDescription"
            className="block text-sm font-medium text-dark-muted mb-1"
          >
            Description *
          </label>
          <textarea
            id="productDescription"
            value={product.description}
            onChange={(e) =>
              setProduct({ ...product, description: e.target.value })
            }
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.description
              ? "border-red-500 focus:ring-red-300"
              : "border-gray-300 focus:ring-primary focus:border-primary"
              }`}
            rows="4"
            placeholder="Enter product description"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Main Image Upload */}
        <div>
          <label className="block text-sm font-medium text-dark-muted mb-1">
            Main Image *
          </label>
          <div className="flex items-center gap-4">
            {product.mainImage ? (
              <div className="relative group">
                <img
                  src={product.mainImage}
                  alt="Main product"
                  className="w-32 h-32 object-cover rounded-lg border-2 border-primary-light shadow-md"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(null, true)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md transform opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all duration-200"
                  aria-label="Remove main image"
                >
                  <FaTrash size={12} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-primary-light rounded-lg cursor-pointer hover:bg-primary-lightest transition text-primary">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                  className="hidden"
                />
                <FaImage className="text-3xl mb-2" />
                <span className="text-sm font-medium">Upload Main</span>
              </label>
            )}
          </div>
          {errors.mainImage && (
            <p className="mt-1 text-sm text-red-600">{errors.mainImage}</p>
          )}
        </div>

        {/* Additional Images */}
        <div>
          <label className="block text-sm font-medium text-dark-muted mb-1">
            Additional Images (Max 5)
          </label>
          <div className="flex flex-wrap gap-4">
            {product.images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img}
                  alt={`Product image ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200 hover:border-primary-light transition cursor-pointer shadow-sm"
                  onClick={() => setSelectedImage(img)}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md transform opacity-0 group-hover:opacity-100 hover:bg-red-600 transition-all duration-200"
                  aria-label={`Remove image ${index + 1}`}
                >
                  <FaTrash size={10} />
                </button>
              </div>
            ))}

            {product.images.length < 5 && (
              <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition text-dark-muted hover:text-primary">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={product.images.length >= 5}
                />
                <FaPlus className="text-2xl mb-1" />
                <span className="text-xs font-medium">
                  Add ({5 - product.images.length} left)
                </span>
              </label>
            )}
          </div>
        </div>

        {/* Image Preview Modal */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div
              className="fixed inset-0 -top-20 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
            >
              <motion.div
                className="relative bg-white p-2 rounded-lg shadow-2xl max-w-lg w-full max-h-[80vh]"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={selectedImage}
                  alt="Preview"
                  className="w-full h-auto object-cover rounded-md max-h-[calc(80vh-60px)]"
                />
                <button
                  className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition"
                  onClick={() => setSelectedImage(null)}
                  aria-label="Close image preview"
                  type="button"
                >
                  <FaTimes size={20} className="text-red-500" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <label className="block text-sm font-medium text-dark-muted mb-2">
            Product Properties (e.g., Size: XL, Color: Red)
          </label>
          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
            {product.properties.map((prop, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-3 p-2 bg-white rounded shadow-sm"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                layout
              >
                <span className="font-medium text-primary">{prop.key}:</span>
                <span className="text-dark-muted flex-1">{prop.value}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveProperty(index)}
                  className="ml-auto text-red-500 hover:text-red-700 transition p-1 rounded-full hover:bg-red-100"
                  aria-label={`Remove property ${prop.key}`}
                >
                  <FaTrash size={14} />
                </button>
              </motion.div>
            ))}

            <div className="flex flex-col sm:flex-row gap-2 items-start pt-2">
              <div className="flex-1 w-full sm:w-auto">
                <input
                  type="text"
                  value={newProperty.key}
                  onChange={(e) =>
                    setNewProperty({ ...newProperty, key: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="Property Name (e.g. Color)"
                />
              </div>
              <div className="flex-1 w-full sm:w-auto">
                <input
                  type="text"
                  value={newProperty.value}
                  onChange={(e) =>
                    setNewProperty({ ...newProperty, value: e.target.value })
                  }
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  placeholder="Property Value (e.g. Blue)"
                />
              </div>
              <button
                type="button"
                onClick={handleAddProperty}
                className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition flex items-center gap-1.5 w-full sm:w-auto justify-center"
                disabled={!newProperty.key.trim() || !newProperty.value.trim()}
              >
                <FaPlus size={14} />
                <span>Add Property</span>
              </button>
            </div>
            {errors.properties && product.properties.length === 0 && (
              <p className="mt-1 text-sm text-red-600">{errors.properties}</p>
            )}
          </div>
        </div>
        <div>
          <label
            htmlFor="productQuantity"
            className="block text-sm font-medium text-dark-muted mb-1"
          >
            Quantity in Stock *
          </label>
          <div className="relative">
            <input
              id="productQuantity"
              type="number"
              value={product.quantity}
              onChange={(e) => {
                setProduct({
                  ...product,
                  quantity: e.target.value
                });
              }
              }
              className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.quantity
                ? "border-red-500 focus:ring-red-300"
                : "border-gray-300 focus:ring-primary focus:border-primary"
                }`}
              placeholder="Enter available quantity"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
            )}
          </div>
        </div>
        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-primary hover:bg-primary-dark/80 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 transition-all duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-lg"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                {initialProduct ? "Updating..." : "Adding..."}
              </>
            ) : initialProduct ? (
              "Update Product"
            ) : (
              "Add Product"
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};
export default AddProduct;
