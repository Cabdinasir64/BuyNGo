import React, { useState, useEffect } from "react";
import firebase from "/firebase";
import { motion } from "framer-motion";
import { FaCheck, FaTimes, FaShoppingBag } from "react-icons/fa";

const BuyerOrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const unsubscribe = firebase
      .firestore()
      .collection("orders")
      .where("buyerId", "==", user.uid)
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (snapshot) => {
          const ordersData = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate(),
          }));
          setOrders(ordersData);
          setLoading(false);
        },
        (err) => {
          setError("Failed to load orders");
          setLoading(false);
          setTimeout(() => {
            setSuccess("");
            setError("");
          }, 3000);
        }
      );

    return () => unsubscribe();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    setProcessing(orderId);
    try {
      const docRef = firebase.firestore().collection("orders").doc(orderId);

      const docSnap = await docRef.get();

      if (!docSnap.exists) {
        setError("Order not found.");
        setProcessing(null);
        setTimeout(() => setError(""), 3000);
        return;
      }

      await docRef.update({
        status: "cancelled",
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      setSuccess(`Order cancel successfully.`);
      setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
    } catch (err) {
      setError("Failed to cancel order");
      console.error(err);
      setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FaShoppingBag /> My Orders
      </h1>

      {error && (
        <div className="bg-accent-red/10 border-l-4 border-accent-red text-accent-red p-4 mb-6 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-accent-green/10 border-l-4 border-accent-green text-accent-green p-4 mb-6 rounded">
          {success}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">You haven't placed any orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-lg overflow-hidden ${
                order.status === "confirmed"
                  ? "bg-green-50 border-green-200"
                  : order.status === "cancelled"
                  ? "bg-red-50 border-red-200"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h3 className="font-bold">
                    Order #{order.id.substring(0, 8)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {order.createdAt.toLocaleDateString()} at{" "}
                    {order.createdAt.toLocaleTimeString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    order.status === "confirmed"
                      ? "bg-green-100 text-green-800"
                      : order.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="p-4">
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Items:</h4>
                  <ul className="space-y-2">
                    {order.items.map((item, index) => (
                      <li key={index} className="flex justify-between">
                        <span>
                          {item.name} x {item.quantity}
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-between border-t pt-3">
                  <div>
                    <h4 className="font-medium">Delivery Address:</h4>
                    <p>
                      {order.address.street}, {order.address.city}
                    </p>
                    <p>
                      {order.address.state}, {order.address.country}
                    </p>
                    <p>Name: {order.address.fullName}</p>
                    <p>Phone: {order.address.phone}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      Total: ${order.total.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {order.status === "pending" && (
                <div className="p-4 border-t bg-gray-50 flex justify-end">
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    disabled={processing === order.id}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
                  >
                    {processing === order.id ? (
                      "Processing..."
                    ) : (
                      <>
                        <FaTimes /> Cancel Order
                      </>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerOrdersTab;
