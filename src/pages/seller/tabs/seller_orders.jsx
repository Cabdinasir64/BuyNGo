import React, { useState, useEffect } from "react";
import firebase from "/firebase";
import { motion } from "framer-motion";
import { FaCheck, FaTimes, FaTrash, FaShoppingBag } from "react-icons/fa";

const SellerOrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    const user = firebase.auth().currentUser;
    if (!user) return;

    const stopListening = firebase
      .firestore()
      .collection("orders")
      .orderBy("createdAt", "desc")
      .onSnapshot(
        (snapshot) => {
          const ordersData = snapshot.docs
            .map((doc) => {
              const data = doc.data();
              const sellerItems = data.items.filter(
                (item) => item.sellerId === user.uid
              );

              if (!sellerItems || sellerItems.length === 0) return null;

              const sellerTotal = sellerItems.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
              );

              return {
                id: doc.id,
                ...data,
                items: sellerItems,
                total: sellerTotal,
                createdAt: data.createdAt?.toDate(),
              };
            })
            .filter((order) => order != null);

          setOrders(ordersData);
          setLoading(false);
        },
        (err) => {
          setError("Failed to load orders");
          setLoading(false);
          setTimeout(() => {
            setError("");
          }, 3000);
        }
      );

    return () => stopListening();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
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

      const orderData = docSnap.data();
      const user = firebase.auth().currentUser;

      const sellerItems = orderData.items.filter(
        (item) => item.sellerId === user.uid
      );

      if (newStatus === "cancelled") {
        for (const item of sellerItems) {
          const productRef = firebase.firestore().collection("products").doc(item.productId);
          const productSnap = await productRef.get();
          if (productSnap.exists) {
            const productData = productSnap.data();
            const updatedStock = (productData.quantity || 0) + item.quantity;
            await productRef.update({ quantity: updatedStock });
          }
        }
      }

      await docRef.update({
        status: newStatus,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });

      setSuccess(`Order ${newStatus}d successfully.`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(`Failed to ${newStatus} order`);
      setTimeout(() => setError(""), 3000);
    } finally {
      setProcessing(null);
    }
  };


  const handleClearHistory = async () => {
    const user = firebase.auth().currentUser;
    if (!user) {
      return;
    }

    if (!window.confirm("Are you sure you want to clear all your order history (except pending)?")) return;

    try {
      const snapshot = await firebase
        .firestore()
        .collection("orders")
        .orderBy("createdAt", "desc")
        .get();

      for (const doc of snapshot.docs) {
        const data = doc.data();

        const sellerItems = data.items?.filter((item) => item.sellerId === user.uid) || [];
        if (sellerItems.length === 0) continue;
        if (data.status === "pending") continue;

        const sellerTotal = sellerItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        const orderToSave = {
          ...data,
          items: sellerItems,
          total: sellerTotal,
          sellerId: user.uid,
          originalOrderId: doc.id,
          clearedAt: firebase.firestore.FieldValue.serverTimestamp(),
        };


        await firebase.firestore().collection("historyorders").add(orderToSave);

        const remainingItems = data.items.filter(item => item.sellerId !== user.uid);

        if (remainingItems.length === 0) {
          await doc.ref.delete();
        } else {
          console.log("Updating order:", doc.id, "with remaining items:", remainingItems);
          await doc.ref.update({
            items: remainingItems,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      setSuccess("History cleared and saved successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error in handleClearHistory:", err);
      setError("Failed to clear history.");
      setTimeout(() => setError(""), 3000);
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <FaShoppingBag /> Sales Orders
        </h1>
        <div className="flex justify-end mb-4">
          <button
            onClick={handleClearHistory}
            className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded"
          >
            Clear All History
          </button>
        </div>
      </div>
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
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`border rounded-lg overflow-hidden ${order.status === "confirmed"
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
                  className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === "confirmed"
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

              <div className="p-4 border-t bg-gray-50 flex justify-end gap-2">
                {order.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(order.id, "confirmed")}
                      disabled={processing === order.id}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
                    >
                      {processing === order.id ? (
                        "Processing..."
                      ) : (
                        <>
                          <FaCheck /> Confirm
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, "cancelled")}
                      disabled={processing === order.id}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
                    >
                      {processing === order.id ? (
                        "Processing..."
                      ) : (
                        <>
                          <FaTimes /> Cancel
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrdersTab;
