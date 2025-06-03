import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import firebase from "/firebase";
import { useNavigate } from "react-router-dom";
import { FaBox, FaChevronDown, FaPlus, FaList } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import ProfileTab from './tabs/profile'
import AddProductTab from './tabs/add_product'
import AllProductsTab from './tabs/all_products'


const SellerDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("add-product");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isProductsOpen, setIsProductsOpen] = useState(false);
    // Handle logout
    const handleLogout = async () => {
        try {
            await firebase.auth().signOut();
            navigate("/");
        } catch (error) {
            setErrors({ general: "Failed to logout" });
        }
    };

    // Render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case "add-product":
                return <AddProductTab onSuccess={() => setActiveTab("all-products")} />;
            case "all-products":
                return <AllProductsTab />;
            case "profile":
                return <ProfileTab />;
            case "products":
            default:
                return null;
        }
    };
    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Mobile sidebar toggle */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-primary p-4 flex justify-between items-center z-30 shadow-md">
                <h1 className="text-xl font-bold text-white font-heading">
                    Seller Dashboard
                </h1>
                <motion.button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="text-white focus:outline-none"
                    whileTap={{ scale: 0.9 }}
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <AnimatePresence mode="wait">
                            {isSidebarOpen ? (
                                <motion.path
                                    key="close-icon"
                                    initial={{ opacity: 0, pathLength: 0 }}
                                    animate={{ opacity: 1, pathLength: 1 }}
                                    exit={{ opacity: 0, pathLength: 0 }}
                                    transition={{ duration: 0.3 }}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            ) : (
                                <motion.path
                                    key="menu-icon"
                                    initial={{ opacity: 0, pathLength: 0 }}
                                    animate={{ opacity: 1, pathLength: 1 }}
                                    exit={{ opacity: 0, pathLength: 0 }}
                                    transition={{ duration: 0.3 }}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            )}
                        </AnimatePresence>
                    </svg>
                </motion.button>
            </div>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } md:translate-x-0 md:static w-64 bg-primary-dark text-white transition-transform duration-300 ease-in-out z-20 flex flex-col shadow-lg`}
            >
                <div className="p-4 border-b border-primary">
                    <h2 className="text-2xl font-bold font-heading text-center">
                        Seller Panel
                    </h2>
                </div>

                <nav className="p-4 space-y-2 flex-grow">
                    {/* Products Dropdown */}
                    <div className="relative">
                        <motion.button
                            onClick={() => setIsProductsOpen(!isProductsOpen)}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-150 ease-in-out font-medium flex items-center gap-2 ${activeTab.startsWith("products")
                                ? "bg-primary text-white hover:bg-primary/80"
                                : "hover:bg-primary"
                                }`}
                            layout="activeTabIndicator"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                            <FaBox className="text-lg" />
                            <span>Products</span>
                            <FaChevronDown
                                className={`ml-auto text-sm transition-transform ${isProductsOpen ? "rotate-180" : ""
                                    }`}
                            />
                        </motion.button>

                        {isProductsOpen && (
                            <div className="ml-2 mt-1 space-y-1">
                                <motion.button
                                    onClick={() => {
                                        setActiveTab("add-product");
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-150 ease-in-out font-medium flex items-center gap-2 ${activeTab === "add-product"
                                        ? "bg-primary/80 text-white"
                                        : "hover:bg-primary/50"
                                        }`}
                                >
                                    <FaPlus className="text-sm" />
                                    <span>Add Product</span>
                                </motion.button>

                                <motion.button
                                    onClick={() => {
                                        setActiveTab("all-products");
                                        setIsSidebarOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-150 ease-in-out font-medium flex items-center gap-2 ${activeTab === "all-products"
                                        ? "bg-primary/80 text-white"
                                        : "hover:bg-primary/50"
                                        }`}
                                >
                                    <FaList className="text-sm" />
                                    <span>All Products</span>
                                </motion.button>
                            </div>
                        )}
                    </div>
                    <motion.button
                        onClick={() => {
                            setActiveTab("profile");
                            setIsSidebarOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-150 ease-in-out font-medium flex items-center gap-2 ${activeTab === "profile"
                            ? "bg-primary text-white hover:bg-primary/80"
                            : "hover:bg-primary"
                            }`}
                        layout="activeTabIndicator"
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                        <CgProfile className="text-lg" />
                        <span>My Profile</span>
                    </motion.button>
                </nav>

                <div className="p-4 border-t-2 border-primary">
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 bg-accent-red hover:bg-accent-red/90 text-white rounded-lg transition-colors duration-150 ease-in-out font-medium"
                    >
                        Log Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 md:ml-0 mt-16 md:mt-0">
                {/* Header */}
                <header className="bg-white shadow-sm p-6 sticky top-0 md:top-0 z-10">
                    <h1 className="text-2xl font-bold text-dark font-heading">
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}

                    </h1>
                </header>

                {/* Content */}
                <div
                    className="p-6 overflow-y-auto"
                    style={{ height: "calc(100vh - 80px)" }}
                >
                    <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default SellerDashboard;