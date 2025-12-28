import Link from 'next/link';
import { FaHeartbeat, FaFileMedicalAlt, FaBookMedical, FaShieldAlt, FaChartLine, FaMobileAlt } from 'react-icons/fa';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFFF5]">
      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center text-white font-bold text-2xl shadow-md">
              L
            </div>
            <span className="text-2xl font-bold tracking-tight text-[#2C2C2C]">
              Life<span className="text-gradient">Doc</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block px-6 py-2.5 rounded-full font-semibold text-[#5A6C4D] hover:bg-[#7A8E6B]/10 transition-colors">
              Login
            </Link>
            <Link href="/signup" className="btn-primary !py-2.5 !px-6 !text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden px-6">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#A9C29B]/10 to-transparent -z-10" />
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#7A8E6B]/5 rounded-full blur-3xl -z-10 animate-pulse" />
          
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <div className="inline-block px-4 py-1.5 rounded-full bg-[#E8F3E3] border border-[#A9C29B]/20 text-[#5A6C4D] font-medium text-sm mb-4 shadow-sm animate-fade-in-up">
              ✨ transform the way you manage health
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight text-[#2C2C2C]">
              Your Health Journey, <br />
              <span className="text-gradient">Simply Documented</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              LifeDoc empowers you to take control of your well-being. Securely store medical records, track vital trends, and maintain a personal health diary — all in one beautiful, accessible place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/signup" className="btn-primary text-lg !px-10 !py-4 w-full sm:w-auto min-w-[200px]">
                Start Your Journey
              </Link>
              <Link href="#features" className="px-8 py-4 rounded-full font-semibold text-[#5A6C4D] border border-[#A9C29B]/30 hover:bg-[#E8F3E3] transition-all w-full sm:w-auto min-w-[200px] text-center">
                Explore Features
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 px-6 relative bg-white/40">
           <div className="max-w-7xl mx-auto">
             <div className="text-center mb-16 space-y-4">
               <h2 className="text-3xl md:text-5xl font-bold text-[#2C2C2C]">Everything you need for <span className="text-gradient">Healthy Living</span></h2>
               <p className="text-xl text-gray-600 max-w-2xl mx-auto">We've built a comprehensive suite of tools to help you stay on top of your health, organize your medical history, and gain valuable insights.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Feature 1 */}
               <div className="glass p-8 rounded-3xl card-hover space-y-4">
                 <div className="w-14 h-14 rounded-2xl bg-[#E8F3E3] flex items-center justify-center text-[#7A8E6B] text-2xl">
                   <FaBookMedical />
                 </div>
                 <h3 className="text-2xl font-bold text-[#2C2C2C]">Smart Health Diary</h3>
                 <p className="text-gray-600 leading-relaxed">
                   More than just a journal. Log symptoms, medications, and daily feelings. Detect patterns in your health over time with our intuitive interface.
                 </p>
               </div>

               {/* Feature 2 */}
               <div className="glass p-8 rounded-3xl card-hover space-y-4 border-[#7A8E6B]/30 shadow-md transform md:-translate-y-4">
                 <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center text-white text-2xl shadow-lg">
                   <FaFileMedicalAlt />
                 </div>
                 <h3 className="text-2xl font-bold text-[#2C2C2C]">Digital Medical Records</h3>
                 <p className="text-gray-600 leading-relaxed">
                   Never lose a prescription or lab report again. Upload, categorize, and search your medical documents instantly. accessible whenever you need them.
                 </p>
               </div>

               {/* Feature 3 */}
               <div className="glass p-8 rounded-3xl card-hover space-y-4">
                 <div className="w-14 h-14 rounded-2xl bg-[#E8F3E3] flex items-center justify-center text-[#7A8E6B] text-2xl">
                   <FaHeartbeat />
                 </div>
                 <h3 className="text-2xl font-bold text-[#2C2C2C]">Vitals Tracking</h3>
                 <p className="text-gray-600 leading-relaxed">
                   Keep a close eye on your blood pressure, sugar levels, BMI, and more. Visual charts help you and your doctor understand your progress.
                 </p>
               </div>
             </div>
           </div>
        </section>

        {/* Benefits/How it helps Section */}
        <section className="py-24 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-3xl md:text-5xl font-bold text-[#2C2C2C] leading-tight">
                  Designed to improve <br/>
                  <span className="text-gradient">Your Quality of Life</span>
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#E8F3E3] flex items-center justify-center text-[#7A8E6B] text-xl">
                      <FaChartLine />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#2C2C2C] mb-2">Gain Actionable Insights</h4>
                      <p className="text-gray-600">Visualize your health data to understand what works for your body and what doesn't. Make informed decisions every day.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#E8F3E3] flex items-center justify-center text-[#7A8E6B] text-xl">
                      <FaShieldAlt />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#2C2C2C] mb-2">Peace of Mind Security</h4>
                      <p className="text-gray-600">Your health data is sensitive. We treat it that way with bank-grade encryption and strict privacy controls. You own your data.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#E8F3E3] flex items-center justify-center text-[#7A8E6B] text-xl">
                      <FaMobileAlt />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-[#2C2C2C] mb-2">Access Anywhere</h4>
                      <p className="text-gray-600">Whether you're at the doctor's office or on vacation, your complete medical history is right in your pocket.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary opacity-10 blur-3xl rounded-full transform rotate-12"></div>
                <div className="glass p-8 rounded-3xl relative z-10 border-[#FFFFFF]/50 shadow-2xl">
                  {/* Mock UI Element - Health Card */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                      <div>
                        <p className="text-sm text-gray-500">Today's Vitals</p>
                        <p className="text-2xl font-bold text-[#2C2C2C]">Healthy</p>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-[#E8F3E3] text-[#5A6C4D] text-sm font-medium">Updated 2m ago</div>
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center"><FaHeartbeat/></div>
                           <div>
                             <p className="font-semibold text-[#2C2C2C]">Heart Rate</p>
                             <p className="text-xs text-gray-500">Normal Range</p>
                           </div>
                         </div>
                         <p className="font-bold text-[#2C2C2C]">72 bpm</p>
                       </div>
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center"><FaFileMedicalAlt/></div>
                           <div>
                             <p className="font-semibold text-[#2C2C2C]">Blood Pressure</p>
                             <p className="text-xs text-gray-500">Optimal</p>
                           </div>
                         </div>
                         <p className="font-bold text-[#2C2C2C]">120/80</p>
                       </div>
                    </div>
                    <div className="pt-4">
                      <Link href="/signup" className="block w-full text-center py-3 rounded-xl bg-gray-50 hover:bg-gray-100 font-semibold text-[#5A6C4D] transition-colors">
                        View Full Report
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto glass p-12 rounded-[2.5rem] text-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#7A8E6B]/10 to-transparent -z-10"></div>
             <h2 className="text-3xl md:text-5xl font-bold text-[#2C2C2C] mb-6">Ready to prioritize your health?</h2>
             <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">Join thousands of users who are already experiencing the peace of mind that comes with organized health management.</p>
             <Link href="/signup" className="btn-primary inline-flex text-lg !px-12 !py-5 shadow-xl hover:shadow-2xl">
               Create Free Account
             </Link>
             <p className="mt-6 text-sm text-gray-500">No credit card required • Secure & Private</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="glass border-t border-[#A9C29B]/20 pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center text-white font-bold text-lg">
                   L
                </div>
                 <span className="text-xl font-bold text-[#2C2C2C]">
                   Life<span className="text-gradient">Doc</span>
                 </span>
              </div>
              <p className="text-gray-500 leading-relaxed">
                Empowering individuals to take control of their health data with security and simplicity.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-[#2C2C2C] mb-4">Features</h4>
              <ul className="space-y-3 text-gray-600">
                <li><Link href="#" className="hover:text-[#7A8E6B] transition-colors">Health Diary</Link></li>
                <li><Link href="#" className="hover:text-[#7A8E6B] transition-colors">Medical Records</Link></li>
                <li><Link href="#" className="hover:text-[#7A8E6B] transition-colors">Vitals Tracking</Link></li>
                <li><Link href="#" className="hover:text-[#7A8E6B] transition-colors">Doctor Reports</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#2C2C2C] mb-4">Company</h4>
              <ul className="space-y-3 text-gray-600">
                <li><Link href="#" className="hover:text-[#7A8E6B] transition-colors">About Us</Link></li>
                <li><Link href="#" className="hover:text-[#7A8E6B] transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-[#7A8E6B] transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-[#7A8E6B] transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#2C2C2C] mb-4">Get Started</h4>
               <p className="text-gray-600 mb-4">Start your journey to better health documentation today.</p>
               <Link href="/signup" className="text-[#7A8E6B] font-bold hover:underline">
                 Sign Up Now &rarr;
               </Link>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} LifeDoc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
