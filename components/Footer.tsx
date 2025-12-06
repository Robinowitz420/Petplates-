import Link from 'next/link';
import MascotIcon from './MascotIcon';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="text-2xl font-bold mb-4">🐾 Paw & Plate</div>
            <p className="text-gray-400">
              Fresh, personalized meal prep for all your pets. Based on AAFCO and WSAVA guidelines.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MascotIcon mascot="robin-redroute" size={16} />
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-400 hover:text-white transition-colors">
                  My Pets
                </Link>
              </li>
              <li>
                <Link href="/meal-plans" className="text-gray-400 hover:text-white transition-colors">
                  Meal Plans
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Pet Categories */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MascotIcon mascot="puppy-prepper" size={16} />
              Pet Categories
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/category/dogs" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <MascotIcon mascot="puppy-prepper" size={14} /> Dogs
                </Link>
              </li>
              <li>
                <Link href="/category/cats" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <MascotIcon mascot="professor-purrfessor" size={14} /> Cats
                </Link>
              </li>
              <li>
                <Link href="/category/birds" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <MascotIcon mascot="robin-redroute" size={14} /> Birds
                </Link>
              </li>
              <li>
                <Link href="/category/reptiles" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <MascotIcon mascot="sherlock-shells" size={14} /> Reptiles
                </Link>
              </li>
              <li>
                <Link href="/category/pocket-pets" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <MascotIcon mascot="farmer-fluff" size={14} /> Pocket Pets
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MascotIcon mascot="professor-purrfessor" size={16} />
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/nutrition-guide" className="text-gray-400 hover:text-white transition-colors">
                  Nutrition Guide
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Paw & Plate. All rights reserved.
            Nutritional guidelines based on AAFCO and WSAVA standards.
          </p>
        </div>
      </div>
    </footer>
  );
}
