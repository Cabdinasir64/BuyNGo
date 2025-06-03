import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import firebase from "/firebase";


const Profile = () => {
    // Profile state
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        profileImage: "",
    });
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");

    // Load current user profile
    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                const userDoc = await firebase
                    .firestore()
                    .collection("users")
                    .doc(user.uid)
                    .get();
                const userData = userDoc.exists ? userDoc.data() : {};

                setProfile((prev) => ({
                    ...prev,
                    name: user.displayName || "",
                    email: user.email || "",
                    profileImage: userData.profileImage || "",
                }));
            }
        });
        return () => unsubscribe();
    }, []);

    // Handle profile image upload
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const user = firebase.auth().currentUser;
        if (!user) {
            setErrors({ general: "No authenticated user" });
            return;
        }

        try {
            // Check role = seller
            const userDoc = await firebase
                .firestore()
                .collection("users")
                .doc(user.uid)
                .get();
            const userData = userDoc.exists ? userDoc.data() : {};
            if (userData.role !== "buyer") {
                setErrors({ general: "Only seller can uploaded profile image" });
                return;
            }

            // Upload to Cloudinary
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", "test_test");

            const res = await fetch(
                "https://api.cloudinary.com/v1_1/db8dtpaus/image/upload",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await res.json();
            const cloudinaryUrl = data.secure_url;

            await firebase.firestore().collection("users").doc(user.uid).update({
                profileImage: cloudinaryUrl,
            });

            setProfile((prev) => ({ ...prev, profileImage: cloudinaryUrl }));
            setSuccess("Profile image updated");
            setTimeout(() => setSuccess(""), 3000);
        } catch (error) {
            setErrors({ general: "Failed to upload image" });
        }
    };

    // Handle profile update
    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setErrors({});
        setSuccess("");

        const user = firebase.auth().currentUser;
        if (!user) {
            setErrors({ general: "No authenticated user" });
            return;
        }

        const newErrors = {};
        if (!profile.name.trim()) newErrors.name = "Name is required";
        if (!profile.email.trim()) newErrors.email = "Email is required";
        if (!/^\S+@\S+\.\S+$/.test(profile.email))
            newErrors.email = "Invalid email";

        if (profile.newPassword) {
            if (!profile.currentPassword)
                newErrors.currentPassword = "Current password required";
            if (profile.newPassword.length < 6)
                newErrors.newPassword = "Password must be at least 6 characters";
            if (profile.newPassword !== profile.confirmPassword)
                newErrors.confirmPassword = "Passwords don't match";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            if (user.displayName !== profile.name) {
                await user.updateProfile({ displayName: profile.name });
            }

            if (user.email !== profile.email) {
                const credential = firebase.auth.EmailAuthProvider.credential(
                    user.email,
                    profile.currentPassword
                );
                await user.reauthenticateWithCredential(credential);
                await user.updateEmail(profile.email);
            }

            if (profile.newPassword) {
                const credential = firebase.auth.EmailAuthProvider.credential(
                    reAuthEmail,
                    profile.currentPassword
                );
                await user.reauthenticateWithCredential(credential);
                await user.updatePassword(profile.newPassword);
            }

            setProfile((prev) => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            }));

            setSuccess("Profile updated successfully");
            setTimeout(() => setSuccess(""), 3000);
        } catch (error) {
            let errorMsg = "Failed to update profile";
            if (error.code === "auth/invalid-credential") {
                errorMsg = "Incorrect current password";
            } else if (error.code === "auth/requires-recent-login") {
                errorMsg =
                    "Please reauthenticate to update sensitive information. You might need to log out and log back in.";
            } else if (error.code === "auth/email-already-in-use") {
                errorMsg = "This email address is already in use by another account.";
            }
            setErrors({ general: errorMsg });
        }
    };

    return (
        // Profile Tab
        <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-2xl mx-auto"
        >
            <div className="">
                <h2 className="text-xl font-semibold text-dark mb-8 font-heading text-center">
                    Profile Settings
                </h2>

                {success && (
                    <motion.div
                        className="mb-4 p-3 bg-green-100 text-green-700 rounded-md border border-green-300"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {success}
                    </motion.div>
                )}
                {errors.general && (
                    <motion.div
                        className="mb-4 p-3 bg-red-100 text-red-700 rounded-md border border-red-300"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {errors.general}
                    </motion.div>
                )}


                <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="flex flex-col items-center space-y-4 mb-8">
                        <motion.div className="relative"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}>
                            {profile.profileImage ? (
                                <motion.img
                                    src={profile.profileImage}
                                    alt="Profile"
                                    className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-primary-light shadow-md"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                />
                            ) : (
                                <motion.div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary-light border-4 border-primary-light flex items-center justify-center shadow-md"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}>
                                    <span className="text-primary-dark text-4xl md:text-5xl font-bold font-heading">
                                        {(
                                            profile.name?.charAt(0) ||
                                            profile.email?.charAt(0) ||
                                            "A"
                                        ).toUpperCase()}
                                    </span>
                                </motion.div>
                            )}
                            <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 border-2 border-primary-light shadow-md cursor-pointer hover:bg-gray-100 transition">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <svg
                                    className="w-5 h-5 text-primary"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5 14a1 1 0 11-2 0 1 1 0 012 0zM13 6l-1.414-1.414 2.828-2.828L15.828 3 13 6zM5 16H4a1 1 0 01-1-1V5a1 1 0 011-1h1M15 16h1a1 1 0 001-1V5a1 1 0 00-1-1h-1m-5.071.293a.999.999 0 00-1.414 0l-6.163 6.163A.996.996 0 001 12v2a1 1 0 001 1h2a.996.996 0 00.707-.293l6.163-6.163a.999.999 0 000-1.414z" />
                                </svg>
                            </label>
                        </motion.div>
                        <div className="text-center">
                            <h3 className="text-2xl font-bold text-dark font-heading">
                                {profile.name || "Buyer User"}
                            </h3>
                            <p className="text-dark-muted">{profile.email}</p>
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-dark-muted mb-1"
                        >
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={profile.name}
                            onChange={(e) =>
                                setProfile({ ...profile, name: e.target.value })
                            }
                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.name
                                ? "border-red-500 focus:ring-red-300"
                                : "border-gray-300 focus:ring-primary-light focus:border-primary"
                                }`}
                            placeholder="Your full name"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-dark-muted mb-1"
                        >
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={profile.email}
                            onChange={(e) =>
                                setProfile({ ...profile, email: e.target.value })
                            }
                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.email
                                ? "border-red-500 focus:ring-red-300"
                                : "border-gray-300 focus:ring-primary-light focus:border-primary"
                                }`}
                            placeholder="your.email@example.com"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>
                    <hr className="my-6 border-gray-200" />
                    <p className="text-sm text-dark-muted mb-1">
                        To change email or password, current password is required.
                    </p>
                    <div>
                        <label
                            htmlFor="currentPassword"
                            className="block text-sm font-medium text-dark-muted mb-1"
                        >
                            Current Password
                        </label>
                        <input
                            id="currentPassword"
                            type="password"
                            value={profile.currentPassword}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    currentPassword: e.target.value,
                                })
                            }
                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.currentPassword
                                ? "border-red-500 focus:ring-red-300"
                                : "border-gray-300 focus:ring-primary-light focus:border-primary"
                                }`}
                            placeholder="Required for email/password changes"
                        />
                        {errors.currentPassword && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.currentPassword}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="newPassword"
                            className="block text-sm font-medium text-dark-muted mb-1"
                        >
                            New Password
                        </label>
                        <input
                            id="newPassword"
                            type="password"
                            value={profile.newPassword}
                            onChange={(e) =>
                                setProfile({ ...profile, newPassword: e.target.value })
                            }
                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.newPassword
                                ? "border-red-500 focus:ring-red-300"
                                : "border-gray-300 focus:ring-primary-light focus:border-primary"
                                }`}
                            placeholder="new current password"
                        />
                        {errors.newPassword && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.newPassword}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="block text-sm font-medium text-dark-muted mb-1"
                        >
                            Confirm New Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={profile.confirmPassword}
                            onChange={(e) =>
                                setProfile({
                                    ...profile,
                                    confirmPassword: e.target.value,
                                })
                            }
                            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.confirmPassword
                                ? "border-red-500 focus:ring-red-300"
                                : "border-gray-300 focus:ring-primary-light focus:border-primary"
                                }`}
                            placeholder="Confirm your new password"
                        />
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600">
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-150 ease-in-out"
                        >
                            Update Profile
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    )

}

export default Profile;