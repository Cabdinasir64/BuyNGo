import React, { useEffect, useState } from "react";
import firebase from "/firebase";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTrash,
  FaPlus,
  FaMinus,
  FaShoppingCart,
  FaArrowRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // rending cart whith current user
  useEffect(() => {
    const stopListening = firebase
      .auth()
      .onAuthStateChanged(async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          try {
            const doc = await firebase
              .firestore()
              .collection("carts")
              .doc(firebaseUser.uid)
              .get();

            if (doc.exists) {
              const items = {
                id: doc.id,
                ...doc.data(),
              };
              setCartItems(items.items || []);
            }
          } catch (error) {
            setErrorMessage("Error fetching cart items");
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      });

    return () => stopListening();
  }, []);

  // syncing cart with products stock
  useEffect(() => {
    const syncCartWithStock = async () => {
      if (!user) return;

      const cartRef = firebase.firestore().collection("carts").doc(user.uid);
      const cartDoc = await cartRef.get();
      const items = cartDoc.exists ? cartDoc.data().items || [] : [];

      const updatedItems = [];

      for (const item of items) {
        const productDoc = await firebase.firestore().collection("products").doc(item.productId).get();

        if (productDoc.exists) {
          const product = productDoc.data();
          const stock = product.quantity || 0;

          if (stock === 0) continue;
          const newQty = Math.min(item.quantity, stock);
          updatedItems.push({ ...item, quantity: newQty });
        }
      }

      await cartRef.update({ items: updatedItems });
      setCartItems(updatedItems);
    };

    syncCartWithStock();
  }, [user]); // ❗️Only depends on user



  // updating cart quantity
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1 || !user) return;

    try {
      const productDoc = await firebase.firestore().collection("products").doc(productId).get();
      const productData = productDoc.data();
      const stock = productData.quantity || 0;

      if (newQuantity > stock) {
        setErrorMessage(`Only ${stock} in stock`);
        return;
      }

      const cartRef = firebase.firestore().collection("carts").doc(user.uid);
      const cartDoc = await cartRef.get();

      if (cartDoc.exists) {
        let items = cartDoc.data().items || [];

        const updatedItems = items.map((item) => {
          if (item.productId === productId) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        });

        await cartRef.update({ items: updatedItems });
        setCartItems((prev) =>
          prev.map((item) =>
            item.productId === productId
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
        setSuccessMessage("Quantity updated successfully");
      }
    } catch (error) {
      setErrorMessage("Error updating quantity");
      console.error("Error updating quantity:", error);
    }
  };


  // deleting cart item
  const deleteItem = async (productId) => {
    setIsDeleting(productId);
    try {
      const cartRef = firebase.firestore().collection("carts").doc(user.uid);
      const cartDoc = await cartRef.get();

      if (cartDoc.exists) {
        let items = cartDoc.data().items || [];
        const updatedItems = items.filter(
          (item) => item.productId !== productId
        );

        await cartRef.update({ items: updatedItems });
        setCartItems(updatedItems);
        setSuccessMessage("Item removed from cart");
        setErrorMessage("");
      }
    } catch (error) {
      setErrorMessage("Failed to remove item from cart");
      setSuccessMessage("");
    } finally {
      setIsDeleting(null);
    }
  };

  // total price
  const getTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  // total cart
  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  const handleCheckout = () => {
    navigate("/checkout");
    setSuccessMessage("Redirecting to checkout...");
    setErrorMessage("");
  };

  useEffect(() => {
    if (successMessage || errorMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
        setErrorMessage("");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, errorMessage]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      {successMessage && (
        <div className="fixed -mt-12 w-3xl bg-green-100 text-green-800 border border-green-200 px-4 py-2 rounded">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="fixed -mt-12 w-3xl bg-red-100 text-red-800 border border-red-200 px-4 py-2 rounded">
          {errorMessage}
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto"
      >
        <div className="flex items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FaShoppingCart className="mr-3 text-primary" />
            Your Shopping Cart
          </h1>
          {cartItems.length > 0 && (
            <span className="ml-auto bg-primary text-white text-sm font-bold px-3 py-1 rounded-full">
              {getItemCount()} {getItemCount() === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        <AnimatePresence>
          {cartItems.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white rounded-xl shadow-md p-8 text-center"
            >
              <div className="text-gray-400 mb-4">
                <FaShoppingCart className="mx-auto text-5xl" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-6">
                Looks like you haven't added anything to your cart yet
              </p>
              <button
                onClick={() => navigate("/shopping")}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
              >
                Continue Shopping
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-xl shadow-sm overflow-hidden"
                  >
                    <AnimatePresence>
                      {isDeleting !== item.productId ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                        >
                          <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={item.mainImage}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-grow">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {item.name}
                            </h3>
                            <p className="text-primary font-bold text-lg">
                              ${item.price.toFixed(2)}
                            </p>
                            <div className="flex items-center mt-2">
                              <button
                                onClick={() =>
                                  item.quantity === 1
                                    ? deleteItem(item.productId)
                                    : updateQuantity(item.productId, item.quantity - 1)
                                }
                                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                              >
                                <FaMinus className="text-gray-600" />
                              </button>
                              <span className="mx-3 w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.quantity + 1
                                  )
                                }
                                className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                              >
                                <FaPlus className="text-gray-600" />
                              </button>
                            </div>
                          </div>

                          <button
                            onClick={() => deleteItem(item.productId)}
                            className="p-3 text-red-500 hover:text-red-700 transition self-end sm:self-auto"
                          >
                            <FaTrash />
                          </button>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 1 }}
                          animate={{ opacity: 0 }}
                          exit={{ opacity: 0 }}
                          className="p-4 flex justify-center items-center h-24"
                        >
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-xl shadow-sm p-6 sticky top-4"
                >
                  <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        ${getTotal().toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-primary text-xl">
                        ${getTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition"
                  >
                    Proceed to Checkout
                    <FaArrowRight />
                  </motion.button>

                  <button
                    onClick={() => navigate("/shopping")}
                    className="w-full mt-4 text-primary hover:text-primary-dark py-2 rounded-lg font-medium transition"
                  >
                    Continue Shopping
                  </button>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Cart;
