import React, { useState } from 'react';
import { FaHeart, FaShoppingCart, FaHome, FaInfoCircle, FaEnvelope, FaPhone } from 'react-icons/fa';
import { motion } from 'framer-motion';

function Footer() {
    const [openIndex, setOpenIndex] = useState(null);

    const faqs = [
        {
            question: "Sideen alaab uga dalban karaa?",
            answer: "Waxaad si fudud uga dalban kartaa adigoo isticmaalaya website-ka, dooro alaabta, ka dibna dhameystir lacag bixinta."
        },
        {
            question: "Intee ayaan ku sugi karaa dalabka?",
            answer: "Dalabkaaga waxa uu gaari doonaa inta badan 2-3 maalmood gudahood, iyadoo ku xiran meesha aad ku sugan tahay."
        },
        {
            question: "Sideen ula xiriiri karaa adeegga macaamiisha?",
            answer: "Waad nagala soo xiriiri kartaa email, telefoon, ama adeegga fariimaha degdega ah ee website-ka."
        }
    ];

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex !== index ? index : null);
    };

    return (
        <div className="min-h-screen flex flex-col">
            <section className="py-10 bg-gray-50 flex-grow">
                <div className="max-w-3xl mx-auto px-4">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-2xl md:text-3xl font-bold text-center mb-14 text-primary"
                    >
                        Su'aalaha La Weydiiyo Badanaa (FAQ)
                    </motion.h2>
                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                className="border rounded-lg overflow-hidden shadow-sm"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, ease: "linear" }}
                            >
                                <button
                                    className="w-full text-left p-4 flex justify-between items-center bg-gradient-to-r from-primary/10 to-primary hover:from-primary hover:to-primary/20 transition-all duration-300"
                                    onClick={() => toggleFAQ(index)}
                                >
                                    <span className="font-medium text-dark">
                                        {faq.question}
                                    </span>
                                    <span className="text-xl font-bold text-dark">
                                        {openIndex === index ? "-" : "+"}
                                    </span>
                                </button>
                                {openIndex === index && (
                                    <motion.div
                                        className="p-4 bg-white border-t"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.1, ease: "easeIn" }}
                                    >
                                        <p className="text-gray-700">{faq.answer}</p>
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="bg-gradient-to-r from-primary to-primary-light text-white py-8 mt-20">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* BuyNGo Brand Section */}
                        <div className="col-span-1">
                            <h3 className="text-xl font-bold mb-4 flex items-center">
                                <FaShoppingCart className="mr-2" />
                                BuyNGo
                            </h3>
                            <p className="text-indigo-100">
                                Adeegga iibsashada online ee ugu fiican ee Soomaaliya.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="font-semibold mb-4">Qiuck Links</h4>
                            <ul className="space-y-2">
                                <li>
                                    <a
                                        href="/"
                                        className="text-gray-100 hover:text-white flex items-center"
                                    >
                                        <FaHome className="mr-2" /> Home
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/about"
                                        className="text-gray-100 hover:text-white flex items-center"
                                    >
                                        <FaInfoCircle className="mr-2" /> About
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/contact"
                                        className="text-gray-100 hover:text-white flex items-center"
                                    >
                                        <FaEnvelope className="mr-2" /> Contact
                                    </a>
                                </li>
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h4 className="font-semibold mb-4">Contact Us</h4>
                            <ul className="space-y-2">
                                <li className="flex items-center">
                                    <FaEnvelope className="mr-2" /> info@buyngo.so
                                </li>
                                <li className="flex items-center">
                                    <FaPhone className="mr-2" /> +252 61 123 4567
                                </li>
                            </ul>
                        </div>

                        {/* Developer Credit */}
                        <div>
                            <h4 className="font-semibold mb-4">Sameeyaha</h4>
                            <div className="flex items-center">
                                <FaHeart className="text-accent-red mr-2" />
                                <span>Abdinasir Ahmed Bashir</span>
                            </div>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="border-t border-primary mt-8 pt-6 text-center text-gray-100">
                        <p>
                            © {new Date().getFullYear()} BuyNGo. Dhamaan xuquuqaha waa la
                            xifdiyay.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Footer;