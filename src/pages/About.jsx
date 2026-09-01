import React from 'react';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll';
import './Home.css';

export default function About() {
  useRevealOnScroll();

  return (
    <div className="home-body min-h-screen pt-24 pb-20 flex-grow flex flex-col">
      <div id="view-about" className="page-view active flex-grow">
        <div className="max-w-6xl mx-auto px-6 py-16 relative z-10">
          <h2 className="section-heading text-3xl">About Tech Titans</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="reveal">
              <p className="text-gray-300 leading-relaxed text-base mb-6">
                Tech Titans is an elite student collective operating across multiple technical disciplines
                including Data Science, Computer Science, and Information Technology. Our purpose is to
                bridge the gap between academic curriculum and real-world tech industry demands.
              </p>
              <p className="text-gray-400 leading-relaxed text-sm mb-6">
                We operate through specialized functional teams to ensure every aspect of our digital
                presence and event execution is professional, engaging, and technically sound. From UI/UX
                implementation to high-fidelity media production, we build the future.
              </p>
            </div>
            <div className="glass-panel p-8 relative overflow-hidden flex flex-col justify-center border-t-2 border-t-[#ae97d6] reveal"
              style={{ transitionDelay: "0.1s" }}>
              <div className="absolute right-4 top-4 text-6xl text-white/5">
                <i className="fas fa-network-wired"></i>
              </div>
              <h3 className="text-white font-bold text-xl mb-3 flex items-center gap-3">
                <i className="fas fa-rocket text-accent"></i> Technical Excellence
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Our collective focuses on real-world application and competitive problem-solving. We
                emphasize collaborative code jams, algorithmic problem solving, and modern integrations.
              </p>
            </div>
          </div>

          {/* Horizontal Divider Line */}
          <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-[#ae97d6]/40 to-transparent reveal"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 reveal">
            <div className="glass-panel p-6 flex flex-col items-start border-t-2 border-transparent">
              <div className="w-10 h-10 rounded bg-[#161821] border border-white/10 flex items-center justify-center text-accent mb-4">
                <i className="fas fa-code"></i>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Development</h4>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                Front-end, Back-end, and Full-stack engineering focused on creating robust digital platforms and custom event software.
              </p>
            </div>

            <div className="glass-panel p-6 flex flex-col items-start border-t-2 border-transparent">
              <div className="w-10 h-10 rounded bg-[#161821] border border-white/10 flex items-center justify-center text-cyan-400 mb-4">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Cybersecurity</h4>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                Dedicated to network security analysis, ethical hacking practices, and maintaining secure infrastructure.
              </p>
            </div>

            <div className="glass-panel p-6 flex flex-col items-start border-t-2 border-transparent sm:col-span-2 md:col-span-1">
              <div className="w-10 h-10 rounded bg-[#161821] border border-white/10 flex items-center justify-center text-pink-400 mb-4">
                <i className="fas fa-microchip"></i>
              </div>
              <h4 className="text-lg font-bold text-white mb-2">IoT &amp; Robotics</h4>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                Hardware programming, sensor integration, and building automated physical systems for campus challenges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
