import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import firebase from "/firebase";
import { FaSpinner, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import Navbar from "../components/navbar";
import AddToCartButton from "../components/addtocart";
import { useNavigate } from "react-router-dom";
import Footer from "../components/footer";

const Category = () => {
  const [user, setUser] = useState(null);
  const { subcategorySlug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const productsPerPage = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const snapshot = await firebase
          .firestore()
          .collection("products")
          .get();
        const productsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filtered = productsData.filter(
          (product) => generateSlug(product.category) === subcategorySlug
        );

        setProducts(filtered);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [subcategorySlug]);

  useEffect(() => {
    const stopListening = firebase.auth().onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser);
    });

    return () => stopListening();
  }, []);

  const totalPages = Math.ceil(products.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = products.slice(
    startIndex,
    startIndex + productsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleProductClick = (product) => {
    const slug = product.name
      .toLowerCase()
      .replace(/ & /g, "-")
      .replace(/\s+/g, "-");
    navigate(`/product/${slug}`);
  };

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <FaSpinner className="animate-spin text-4xl text-primary" />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-accent-red text-xl">{error}</p>
        </div>
      </div>
    );

  if (products.length === 0)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-grow flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-heading text-dark mb-4">
            No products found
          </h2>
          <p className="text-dark-muted mb-6">
            No products found in this category.
          </p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col mt-16">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-dark capitalize">
            {subcategorySlug.replace(/-/g, " ")}
          </h1>
          <p className="text-dark-muted mt-2">
            Showing {currentProducts.length} of {products.length} products
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          {currentProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300"
            >
              <div className="h-48 bg-gray-200 overflow-hidden">
                {product.mainImage ? (
                  <img
                    src={product.mainImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onClick={() => handleProductClick(product)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <span className="text-dark-muted">No Image</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg text-dark mb-1 truncate">
                  {product.name}
                </h3>
                <p className="text-primary font-bold text-xl mb-2">
                  ${product.price}
                </p>
                <p className="text-dark-muted text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                <AddToCartButton
                  product={product}
                  user={user}
                  className="w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition flex items-center justify-center gap-2"
                />
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 pb-24">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              <FaArrowLeft />
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => handlePageChange(i + 1)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  currentPage === i + 1
                    ? "bg-primary text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
            >
              <FaArrowRight />
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Category;
