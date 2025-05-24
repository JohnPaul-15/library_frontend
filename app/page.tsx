import Link from 'next/link';
import Image from "next/image";

export default function Home() {
  return (
     <>
      {/* Hero Section */}
      <section className="bg-blue-600 text-white text-center py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to Library Management System
          </h1>
          <p className="text-xl mb-8">
            Build amazing things with Next.js & Tailwind CSS
          </p>
          <Link
            href="/auth"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition duration-300"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-12">Awesome Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-6">
            <div className="flex justify-center">
              <Image
                src="/file.svg"
                alt="Fast Performance"
                width={60}
                height={60}
              />
            </div>
            <h4 className="text-xl font-semibold mt-4 mb-2">Fast Performance</h4>
            <p className="text-gray-600">Optimized for speed and efficiency.</p>
          </div>

          {/* Feature 2 */}
          <div className="p-6">
            <div className="flex justify-center">
              <Image
                src="/window.svg"
                alt="User Friendly"
                width={60}
                height={60}
              />
            </div>
            <h4 className="text-xl font-semibold mt-4 mb-2">User Friendly</h4>
            <p className="text-gray-600">Intuitive and easy-to-use design.</p>
          </div>

          {/* Feature 3 */}
          <div className="p-6">
            <div className="flex justify-center">
              <Image
                src="/globe.svg"
                alt="SEO Ready"
                width={60}
                height={60}
              />
            </div>
            <h4 className="text-xl font-semibold mt-4 mb-2">SEO Ready</h4>
            <p className="text-gray-600">Boost your search rankings with SEO.</p>
          </div>
        </div>
      </section>

       <footer className="bg-gray-900 text-white text-center py-8">
      <div className="container mx-auto px-4">
        <p className="m-0">
          © {new Date().getFullYear()} MyBrand. All rights reserved.
        </p>
      </div>
    </footer>
    </>
  );
}
