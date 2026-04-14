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
      .sort({ count: 1 })
      .toArray();

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://tskapi.t4gverse.com';
    const fixUrl = (url?: string) => {
      if (!url) return '';
      // Handle localhost URLs (dev) or any incorrect server URLs
      if (url.includes('localhost') || url.includes('127.0.0.1')) {
        return url.replace(/http:\/\/[^/]+/, apiUrl);
      }
      return url;
    };

    return docs.map((doc) => ({
      id: doc._id.toString(),
      firstName: (doc.firstName as string) || '',
      lastName: (doc.lastName as string) || '',
      slug: doc.slug as string,
      count: doc.count as string,
      image: fixUrl(doc.image as string),
    }));
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