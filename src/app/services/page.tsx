import { Metadata } from 'next';
import ServiceCard from '@/components/ServiceCard';
import PageHeader from '@/components/PageHeader';
import ProcessTimeline from '@/components/ProcessTimeline';
import { services } from '@/data/services';
import { processSteps } from '@/data/process';

const siteUrl = 'https://devteammate.co.kr';

export const metadata: Metadata = {
  title: '서비스 - Mate 외주개발팀',
  description: '유니티 외주 개발과 개발 강의 서비스를 제공합니다. 실무 경험 기반 교육과 안정적인 외주 개발 전문.',
  keywords: '외주개발, 유니티 개발, 개발 강의, Unity 외주, 유니티 강의, 게임 개발 교육, 유니티 외주개발, Unity 외주개발',
  alternates: {
    canonical: `${siteUrl}/services`,
  },
  openGraph: {
    title: '서비스 - Mate 외주개발팀',
    description: '유니티 외주 개발과 개발 강의 서비스를 제공합니다. 실무 경험 기반 교육과 안정적인 외주 개발 전문.',
    url: `${siteUrl}/services`,
    type: 'website',
  },
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Process Timeline */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              개발 프로세스
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              체계적인 프로세스로 고품질의 결과물을 만들어갑니다
            </p>
          </div>
          <ProcessTimeline steps={processSteps} />
        </div>
      </section>
    </div>
  );
}

