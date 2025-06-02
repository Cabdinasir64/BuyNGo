import { useState } from "react";
import firebase from "/firebase";
import { Link, useNavigate } from "react-router-dom";
import { googleProvider, facebookProvider } from "../../firebase.js";
const signin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        login: "",
        password: ""
    });
    const [errors, setErrors] = useState({
        login: "",
        password: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Validate form fields
    const validate = () => {
        let valid = true;
        const newErrors = { login: "", password: "" };

        if (!formData.login.trim()) {
            newErrors.login = "Email or username is required";
            valid = false;
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
            valid = false;
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
            valid = false;
        }

        setErrors(newErrors);
        return valid;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!validate()) return;

        setIsLoading(true);

        try {
            let userCredential;
            try {
                userCredential = await firebase.auth()
                    .signInWithEmailAndPassword(formData.login, formData.password);
            } catch (emailError) {
                if (emailError.code === "auth/invalid-email") {
                    const snapshot = await firebase.firestore()
                        .collection("users")
                        .where("username", "==", formData.login)
                        .limit(1)
                        .get();

                    if (snapshot.empty) {
                        throw new Error("Invalid email/username or password");
                    }

                    const userDoc = snapshot.docs[0].data();
                    userCredential = await firebase.auth()
                        .signInWithEmailAndPassword(userDoc.email, formData.password);
                } else {
                    throw emailError;
                }
            }

            const userDoc = await firebase.firestore()
                .collection("users")
                .doc(userCredential.user.uid)
                .get();

            if (!userDoc.exists) {
                throw new Error("User data not found");
            }

            const userData = userDoc.data();

            await firebase.firestore()
                .collection("users")
                .doc(userCredential.user.uid)
                .update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });

            // Redirect based on role
            switch (userData.role) {
                case "admin":
                    navigate("/admindashboard");
                    break;
                case "seller":
                    navigate("/sellerdashboard");
                    break;
                default:
                    navigate("/");
            }

        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    // Handle social login
    const handleSocialLogin = async (provider) => {
        try {
            setIsLoading(true);
            const authProvider = provider === "google" ? googleProvider : facebookProvider;

            const { user } = await firebase.auth().signInWithPopup(authProvider);

            const userDoc = await firebase.firestore()
                .collection("users")
                .doc(user.uid)
                .get();

            if (!userDoc.exists) {
                throw new Error("User data not found");
            }

            const userData = userDoc.data();

            await firebase.firestore()
                .collection("users")
                .doc(user.uid)
                .update({
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                });

            switch (userData.role) {
                case "admin":
                    navigate("/admin");
                    break;
                case "seller":
                    navigate("/");
                    break;
                default:
                    navigate("/");
            }

        } catch (err) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    // SVG Icons
    const GoogleIcon = () => (
        <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
            />
            <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
            />
            <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
            />
            <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
            />
        </svg>
    );

    const FacebookIcon = () => (
        <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"
                fill="#1877F2"
            />
        </svg>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center p-4 sm:p-6">
            <div className="w-full max-w-md">
                {/* Card Container */}
                <div className="bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
                    {/* Header Section */}
                    <div className="bg-primary-DEFAULT p-6 text-center">
                        <h1 className="text-3xl font-heading font-bold text-primary-light">Welcome Back</h1>
                        <p className="text-primary-DEFAULT mt-2">Sign in to your account</p>
                    </div>

                    {/* Form Section */}
                    <div className="p-6 sm:p-8">
                        {error && (
                            <div className="mb-5 p-3 bg-accent-red/10 border-l-4 border-accent-red text-accent-red rounded-lg">
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Login Field (Email or Username) */}
                            <div>
                                <label htmlFor="login" className="block text-sm font-medium text-dark-DEFAULT mb-1.5">
                                    Email or Username
                                </label>
                                <input
                                    id="login"
                                    type="text"
                                    value={formData.login}
                                    onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                                    className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all ${errors.login
                                        ? "border-accent-red focus:ring-accent-red/20"
                                        : "border-gray-300 focus:border-primary-DEFAULT focus:ring-primary-light/50"
                                        }`}
                                    placeholder="Enter your email or username"
                                />
                                {errors.login && (
                                    <p className="mt-1.5 text-xs text-accent-red flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {errors.login}
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-dark-DEFAULT mb-1.5">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all ${errors.password
                                        ? "border-accent-red focus:ring-accent-red/20"
                                        : "border-gray-300 focus:border-primary-DEFAULT focus:ring-primary-light/50"
                                        }`}
                                    placeholder="••••••••"
                                />
                                {errors.password && (
                                    <p className="mt-1.5 text-xs text-accent-red flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Forgot Password Link */}
                            <div className="flex justify-end">
                                <Link
                                    to="/forgot-password"
                                    className="text-xs text-primary-DEFAULT hover:text-primary-dark transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full py-3 px-4 rounded-lg font-medium bg-primary-dark text-white transition-all duration-200 ${isLoading
                                    ? "bg-primary-light cursor-not-allowed"
                                    : "hover:bg-primary-dark/80 shadow-md hover:shadow-lg"
                                    }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing In...
                                    </span>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="my-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-2 text-xs text-dark-muted uppercase tracking-wider">
                                        Or continue with
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Social Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => handleSocialLogin("google")}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border border-gray-300 bg-white text-dark-DEFAULT hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                <GoogleIcon />
                                <span>Google</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSocialLogin("facebook")}
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border border-gray-300 bg-white text-dark-DEFAULT hover:bg-gray-100 transition-colors disabled:opacity-50"
                            >
                                <FacebookIcon />
                                <span>Facebook</span>
                            </button>
                        </div>

                        {/* Sign Up Link */}
                        <div className="mt-6 text-center text-sm text-dark-muted">
                            <p>
                                Don't have an account?{" "}
                                <Link
                                    to="/signup"
                                    className="font-medium text-primary-DEFAULT hover:text-primary-dark transition-colors"
                                >
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default signin;