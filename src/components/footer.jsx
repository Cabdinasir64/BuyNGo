import { FaHeart, FaShoppingCart, FaHome, FaInfoCircle, FaEnvelope, FaPhone } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-gradient-to-r from-primary to-primary-light text-white py-8
        ">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* BuyNGo Brand Section */}
                    <div className="col-span-1">
                        <h3 className="text-xl font-bold mb-4 flex items-center">
                            <FaShoppingCart className="mr-2" />
                            BuyNGo
                        </h3>
                        <p className="text-indigo-100">
                            Adeegga iibsashada online ee ugu fiican ee Soomaaliya.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Qiuck Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <a
                                    href="/"
                                    className="text-gray-100 hover:text-white flex items-center"
                                >
                                    <FaHome className="mr-2" /> Home
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/about"
                                    className="text-gray-100 hover:text-white flex items-center"
                                >
                                    <FaInfoCircle className="mr-2" /> About
                                </a>
                            </li>
                            <li>
                                <a
                                    href="/contact"
                                    className="text-gray-100 hover:text-white flex items-center"
                                >
                                    <FaEnvelope className="mr-2" /> Contact
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-semibold mb-4">Contact Us</h4>
                        <ul className="space-y-2">
                            <li className="flex items-center">
                                <FaEnvelope className="mr-2" /> info@buyngo.so
                            </li>
                            <li className="flex items-center">
                                <FaPhone className="mr-2" /> +252 61 123 4567
                            </li>
                        </ul>
                    </div>

                    {/* Developer Credit */}
                    <div>
                        <h4 className="font-semibold mb-4">Sameeyaha</h4>
                        <div className="flex items-center">
                            <FaHeart className="text-accent-red mr-2" />
                            <span>Abdinasir Ahmed Bashir</span>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-primary mt-8 pt-6 text-center text-gray-100">
                    <p>
                        © {new Date().getFullYear()} BuyNGo. Dhamaan xuquuqaha waa la
                        xifdiyay.
                    </p>
                </div>
            </div>
        </footer>
    )
}
export default Footer;