import { defineConfig } from 'astro/config';

// 배포 주소가 정해지면 SITE_URL을 설정해 실제 주소로 메타데이터를 생성한다.
export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  site: process.env.SITE_URL || undefined,
  devToolbar: { enabled: false },
});
