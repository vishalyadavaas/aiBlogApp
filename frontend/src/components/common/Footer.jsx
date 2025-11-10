import { Link } from 'react-router-dom';
import { FiHeart, FiGithub, FiTwitter, FiMail, FiStar, FiCode, FiUsers, FiBookOpen } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '/features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'AI Generator', href: '/create' },
      { name: 'Community', href: '/community' },
    ],
    resources: [
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/api' },
      { name: 'Blog', href: '/blog' },
      { name: 'Support', href: '/support' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy', href: '/privacy' },
    ],
  };

  const socialLinks = [
    { name: 'GitHub', icon: <FiGithub />, href: 'https://github.com', color: 'hover:text-gray-600' },
    { name: 'Twitter', icon: <FiTwitter />, href: 'https://twitter.com', color: 'hover:text-blue-400' },
    { name: 'Email', icon: <FiMail />, href: 'mailto:hello@aiblog.com', color: 'hover:text-red-400' },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full transform translate-x-48 -translate-y-48"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-pink-500/10 to-blue-500/10 rounded-full transform -translate-x-40 translate-y-40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(59,130,246,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 flex items-center justify-center">
                  <img 
                    src="/Icon.png" 
                    alt="AiBlog Logo" 
                    className="w-full h-full object-contain drop-shadow-lg filter brightness-110"
                  />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AiBlog
                </span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Empowering creators with AI-powered content generation. Join our community of writers, thinkers, and innovators.
              </p>
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                  <div className="flex items-center justify-center text-blue-400 mb-1">
                    <FiUsers className="w-4 h-4 mr-1" />
                    <span className="text-lg font-bold">10K+</span>
                  </div>
                  <span className="text-xs text-gray-400">Active Users</span>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-lg backdrop-blur-sm border border-white/10">
                  <div className="flex items-center justify-center text-purple-400 mb-1">
                    <FiBookOpen className="w-4 h-4 mr-1" />
                    <span className="text-lg font-bold">50K+</span>
                  </div>
                  <span className="text-xs text-gray-400">Posts Created</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-white/10 ${social.color}`}
                    title={social.name}
                  >
                    <div className="w-5 h-5">{social.icon}</div>
                  </a>
                ))}
              </div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-6 text-blue-300">Product</h3>
                <ul className="space-y-3">
                  {footerLinks.product.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 transform inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-6 text-purple-300">Resources</h3>
                <ul className="space-y-3">
                  {footerLinks.resources.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 transform inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-6 text-pink-300">Company</h3>
                <ul className="space-y-3">
                  {footerLinks.company.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-gray-300 hover:text-white transition-colors duration-200 hover:translate-x-1 transform inline-block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="mt-16 p-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="text-center max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Stay Updated with AI Innovations
              </h3>
              <p className="text-gray-300 mb-6">
                Get the latest updates on AI writing tools, feature releases, and community highlights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 shadow-lg">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2 text-gray-400">
                <span>© {currentYear} AiBlog. Made with</span>
                <FiHeart className="w-4 h-4 text-red-400 animate-pulse" />
                <span>for creators worldwide.</span>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <Link to="/terms" className="hover:text-white transition-colors duration-200">
                  Terms of Service
                </Link>
                <Link to="/privacy" className="hover:text-white transition-colors duration-200">
                  Privacy Policy
                </Link>
                <Link to="/cookies" className="hover:text-white transition-colors duration-200">
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
