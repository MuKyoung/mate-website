import Link from 'next/link';
import { FiGithub, FiLinkedin, FiMail, FiTwitter } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="sm:col-span-2 md:col-span-1">
            <h3 className="text-2xl font-bold text-white mb-4">Mate</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              유니티 외주 개발과 개발 강의에 특화된 전문 개발 팀입니다.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">빠른 링크</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  홈
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-gray-300 hover:text-white transition-colors">
                  서비스
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-gray-300 hover:text-white transition-colors">
                  팀
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-gray-300 hover:text-white transition-colors">
                  프로젝트
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">서비스</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>유니티 외주 개발</li>
              <li>개발 강의</li>
              <li>AR/VR 개발</li>
              <li>게임 서버 개발</li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="text-white font-semibold mb-4">연락처</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>이메일: team-mate@naver.com</p>
              <p>전화: 010-5457-9141</p>
              <div className="flex space-x-4 mt-4">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="GitHub"
                >
                  <FiGithub size={20} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <FiLinkedin size={20} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Twitter"
                >
                  <FiTwitter size={20} />
                </a>
                <a
                  href="mailto:team-mate@naver.com"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Email"
                >
                  <FiMail size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} Mate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

