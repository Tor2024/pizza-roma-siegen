import { MetadataRoute } from 'next';

const BASE_URL = 'https://pizza-roma-siegen.de';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/order/confirm'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
