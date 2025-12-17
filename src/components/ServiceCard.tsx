'use client';

import { motion } from 'framer-motion';
import { Service } from '@/types';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import { useState } from 'react';

interface ServiceCardProps {
  service: Service;
  index: number;
}

export default function ServiceCard({ service, index }: ServiceCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative h-full"
    >
      <motion.div
        whileHover={{ y: -10, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative h-full p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 backdrop-blur-sm overflow-hidden"
      >
        {/* Gradient Overlay on Hover */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
          }}
        />

        {/* Animated Border */}
        <motion.div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(236, 72, 153, 0.3))',
            padding: '1px',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
          }}
        />

        {/* Glow Effect */}
        <motion.div
          className="absolute -inset-1 rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 blur-xl"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Icon */}
          <motion.div
            animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="text-5xl sm:text-6xl mb-5 sm:mb-6"
          >
            {service.icon}
          </motion.div>

          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 group-hover:gradient-text transition-all duration-300">
            {service.title}
          </h3>

          {/* Description */}
          <p className="text-sm sm:text-base text-white/60 mb-6 leading-relaxed flex-grow">
            {service.description}
          </p>

          {/* Features */}
          <ul className="space-y-3 mb-6">
            {service.features.map((feature, idx) => (
              <motion.li 
                key={idx} 
                className="flex items-start text-sm text-white/70"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + idx * 0.05 }}
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3 mt-0.5">
                  <FiCheck className="text-white" size={12} />
                </span>
                <span className="leading-relaxed">{feature}</span>
              </motion.li>
            ))}
          </ul>

          {/* Learn More Link */}
          <motion.div
            className="flex items-center gap-2 text-sm font-medium text-purple-400 group-hover:text-pink-400 transition-colors cursor-pointer"
            whileHover={{ x: 5 }}
          >
            <span>자세히 보기</span>
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
