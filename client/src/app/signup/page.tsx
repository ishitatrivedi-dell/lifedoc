'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { signupUser, clearError } from '@/store/slices/authSlice';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    password: '',
  });
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    // Clear error when component unmounts
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await dispatch(signupUser({
      name: formData.name,
      age: formData.age,
      email: formData.email,
      password: formData.password
    }));

    if (signupUser.fulfilled.match(result)) {
      router.push('/verify-otp');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-gray-900">Life</div>
          <div className="text-2xl font-bold text-emerald-600">Doc</div>
        </div>
        <button className="text-gray-600 hover:text-gray-900 text-sm font-medium">
          EN ▼
        </button>
      </div>

      {/* Main Content */}
      <div className="flex h-screen">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 sm:px-8 lg:px-16">
          <div className="w-full max-w-md">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 text-center">
              Welcome
            </h1>
            <p className="text-center text-gray-600 mb-10 text-sm leading-relaxed">
              Create an account to access your profile, find your medical documents and your treatment history.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              {/* Age Input */}
              <div>
                <input
                  type="number"
                  name="age"
                  placeholder="Your age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              {/* Email Input */}
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Your email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Your password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? 'Creating account...' : 'Next Step'}
              </button>
            </form>

            {/* Login Link */}
            <p className="text-center text-gray-600 text-sm mt-8">
              Already have an account?{' '}
              <Link href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                Login
              </Link>
            </p>

            {/* Footer */}
            <div className="text-center text-gray-500 text-xs mt-12">
              <p>Questions? <a href="mailto:support@lifedoc.com" className="text-emerald-600 hover:text-emerald-700">support@lifedoc.com</a></p>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-100">
          <img
            src="https://res.cloudinary.com/dzsvjyg2c/image/upload/v1766864239/Gemini_Generated_Image_7tp4m87tp4m87tp4_o2zzbs.png"
            alt="LifeDoc Medical Professionals"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-12">
            <h2 className="text-4xl font-bold text-white mb-2">Your Health Matters</h2>
            <p className="text-emerald-50 text-lg leading-relaxed">
              Access your medical records, track your health history, and stay connected
              with your healthcare providers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
