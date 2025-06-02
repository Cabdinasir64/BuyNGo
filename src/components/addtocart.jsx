import React, { useState } from "react";
import firebase from "/firebase";
import { motion, AnimatePresence } from "framer-motion";

function AddToCartButton({ product, user, className }) {
    const [errors, setErrors] = useState("");
    const [success, setSuccess] = useState("");

    const addToCart = async () => {
        if (!user) {
            setErrors("Please login to add to cart");
            setSuccess("");
            clearMessages();
            return;
        }

        try {
            const cartRef = firebase.firestore().collection("carts").doc(user.uid);
            const cartDoc = await cartRef.get();

            if (!cartDoc.exists) {
                await cartRef.set({
                    items: [
                        {
                            productId: product.id,
                            quantity: 1,
                            sellerId: product.sellerId || "",
                            price: product.price || 0,
                            name: product.name || "",
                            mainImage: product.mainImage || "",
                        },
                    ],
                });
            } else {
                const cartData = cartDoc.data();
                let items = cartData.items || [];
                const itemExist = items.findIndex((item) => item.productId === product.id);

                if (itemExist > -1) {
                    items[index].quantity += 1;
                } else {
                    items.push({
                        productId: product.id,
                        quantity: 1,
                        sellerId: product.sellerId || "",
                        price: product.price || 0,
                        name: product.name || "",
                        mainImage: product.mainImage || "",
                    });
                }

                await cartRef.update({ items });
            }

            setSuccess("Product added to cart");
            setErrors("");
            clearMessages();
        } catch (error) {
            setErrors("Failed to add product to cart. Try again.");
            setSuccess("");
            clearMessages();
        }
    };

    const clearMessages = () => {
        setTimeout(() => {
            setErrors("");
            setSuccess("");
        }, 3000);
    };

    return (
        <>
            <button
                onClick={addToCart}
                className={
                    className ||
                    ""
                }
            >
                Add to Cart
            </button>

            <AnimatePresence>
                {success && (
                    <motion.div
                        key="success"
                        className="mb-4 p-3 bg-green-100 text-accent-green rounded-md border border-accent-green absolute top-[40px] z-40 left-[0px]"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {success}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {errors && (
                    <motion.div
                        key="error"
                        className="mb-4 p-3 bg-red-100 text-accent-red rounded-md border border-accent-red absolute top-[40px] z-40 left-[0px]"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {errors}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default AddToCartButton;
