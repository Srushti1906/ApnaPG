import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Find Your Perfect PG 🏠
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Affordable PGs and shared rooms for students, professionals, and teachers
        </p>
        <div className="space-x-4">
          <Link to="/browse" className="btn-primary inline-block">
            Browse PGs
          </Link>
          <Link
            to="/register"
            className="btn-secondary inline-block"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Apna PG?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold mb-2">Safe & Verified</h3>
              <p className="text-gray-600">
                All PGs are verified and follow Indian safety standards
              </p>
            </div>

            <div className="card">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2">Affordable Pricing</h3>
              <p className="text-gray-600">
                Transparent pricing with no hidden charges
              </p>
            </div>

            <div className="card">
              <div className="text-4xl mb-4">🏃</div>
              <h3 className="text-xl font-bold mb-2">One-Day Stay</h3>
              <p className="text-gray-600">
                Book single night stays for exams or temporary needs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Home?</h2>
          <p className="text-blue-100 mb-8">
            Join thousands of students and professionals who found their perfect PG with us
          </p>
          <Link to="/browse" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 inline-block">
            Start Browsing
          </Link>
        </div>
      </section>
    </div>
  );
}
