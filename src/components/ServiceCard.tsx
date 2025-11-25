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
      whileHover={{ scale: 1.05, y: -5 }}
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow border border-gray-100"
    >
      <div className="text-4xl mb-4">{iconMap[service.icon] || '✨'}</div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">{service.title}</h3>
      <p className="text-gray-600 mb-4">{service.description}</p>
      <ul className="space-y-2">
        {service.features.map((feature, idx) => (
          <li key={idx} className="flex items-start text-sm text-gray-700">
            <FiCheck className="text-green-500 mr-2 mt-1 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

