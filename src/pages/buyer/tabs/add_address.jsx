import React, { useState } from 'react';
import firebase from '/firebase';
import { motion } from 'framer-motion';

const AddAddressTab = ({ onSuccess }) => {
    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        country: 'Somalia',
        zip: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = e => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const user = firebase.auth().currentUser;
        if (!user) {
            setError('User not logged in');
            setLoading(false);
            return;
        }

        try {
            await firebase.firestore().collection('addresses').add({
                ...form,
                userId: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            setForm({
                fullName: '', phone: '', street: '', city: '',
                state: '', country: 'Somalia', zip: ''
            });
            setSuccess('Address added successfully!');
            if (onSuccess) onSuccess();
        } catch (err) {
            console.error("Error adding address:", err);
            setError('Failed to save address. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto"
        >
            <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Add New Address</h2>

                {error && (
                    <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="p-3 bg-green-100 text-green-700 rounded-lg">
                        {success}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Full Name</label>
                        <input
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Phone Number</label>
                        <input
                            name="phone"
                            type="tel"
                            value={form.phone}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Street Address</label>
                    <input
                        name="street"
                        value={form.street}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">City</label>
                        <input
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">State/Region</label>
                        <input
                            name="state"
                            value={form.state}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">ZIP Code</label>
                        <input
                            name="zip"
                            value={form.zip}
                            onChange={handleChange}
                            required
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Country</label>
                    <select
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                        <option value="Somalia">Somalia</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-4 bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                    {loading ? 'Saving...' : 'Save Address'}
                </button>
            </form>
        </motion.div>
    );
};

export default AddAddressTab;