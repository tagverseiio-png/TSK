import RosterList from '@/components/RosterList';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

async function getServices() {
  try {
    const client = await clientPromise.connect();
    const db = client.db(process.env.MONGODB_DB || 'TSK');
    const docs = await db
      .collection('services')
      .find({})
      .sort({ number: 1 })
      .toArray();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const fixUrl = (url?: string) => {
      if (!url) return '';
      // If we are on production, replace localhost with the API URL
      if (process.env.NODE_ENV === 'production' && url.includes('localhost')) {
        return url.replace(/http:\/\/localhost:\d+/, apiUrl);
      }
      return url;
    };

    return docs.map((doc) => {
      const title = (doc.title as string) || '';
      const parts = title.split(' ');
      const firstName = parts[0] || 'Service';
      const lastName = parts.slice(1).join(' ') || '';

      return {
        id: doc._id.toString(),
        firstName,
        lastName,
        slug: doc.slug as string,
        count: doc.number as string || '01',
        image: fixUrl(doc.mediaUrl as string),
      };
    });
  } catch (err) {
    console.error('[services] Failed to fetch services:', err);
    return [];
  }
}

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <div className='min-h-screen bg-[#15110f] w-full'>
      <RosterList items={services} basePath='services' pageLabel='OUR SERVICES' subline='Comprehensive creative solutions for your brand.' />
    </div>
  );
}