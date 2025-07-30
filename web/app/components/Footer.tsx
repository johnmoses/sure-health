export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">SureHealth</h3>
            <p className="text-gray-300">Electronic Health Records System for modern healthcare.</p>
          </div>
          <div>
            <h4 className="text-md font-medium mb-3">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/dashboard" className="hover:text-white">Dashboard</a></li>
              <li><a href="/patients" className="hover:text-white">Patients</a></li>
              <li><a href="/clinical" className="hover:text-white">Clinical</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-md font-medium mb-3">Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="#" className="hover:text-white">Help Center</a></li>
              <li><a href="#" className="hover:text-white">Contact Us</a></li>
              <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 SureHealth. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}