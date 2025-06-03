import React, { useState, useEffect } from 'react';
import firebase from '/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import Navbar from '../../components/navbar'
import Footer from '../../components/footer'
import AddToCartButton from '../../components/addtocart'
import { useNavigate } from 'react-router-dom'



const Shopping = () => {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOption, setSortOption] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showSortMenu, setShowSortMenu] = useState(false);
    const navigate = useNavigate();
    const user = firebase.auth().currentUser

    const productsPerPage = 12;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const snapshot = await firebase.firestore()
                    .collection('products')
                    .get();

                const productsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProducts(productsData);
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        if (sortOption === 'A-Z') return a.name.localeCompare(b.name);
        if (sortOption === 'Z-A') return b.name.localeCompare(a.name);
        if (sortOption === 'price-low') return a.price - b.price;
        if (sortOption === 'price-high') return b.price - a.price;
        return 0;
    });
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = sortedProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleProductClick = (product) => {
        const slug = product.name.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
        navigate(`/product/${slug}`);
    };

    const LoadingSkeleton = () => (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20 px-4 mt-[65px]">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-6"
                    >
                        Welcome to Our Online Store
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl mb-8 max-w-2xl mx-auto"
                    >
                        Discover amazing products at unbeatable prices
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="relative max-w-md mx-auto"
                    >
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full py-3 px-4 pr-10 rounded-lg text-gray-800 focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FaSearch className="absolute right-3 top-3.5 text-gray-500" />
                    </motion.div>
                </div>
            </div>
            {/* Products Section Skeleton */}
            <div className="max-w-6xl mx-auto py-12 px-4">
                {/* Filters Skeleton */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
                </div>

                {/* Products Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, index) => (
                        <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                            <div className="h-48 bg-gray-200"></div>
                            <div className="p-4">
                                <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 w-full bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 w-2/3 bg-gray-200 rounded mb-4"></div>
                                <div className="flex justify-between">
                                    <div className="h-6 w-16 bg-gray-200 rounded"></div>
                                    <div className="h-8 w-24 bg-gray-200 rounded"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    );

    if (loading) {
        return <LoadingSkeleton />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 text-white py-20 px-4 mt-[65px]">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold mb-6"
                    >
                        Welcome to Our Online Store
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl mb-8 max-w-2xl mx-auto"
                    >
                        Discover amazing products at unbeatable prices
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="relative max-w-md mx-auto"
                    >
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="w-full py-3 px-4 pr-10 rounded-lg text-gray-800 focus:outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FaSearch className="absolute right-3 top-3.5 text-gray-500" />
                    </motion.div>
                </div>
            </div>

            {/* Products Section */}
            <div className="max-w-6xl mx-auto py-12 px-4">
                {/* Filters */}
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <h2 className="text-2xl font-bold">Our Products</h2>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button
                                className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow"
                                onClick={() => setShowSortMenu(!showSortMenu)}
                            >
                                <FaFilter /> Sort
                            </button>

                            <AnimatePresence>
                                {showSortMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10"
                                    >
                                        <button
                                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${sortOption === 'A-Z' ? 'bg-gray-100' : ''}`}
                                            onClick={() => {
                                                setSortOption('A-Z');
                                                setShowSortMenu(false);
                                            }}
                                        >
                                            <FaArrowUp className="inline mr-2" /> A-Z
                                        </button>
                                        <button
                                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${sortOption === 'Z-A' ? 'bg-gray-100' : ''}`}
                                            onClick={() => {
                                                setSortOption('Z-A');
                                                setShowSortMenu(false);
                                            }}
                                        >
                                            <FaArrowDown className="inline mr-2" /> Z-A
                                        </button>
                                        <button
                                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${sortOption === 'price-low' ? 'bg-gray-100' : ''}`}
                                            onClick={() => {
                                                setSortOption('price-low');
                                                setShowSortMenu(false);
                                            }}
                                        >
                                            <FaArrowUp className="inline mr-2" /> Price: Low to High
                                        </button>
                                        <button
                                            className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${sortOption === 'price-high' ? 'bg-gray-100' : ''}`}
                                            onClick={() => {
                                                setSortOption('price-high');
                                                setShowSortMenu(false);
                                            }}
                                        >
                                            <FaArrowDown className="inline mr-2" /> Price: High to Low
                                        </button>
                                        <button
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                                            onClick={() => {
                                                setSortOption(null);
                                                setShowSortMenu(false);
                                            }}
                                        >
                                            Clear Filters
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Products Grid */}
                {currentProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No products found. Try a different search.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            <AnimatePresence>
                                {currentProducts.map((product, index) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: index * 0.05 }}
                                        whileHover={{ y: -5 }}
                                        className="bg-white rounded-lg shadow-md overflow-hidden"
                                    >
                                        <div className="h-48 overflow-hidden">
                                            <img
                                                src={product.mainImage}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                onClick={() => handleProductClick(product)}
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                                {product.description}
                                            </p>
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-primary">
                                                    ${product.price.toFixed(2)}
                                                </span>
                                                <AddToCartButton
                                                    product={product}
                                                    user={user}
                                                    className="py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg transition flex items-center justify-center gap-2"
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-8 pb-24">
                                <nav className="flex gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                                        <button
                                            key={number}
                                            onClick={() => paginate(number)}
                                            className={`px-3 py-1 rounded ${currentPage === number ? 'bg-primary text-white' : 'bg-white hover:bg-gray-100'}`}
                                        >
                                            {number}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        )}
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Shopping;