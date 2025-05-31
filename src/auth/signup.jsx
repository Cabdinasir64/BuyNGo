import { useState } from "react";
import { auth, googleProvider, facebookProvider } from "/firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

// SVG Icons
const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
);

const FacebookIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" fill="#1877F2" />
    </svg>
);

export default function Signup() {
    const navigate = useNavigate();
    const db = getFirestore();
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({
        username: "",
        email: "",
        password: "",
    });

    // ✅ Check if username/email exists in Firestore
    const checkUnique = async (field, value) => {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where(field, "==", value));
        const snapshot = await getDocs(q);
        return snapshot.empty; // Returns true if unique
    };

    // ✅ Validate Form
    const validate = async () => {
        let valid = true;
        const newErrors = { username: "", email: "", password: "" };

        // Username Validation
        if (formData.username.length < 3) {
            newErrors.username = "Username must be 3+ characters!";
            valid = false;
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = "No spaces/special chars!";
            valid = false;
        } else if (!(await checkUnique("username", formData.username))) {
            newErrors.username = "Username taken!";
            valid = false;
        }

        // Email Validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email!";
            valid = false;
        } else if (!(await checkUnique("email", formData.email))) {
            newErrors.email = "Email already registered!";
            valid = false;
        }

        // Password Validation
        if (formData.password.length < 8) {
            newErrors.password = "Password must be 8+ chars!";
            valid = false;
        } else if (!/[A-Z]/.test(formData.password) || !/[!@#$%^&*]/.test(formData.password)) {
            newErrors.password = "Need 1 uppercase & 1 symbol!";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    // ✅ Handle Signup
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (await validate()) {
            try {
                // 1. Create user in Firebase Auth
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    formData.email,
                    formData.password
                );

                // 2. Save user data to Firestore
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    username: formData.username,
                    email: formData.email,
                    createdAt: new Date(),
                });

                navigate("/dashboard");
            } catch (err) {
                setError(err.message);
            }
        }
    };

    // ✅ Social Login (Google/Facebook)
    const handleSocialLogin = async (provider) => {
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user exists in Firestore
            const userDoc = await getDocs(query(collection(db, "users"), where("email", "==", user.email)));

            if (userDoc.empty) {
                // Save new user if not exists
                await setDoc(doc(db, "users", user.uid), {
                    username: user.displayName || user.email.split("@")[0],
                    email: user.email,
                    createdAt: new Date(),
                });
            }

            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md transition-all hover:shadow-xl">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
                    Join BuyNGo
                </h1>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Username Input */}
                    <div>
                        <label htmlFor="username" className="block text-gray-700 mb-1">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            value={formData.username}
                            onChange={(e) => {
                                setFormData({ ...formData, username: e.target.value });
                                setErrors({ ...errors, username: "" });
                            }}
                            className={`w-full p-3 border rounded-lg focus:ring-2 ${errors.username ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-200"
                                }`}
                        />
                        {errors.username && (
                            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
                        )}
                    </div>

                    {/* Email Input */}
                    <div>
                        <label htmlFor="email" className="block text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value });
                                setErrors({ ...errors, email: "" });
                            }}
                            className={`w-full p-3 border rounded-lg focus:ring-2 ${errors.email ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-200"
                                }`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div>
                        <label htmlFor="password" className="block text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => {
                                setFormData({ ...formData, password: e.target.value });
                                setErrors({ ...errors, password: "" });
                            }}
                            className={`w-full p-3 border rounded-lg focus:ring-2 ${errors.password ? "border-red-500 focus:ring-red-200" : "focus:ring-blue-200"
                                }`}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition duration-200"
                    >
                        Sign Up
                    </button>

                    {/* Divider */}
                    <div className="flex items-center my-4">
                        <div className="flex-1 border-t border-gray-300"></div>
                        <span className="px-3 text-gray-500">OR</span>
                        <div className="flex-1 border-t border-gray-300"></div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => handleSocialLogin(googleProvider)}
                            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg"
                        >
                            <GoogleIcon />
                            Google
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSocialLogin(facebookProvider)}
                            className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg"
                        >
                            <FacebookIcon />
                            Facebook
                        </button>
                    </div>

                    {/* Login Link */}
                    <p className="text-center text-gray-600 mt-4">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-600 hover:underline">
                            Log In
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}