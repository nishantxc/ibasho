"use client"

import React, { useState, useEffect } from 'react';
import { Camera, Heart, Users, Sparkles, ArrowRight, Star, Shield, Moon, Sun } from 'lucide-react';

const IbashoLanding = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const testimonials = [
    {
      text: "A week of balancing calmness and raw emotions, with moments of anxiety creeping in.",
      author: "The Calm Seeker",
      mood: "8/10 Calm"
    },
    {
      text: "I've been there so I know its not easy being in that position",
      author: "Anonymous Whisper",
      mood: "Connected"
    },
    {
      text: "its getting dark, i am not sure we can continue moving through this",
      author: "Silent Journaler",
      mood: "Overwhelmed"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-amber-50 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-pink-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="text-2xl font-serif text-slate-800">ibasho</div>
            <span className="text-sm text-slate-500 font-light">(居場所)</span>
          </div>
          <div className="flex items-center space-x-6">
            <button className="text-slate-600 hover:text-slate-800 transition-colors">About</button>
            <button className="text-slate-600 hover:text-slate-800 transition-colors">Community</button>
            <button className="bg-gradient-to-r from-pink-200 to-orange-200 text-slate-800 px-6 py-2 rounded-full hover:from-pink-300 hover:to-orange-300 transition-all duration-300 font-medium">
              Find Your Space
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="inline-flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full px-6 py-3 mb-8 border border-pink-100">
              <Sparkles className="w-5 h-5 text-orange-400" />
              <span className="text-slate-700 font-medium">A place where you belong</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-serif text-slate-800 mb-6 leading-tight">
              Your Online
              <span className="block bg-gradient-to-r from-pink-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
                Emotional Sanctuary
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Create polaroid-style visual journals, connect with understanding souls, and discover weekly insights about your emotional journey. Where authenticity matters more than performance.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <button className="group bg-gradient-to-r from-pink-300 via-orange-300 to-amber-300 text-slate-800 px-8 py-4 rounded-full font-semibold text-lg hover:from-pink-400 hover:via-orange-400 hover:to-amber-400 transition-all duration-300 flex items-center space-x-2 shadow-lg hover:shadow-xl">
                <span>Begin Your Journey</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="text-slate-600 hover:text-slate-800 font-medium px-8 py-4 transition-colors">
                Watch How It Works
              </button>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {/* Journal Cards */}
              <div className="space-y-6 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-lg shadow-lg p-4 border-4 border-white transform -rotate-1 hover:rotate-0 transition-transform">
                  <img src="/api/placeholder/300/200" alt="Kitten journal" className="w-full h-48 object-cover rounded mb-3" />
                  <p className="text-sm italic text-slate-600 mb-2">"not feeling good at all"</p>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>August 14, 2025</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">Sad</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6 transform -rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-lg shadow-lg p-4 border-4 border-white transform rotate-2 hover:rotate-0 transition-transform">
                  <img src="/api/placeholder/300/200" alt="Puppies journal" className="w-full h-48 object-cover rounded mb-3" />
                  <p className="text-sm italic text-slate-600 mb-2">"I am feeling not good right now"</p>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>August 14, 2025</span>
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">Tired</span>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-6 text-white shadow-lg">
                  <h3 className="text-lg font-semibold mb-2">The Calm Seeker</h3>
                  <p className="text-slate-300 text-sm mb-4">A gentle soul navigating life's waves with serenity.</p>
                  <div className="flex justify-between items-center">
                    <div className="text-2xl font-bold">8</div>
                    <div className="text-sm text-slate-400">MOOD</div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-lg shadow-lg p-4 border-4 border-white transform -rotate-2 hover:rotate-0 transition-transform">
                  <img src="/api/placeholder/300/200" alt="Mountain landscape" className="w-full h-48 object-cover rounded mb-3" />
                  <p className="text-sm italic text-slate-600 mb-2">"its getting dark, i am not sure we can continue moving through this"</p>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>August 7, 2025</span>
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">Overwhelmed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-slate-800 mb-6">How Ibasho Works</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              A gentle three-step journey to emotional wellness and authentic connection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-pink-200 to-orange-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Camera className="w-10 h-10 text-slate-700" />
              </div>
              <h3 className="text-2xl font-serif text-slate-800 mb-4">Capture Your Moment</h3>
              <p className="text-slate-600 leading-relaxed">
                Create polaroid-style visual journals with photos, moods, and reflections. Every entry starts private—your safe space to be authentic.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-orange-200 to-amber-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-10 h-10 text-slate-700" />
              </div>
              <h3 className="text-2xl font-serif text-slate-800 mb-4">Share When Ready</h3>
              <p className="text-slate-600 leading-relaxed">
                Choose to share moments with the community as postcards. Receive gentle reactions and connect through anonymous whispers when you're ready.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-gradient-to-br from-amber-200 to-pink-200 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-10 h-10 text-slate-700" />
              </div>
              <h3 className="text-2xl font-serif text-slate-800 mb-4">Weekly Wrapped</h3>
              <p className="text-slate-600 leading-relaxed">
                Receive personalized Spotify-style emotional insights. Discover your patterns, celebrate growth, and understand your journey with compassion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Whispers Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-slate-800 mb-6">Community Whispers</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Connect with understanding souls through gentle, anonymous conversations
            </p>
          </div>

          <div className="max-w-2xl mx-auto bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-pink-100">
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-300 to-orange-300 rounded-full flex items-center justify-center text-white font-semibold">
                P
              </div>
              <div className="flex-1">
                <div className="bg-pink-100 rounded-2xl rounded-tl-none px-4 py-3 mb-2">
                  <p className="text-slate-700">how have you been?</p>
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-4 mb-4 justify-end">
              <div className="flex-1 text-right">
                <div className="bg-slate-100 rounded-2xl rounded-tr-none px-4 py-3 mb-2 inline-block">
                  <p className="text-slate-700">i've been there so I know its not easy being in that position</p>
                </div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center text-white font-semibold">
                F
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-300 to-orange-300 rounded-full flex items-center justify-center text-white font-semibold">
                P
              </div>
              <div className="flex-1">
                <div className="bg-pink-100 rounded-2xl rounded-tl-none px-4 py-3">
                  <p className="text-slate-700">hanging in there, i know right</p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500 italic">Safe, anonymous conversations that heal</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-r from-pink-100/50 to-orange-100/50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-serif text-slate-800 mb-12">What Our Community Says</h2>
          
          <div className="relative min-h-[200px]">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-500 ${
                  index === currentTestimonial ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <blockquote className="text-2xl font-serif text-slate-700 mb-6 italic">
                  "{testimonial.text}"
                </blockquote>
                <div className="flex items-center justify-center space-x-4">
                  <span className="text-slate-600 font-medium">{testimonial.author}</span>
                  <span className="bg-gradient-to-r from-pink-200 to-orange-200 px-3 py-1 rounded-full text-sm text-slate-700">
                    {testimonial.mood}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center space-x-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentTestimonial ? 'bg-orange-400' : 'bg-slate-300'
                }`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-5xl font-serif mb-6">Find Your Ibasho</h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            Join thousands who have discovered their digital emotional sanctuary. Your journey to authentic self-expression starts here.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button className="group bg-gradient-to-r from-pink-400 via-orange-400 to-amber-400 text-slate-800 px-12 py-5 rounded-full font-bold text-xl hover:from-pink-300 hover:via-orange-300 hover:to-amber-300 transition-all duration-300 flex items-center space-x-3 shadow-lg hover:shadow-xl">
              <span>Start Your Journey</span>
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="flex justify-center items-center space-x-8 text-slate-400">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Private First</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5" />
              <span>Authentic Community</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5" />
              <span>Weekly Insights</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-serif text-white">ibasho</div>
              <span className="text-sm text-slate-500 font-light">(居場所)</span>
            </div>
            <div className="text-sm">
              © 2025 Ibasho. A place where you belong.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default IbashoLanding;