import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaShoppingCart, FaTruck, FaShieldAlt } from 'react-icons/fa';

const features = [
    {
        icon: <FaShoppingCart className="w-10 h-10 text-primary-dark" />,
        title: "Easy Ordering",
        description: "Browse premium products and place your order with just a few clicks."
    },
    {
        icon: <FaTruck className="w-10 h-10 text-primary-dark" />,
        title: "Fast Delivery",
        description: "We deliver your items quickly, no matter where you're located."
    },
    {
        icon: <FaShieldAlt className="w-10 h-10 text-primary-dark" />,
        title: "Secure Payments",
        description: "Our protected payment system ensures your money is always safe."
    }
];

function Features() {
    return (
        <section className="py-20 bg-gray-100">
            <div className="max-w-6xl mx-auto px-4 text-center">
                <motion.h2
                    className="text-3xl md:text-4xl font-heading mb-10 text-dark-default"
                    initial={{ opacity: 0, y: -20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    Why Choose Us?
                </motion.h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                            viewport={{ once: true }}
                            transition={{
                                duration: 0.5,
                                delay: idx * 0.1,
                                type: "spring",
                                stiffness: 100
                            }}
                            className="bg-white rounded-lg p-6 shadow-md flex flex-col items-center hover:shadow-lg transition-all"
                        >
                            <motion.div
                                className="mb-4"
                                whileHover={{ scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                {feature.icon}
                            </motion.div>
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Features;