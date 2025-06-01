import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import firebase from '/firebase';

const generateSlug = (name) => {
    return name.toLowerCase().replace(/ & /g, '-').replace(/\s+/g, '-');
};

const CategoryProducts = () => {
    const { categorySlug, subcategorySlug } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');

            try {
                const snapshot = await firebase.firestore().collection('products').get();
                const productsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Filter products by category and subcategory slug (no slug in Firestore)
                const filteredProducts = productsData.filter(product =>
                    generateSlug(product.category) === subcategorySlug
                );

                setProducts(filteredProducts);
                console.log(filteredProducts);
            } catch (err) {
                setError('Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categorySlug, subcategorySlug]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;
    if (products.length === 0) return <p>No products found for this category.</p>;

    return (
        <div>
            <h2>Products in {categorySlug} / {subcategorySlug}</h2>
            <div className="grid grid-cols-3 gap-4">
                {products.map(product => (
                    <div key={product.id} className="border p-4 rounded">
                        <h3>{product.name}</h3>
                        <p>${product.price}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryProducts;
