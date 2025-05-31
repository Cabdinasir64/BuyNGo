import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import firebase from "/firebase"; // Assuming this path is correct for your project

const AdminDashboard = () => {
    const user = firebase.auth().currentUser;
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("users");
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    // Profile state
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        profileImage: localStorage.getItem(user ? user.uid : "") || "",
    });

    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState("");

    // Fetch users from Firestore
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const snapshot = await firebase.firestore()
                    .collection("users")
                    .orderBy("createdAt", "desc")
                    .get();

                const usersData = snapshot.docs.map(doc => ({
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

    // Load current user profile
    useEffect(() => {
        const unsubscribe = firebase.auth().onAuthStateChanged(user => {
            if (user) {
                setProfile(prev => ({
                    ...prev,
                    name: user.displayName || "",
                    email: user.email || "",
                }));
            }
        });

        return () => unsubscribe();
    }, []);

    // Handle role change
    const handleRoleChange = async (userId, newRole) => {
        try {
            await firebase.firestore().collection("users").doc(userId).update({
                role: newRole,
            });

            setUsers(users.map(user =>
                user.id === userId ? { ...user, role: newRole } : user
            ));

            setSuccess(`User role updated to ${newRole}`);
            setTimeout(() => setSuccess(""), 3000);
        } catch (error) {
            setErrors({ general: "Failed to update user role" });
        }
    };

    // Handle user deletion
    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            await firebase.firestore().collection("users").doc(userId).delete();
            setSuccess("User deleted successfully");
            setTimeout(() => setSuccess(""), 3000);
        } catch (error) {
            setErrors({ general: "Failed to delete user" });
        }
    };

    // Handle profile image upload
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const user = firebase.auth().currentUser;
        const reader = new FileReader();
        reader.onloadend = () => {
            const imageUrl = reader.result;
            localStorage.setItem(user.uid, imageUrl);
            setProfile(prev => ({ ...prev, profileImage: imageUrl }));
            setSuccess("Profile image updated");
            setTimeout(() => setSuccess(""), 3000);
        };
        reader.readAsDataURL(file);
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
        if (!/^\S+@\S+\.\S+$/.test(profile.email)) newErrors.email = "Invalid email";

        if (profile.newPassword) {
            if (!profile.currentPassword) newErrors.currentPassword = "Current password required";
            if (profile.newPassword.length < 6) newErrors.newPassword = "Password must be at least 6 characters";
            if (profile.newPassword !== profile.confirmPassword) newErrors.confirmPassword = "Passwords don't match";
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

            setProfile(prev => ({
                ...prev,
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            }));

            setSuccess("Profile updated successfully");
            setTimeout(() => setSuccess(""), 3000);
        } catch (error) {
            console.error("Error updating profile:", error);
            let errorMsg = "Failed to update profile";
            if (error.code === "auth/invalid-credential") {
                errorMsg = "Incorrect current password";
            } else if (error.code === "auth/requires-recent-login") {
                errorMsg = "Please reauthenticate to update sensitive information. You might need to log out and log back in.";
            } else if (error.code === "auth/email-already-in-use") {
                errorMsg = "This email address is already in use by another account.";
            }
            setErrors({ general: errorMsg });
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await firebase.auth().signOut();
            navigate("/signin");
        } catch (error) {
            setErrors({ general: "Failed to logout" });
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Mobile sidebar toggle */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-primary p-4 flex justify-between items-center z-30 shadow-md">
                <h1 className="text-xl font-bold text-white font-heading">Admin Dashboard</h1>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="text-white focus:outline-none"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {isSidebarOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static w-64 bg-primary-dark text-white transition-transform duration-300 ease-in-out z-20 flex flex-col shadow-lg`}>
                <div className="p-4 border-b border-primary">
                    <h2 className="text-2xl font-bold font-heading text-center">Admin Panel</h2>
                </div>
                <nav className="p-4 space-y-2 flex-grow">
                    <button
                        onClick={() => {
                            setActiveTab("users");
                            setIsSidebarOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-150 ease-in-out font-medium ${activeTab === "users" ? "bg-primary text-white" : "hover:bg-primary-light hover:text-primary-dark"}`}
                    >
                        Manage Users
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("profile");
                            setIsSidebarOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-150 ease-in-out font-medium ${activeTab === "profile" ? "bg-primary text-white" : "hover:bg-primary-light hover:text-primary-dark"}`}
                    >
                        My Profile
                    </button>
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

            {/* Main content */}
            <main className="flex-1 md:ml-0 mt-16 md:mt-0">
                {/* Header */}
                <header className="bg-white shadow-sm p-6 sticky top-0 md:top-0 z-10">
                    <h1 className="text-2xl font-bold text-dark font-heading">
                        {activeTab === "users" ? "User Management" : "My Profile"}
                    </h1>
                </header>

                {/* Content */}
                <div className="p-6 overflow-y-auto" style={{ height: 'calc(100vh - 88px)' }}>
                    {success && (
                        <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded-md shadow">
                            <p className="font-medium">{success}</p>
                        </div>
                    )}
                    {errors.general && (
                        <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md shadow">
                            <p className="font-medium">{errors.general}</p>
                        </div>
                    )}

                    {activeTab === "users" ? (
                        <div className="bg-white rounded-lg shadow-xl p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                                <h2 className="text-xl font-semibold text-dark font-heading">All Users ({filteredUsers.length})</h2>
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
                                <p className="text-dark-muted text-center py-8">No users found matching your criteria.</p>
                            ) : (
                                <div className="overflow-x-auto rounded-lg border border-gray-200">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">Email</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">Created At</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">Role</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-dark-muted uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredUsers.map((user) => (
                                                <tr key={user.id} className="hover:bg-gray-100 transition-colors duration-150">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-light flex items-center justify-center">
                                                                <span className="text-primary-dark font-bold text-lg">
                                                                    {user.displayName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-dark">
                                                                    {user.displayName || user.email.split("@")[0]}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-muted">{user.email}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-dark-muted">{user.createdAt}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <select
                                                            value={user.role || "buyer"}
                                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
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
                                                            className="text-accent-red hover:text-red-700 transition-colors font-semibold" // Using accent.red
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ) : ( // Profile Tab
                        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-2xl mx-auto">
                            <h2 className="text-xl font-semibold text-dark mb-8 font-heading text-center">Profile Settings</h2>

                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div className="flex flex-col items-center space-y-4 mb-8">
                                    <div className="relative">
                                        {profile.profileImage ? (
                                            <img
                                                src={profile.profileImage}
                                                alt="Profile"
                                                className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-primary-light shadow-md"
                                            />
                                        ) : (
                                            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-primary-light border-4 border-primary-light flex items-center justify-center shadow-md">
                                                <span className="text-primary-dark text-4xl md:text-5xl font-bold font-heading">
                                                    {(profile.name?.charAt(0) || profile.email?.charAt(0) || 'A').toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 border-2 border-primary-light shadow-md cursor-pointer hover:bg-gray-100 transition">
                                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828zM5 14a1 1 0 11-2 0 1 1 0 012 0zM13 6l-1.414-1.414 2.828-2.828L15.828 3 13 6zM5 16H4a1 1 0 01-1-1V5a1 1 0 011-1h1M15 16h1a1 1 0 001-1V5a1 1 0 00-1-1h-1m-5.071.293a.999.999 0 00-1.414 0l-6.163 6.163A.996.996 0 001 12v2a1 1 0 001 1h2a.996.996 0 00.707-.293l6.163-6.163a.999.999 0 000-1.414z" />
                                            </svg>
                                        </label>
                                    </div>
                                    <div className="text-center">
                                        <h3 className="text-2xl font-bold text-dark font-heading">{profile.name || "Admin User"}</h3>
                                        <p className="text-dark-muted">{profile.email}</p>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-dark-muted mb-1">Full Name</label>
                                    <input id="name" type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.name ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-primary-light focus:border-primary"}`}
                                        placeholder="Your full name" />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-dark-muted mb-1">Email Address</label>
                                    <input id="email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.email ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-primary-light focus:border-primary"}`}
                                        placeholder="your.email@example.com" />
                                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                                </div>
                                <hr className="my-6 border-gray-200" />
                                <p className="text-sm text-dark-muted mb-1">To change email or password, current password is required.</p>
                                <div>
                                    <label htmlFor="currentPassword" className="block text-sm font-medium text-dark-muted mb-1">Current Password</label>
                                    <input id="currentPassword" type="password" value={profile.currentPassword} onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.currentPassword ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-primary-light focus:border-primary"}`}
                                        placeholder="Required for email/password changes" />
                                    {errors.currentPassword && <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>}
                                </div>

                                <div>
                                    <label htmlFor="newPassword" className="block text-sm font-medium text-dark-muted mb-1">New Password</label>
                                    <input id="newPassword" type="password" value={profile.newPassword} onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.newPassword ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-primary-light focus:border-primary"}`}
                                        placeholder="new current password" />
                                    {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-muted mb-1">Confirm New Password</label>
                                    <input id="confirmPassword" type="password" value={profile.confirmPassword} onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.confirmPassword ? "border-red-500 focus:ring-red-300" : "border-gray-300 focus:ring-primary-light focus:border-primary"}`}
                                        placeholder="Confirm your new password" />
                                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                                </div>

                                <div>
                                    <button type="submit"
                                        className="w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all duration-150 ease-in-out">
                                        Update Profile
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;