import React, { useState, useEffect } from "react";
import firebase from "/firebase";
import { motion } from "framer-motion";
import { FaHistory } from "react-icons/fa";

const OrderHistoryTab = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const user = firebase.auth().currentUser;
        if (!user) return;

        const unsubscribe = firebase
            .firestore()
            .collection("historyorders")
            .where("buyerId", "==", user.uid)
            .orderBy("clearedAt", "desc")
            .onSnapshot(
                (snapshot) => {
                    const data = snapshot.docs.map((doc) => {
                        const d = doc.data();
                        return {
                            id: doc.id,
                            ...d,
                            createdAt: d.createdAt?.toDate(),
                            clearedAt: d.clearedAt?.toDate(),
                        };
                    });
                    setOrders(data);
                    setLoading(false);
                },
                (err) => {
                    setError("Failed to load order history");
                    console.error(err);
                    setLoading(false);
                    setTimeout(() => setError(""), 3000);
                }
            );

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FaHistory /> My Order History
                </h1>
            </div>

            {error && (
                <div className="bg-accent-red/10 border-l-4 border-accent-red text-accent-red p-4 mb-6 rounded">
                    {error}
                </div>
            )}

            {orders.length === 0 ? (
                <div className="bg-white p-8 rounded-lg shadow text-center">
                    <p className="text-gray-500">No order history found.</p>
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
                                        Order #{order.originalOrderId?.substring(0, 8) || order.id.substring(0, 8)}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {order.createdAt
                                            ? order.createdAt.toLocaleDateString() + " " + order.createdAt.toLocaleTimeString()
                                            : "Unknown Date"}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        Cleared on: {order.clearedAt?.toLocaleDateString() || "-"}
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
                                        {order.items?.map((item, idx) => (
                                            <li key={idx} className="flex justify-between">
                                                <span>{item.name} x {item.quantity}</span>
                                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="flex justify-between border-t pt-3">
                                    <div>
                                        <h4 className="font-medium">Delivered To:</h4>
                                        <p>{order.address?.street}, {order.address?.city}</p>
                                        <p>{order.address?.state}, {order.address?.country}</p>
                                        <p>Name: {order.address?.fullName}</p>
                                        <p>Phone: {order.address?.phone}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">Total: ${order.total?.toFixed(2)}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistoryTab;
