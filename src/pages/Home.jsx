import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { X, Send } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { eventService } from "../services/eventService";
import { questService } from "../services/questService";
import { useRevealOnScroll } from "../hooks/useRevealOnScroll";
import "./Home.css";

// Defined outside component to maintain stable reference across renders
const PHRASES = ["'Welcome_Titans'", "'Think'", "'Build'", "'Innovate'"];

export default function Home() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackData, setFeedbackData] = useState({ name: "", message: "" });
  const [feedbackStatus, setFeedbackStatus] = useState("");
  const [latestEvent, setLatestEvent] = useState(null);
  const [latestQuest, setLatestQuest] = useState(null);
  const [isEntering, setIsEntering] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Reusable scroll reveal observer
  useRevealOnScroll();

  // Typewriter effect state
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    const typeTimer = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % PHRASES.length);
    }, 2000);

    const enterTimer = setTimeout(() => setIsEntering(false), 50);

    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      clearInterval(typeTimer);
      clearTimeout(enterTimer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Listen for Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && showFeedbackForm) {
        setShowFeedbackForm(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showFeedbackForm]);

  useEffect(() => {
    async function fetchNews() {
      try {
        const events = await eventService.fetchEvents();
        if (events && events.length > 0) setLatestEvent(events[0]);

        const quests = await questService.fetchActiveQuests();
        if (quests && quests.length > 0) setLatestQuest(quests[0]);
      } catch (err) {
        console.error("Error fetching news:", err);
      }
    }
    fetchNews();
  }, []);

  const handleOpenFeedback = () => {
    if (!user) {
      navigate("/auth", {
        state: {
          from: "/home",
          message: "Please sign in to send a transmission to the core team.",
        },
      });
    } else {
      setFeedbackData({
        name: profile?.full_name || user?.user_metadata?.full_name || "",
        message: "",
      });
      setFeedbackStatus("");
      setShowFeedbackForm(true);
    }
  };

  // Calculate live word count
  const messageWords = feedbackData.message.trim()
    ? feedbackData.message.trim().split(/\s+/).filter(Boolean)
    : [];
  const wordCount = messageWords.length;
  const isOverLimit = wordCount > 60;

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (wordCount === 0) {
      setFeedbackStatus("Error: Transmission message cannot be empty.");
      return;
    }
    if (isOverLimit) {
      setFeedbackStatus(
        `Error: Message exceeds 60-word limit (${wordCount}/60 words).`,
      );
      return;
    }

    setFeedbackStatus("Transmitting message...");
    try {
      const { error } = await supabase.from("feedback").insert([
        {
          name:
            feedbackData.name.trim() ||
            profile?.full_name ||
            user?.user_metadata?.full_name ||
            "Titan Operative",
          email: user?.email || "authenticated@techtitans.club",
          message: feedbackData.message.trim(),
        },
      ]);

      if (error) throw error;

      setFeedbackStatus("Transmission sent successfully!");
      setTimeout(() => {
        setShowFeedbackForm(false);
        setFeedbackStatus("");
        setFeedbackData({ name: "", message: "" });
      }, 1800);
    } catch (err) {
      setFeedbackStatus("Error: " + err.message);
    }
  };

  return (
    <div
      className={`home-body transition-opacity duration-1000 ease-out ${isEntering ? "opacity-0" : "opacity-100"}`}
    >
      {/* Back to top button */}
      <button
        id="back-to-top"
        className={`btn-keycap ${showBackToTop ? "visible" : ""}`}
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
      >
        <i className="fas fa-rocket"></i>
      </button>

      <main className="pt-24 pb-20 flex-grow">
        <div id="view-home" className="page-view active">
          <section className="relative pt-6 pb-16 lg:pt-16 lg:pb-32 overflow-hidden">
            <div
              className="anchor-glow"
              style={{
                width: "500px",
                height: "500px",
                top: "-180px",
                left: "-140px",
                background:
                  "radial-gradient(circle, rgba(174,151,214,0.1), transparent 70%)",
              }}
            ></div>
            <div
              className="anchor-glow"
              style={{
                width: "420px",
                height: "420px",
                top: "-100px",
                right: "-160px",
                background:
                  "radial-gradient(circle, rgba(96,165,250,0.05), transparent 70%)",
                animationDelay: "3s",
              }}
            ></div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center w-full">
              <p className="text-accent tracking-[0.3em] sm:tracking-[0.4em] text-[10px] sm:text-xs font-bold uppercase mb-4 sm:mb-6 drop-shadow-md">
                A New Chapter Begins
              </p>

              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-4xl sm:text-7xl md:text-[6.5rem] lg:text-[8rem] font-black tracking-tight mb-4 leading-none break-words">
                <span className="title-tech">TECH</span>
                <span className="title-titans">TITANS</span>
              </div>

              <p className="text-[#8c8d96] tracking-[0.25em] sm:tracking-[0.3em] text-xs sm:text-sm font-semibold uppercase mb-8 sm:mb-16">
                Official Club Homepage
              </p>

              {/* Code Window with Typing Loop */}
              <div className="code-window w-full max-w-2xl mx-auto rounded-xl overflow-hidden mb-8 sm:mb-16">
                <div className="code-header px-4 py-2.5 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
                  <span className="text-[11px] text-gray-500 ml-3 font-mono opacity-60">
                    titans_init.py
                  </span>
                </div>
                <div className="p-5 sm:p-10 md:p-12 flex items-center justify-center relative overflow-hidden">
                  <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                      backgroundImage:
                        "radial-gradient(white 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  ></div>

                  <div className="font-mono text-xs sm:text-xl md:text-2xl font-semibold tracking-tight relative z-10">
                    <span className="text-[#ff4ecd]">print</span>
                    <span className="text-gray-300">(</span>
                    <span className="text-[#f1fa8c]" id="typewriter">
                      {PHRASES[phraseIdx]}
                    </span>
                    <span className="text-gray-300">)</span>
                    <span className="inline-block w-2 sm:w-2.5 h-3.5 sm:h-5 bg-gray-400 ml-1 animate-pulse align-middle"></span>
                  </div>
                </div>
              </div>

              {/* Dynamic Action Buttons */}
              {!user ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 px-2 sm:px-0">
                  <button
                    onClick={() => navigate("/events")}
                    className="bg-transparent border border-white/20 hover:border-white/50 hover:bg-white/5 text-white font-bold rounded-lg px-10 py-3.5 text-sm w-full sm:w-auto transition-all min-h-[48px] flex items-center justify-center box-border m-0 cursor-pointer"
                  >
                    Explore Events
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center px-2 sm:px-0">
                  <button
                    onClick={() => navigate("/events")}
                    className="btn-keycap px-12 py-3.5 text-sm w-full sm:w-auto text-center inline-flex items-center justify-center min-h-[48px] box-border m-0 cursor-pointer"
                  >
                    Explore Events
                  </button>
                </div>
              )}
            </div>
          </section>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 relative z-10 flex flex-col gap-12 sm:gap-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              {/* Story Column */}
              <div className="reveal flex flex-col h-full">
                <h2 className="section-heading text-2xl mb-4 sm:mb-6">
                  Our Story &amp; Purpose
                </h2>
                <div className="glass-panel p-6 sm:p-8 relative flex-1 flex flex-col justify-center overflow-hidden">
                  <p className="text-[#8c8d96] text-sm sm:text-base leading-relaxed mb-6">
                    Tech Titans was formed to bridge the gap between academic
                    theory and high-impact engineering. We are a collective of
                    developers, designers, and innovators focused on building
                    real-world software and exploring decentralized
                    technologies.
                  </p>
                  <p className="text-gray-300 text-xs sm:text-sm font-semibold flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-accent animate-ping"></span>
                    Next Gen Tech Club
                  </p>
                </div>
              </div>

              {/* Latest Updates Feed */}
              <div className="reveal flex flex-col h-full">
                <h2 className="section-heading text-2xl mb-4 sm:mb-6">
                  Latest Updates
                </h2>
                <div className="flex-1 space-y-4">
                  {latestEvent ? (
                    <div className="glass-panel p-5 sm:p-6 flex items-start gap-4 hover:border-accent/40 transition-colors">
                      <div className="p-3 rounded-lg bg-black/40 text-accent border border-white/5 shrink-0">
                        <i className="fas fa-calendar-alt text-xl"></i>
                      </div>
                      <div>
                        <span className="text-xs text-accent font-mono uppercase tracking-wider block mb-1">
                          Upcoming Event
                        </span>
                        <h3 className="font-bold text-white text-base sm:text-lg mb-1">
                          {latestEvent.title}
                        </h3>
                        <p className="text-[#8c8d96] text-xs sm:text-sm line-clamp-2">
                          {latestEvent.description}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="glass-panel p-6 text-center text-[#8c8d96] font-mono text-sm">
                      No announcements posted yet.
                    </div>
                  )}

                  {latestQuest && (
                    <div className="glass-panel p-5 sm:p-6 flex items-start gap-4 border border-[#00f3ff]/20 hover:border-[#00f3ff]/50 transition-colors">
                      <div className="p-3 rounded-lg bg-black/40 text-[#00f3ff] border border-white/5 shrink-0">
                        <i className="fas fa-trophy text-xl"></i>
                      </div>
                      <div>
                        <span className="text-xs text-[#00f3ff] font-mono uppercase tracking-wider block mb-1">
                          Active Bounty
                        </span>
                        <h3 className="font-bold text-white text-base sm:text-lg mb-1">
                          {latestQuest.title}
                        </h3>
                        <p className="text-[#8c8d96] text-xs sm:text-sm line-clamp-2">
                          {latestQuest.description}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        id="contact-footer"
        className="border-t border-white/5 bg-[#16171d] py-12 relative z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col gap-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                CONNECT WITH THE NETWORK
              </h2>
              <p className="text-[#8c8d96] text-xs sm:text-sm max-w-md">
                Have questions about joining, partnering, or sponsoring upcoming
                events? Drop a line to the core team.
              </p>
            </div>

            <div className="flex gap-6 text-2xl text-[#8c8d96]">
              <a
                href="mailto:contact@techtitans.club"
                className="hover:text-accent hover:-translate-y-2 transition-all drop-shadow-md"
                aria-label="Email"
              >
                <i className="fas fa-envelope"></i>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent hover:-translate-y-2 transition-all drop-shadow-md"
                aria-label="LinkedIn"
              >
                <i className="fab fa-linkedin"></i>
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent hover:-translate-y-2 transition-all drop-shadow-md"
                aria-label="GitHub"
              >
                <i className="fab fa-github"></i>
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent hover:-translate-y-2 transition-all drop-shadow-md"
                aria-label="Discord"
              >
                <i className="fab fa-discord"></i>
              </a>
            </div>

            <button
              id="msg-btn"
              className="btn-keycap px-8 py-3.5 text-sm w-full md:w-auto min-w-[200px]"
              onClick={handleOpenFeedback}
            >
              SEND MESSAGE
            </button>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[#8c8d96]/60 text-xs font-medium text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-black tracking-tighter text-white/70 text-base sm:text-lg">
                  TECH TITANS
                </span>
              </div>
              <span>Powered by innovation. Founded 2026.</span>
            </div>
            <div className="text-center md:text-right flex flex-col gap-1">
              <p>© 2026 University Collective. All rights reserved.</p>
              <p className="text-accent/50">
                This site is created by members for members.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Feedback / Message Modal */}
      {showFeedbackForm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowFeedbackForm(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div
            className="bg-[#1a1b22] border border-[#31333e] rounded-2xl max-w-md w-full max-h-[90dvh] overflow-y-auto p-6 sm:p-8 relative shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-[#ae97d6]/10 rounded-full blur-3xl pointer-events-none"></div>

            <button
              onClick={() => setShowFeedbackForm(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white transition-colors z-10 p-2 bg-[#21222b] rounded-full hover:bg-white/10"
              aria-label="Close feedback modal"
            >
              <X size={18} />
            </button>

            <div className="mb-5">
              <span className="text-accent font-mono text-xs font-bold uppercase tracking-[0.3em] mb-1 block">
                DIRECT TRANSMISSION
              </span>
              <h2
                id="modal-title"
                className="text-xl sm:text-2xl font-black text-white tracking-tight"
              >
                Send Message
              </h2>
            </div>

            {feedbackStatus && (
              <div
                className={`p-3 rounded-lg mb-4 text-xs font-mono text-center ${feedbackStatus.includes("Error") ? "bg-red-500/10 border border-red-500/50 text-red-400" : "bg-[#ae97d6]/10 border border-[#ae97d6]/50 text-[#ae97d6]"}`}
              >
                {feedbackStatus}
              </div>
            )}

            <form
              onSubmit={handleSubmitFeedback}
              className="flex flex-col gap-4 relative z-10"
            >
              <div>
                <label className="text-xs text-gray-400 uppercase tracking-wider font-mono mb-1.5 block">
                  Operative Name
                </label>
                <input
                  type="text"
                  required
                  value={feedbackData.name}
                  onChange={(e) =>
                    setFeedbackData({ ...feedbackData, name: e.target.value })
                  }
                  className="input-glass w-full text-sm"
                  placeholder="Your Name"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs text-gray-400 uppercase tracking-wider font-mono">
                    Transmission
                  </label>
                  <span
                    className={`text-[11px] font-mono ${isOverLimit ? "text-red-400 font-bold" : "text-[#8c8d96]"}`}
                  >
                    {wordCount} / 60 words
                  </span>
                </div>
                <textarea
                  required
                  value={feedbackData.message}
                  onChange={(e) =>
                    setFeedbackData({
                      ...feedbackData,
                      message: e.target.value,
                    })
                  }
                  className={`input-glass w-full h-32 resize-none text-sm font-sans ${isOverLimit ? "!border-red-500/60" : ""}`}
                  placeholder="Enter your message here (up to 60 words)..."
                ></textarea>
                {isOverLimit && (
                  <p className="text-xs text-red-400 font-mono mt-1">
                    Exceeded by {wordCount - 60} word
                    {wordCount - 60 > 1 ? "s" : ""}. Please trim down to 60
                    words.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isOverLimit}
                className={`btn-keycap w-full py-3.5 mt-2 text-sm flex items-center justify-center gap-2 ${isOverLimit ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Send size={15} /> SUBMIT TRANSMISSION
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
