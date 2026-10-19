/** @type {import('next').NextConfig} */
// 정적 내보내기(output: 'export')는 쓰지 않는다 - 견적 문의 메일(src/app/api/contact)이 서버에서 돌아야 한다.
// 페이지는 모두 빌드 때 정적으로 만들어진다.
const nextConfig = {
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig

