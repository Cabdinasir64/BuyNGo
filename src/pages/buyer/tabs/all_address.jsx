import React, { useEffect, useState } from 'react';
import firebase from '/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import AddAddressTab from './add_address';

const AllAddressTab = ({ onEmpty }) => {
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAddresses = async () => {
      const user = firebase.auth().currentUser;
      if (!user) {
        setError('User not logged in');
        setLoading(false);
        setTimeout(() => { setError('') }, 3000)
        return;
      }

      try {
        const snapshot = await firebase.firestore()
          .collection('addresses')
          .where('buyerId', '==', user.uid)
          .orderBy('createdAt', 'desc')
          .get();

        const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAddresses(list);
      } catch (err) {
        setError("Error fetching addresses:");
        setError('Failed to load addresses');
        setTimeout(() => { setError('') }, 3000)
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await firebase.firestore().collection('addresses').doc(id).delete();
        setAddresses(prev => prev.filter(a => a.id !== id));
      } catch (err) {
        setError("Error deleting address:");
        setError('Failed to delete address');
        setTimeout(() => { setError('') }, 3000)
      }
    }
  };

  const handleUpdate = (updatedAddress) => {
    setAddresses(prev =>
      prev.map(addr => addr.id === updatedAddress.id ? updatedAddress : addr)
    );
    setEditingAddress(null);
  };

  const onEmptyy = () => {
    if (onEmpty) onEmpty()
  }

  if (editingAddress) {
    return (
      <AddAddressTab
        initialAddress={editingAddress}
        onSave={handleUpdate}
        onCancel={() => setEditingAddress(null)}
      />
    );
  }



  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Your Addresses</h2>
        <button
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg"
        >
          <FaPlus /> Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">You haven't added any addresses yet</p>
          <button
            onClick={onEmptyy}
            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {addresses.map(address => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="bg-white p-6 rounded-lg shadow border border-gray-100"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{address.fullName}</h3>
                    <p className="text-gray-600">{address.phone}</p>
                    <p className="mt-2">
                      {address.street}, {address.city}, {address.state}, {address.country} {address.zip}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="text-primary hover:text-primary-light p-2"
                      onClick={() => setEditingAddress(address)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(address.id)}
                      className="text-accent-red hover:text-accent-red/70 p-2"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default AllAddressTab;