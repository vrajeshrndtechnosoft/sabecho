// scripts/seedStaticMetadata.ts
import Metadata from '@/models/Metadata'; // Adjust path as needed
import { connectDb } from '@/lib/db'; // Your DB connect logic
import Product from '@/models/Product';
import slugify from 'slugify';
export async function seedStaticMetadata() {
  await connectDb();

  const staticPages = [
    {
      title: 'Home - Welcome to MySite',
      description: 'Explore the best products and services on our homepage.',
      slug: 'home',
      page: '/',
      image: 'https://sabcho.com/image/metadata.jpg',
      keywords: ['home', 'welcome', 'mysite'],
      canonicalUrl: '${process.env.BASE_URL}/',
    },
    {
      title: 'About Us - MySite',
      description: 'Learn more about our mission, values, and team.',
      slug: 'about',
      page: '/about',
      image: 'https://sabcho.com/image/metadata.jpg',
      keywords: ['about', 'company', 'team'],
      canonicalUrl: '${process.env.BASE_URL}/about',
    },
    {
      title: 'Contact Us - MySite',
      description: 'Get in touch with us for any inquiries or support.',
      slug: 'contact',
      page: '/contact',
      image: 'https://sabcho.com/image/metadata.jpg',
      keywords: ['contact', 'support', 'help'],
      canonicalUrl: '${process.env.BASE_URL}/contact',
    },
  ];

  for (const entry of staticPages) {
    const existing = await Metadata.findOne({ page: entry.page });

    if (existing) {
      console.log(`Metadata for "${entry.page}" already exists. Skipping.`);
      continue;
    }

    await Metadata.create(entry);
    console.log(`Inserted metadata for "${entry.page}"`);
  }
}

seedStaticMetadata().catch((err) => {
  console.error(err);
});


function toSlug(text: string) {
  return slugify(text, { lower: true, strict: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildProductPath(product: any): string {
  const category = toSlug(product.categoryType || '');
  const subcategory = toSlug(product.categorySubType || '');
  const productSlug = toSlug(product.name || '');
  const location = toSlug(product.location || '');
  return `/products/${category}/${subcategory}/${productSlug}/${location}`;
}

export async function seedProductMetadata() {
  await connectDb();

  const products = await Product.find();

  for (const product of products) {
    const path = buildProductPath(product);

    const existing = await Metadata.findOne({ page: path });
    if (existing) {
      console.log(`Metadata for "${path}" already exists. Skipping.`);
      continue;
    }

    const title = `${product.name} in ${product.location} | ${product.categorySubType}`;
    const description = `Get the best price for ${product.name} in ${product.location}. Trusted ${product.categoryType} suppliers at Sabecho.`;
    const image = '${process.env.BASE_URL}/image/metadata.jpg'; // fallback
    const keywords = [
      product.name,
      product.categoryType,
      product.categorySubType,
      product.location,
    ].filter(Boolean);

    const slug = toSlug(`${product.name}-${product.location}`);

    await Metadata.create({
      title,
      description,
      slug,
      page: path,
      image,
      keywords,
      canonicalUrl: `${process.env.BASE_URL}${path}`,
    });

    console.log(`Inserted metadata for "${path}"`);
  }
}

seedProductMetadata().catch((err) => {
  console.error('❌ Error seeding product metadata:', err);
});
