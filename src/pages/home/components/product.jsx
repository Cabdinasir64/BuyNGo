import React, { useEffect, useState } from "react";
import firebase from "/firebase";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AddToCartButton from "../../../components/addtocart";

function Product() {
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stopListening = firebase.auth().onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => stopListening();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await firebase
          .firestore()
          .collection("products")
          .orderBy("createdAt", "desc")
          .limit(10)
          .get();
        const prods = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(prods);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleProductClick = (product) => {
    const slug = product.name
      .toLowerCase()
      .replace(/ & /g, "-")
      .replace(/\s+/g, "-");
    navigate(`/product/${slug}`);
  };

  // Skeleton loading component
  const SkeletonCard = () => (
    <motion.div
      className="bg-white rounded-xl shadow-lg overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <div className="w-full h-60 bg-gray-200 animate-pulse"></div>
      </div>
      <div className="p-5">
        <div className="h-5 bg-gray-200 rounded animate-pulse mb-3 w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-1/2"></div>
        <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    </motion.div>
  );

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <motion.h2
          className="text-3xl md:text-4xl font-heading font-bold text-dark mb-3"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Our Featured Products
        </motion.h2>
        <motion.p
          className="text-dark-muted max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Discover our carefully curated collection of premium products
        </motion.p>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence>
          {loading
            ? Array(8)
              .fill(0)
              .map((_, idx) => <SkeletonCard key={`skeleton-${idx}`} />)
            : products.map((product, idx) => (
              <motion.div
                key={product.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                transition={{
                  delay: idx * 0.01,
                  duration: 0.1,
                  ease: "easeInOut",
                }}
                layout
              >
                <div className="relative">
                  <motion.img
                    src={product.mainImage}
                    alt={product.name}
                    className="w-full h-60 object-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => handleProductClick(product)}
                    loadig="lazy"

                  />
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <motion.h3
                      className="font-heading font-semibold text-lg text-dark truncate"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {product.name}
                    </motion.h3>
                  </div>

                  <motion.div
                    className="flex items-center mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <span className="text-primary font-bold text-xl">
                      ${product.price}
                    </span>
                    {product.originalPrice && (
                      <span className="ml-2 text-dark-muted text-sm line-through">
                        ${product.originalPrice}
                      </span>
                    )}
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <AddToCartButton
                      product={product}
                      user={user}
                      className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition flex items-center justify-center gap-2"
                    />
                  </motion.div>
                </div>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
      {/* Mobile Carousel */}
      <div className="md:hidden relative">
        <div className="flex overflow-x-auto pb-6 space-x-4">
          <AnimatePresence>
            {loading
              ? Array(3)
                .fill(0)
                .map((_, idx) => (
                  <div
                    key={`mobile-skeleton-${idx}`}
                    className="min-w-[280px]"
                  >
                    <SkeletonCard />
                  </div>
                ))
              : products.map((product, idx) => (
                <motion.div
                  key={product.id}
                  className="min-w-[280px] bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                  viewport={{ once: true, margin: "0px 0px -50px 0px" }}
                  transition={{
                    type: "spring",
                    stiffness: 100,
                    damping: 10,
                  }}
                  layout
                >
                  <div className="relative">
                    <motion.img
                      src={product.mainImage}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      onClick={() => handleProductClick(product)}
                    />
                  </div>

                  <div className="p-4 flex-grow flex flex-col">
                    <motion.h3
                      className="font-heading font-semibold text-dark mb-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {product.name}
                    </motion.h3>
                    <motion.div
                      className="flex items-center mb-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <span className="text-primary font-bold">
                        ${product.price}
                      </span>
                    </motion.div>

                    <motion.div
                      className="mt-auto"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <AddToCartButton
                        product={product}
                        user={user}
                        className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm"
                      />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

export default Product;
