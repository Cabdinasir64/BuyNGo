import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import firebase from "/firebase";
import { FaUsers } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { motion, AnimatePresence } from "framer-motion";
const AdminDashboard = () => {
  const user = firebase.auth().currentUser;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  // reding users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snapshot = await firebase
          .firestore()
          .collection("users")
          .orderBy("createdAt", "desc")
          .get();

        const usersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate().toLocaleString() || "N/A",
        }));

        setUsers(usersData);
      } catch (error) {
        setErrors({ general: "Failed to load users" });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // rending user login current profile
  useEffect(() => {
    const stopListening = firebase.auth().onAuthStateChanged(async (user) => {
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

    return () => stopListening();
  }, []);

  // role change
  const handleRoleChange = async (userId, newRole) => {
    try {
      await firebase.firestore().collection("users").doc(userId).update({
        role: newRole,
      });
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      setSuccess(`User role updated to ${newRole}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setErrors({ general: "Failed to update user role" });
    }
  };

  // delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      if (userId === user.uid) {
        setErrors({ general: "Cannot delete your own account" });
        setTimeout(() => setErrors({}), 3000);
        return;
      }
      await firebase.firestore().collection("users").doc(userId).delete();
      setUsers(users.filter((user) => user.id !== userId));
      setSuccess("User deleted successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setErrors({ general: "Failed to delete user" });
    }
  };

  // image upload with cloudinary
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const user = firebase.auth().currentUser;

    if (!user) {
      setErrors({ general: "No authenticated user" });
      return;
    }

    try {
      const userDoc = await firebase
        .firestore()
        .collection("users")
        .doc(user.uid)
        .get();

      const userData = userDoc.exists ? userDoc.data() : {};

      if (userData.role !== "admin") {
        setErrors({ general: "Only admin can upload profile image" });
        return;
      }

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

  // updating profile
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    const user = firebase.auth().currentUser;
    if (!user) {
      setErrors({ general: "No authenticated user" });
      return;
    }

    const userDoc = await firebase
      .firestore()
      .collection("users")
      .doc(user.uid)
      .get();

    const userData = userDoc.exists ? userDoc.data() : {};

    if (userData.role !== "admin") {
      setErrors({ general: "Only admin can update profile" });
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
      let errorMsg = error.message;
      setErrors({ general: errorMsg });
    }
  };

  // logout
  const handleLogout = async () => {
    try {
      await firebase.auth().signOut();
      navigate("/");
    } catch (error) {
      setErrors({ general: "Failed to logout" });
    }
  };

  // search users
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.displayName &&
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      <div className="md:hidden fixed top-0 left-0 right-0 bg-primary p-4 flex justify-between items-center z-30 shadow-md">
        <h1 className="text-xl font-bold text-white font-heading">
          Admin Dashboard
        </h1>
        <motion.button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white focus:outline-none"
          whileTap={{ scale: 0.9 }}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <AnimatePresence mode="wait">
              {isSidebarOpen ? (
                <motion.path
                  key="close-icon"
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: 1, pathLength: 1 }}
                  exit={{ opacity: 0, pathLength: 0 }}
                  transition={{ duration: 0.3 }}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <motion.path
                  key="menu-icon"
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{ opacity: 1, pathLength: 1 }}
                  exit={{ opacity: 0, pathLength: 0 }}
                  transition={{ duration: 0.3 }}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </AnimatePresence>
          </svg>
        </motion.button>
      </div>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static w-64 bg-primary-dark text-white transition-transform duration-300 ease-in-out z-20 flex flex-col shadow-lg`}
      >
        <div className="p-4 border-b border-primary">
          <h2 className="text-2xl font-bold font-heading text-center">
            Admin Panel
          </h2>
        </div>
        <nav className="p-4 space-y-2 flex-grow">
          <motion.button
            onClick={() => {
              setActiveTab("users");
              setIsSidebarOpen(false);
            }}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-150 ease-in-out font-medium text-nowrap flex items-center ${
              activeTab === "users"
                ? "bg-primary text-white hover:bg-primary/80"
                : "hover:bg-primary"
            }`}
            layout="activeTabIndicator"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <FaUsers className="mr-2 text-2xl md:inline " />
            <span className="inline md:hdden lg:inline">Manage users</span>
          </motion.button>

          <motion.button
            onClick={() => {
              setActiveTab("profile");
              setIsSidebarOpen(false);
            }}
            className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-150 ease-in-out font-medium text-nowrap flex items-center ${
              activeTab === "profile"
                ? "bg-primary text-white hover:bg-primary/80"
                : "hover:bg-primary"
            }`}
            layout="activeTabIndicator"
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <CgProfile className="mr-2 text-2xl md:inline " />
            <span className="inline md:hdden lg:inline">My profile</span>
          </motion.button>
        </nav>
        <div className="p-4 border-t-2 border-primary">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 bg-accent-red hover:bg-accent-red hover:brightness-90 text-white rounded-lg transition-colors duration-150 ease-in-out font-medium"
          >
            Log Out
          </button>
        </div>
      </aside>

      {/* content */}
      <main className="flex-1 md:ml-0 mt-16 md:mt-0">
        <header className="bg-white shadow-sm p-6 sticky top-0 md:top-0 z-10">
          <h1 className="text-2xl font-bold text-dark font-heading">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </h1>
        </header>
        <div
          className="p-6 overflow-y-auto"
          style={{ height: "calc(100vh - 80px)" }}
        >
          {success && (
            <motion.div
              className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-md shadow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p className="font-medium">{success}</p>
            </motion.div>
          )}
          {errors.general && (
            <motion.div
              className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md shadow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <p className="font-medium">{errors.general}</p>
            </motion.div>
          )}
          <AnimatePresence mode="wait">
            {activeTab === "users" ? (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-xl p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                  <h2 className="text-xl font-semibold text-dark font-heading">
                    All Users ({filteredUsers.length})
                  </h2>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search users by name or email..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full md:w-72"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary-dark"></div>
                    <p className="ml-4 text-dark-muted">Loading Users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-dark-muted text-center py-8">
                    No users found matching your criteria.
                  </p>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                            Created At
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.map((user) => (
                          <motion.tr
                            key={user.id}
                            layout
                            initial={{ opacity: 1, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="hover:bg-gray-100 transition-colors duration-150"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-ful flex items-center justify-center">
                                  <img
                                    src={user.profileImage}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-dark">
                                    {user.displayName ||
                                      user.email.split("@")[0]}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-muted">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-muted">
                              {user.createdAt}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={user.role || "buyer"}
                                onChange={(e) =>
                                  handleRoleChange(user.id, e.target.value)
                                }
                                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                              >
                                <option value="buyer">Buyer</option>
                                <option value="seller">Seller</option>
                                <option value="admin">Admin</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-accent-red hover:text-red-700 transition-colors font-semibold"
                              >
                                Delete
                              </button>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            ) : (
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

                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="flex flex-col items-center space-y-4 mb-8">
                      <motion.div
                        className="relative"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
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
                          <motion.div
                            className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary-light border-4 border-primary-light flex items-center justify-center shadow-md"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                          >
                            <span className="text-primary-dark text-4xl md:text-5xl font-bold font-heading">
                              {(
                                profile.name.charAt(0) ||
                                profile.email.charAt(0) ||
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
                          {profile.name || "Admin User"}
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
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          errors.name
                            ? "border-red-500 focus:ring-red-300"
                            : "border-gray-300 focus:ring-primary-light focus:border-primary"
                        }`}
                        placeholder="Your full name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.name}
                        </p>
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
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          errors.email
                            ? "border-red-500 focus:ring-red-300"
                            : "border-gray-300 focus:ring-primary-light focus:border-primary"
                        }`}
                        placeholder="your.email@example.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email}
                        </p>
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
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          errors.currentPassword
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
                          setProfile({
                            ...profile,
                            newPassword: e.target.value,
                          })
                        }
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          errors.newPassword
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
                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          errors.confirmPassword
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
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
