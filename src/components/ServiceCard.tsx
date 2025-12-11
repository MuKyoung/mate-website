'use client';

import { motion } from 'framer-motion';
import { Service } from '@/types';
import { FiCheck } from 'react-icons/fi';

interface ServiceCardProps {
  service: Service;
  index: number;
}

const iconMap: Record<string, string> = {
  web: '🌐',
  mobile: '📱',
  design: '🎨',
  consulting: '💼',
};

export default function ServiceCard({ service, index }: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="bg-white rounded-xl shadow-lg p-5 sm:p-6 md:p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 h-full flex flex-col"
    >
      <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">{service.icon}</div>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">{service.title}</h3>
      <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 flex-grow">{service.description}</p>
      <ul className="space-y-2 sm:space-y-2.5">
        {service.features.map((feature, idx) => (
          <li key={idx} className="flex items-start text-xs sm:text-sm text-gray-700">
            <FiCheck className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
            <span className="leading-relaxed">{feature}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

