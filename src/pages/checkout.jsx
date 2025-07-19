import { v4 as uuidv4 } from "uuid";
import React, { useState, useEffect } from "react";
import firebase from "/firebase";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaPlus,
  FaArrowRight,
} from "react-icons/fa";

const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [sellerId, setSellerId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "Somalia",
    zip: "",
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const user = firebase.auth().currentUser;
      if (!user) {
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        setError("");
        // Fetch cart items
        const cartDoc = await firebase
          .firestore()
          .collection("carts")
          .doc(user.uid)
          .get();
        if (cartDoc.exists) {
          let items = cartDoc.data().items || [];

          items = items.map((item) => ({
            ...item,
            id: cartDoc.id,
          }));

          setCartItems(items);
          if (items.length > 0) {
            setSellerId(items[0].sellerId);
          } else {
            navigate("/cart");
            return;
          }
        }
        // Fetch addresses
        const snap = await firebase
          .firestore()
          .collection("addresses")
          .where("buyerId", "==", user.uid)
          .orderBy("createdAt", "desc")
          .get();

        const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setAddresses(list);

        if (list.length > 0) setSelectedAddress(list[0]);
      } catch (err) {
        setError("Failed to load checkout data. Please try again.");
        setTimeout(() => {
          setSuccess("");
          setError("");
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTotal = () =>
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePlaceOrder = async () => {
    const user = firebase.auth().currentUser;
    if (!user) {
      navigate("/");
      return;
    }
    if (!selectedAddress) {
      setError("Please select a delivery address");
      setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
      return;
    }
    setPlacingOrder(true);
    setError("");
    setSuccess("");

    try {
      for (const item of cartItems) {
        const productRef = firebase.firestore().collection("products").doc(item.productId);
        const productDoc = await productRef.get();

        if (!productDoc.exists) {
          throw new Error(`Product ${item.name} does not exist.`);
        }

        const currentStock = productDoc.data().quantity;

        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.name}.`);
        }

        await productRef.update({
          quantity: currentStock - item.quantity,
        });
      }

      await firebase.firestore().collection("orders").add({
        sellerId: sellerId,
        buyerId: user.uid,
        items: cartItems,
        total: getTotal(),
        status: "pending",
        address: selectedAddress,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      await firebase.firestore().collection("carts").doc(user.uid).delete();

      setSuccess("Order placed successfully!");
      setTimeout(() => {
        setSuccess("");
        navigate("/");
      }, 2000);
    } catch (error) {
      setError(error.message || "Failed to place order. Please try again.");
      setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
    } finally {
      setPlacingOrder(false);
    }
  };


  const handleAddressChange = (e) => {
    setNewAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const user = firebase.auth().currentUser;
    if (!user) return;

    setSavingAddress(true);
    setError("");

    try {
      const docRef = await firebase
        .firestore()
        .collection("addresses")
        .add({
          ...newAddress,
          buyerId: user.uid,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        });

      const newAddr = { id: docRef.id, ...newAddress };
      setAddresses((prev) => [newAddr, ...prev]);
      setSelectedAddress(newAddr);
      setShowAddressForm(false);
      setNewAddress({
        fullName: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        country: "Somalia",
        zip: "",
      });
      setSuccess("Address saved successfully!");
      setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
    } catch (err) {
      setError("Failed to save address. Please try again.");
      setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
    } finally {
      setSavingAddress(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Checkout</h2>

      {/* Error/Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded"
          >
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2" />
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded"
          >
            <div className="flex items-center">
              <FaCheckCircle className="mr-2" />
              <span>{success}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Items Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 rounded-lg shadow-md mb-6"
      >
        <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
        <div className="divide-y">
          {cartItems.map((item) => (
            <div key={item.id} className="py-3 flex justify-between">
              <div className="flex items-center">
                <img
                  src={item.mainImage}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded mr-4"
                  loadig="lazy"

                />
                <div>
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                </div>
              </div>
              <span className="font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t pt-4 mt-2 flex justify-between font-bold text-lg">
          <span>Total:</span>
          <span>${getTotal().toFixed(2)}</span>
        </div>
      </motion.div>

      {/* Address Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white p-6 rounded-lg shadow-md mb-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Delivery Address</h3>
          {!showAddressForm && (
            <button
              onClick={() => setShowAddressForm(true)}
              className="text-primary hover:text-primary-dark flex items-center gap-1"
            >
              <FaPlus /> Add New Address
            </button>
          )}
        </div>

        {showAddressForm ? (
          <form onSubmit={handleSaveAddress} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  name="fullName"
                  value={newAddress.fullName}
                  onChange={handleAddressChange}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={newAddress.phone}
                  onChange={handleAddressChange}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Street Address
              </label>
              <input
                name="street"
                value={newAddress.street}
                onChange={handleAddressChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input
                  name="city"
                  value={newAddress.city}
                  onChange={handleAddressChange}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  State/Region
                </label>
                <input
                  name="state"
                  value={newAddress.state}
                  onChange={handleAddressChange}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  ZIP Code
                </label>
                <input
                  name="zip"
                  value={newAddress.zip}
                  onChange={handleAddressChange}
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <select
                name="country"
                value={newAddress.country}
                onChange={handleAddressChange}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Somalia">Somalia</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={savingAddress}
                className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
              >
                {savingAddress ? "Saving..." : "Save Address"}
              </button>

              <button
                type="button"
                onClick={() => setShowAddressForm(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-medium transition"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : addresses.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500 mb-4">
              You haven't added any addresses yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <label
                key={addr.id}
                className={`block border p-4 rounded-lg cursor-pointer transition ${selectedAddress.id === addr.id
                  ? "border-primary bg-primary/10"
                  : "border-gray-200 hover:border-primary"
                  }`}
              >
                <input
                  type="radio"
                  name="address"
                  value={addr.id}
                  checked={selectedAddress.id === addr.id}
                  onChange={() => setSelectedAddress(addr)}
                  className="hidden"
                />
                <div className="flex">
                  <div
                    className={`w-5 h-5 border rounded-full mt-1 mr-3 flex-shrink-0 ${selectedAddress.id === addr.id
                      ? "border-primary bg-primary"
                      : "border-gray-300"
                      }`}
                  >
                    {selectedAddress.id === addr.id && (
                      <div className="w-3 h-3 bg-white rounded-full m-1"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">{addr.fullName}</h4>
                    <p className="text-gray-600">{addr.phone}</p>
                    <p className="mt-1 text-gray-700">
                      {addr.street}, {addr.city}, {addr.state}, {addr.country}{" "}
                      {addr.zip}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </motion.div>

      {/* Place Order Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="sticky bottom-0 bg-white p-4 shadow-lg rounded-lg"
      >
        <button
          onClick={handlePlaceOrder}
          className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
        >
          {placingOrder ? "Placing Order..." : "Place Order"}
          {!placingOrder && <FaArrowRight />}
        </button>
      </motion.div>
    </div>
  );
};

export default Checkout;
