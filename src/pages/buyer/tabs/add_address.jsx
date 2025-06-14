import { v4 as uuidv4 } from "uuid";
import React, { useState, useEffect } from "react";
import firebase from "/firebase";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

const AddAddressTab = ({ initialAddress, onSave, onCancel, onSuccess }) => {
  const defaultState = {
    fullName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "Somalia",
    zip: "",
  };
  const [form, setForm] = useState(initialAddress || defaultState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setForm(initialAddress || defaultState);
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const user = firebase.auth().currentUser;
    if (!user) {
      setError("User not logged in");
      return;
    }

    try {
      setLoading(true);

      const adressData = {
        ...form,
        buyerId: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      };

      if (initialAddress) {
        const snapshot = await firebase
          .firestore()
          .collection("addresses")
          .where("street", "==", form.street)
          .where("city", "==", form.city)
          .where("state", "==", form.state)
          .where("zip", "==", form.zip)
          .where("country", "==", form.country)
          .where("phone", "==", form.phone)
          .where("fullName", "==", form.fullName)
          .get();

        if (!snapshot.empty) {
          setError("Address already exists.");
          setLoading(false);
          setTimeout(() => setError(""), 3000);
          return;
        } else {
          await firebase
            .firestore()
            .collection("addresses")
            .doc(initialAddress.id)
            .update(adressData);

          if (onSave) onSave(adressData);
          setSuccess("Address updated successfully!");
        }
      } else {
        const snapshot = await firebase
          .firestore()
          .collection("addresses")
          .where("street", "==", form.street)
          .where("city", "==", form.city)
          .where("state", "==", form.state)
          .where("zip", "==", form.zip)
          .where("country", "==", form.country)
          .where("phone", "==", form.phone)
          .where("fullName", "==", form.fullName)
          .get();
        if (!snapshot.empty) {
          setError("Address already exists.");
          setLoading(false);
          setTimeout(() => setError(""), 3000);
          return;
        }
        adressData.buyerId = user.uid;
        adressData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        await firebase.firestore().collection("addresses").add(adressData);
        setSuccess("Address added successfully!");
        if (onSuccess) onSuccess();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to save address. Please try again.");
      setTimeout(() => setError(""), 3000);
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
      <form
        onSubmit={handleSubmit}
        className="space-y-4 p-6 bg-white rounded-lg shadow"
      >
        <h2 className="text-xl font-bold mb-4">
          {initialAddress ? "Edit Address" : "Add New Address"}
        </h2>

        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>
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
            <label className="block text-sm font-medium mb-1">
              Phone Number
            </label>
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
          <label className="block text-sm font-medium mb-1">
            Street Address
          </label>
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
            <label className="block text-sm font-medium mb-1">
              State/Region
            </label>
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
          </select>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            type="button"
            className="px-4 py-2 bg-gray-200 rounded mt-4 mr-2"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-white px-6 py-2 rounded flex items-center"
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" />
              {initialAddress ? "Updating..." : "Adding..."}
            </>
          ) : initialAddress ? (
            "Update Adress"
          ) : (
            "Add Address"
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default AddAddressTab;
