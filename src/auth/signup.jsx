import { useState } from "react";
import firebase from "/firebase";
import { Link, useNavigate } from "react-router-dom";
import { googleProvider, facebookProvider } from "../../firebase.js";

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

export default function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "buyer",
  });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  //Chech unique if username used
  const checkUsernameUnique = async (username) => {
    const snapshot = await firebase
      .firestore()
      .collection("users")
      .where("username", "==", username)
      .get();
    return snapshot.empty;
  };
  //Chech unique if email used
  const checkEmailUnique = async (email) => {
    const snapshot = await firebase
      .firestore()
      .collection("users")
      .where("email", "==", email)
      .get();
    return snapshot.empty;
  };
  // validation from data
  const validate = async () => {
    let valid = true;
    const newErrors = { username: "", email: "", password: "" };

    if (formData.username.length < 3) {
      newErrors.username = "Username must be 3+ characters!";
      valid = false;
    } else if (!/^[a-zA-Z]/.test(formData.username)) {
      newErrors.username = "Username must start with a letter!";
      valid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Only letters, numbers and underscores!";
      valid = false;
    } else if (!(await checkUsernameUnique(formData.username))) {
      newErrors.username = "Username taken!";
      valid = false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format!";
      valid = false;
    } else if (!(await checkEmailUnique(formData.email))) {
      newErrors.email = "Email already registered!";
      valid = false;
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must be 8+ characters!";
      valid = false;
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Need at least 1 uppercase letter!";
      valid = false;
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      newErrors.password = "Need at least 1 special character!";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };


  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (await validate()) {
      try {
        const { user } = await firebase
          .auth()
          .createUserWithEmailAndPassword(formData.email, formData.password);

        await firebase.firestore().collection("users").doc(user.uid).set({
          username: formData.username,
          email: formData.email,
          role: formData.role,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        });

        navigate(`/`);
      } catch (err) {
        if (err.code === "auth/email-already-in-use") {
          setErrors((prev) => ({
            ...prev,
            email: "Email already registered!",
          }));
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  };

  // creating facebook and google signup
  const handleSocialLogin = async (provider) => {
    try {
      setIsLoading(true);
      setError("");

      const authProvider = provider === "google" ? googleProvider : facebookProvider;
      const { user } = await firebase.auth().signInWithPopup(authProvider);

      const userRef = firebase.firestore().collection("users").doc(user.uid);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        await userRef.set({
          username: user.displayName || user.email.split("@")[0],
          email: user.email,
          role: "buyer",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        });
        return navigate("/");
      }

      await userRef.update({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
      });

      const userData = userDoc.data();
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
      if (err.code === "auth/account-exists-with-different-credential") {
        setError("This email is already registerd with a differnt login method. Try signing in with email/password.");
      } else if (err.code === "auth/popup-closed-by-user") {
        setError("Login popup was closed. Please try again.");
      } else if (err.code === "auth/cancelled-popup-request") {
      } else {
        setError(err.message || "Failed to sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-primary-dark flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
        <div className="bg-primary-DEFAULT p-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-primary-light">
            Join Our Community
          </h1>
          <p className="text-primary-DEFAULT mt-1">Sign up to get started</p>
        </div>
        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-4 p-3 bg-accent-red/10 border-l-4 border-accent-red text-accent-red rounded-lg">
              <p>{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-dark-DEFAULT mb-1"
              >
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
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${errors.username
                  ? "border-accent-red focus:ring-accent-red/30"
                  : "border-gray-300 focus:border-primary-DEFAULT focus:ring-primary-light/50"
                  }`}
                placeholder="Username"
                autoComplete="username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-accent-red">
                  {errors.username}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-dark-DEFAULT mb-1"
              >
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
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${errors.email
                  ? "border-accent-red focus:ring-accent-red/30"
                  : "border-gray-300 focus:border-primary-DEFAULT focus:ring-primary-light/50"
                  }`}
                placeholder="Name@example.com"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-accent-red">{errors.email}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-dark-DEFAULT mb-1"
              >
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
                className={`w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 ${errors.password
                  ? "border-accent-red focus:ring-accent-red/30"
                  : "border-gray-300 focus:border-primary-DEFAULT focus:ring-primary-light/50"
                  }`}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-accent-red">
                  {errors.password}
                </p>
              )}
            </div>
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-lg font-medium bg-primary-dark text-white transition-colors ${isLoading
                ? "bg-primary-light cursor-not-allowed"
                : "hover:bg-primary-dark/80"
                }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
          <div className="my-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-2 text-sm text-dark-muted">
                OR CONTINUE WITH
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border border-gray-300 bg-white text-dark-DEFAULT hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <GoogleIcon />
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin("facebook")}
              className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg border border-gray-300 bg-white text-dark-DEFAULT hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <FacebookIcon />
              <span>Facebook</span>
            </button>
          </div>
          <div className="mt-6 text-center text-sm text-dark-muted">
            <p>
              Already have an account?{" "}
              <Link
                to="/signin"
                className="font-medium text-primary-DEFAULT hover:text-primary-dark"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
