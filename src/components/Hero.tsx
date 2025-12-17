'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { FiArrowDown, FiArrowRight } from 'react-icons/fi';
import { useRef } from 'react';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a1a]" 
      style={{ isolation: 'isolate' }}
    >
      {/* Animated Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e]" />
        
        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(124, 58, 237, 0.4) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-[400px] h-[400px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
          animate={{
            x: [0, 60, 0],
            y: [0, -80, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Floating Logo Pattern Background */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.03]">
        <div className="animate-marquee whitespace-nowrap flex items-center h-full">
          {[...Array(10)].map((_, i) => (
            <span key={i} className="text-[200px] sm:text-[300px] md:text-[400px] font-black text-white mx-8 select-none">
              MATE
            </span>
          ))}
        </div>
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating Geometric Elements */}
      <motion.div
        className="absolute top-[15%] left-[10%] w-20 h-20 sm:w-32 sm:h-32 border border-white/10 rounded-2xl"
        animate={{
          rotate: [0, 90, 180, 270, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        className="absolute bottom-[20%] right-[15%] w-16 h-16 sm:w-24 sm:h-24 border border-purple-500/20 rotate-45"
        animate={{
          rotate: [45, 135, 225, 315, 405],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-[40%] right-[8%] w-4 h-4 sm:w-6 sm:h-6 bg-pink-500/30 rounded-full"
        animate={{
          scale: [1, 2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-[35%] left-[5%] w-3 h-3 sm:w-5 sm:h-5 bg-cyan-500/30 rounded-full"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      {/* 3D Ring */}
      <div className="absolute top-1/3 left-1/4 hidden md:block" style={{ perspective: '1000px' }}>
        <motion.div
          className="w-40 h-40 border-2 border-purple-500/20 rounded-full"
          style={{ transformStyle: 'preserve-3d' }}
          animate={{
            rotateX: [0, 360],
            rotateY: [0, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Floating Particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${i > 8 ? 'hidden sm:block' : ''}`}
          style={{
            left: `${10 + (i * 6)}%`,
            top: `${20 + (i % 5) * 15}%`,
            background: i % 2 === 0 ? 'rgba(124, 58, 237, 0.5)' : 'rgba(236, 72, 153, 0.5)',
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + i * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.2,
          }}
        />
      ))}

      {/* Content */}
      <motion.div 
        style={{ y, opacity, scale }}
        className="relative z-20 container mx-auto px-4 sm:px-6"
      >
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 sm:mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-white/80 text-sm sm:text-base">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              외주 프로젝트 상담 가능
            </span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="heading-xl text-white mb-4 sm:mb-6"
          >
            <span className="block">
              <span className="gradient-text">MATE</span>
            </span>
            <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium text-white/80 mt-2 sm:mt-4">
              외주개발팀
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="body-lg text-white/70 mb-8 sm:mb-10 max-w-2xl mx-auto"
          >
            유니티 외주 개발과 개발 강의에 특화된 전문 팀입니다.
            <br className="hidden sm:block" />
            <span className="text-white/90 font-medium">5년 이상의 경력</span>과 <span className="text-white/90 font-medium">30+ 프로젝트</span>를 성공적으로 완료했습니다.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link
              href="/contact"
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 sm:px-10 sm:py-5 rounded-full font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto"
            >
              <span className="absolute inset-0 gradient-primary" />
              <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-pink-500 to-purple-600" />
              <span className="relative flex items-center gap-2">
                프로젝트 문의하기
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link
              href="/projects"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 sm:px-10 sm:py-5 rounded-full font-semibold text-white border border-white/20 hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95 w-full sm:w-auto"
            >
              포트폴리오 보기
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mt-12 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 max-w-3xl mx-auto"
          >
            {[
              { value: '30+', label: '완료 프로젝트' },
              { value: '5년', label: '개발 경력' },
              { value: '100%', label: '프로젝트 성공률' },
              { value: '4명', label: '전문 개발자' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className="text-center p-4 rounded-2xl glass"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-xs sm:text-sm text-white/60 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 12, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-white/40"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <FiArrowDown size={20} />
        </motion.div>
      </motion.div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f0f23] to-transparent pointer-events-none" />
    </section>
  );
}
