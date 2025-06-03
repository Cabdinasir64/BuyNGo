import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPaperPlane, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import Navbar from '../../components/navbar'
import Footer from '../../components/footer'

const ContactUs = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate form submission
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });

            // Hide success message after 3 seconds
            setTimeout(() => setSuccess(false), 3000);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4 mt-16">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl md:text-4xl font-bold mb-4"
                    >
                        Contact Us
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg max-w-2xl mx-auto"
                    >
                        We'd love to hear from you! Reach out with any questions or
                        feedback.
                    </motion.p>
                </div>
            </div>

            {/* Contact Content */}
            <div className="max-w-6xl mx-auto py-12 px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-lg shadow-lg p-6"
                    >
                        <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>

                        {success && (
                            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
                                Thank you! Your message has been sent successfully.
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium mb-1"
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div className="mb-4">
                                <label
                                    htmlFor="email"
                                    className="block text-sm font-medium mb-1"
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div className="mb-4">
                                <label
                                    htmlFor="subject"
                                    className="block text-sm font-medium mb-1"
                                >
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div className="mb-6">
                                <label
                                    htmlFor="message"
                                    className="block text-sm font-medium mb-1"
                                >
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="5"
                                    value={formData.message}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    "Sending..."
                                ) : (
                                    <>
                                        <FaPaperPlane /> Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>

                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                                        <FaMapMarkerAlt className="text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Our Location</h3>
                                        <p className="text-gray-600">
                                            123 Main Street, Mogadishu, Somalia
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-green-100 p-3 rounded-full text-green-600">
                                        <FaPhone className="text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Phone Number</h3>
                                        <p className="text-gray-600">+252 61 123 4567</p>
                                        <p className="text-gray-600">+252 61 765 4321</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                                        <FaEnvelope className="text-xl" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">Email Address</h3>
                                        <p className="text-gray-600">info@buyngo.so</p>
                                        <p className="text-gray-600">support@buyngo.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-2xl font-bold mb-4">Business Hours</h2>
                            <ul className="space-y-2">
                                <li className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Monday - Friday</span>
                                    <span className="font-medium">9:00 AM - 6:00 PM</span>
                                </li>
                                <li className="flex justify-between border-b pb-2">
                                    <span className="text-gray-600">Saturday</span>
                                    <span className="font-medium">10:00 AM - 4:00 PM</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="text-gray-600">Sunday</span>
                                    <span className="font-medium">Closed</span>
                                </li>
                            </ul>
                        </div>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ContactUs;