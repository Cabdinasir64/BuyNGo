import { useState, useEffect, useRef, } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaUser, FaShoppingCart, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { MdOutlineArrowDropDown } from "react-icons/md";
import { Link, useNavigate } from 'react-router-dom';
import firebase from '/firebase'

const categoriesData = [
    {
        name: "Electronics & Technology",
        subcategories: [
            "Smartphones & Accessories", "Laptops & Computers", "Cameras & Photography",
            "Audio & Headphones", "Gaming & Consoles", "Wearable Tech (Smartwatches, Fitness Bands)"
        ]
    },
    {
        name: "Fashion & Apparel",
        subcategories: [
            "Men's Clothing", "Women's Clothing", "Kids & Baby Clothing",
            "Shoes & Accessories (bags, watches, jewelry)"
        ]
    },
    {
        name: "Home & Living",
        subcategories: [
            "Furniture", "Home Decor", "Kitchen & Dining", "Lighting", "Bedding & Bath"
        ]
    },
    {
        name: "Health & Beauty",
        subcategories: [
            "Skincare", "Makeup", "Haircare", "Fragrances", "Personal Care Products"
        ]
    },
    {
        name: "Tools & DIY",
        subcategories: [
            "Power Tools", "Hand Tools", "Home Improvement", "Garden & Outdoor"
        ]
    },
    {
        name: "Food & Grocery",
        subcategories: [
            "Fresh Food", "Packaged Food", "Beverages", "Health Supplements"
        ]
    },
    {
        name: "Baby & Kids",
        subcategories: [
            "Toys & Games", "Baby Gear (strollers, car seats)", "Kids' Fashion"
        ]
    },
    {
        name: "Books & Media",
        subcategories: [
            "Books", "eBooks", "Movies & Music"
        ]
    },
    {
        name: "Sports & Outdoors",
        subcategories: [
            "Sports Equipment", "Outdoor Gear", "Fitness Products"
        ]
    },
    {
        name: "Automotive",
        subcategories: [
            "Car Accessories", "Motorcycle Accessories", "Car Parts & Tools"
        ]
    },
    {
        name: "Pet Supplies",
        subcategories: [
            "Food", "Toys", "Grooming Products"
        ]
    },
    {
        name: "Other General Categories",
        subcategories: [
            "Office Supplies", "Stationery", "Gifts", "Art & Craft Supplies"
        ]
    }
];


const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
    const [showMobileCategoriesList, setShowMobileCategoriesList] = useState(false);
    const [activeMobileCategoryIndex, setActiveMobileCategoryIndex] = useState(null);
    const [user, setUser] = useState(null);
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const userDropdownRef = useRef(null);
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                setUser(user);
                fetchCartItems(user.uid);
            } else {
                setUser(null);
                setCartItems(0);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            const unsubscribe = firebase.firestore()
                .collection('carts')
                .doc(user.uid)
                .onSnapshot((doc) => {
                    if (doc.exists) {
                        const cartData = doc.data();
                        setCartItems(cartData.items || []);
                        const total = cartData.items.reduce(
                            (sum, item) => sum + item.quantity, 0
                        );
                        setCartTotal(total);
                    } else {
                        setCartItems([]);
                        setCartTotal(0);
                    }
                });

            return () => unsubscribe();
        } else {
            setCartItems([]);
            setCartTotal(0);
        }
    }, [user]);

    const fetchCartItems = async (userId) => {
        try {
            const cartRef = firebase.firestore().collection('carts').doc(userId);
            const doc = await cartRef.get();   
            if (doc.exists) {
                const cartData = doc.data();
                const items = cartData.items || [];
                setCartItems(items);             
                const totalItems = items.reduce((total, item) => total + item.quantity, 0);
                setCartTotal(totalItems);        
            } else {
                setCartItems([]);
                setCartTotal(0);
            }
        } catch (error) {
            console.error("Error fetching cart items:", error);
        }
    };

    const handleSignOut = async () => {
        try {
            await firebase.auth().signOut();
            setShowUserDropdown(false);
            navigate('/signin');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const megaMenuTimeoutRef = useRef(null);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        if (isMenuOpen) {
            setShowMobileCategoriesList(false);
            setActiveMobileCategoryIndex(null);
        }
    };

    const toggleShowMobileCategoriesList = () => {
        setShowMobileCategoriesList(!showMobileCategoriesList);
        if (showMobileCategoriesList) {
            setActiveMobileCategoryIndex(null);
        }
    };

    const toggleMobileCategoryAccordion = (index) => {
        setActiveMobileCategoryIndex(activeMobileCategoryIndex === index ? null : index);
    };

    const generateSlug = (name) => {
        return name.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
    };

    const handleDesktopCategoriesMouseEnter = () => {
        clearTimeout(megaMenuTimeoutRef.current);
        setIsMegaMenuOpen(true);
    };

    const handleDesktopCategoriesMouseLeave = () => {
        megaMenuTimeoutRef.current = setTimeout(() => {
            setIsMegaMenuOpen(false);
        }, 200);
    };

    const handleMegaMenuMouseEnter = () => {
        clearTimeout(megaMenuTimeoutRef.current);
    };

    const handleMegaMenuMouseLeave = () => {
        setIsMegaMenuOpen(false);
    };

    const closeMegaMenuAndMobile = () => {
        setIsMegaMenuOpen(false);
        if (isMenuOpen) {
            toggleMenu();
        }
    }

    const containerVariants = {
        hidden: { opacity: 0, y: -25, height: 0 },
        visible: {
            opacity: 1,
            y: 0,
            height: "auto",
            transition: {
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.08,
            },
        },
        exit: {
            opacity: 0,
            y: -25,
            height: 0,
        },
    };

    const categoryVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 }
    };

    const subcategoryVariants = {
        hidden: { opacity: 0, y: -15 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -15 }
    };

    return (
        <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-md fixed left top-0 z-50 w-full"
        >
            <div className="max-w-7xl mx-auto px-4 md:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link
                            to="/"
                            className="text-2xl font-bold text-primary font-heading"
                        >
                            BuyNGo
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-8">
                        <Link to="/" className="text-dark hover:text-primary transition">
                            Home
                        </Link>
                        <div
                            className="relative"
                            onMouseEnter={handleDesktopCategoriesMouseEnter}
                            onMouseLeave={handleDesktopCategoriesMouseLeave}
                        >
                            <button className="flex items-center text-dark hover:text-primary transition">
                                Categories
                                <motion.span
                                    animate={{ rotate: isMegaMenuOpen ? 180 : 0 }}
                                    className="ml-1"
                                >
                                    <MdOutlineArrowDropDown size={28} />
                                </motion.span>
                            </button>
                        </div>
                        <Link
                            to="/products"
                            className="text-dark hover:text-primary transition"
                        >
                            Shopping
                        </Link>
                        <Link
                            to="/contact"
                            className="text-dark hover:text-primary transition"
                        >
                            Contact
                        </Link>
                    </div>

                    {/* Search and Icons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-64"
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                        <div className="relative" ref={userDropdownRef}>
                            <button
                                onClick={() => setShowUserDropdown(!showUserDropdown)}
                                className="flex items-center text-dark hover:text-primary transition"
                            >
                                {user ? (
                                    <>
                                        {user.profileImage ? (
                                            <img
                                                src={user.profileImage}
                                                alt="User"
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                                                {user ? user.email.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <FaUser size={18} />
                                )}
                            </button>

                            <AnimatePresence>
                                {showUserDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                                    >
                                        {user ? (
                                            <>
                                                <div className="px-4 py-2 border-b border-gray-100">
                                                    <p className="text-sm font-medium text-dark truncate">
                                                        {user.displayName || 'User'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {user.email}
                                                    </p>
                                                </div>
                                                <Link
                                                    to="/dashboard"
                                                    className="block px-4 py-2 text-sm text-dark hover:bg-gray-100"
                                                    onClick={() => setShowUserDropdown(false)}
                                                >
                                                    Dashboard
                                                </Link>
                                                <button
                                                    onClick={handleSignOut}
                                                    className="w-full text-left px-4 py-2 text-sm text-dark hover:bg-gray-100 flex items-center"
                                                >
                                                    <FaSignOutAlt className="mr-2" /> Logout
                                                </button>
                                            </>
                                        ) : (
                                            <Link
                                                to="/signin"
                                                className="block px-4 py-2 text-sm text-dark hover:bg-gray-100"
                                                onClick={() => setShowUserDropdown(false)}
                                            >
                                                Sign In
                                            </Link>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <Link to="/cart" className="relative text-dark hover:text-primary transition">
                            <FaShoppingCart size={20} />
                            {cartTotal > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-2 -right-2 bg-accent-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                                >
                                    {cartTotal}
                                </motion.span>
                            )}
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            className="text-dark hover:text-primary focus:outline-none"
                        >
                            {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence mode='wait'>
                {isMegaMenuOpen && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute top-full left-0 right-0 w-full bg-gray-50 shadow-xl border-t border-gray-200 z-40"
                        onMouseEnter={handleMegaMenuMouseEnter}
                        onMouseLeave={handleMegaMenuMouseLeave}
                    >
                        <div className="max-w-7xl mx-auto px-6 py-8">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-x-6 gap-y-8">
                                {categoriesData.map((category, catIndex) => (
                                    <motion.div
                                        key={catIndex}
                                        className="space-y-3"
                                        variants={categoryVariants}
                                    >
                                        <motion.h3
                                            className="text-md font-semibold text-primary mb-2 border-b-2 border-primary-light pb-2"
                                            variants={categoryVariants}
                                        >
                                            {category.name}
                                        </motion.h3>
                                        <ul className="space-y-1.5">
                                            {category.subcategories.map((sub, subIndex) => (
                                                <motion.li
                                                    key={subIndex}
                                                    variants={subcategoryVariants}
                                                    transition={{ delay: subIndex * 0.1 }}
                                                >
                                                    <Link
                                                        to={`/category/${generateSlug(category.name)}/${generateSlug(sub)}`}
                                                        className="block text-sm text-dark-muted hover:text-primary hover:underline"
                                                        onClick={closeMegaMenuAndMobile}
                                                    >
                                                        {sub}
                                                    </Link>
                                                </motion.li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white overflow-y-auto max-h-[calc(100vh-4rem)]"
                    >
                        <div className="px-4 pt-2 pb-4 space-y-2">
                            <Link
                                to="/"
                                className="block px-3 py-3 rounded-md text-dark hover:bg-gray-100"
                                onClick={toggleMenu}
                            >
                                Home
                            </Link>

                            {/* Mobile Categories Section Toggle + Accordion */}
                            <div>
                                <button
                                    onClick={toggleShowMobileCategoriesList}
                                    className="flex items-center justify-between w-full px-3 py-3 rounded-md text-dark hover:bg-gray-100"
                                >
                                    <span>Categories</span>
                                    <motion.span
                                        animate={{ rotate: showMobileCategoriesList ? 180 : 0 }}
                                    >
                                        <MdOutlineArrowDropDown size={24} />
                                    </motion.span>
                                </button>
                                <AnimatePresence>
                                    {showMobileCategoriesList && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mt-1 space-y-0.5 pl-3"
                                        >
                                            {categoriesData.map((category, index) => (
                                                <div
                                                    key={index}
                                                    className="border-b border-gray-100 last:border-b-0"
                                                >
                                                    <button
                                                        onClick={() =>
                                                            toggleMobileCategoryAccordion(index)
                                                        }
                                                        className="flex items-center justify-between w-full px-3 py-3 text-dark hover:bg-gray-50 text-left rounded-md"
                                                    >
                                                        <span className="font-medium text-sm">
                                                            {category.name}
                                                        </span>
                                                        <motion.span
                                                            animate={{
                                                                rotate:
                                                                    activeMobileCategoryIndex === index
                                                                        ? 180
                                                                        : 0,
                                                            }}
                                                        >
                                                            <MdOutlineArrowDropDown size={22} />
                                                        </motion.span>
                                                    </button>
                                                    <AnimatePresence>
                                                        {activeMobileCategoryIndex === index && (
                                                            <motion.div
                                                                initial={{ opacity: 0, height: 0 }}
                                                                animate={{ opacity: 1, height: "auto" }}
                                                                exit={{ opacity: 0, height: 0 }}
                                                                className="pl-4 pr-2 pt-1 pb-2 space-y-1 bg-gray-50"
                                                            >
                                                                {category.subcategories.map(
                                                                    (sub, subIndex) => (
                                                                        <Link
                                                                            key={subIndex}
                                                                            to={`/category/${generateSlug(
                                                                                category.name
                                                                            )}/${generateSlug(sub)}`}
                                                                            className="block px-3 py-2 text-xs text-dark-muted hover:text-primary hover:bg-gray-100 rounded-md"
                                                                            onClick={closeMegaMenuAndMobile} // Closes main mobile menu
                                                                        >
                                                                            {sub}
                                                                        </Link>
                                                                    )
                                                                )}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <Link
                                to="/products"
                                className="block px-3 py-3 rounded-md text-dark hover:bg-gray-100"
                                onClick={toggleMenu}
                            >
                                Shopping
                            </Link>
                            <Link
                                to="/contact"
                                className="block px-3 py-3 rounded-md text-dark hover:bg-gray-100"
                                onClick={toggleMenu}
                            >
                                Contact
                            </Link>

                            {/* Search input and mobile icons */}
                            <div className="pt-4 border-t border-gray-200 mt-2">
                                <div className="relative mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search products..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    />
                                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                </div>
                                <div className="flex justify-around mt-4 px-2">
                                    <div className='flex items-center'>
                                        {user ? (
                                            <div className="flex flex-col items-center space-y-2 w-full">
                                                <div className="flex items-center space-x-2">
                                                    {user.profileImage ? (
                                                        <img
                                                            src={user.profileImage}
                                                            alt="User"
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                                                            {user ? user.email.charAt(0).toUpperCase() : 'U'}
                                                        </div>
                                                    )}
                                                    <span className="text-sm font-medium">{user.displayName || 'User'}</span>
                                                </div>
                                                <div className="flex space-x-4 w-full justify-center">
                                                    <Link
                                                        to="/dashboard"
                                                        className="text-sm text-dark hover:text-primary"
                                                        onClick={toggleMenu}
                                                    >
                                                        Dashboard
                                                    </Link>
                                                    <button
                                                        onClick={handleSignOut}
                                                        className="text-sm text-dark hover:text-primary flex items-center"
                                                    >
                                                        <FaSignOutAlt className="mr-1" /> Logout
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <Link
                                                to="/signin"
                                                className="text-dark hover:text-primary flex flex-col items-center"
                                                onClick={toggleMenu}
                                            >
                                                <FaUser size={18} className="mb-1" /> Signin
                                            </Link>
                                        )}
                                    </div>
                                    <Link
                                        to="/cart"
                                        className="relative text-dark hover:text-primary flex flex-col items-center"
                                        onClick={toggleMenu}
                                    >
                                        <FaShoppingCart size={20} className="mb-1" /> Cart
                                        {cartTotal > 0 && (
                                            <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-accent-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                                {cartTotal}
                                            </span>
                                        )}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;