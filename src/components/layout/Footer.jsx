import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
              Web Design Contest
            </Link>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Showcase your creativity and technical skills
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2">Resources</h3>
              <ul className="space-y-1">
                <li>
                  <Link to="/faq" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                    FAQ
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                    Guidelines
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase mb-2">Support</h3>
              <ul className="space-y-1">
                <li>
                  <a href="mailto:support@webdesigncontest.edu.vn" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400">
                    Help Center
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-600 dark:text-gray-400">
          © {currentYear} Web Design Contest. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
