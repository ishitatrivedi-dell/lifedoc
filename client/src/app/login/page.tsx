'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, clearError } from '@/store/slices/authSlice';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { loading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await dispatch(
      loginUser({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      })
    );

    if (loginUser.fulfilled.match(result)) {
      router.push('/dashboard');
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
        {/* Left */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 sm:px-8 lg:px-16">
          <div className="w-full max-w-md">
            <h1 className="text-4xl font-bold text-gray-900 mb-3 text-center">
              Welcome Back
            </h1>

            <p className="text-center text-gray-600 mb-10 text-sm leading-relaxed">
              Sign in to your account to access your medical documents and health history.
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                name="email"
                placeholder="Your email address"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-gray-900 placeholder-gray-500"
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition text-gray-900 placeholder-gray-500"
                required
              />

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-gray-700 cursor-pointer">
                    Remember me
                  </span>
                </label>

                <Link
                  href="/forgot-password"
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-gray-600 text-sm mt-8">
              Don't have an account?{' '}
              <Link href="/signup" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                Sign Up
              </Link>
            </p>

            <div className="text-center text-gray-500 text-xs mt-12">
              Need help?{' '}
              <a
                href="mailto:support@lifedoc.com"
                className="text-emerald-600 hover:text-emerald-700"
              >
                support@lifedoc.com
              </a>
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
