'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiArrowDown, FiArrowRight } from 'react-icons/fi';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 gradient-bg opacity-90"></div>

      {/* Geometric Shapes - Floating Circles */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, -60, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute top-1/2 right-1/4 w-64 h-64 bg-purple-500/15 rounded-full blur-3xl"
        animate={{
          x: [0, 60, 0],
          y: [0, -80, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Geometric Shapes - 3D Rotating Triangle */}
      <div className="absolute top-1/4 left-1/4" style={{ perspective: '1000px' }}>
        <motion.div
          style={{
            transformStyle: 'preserve-3d',
            position: 'relative',
            width: '120px',
            height: '100px',
          }}
          animate={{
            rotateX: [0, 360],
            rotateY: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div
            className="absolute"
            style={{
              width: '0',
              height: '0',
              borderLeft: '60px solid transparent',
              borderRight: '60px solid transparent',
              borderBottom: '100px solid rgba(255,255,255,0.15)',
              transform: 'translateZ(40px)',
              left: '0',
              top: '0',
            }}
          />
          <div
            className="absolute"
            style={{
              width: '0',
              height: '0',
              borderLeft: '60px solid transparent',
              borderRight: '60px solid transparent',
              borderBottom: '100px solid rgba(255,255,255,0.1)',
              transform: 'rotateY(120deg) translateZ(40px)',
              left: '0',
              top: '0',
            }}
          />
          <div
            className="absolute"
            style={{
              width: '0',
              height: '0',
              borderLeft: '60px solid transparent',
              borderRight: '60px solid transparent',
              borderBottom: '100px solid rgba(255,255,255,0.1)',
              transform: 'rotateY(240deg) translateZ(40px)',
              left: '0',
              top: '0',
            }}
          />
        </motion.div>
      </div>
      <motion.div
        className="absolute bottom-1/4 right-1/3 w-0 h-0"
        style={{
          borderLeft: '80px solid transparent',
          borderRight: '80px solid transparent',
          borderTop: '140px solid rgba(255,255,255,0.08)',
        }}
        animate={{
          rotate: [360, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Geometric Shapes - 3D Rotating Cube */}
      <div className="absolute top-1/3 right-1/5" style={{ perspective: '1000px' }}>
        <motion.div
          style={{
            transformStyle: 'preserve-3d',
            position: 'relative',
            width: '128px',
            height: '128px',
          }}
          animate={{
            rotateX: [0, 360],
            rotateY: [0, 360],
            rotateZ: [45, 405],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {/* Front face */}
          <div
            className="absolute inset-0 border-2 border-white/25"
            style={{
              transform: 'translateZ(64px)',
              opacity: 0.4,
            }}
          />
          {/* Back face */}
          <div
            className="absolute inset-0 border-2 border-white/15"
            style={{
              transform: 'translateZ(-64px) rotateY(180deg)',
              opacity: 0.2,
            }}
          />
          {/* Right face */}
          <div
            className="absolute inset-0 border-2 border-white/20"
            style={{
              transform: 'rotateY(90deg) translateZ(64px)',
              opacity: 0.3,
            }}
          />
          {/* Left face */}
          <div
            className="absolute inset-0 border-2 border-white/20"
            style={{
              transform: 'rotateY(-90deg) translateZ(64px)',
              opacity: 0.3,
            }}
          />
          {/* Top face */}
          <div
            className="absolute inset-0 border-2 border-white/15"
            style={{
              transform: 'rotateX(90deg) translateZ(64px)',
              opacity: 0.2,
            }}
          />
          {/* Bottom face */}
          <div
            className="absolute inset-0 border-2 border-white/15"
            style={{
              transform: 'rotateX(-90deg) translateZ(64px)',
              opacity: 0.2,
            }}
          />
        </motion.div>
      </div>
      <motion.div
        className="absolute bottom-1/3 left-1/5 w-24 h-24 border-2 border-white/15 rotate-45"
        animate={{
          rotate: [45, -315],
          scale: [1, 0.7, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* 3D Rotating Hexagon */}
      <div className="absolute top-1/2 left-1/2" style={{ perspective: '1000px', marginLeft: '-100px', marginTop: '-100px' }}>
        <motion.div
          style={{
            transformStyle: 'preserve-3d',
            position: 'relative',
            width: '200px',
            height: '200px',
          }}
          animate={{
            rotateX: [0, 360],
            rotateY: [0, 360],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {/* Front hexagon */}
          <div
            style={{
              position: 'absolute',
              width: '200px',
              height: '200px',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              background: 'rgba(255,255,255,0.1)',
              border: '2px solid rgba(255,255,255,0.2)',
              transform: 'translateZ(80px)',
            }}
          />
          {/* Back hexagon */}
          <div
            style={{
              position: 'absolute',
              width: '200px',
              height: '200px',
              clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              background: 'rgba(255,255,255,0.06)',
              border: '2px solid rgba(255,255,255,0.15)',
              transform: 'translateZ(-80px) rotateY(180deg)',
            }}
          />
          {/* Connecting side faces */}
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '200px',
                height: '80px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                transform: `rotateY(${angle}deg) translateZ(80px)`,
                clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
                top: '60px',
              }}
            />
          ))}
        </motion.div>
      </div>

      {/* Animated Lines */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <svg className="w-full h-full opacity-10">
          <motion.line
            x1="0"
            y1="0"
            x2="100%"
            y2="100%"
            stroke="white"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.line
            x1="100%"
            y1="0"
            x2="0"
            y2="100%"
            stroke="white"
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.3 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 1 }}
          />
        </svg>
      </div>

      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-white/30 rounded-full"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            Mate
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-2">
            외주개발팀
          </p>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            유니티 외주 개발과 개발 강의에 특화된 전문 팀입니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/services"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
            >
              우리의 서비스
              <FiArrowRight className="ml-2" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
            >
              문의하기
            </Link>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-white"
          >
            <FiArrowDown size={24} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

