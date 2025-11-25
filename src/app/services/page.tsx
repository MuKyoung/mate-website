import { Metadata } from 'next';
import ServiceCard from '@/components/ServiceCard';
import PageHeader from '@/components/PageHeader';
import { services } from '@/data/services';

export const metadata: Metadata = {
  title: '서비스 - Mate 외주개발팀',
  description: '유니티 게임 개발, AR/VR, 외주 개발 서비스를 제공합니다. 2D/3D 게임, 클라이언트/서버 개발 전문.',
  keywords: '외주개발, 유니티 개발, 게임 개발, AR/VR, Unity 외주, 게임 서버 개발',
};

export default function ServicesPage() {
  return (
    <div className="pt-20">
      <PageHeader
        title="우리의 서비스"
        description="고객의 비즈니스 성장을 위한 전문적인 개발 서비스를 제공합니다"
      />

      {/* Services Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

