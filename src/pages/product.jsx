import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import firebase from '/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaShoppingCart, FaHeart, FaShareAlt, FaChevronLeft, FaChevronRight,
    FaStar, FaRegStar, FaTruck, FaShieldAlt, FaExchangeAlt,
    FaUser, FaStore, FaCommentAlt, FaStarHalfAlt
} from 'react-icons/fa';
import Navbar from '../components/navbar';
import AddToCartButton from '../components/addtocart';

const Product = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [wishlist, setWishlist] = useState(false);
    const [user, setUser] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
    const [seller, setSeller] = useState(null);
    const [sellerProducts, setSellerProducts] = useState([]);

    // Calculate average rating
    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : 0;

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const doc = await firebase.firestore().collection('products').get();
                const productsData = doc.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const filtered = productsData.filter(
                    (prod) =>
                        prod.name
                            .toLowerCase()
                            .replace(/ & /g, "-")
                            .replace(/\s+/g, "-") ===
                        productId
                            .toLowerCase()
                            .replace(/ & /g, "-")
                            .replace(/\s+/g, "-")
                );

                if (filtered.length > 0) {
                    const foundProduct = filtered[0];
                    setProduct(foundProduct);

                    // Fetch seller information
                    if (foundProduct.sellerId) {
                        const sellerDoc = await firebase.firestore().collection('users').doc(foundProduct.sellerId).get();
                        if (sellerDoc.exists) {
                            setSeller(sellerDoc.data());

                            // Fetch seller's other products
                            const sellerProducts = productsData
                                .filter(p => p.sellerId === foundProduct.sellerId && p.id !== foundProduct.id)
                                .slice(0, 8);
                            setSellerProducts(sellerProducts);
                        }
                    }

                    // Fetch related products
                    const related = productsData
                        .filter(p => p.category === foundProduct.category && p.id !== foundProduct.id)
                        .slice(0, 8);
                    setRelatedProducts(related);
                } else {
                    setError('Product not found.');
                }
            } catch (err) {
                setError('Error fetching product details.');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged((firebaseUser) => {
            setUser(firebaseUser);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!productId) return;
            const slug = productId.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-");
            const snapshot = await firebase.firestore().collection('reviews')
                .where('productId', '==', slug)
                .orderBy('createdAt', 'desc')
                .get();
            setReviews(snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate()
            })));
        };
        fetchReviews();
    }, [productId]);

    const handleImageChange = (index) => {
        setSelectedImage(index);
    };

    const nextImage = () => {
        setSelectedImage(prev => (prev + 1) % product.images.length);
    };

    const prevImage = () => {
        setSelectedImage(prev => (prev - 1 + product.images.length) % product.images.length);
    };

    const handleProductClick = (product) => {
        const slug = product.name.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
        navigate(`/product/${slug}`);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) return alert("Please login to leave a review.");
        if (newReview.rating === 0 || newReview.comment.trim() === '') return alert("Please provide a rating and comment.");

        const slug = productId.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-");

        await firebase.firestore().collection('reviews').add({
            productId: slug,
            buyerId: user.uid,
            username: user.displayName || user.email,
            rating: newReview.rating,
            comment: newReview.comment,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        setNewReview({ rating: 0, comment: '' });
        const snapshot = await firebase.firestore().collection('reviews')
            .where('productId', '==', slug)
            .orderBy('createdAt', 'desc')
            .get();
        setReviews(snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()
        })));
    };

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push(<FaStar key={i} className="text-yellow-400" />);
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
            } else {
                stars.push(<FaRegStar key={i} className="text-yellow-400" />);
            }
        }

        return stars;
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gray-50 flex justify-center items-center text-red-500">
            {error}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 mt-20">
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                {/* Main Product Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                >
                    {/* Product Images */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="relative h-96 w-full">
                            <AnimatePresence mode='wait'>
                                <motion.img
                                    key={selectedImage}
                                    src={product.images?.[selectedImage] || product.mainImage}
                                    alt={product.name}
                                    className="w-full h-full object-contain"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                />
                            </AnimatePresence>

                            {product.images?.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow-md hover:bg-opacity-100 transition"
                                    >
                                        <FaChevronLeft className="text-gray-800" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-70 rounded-full p-2 shadow-md hover:bg-opacity-100 transition"
                                    >
                                        <FaChevronRight className="text-gray-800" />
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Thumbnail Gallery */}
                        {product.images?.length > 1 && (
                            <div className="flex p-4 space-x-2 overflow-x-auto">
                                {product.images.map((img, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleImageChange(index)}
                                        className={`flex-shrink-0 w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 ${selectedImage === index ? 'border-primary' : 'border-transparent'}`}
                                    >
                                        <img
                                            src={img}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                            <div className="flex items-center mt-2 space-x-2">
                                <div className="flex">
                                    {renderStars(averageRating)}
                                </div>
                                <span className="text-gray-500">
                                    ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                                </span>
                            </div>
                        </motion.div>

                        {/* Price Section */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="bg-blue-50 p-4 rounded-lg"
                        >
                            <p className="text-primary font-bold text-3xl mb-1">${product.price}</p>
                            {product.originalPrice && (
                                <p className="text-gray-500 line-through">${product.originalPrice}</p>
                            )}
                        </motion.div>

                        {/* Description */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <p className="text-gray-700 mb-4">{product.description}</p>
                            <div className="flex items-center space-x-4 mb-6">
                                <AddToCartButton
                                    product={product}
                                    user={user}
                                    className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition flex items-center justify-center gap-2"
                                />
                                <button
                                    onClick={() => setWishlist(!wishlist)}
                                    className="p-3 rounded-full border border-gray-300 hover:bg-gray-100 transition"
                                >
                                    <FaHeart className={wishlist ? "text-red-500" : "text-gray-400"} />
                                </button>
                                <button className="p-3 rounded-full border border-gray-300 hover:bg-gray-100 transition">
                                    <FaShareAlt className="text-gray-600" />
                                </button>
                            </div>
                        </motion.div>

                        {/* Seller Information */}
                        {seller && (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="border rounded-lg p-4"
                            >
                                <h3 className="font-semibold mb-3 flex items-center">
                                    <FaStore className="mr-2 text-primary" />
                                    Seller Information
                                </h3>
                                <div className="flex items-center space-x-3">
                                    <div className="bg-gray-200 rounded-full p-2">
                                        <FaUser className="text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{seller.displayName || seller.email}</p>
                                        <p className="text-sm text-gray-500">Joined: {seller.createdAt?.toDate().toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Product Features */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="grid grid-cols-2 gap-4"
                        >
                            <div className="flex items-center">
                                <FaTruck className="text-green-500 mr-2" />
                                <span>Free Delivery</span>
                            </div>
                            <div className="flex items-center">
                                <FaShieldAlt className="text-blue-500 mr-2" />
                                <span>1 Year Warranty</span>
                            </div>
                            <div className="flex items-center">
                                <FaExchangeAlt className="text-purple-500 mr-2" />
                                <span>7-Day Returns</span>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
                {/* Product Details Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 bg-white rounded-xl shadow-lg p-6"
                >
                    <h2 className="text-2xl font-bold mb-6">Product Details</h2>

                    {/* Properties Table */}
                    {product.properties?.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                            <table className="w-full">
                                <tbody className="divide-y divide-gray-200">
                                    {product.properties.map((prop, index) => (
                                        <tr key={index}>
                                            <td className="py-3 px-4 font-medium text-gray-700 bg-gray-50">{prop.key}</td>
                                            <td className="py-3 px-4">{prop.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>

                {/* Reviews Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9 }}
                    className="mt-12 bg-white rounded-xl shadow-lg p-6"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold flex items-center">
                            <FaCommentAlt className="mr-2 text-primary" />
                            Customer Reviews
                        </h2>
                        <div className="flex items-center">
                            <span className="text-3xl font-bold mr-2">{averageRating}</span>
                            <div className="flex flex-col">
                                <div className="flex">
                                    {renderStars(averageRating)}
                                </div>
                                <span className="text-sm text-gray-500">
                                    Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    {reviews.length === 0 ? (
                        <div className="text-center py-8">
                            <FaCommentAlt className="mx-auto text-4xl text-gray-300 mb-3" />
                            <p className="text-gray-500">No reviews yet. Be the first to review this product.</p>
                        </div>
                    ) : (
                        <div className="space-y-6 max-h-48 overflow-y-auto">
                            {reviews.map(review => (
                                <div key={review.id} className="border-b pb-4 last:border-b-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-gray-200 rounded-full p-2">
                                                <FaUser className="text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium">{review.username}</p>
                                                <div className="flex items-center">
                                                    <div className="flex mr-2">
                                                        {[...Array(5)].map((_, i) => (
                                                            i < review.rating ?
                                                                <FaStar key={i} className="text-yellow-400 text-sm" /> :
                                                                <FaRegStar key={i} className="text-yellow-400 text-sm" />
                                                        ))}
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {review.createdAt?.toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 pl-12">{review.comment}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Review Form */}
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
                        {user ? (
                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                <div>
                                    <label className="block mb-2">Your Rating</label>
                                    <div className="flex space-x-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setNewReview({ ...newReview, rating: star })}
                                                className={`text-2xl ${newReview.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                            >
                                                <FaStar />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="review" className="block mb-2">Your Review</label>
                                    <textarea
                                        id="review"
                                        value={newReview.comment}
                                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                        rows="4"
                                        placeholder="Share your thoughts about this product..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                                >
                                    Submit Review
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-gray-500 mb-3">Please login to leave a review.</p>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                                >
                                    Login
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="mt-12"
                    >
                        <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {relatedProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    whileHover={{ y: -5 }}
                                    className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
                                    onClick={() => handleProductClick(product)}
                                >
                                    <img
                                        src={product.mainImage}
                                        alt={product.name}
                                        className="w-full h-40 object-cover"
                                    />
                                    <div className="p-3">
                                        <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                                        <p className="text-primary font-bold">${product.price}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default Product;