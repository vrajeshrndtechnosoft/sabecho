// scripts/seedStaticMetadata.ts
import Metadata from '@/models/Metadata'; // Adjust path as needed
import { connectDb } from '@/lib/db'; // Your DB connect logic
import Product from '@/models/Product';
import slugify from 'slugify';

export async function seedStaticMetadata() {
  await connectDb();

  const staticPages = [
    {
      title: 'Sabecho.com',
      description: 'Explore the best products and services on our homepage.',
      slug: 'home',
      page: '/',
      image: 'https://sabcho.com/image/metadata.jpg',
      keywords: ['home', 'welcome', 'sabecho.com'],
      canonicalUrl: `${process.env.BASE_URL}`,
    },
    {
      title: 'About Us',
      description: 'Learn more about our mission, values, and team.',
      slug: 'about',
      page: '/about',
      image: 'https://sabcho.com/image/metadata.jpg',
      keywords: ['about', 'company', 'team'],
      canonicalUrl: `${process.env.BASE_URL}/about`,
    },
    {
      title: 'Contact Us',
      description: 'Get in touch with us for any inquiries or support.',
      slug: 'contact',
      page: '/contact',
      image: 'https://sabcho.com/image/metadata.jpg',
      keywords: ['contact', 'support', 'help'],
      canonicalUrl: `${process.env.BASE_URL}/contact`,
    },
    {
      title: 'My Profile - Dashboard | Sabecho',
      description: 'Manage your profile, update personal information, and account settings on Sabecho.',
      slug: 'dashboard-profile',
      page: '/dashboard/profile',
      image: 'https://sabcho.com/image/metadata.jpg',
      keywords: ['profile', 'dashboard', 'account', 'settings', 'user'],
      canonicalUrl: `${process.env.BASE_URL}/dashboard/profile`,
    },
    {
      title: 'Order Tracking - Dashboard | Sabecho',
      description: 'Track your orders, view delivery status, and manage your purchase history on Sabecho.',
      slug: 'dashboard-tracking',
      page: '/dashboard/tracking',
      image: 'https://sabcho.com/image/metadata.jpg',
      keywords: ['tracking', 'orders', 'delivery', 'status', 'purchase history'],
      canonicalUrl: `${process.env.BASE_URL}/dashboard/tracking`,
    },
    {
      title: 'My Favourites - Dashboard | Sabecho',
      description: 'View and manage your favourite products, wishlist items, and saved searches on Sabecho.',
      slug: 'dashboard-favourites',
      page: '/dashboard/favourites',
      image: 'https://sabcho.com/image/metadata.jpg',
      keywords: ['favourites', 'wishlist', 'saved', 'products', 'bookmarks'],
      canonicalUrl: `${process.env.BASE_URL}/dashboard/favourites`,
    },
    {
      title: 'Checkout | Sabecho',
      description: 'Complete your purchase securely with our easy checkout process on Sabecho.',
      slug: 'checkout',
      page: '/checkout',
      image: 'https://sabcho.com/image/metadata.jpg',
      keywords: ['checkout', 'purchase', 'payment', 'order', 'buy'],
      canonicalUrl: `${process.env.BASE_URL}/checkout`,
    },
    {
      title: 'Negotiation | Sabecho',
      description: 'Negotiate prices with suppliers and get the best deals on your favorite products.',
      slug: 'negotiation',
      page: '/negotiation',
      image: 'https://sabcho.com/image/metadata.jpg',
      keywords: ['negotiation', 'price', 'deals', 'suppliers', 'bargain'],
      canonicalUrl: `${process.env.BASE_URL}/negotiation`,
    },
    {
      title: 'Payment Failed | Sabecho',
      description: 'Payment processing failed. Please try again or contact support for assistance.',
      slug: 'payment-failed',
      page: '/payment-failed',
      image: 'https://sabcho.com/image/metadata.jpg',
      keywords: ['payment failed', 'error', 'support', 'retry payment'],
      canonicalUrl: `${process.env.BASE_URL}/payment-failed`,
    },
    {
      title: 'Thank You | Sabecho',
      description: 'Thank you for your purchase! Your order has been confirmed and will be processed soon.',
      slug: 'thankyou',
      page: '/thankyou',
      image: 'https://sabcho.com/image/metadata.jpg',
      keywords: ['thank you', 'order confirmed', 'purchase complete', 'success'],
      canonicalUrl: `${process.env.BASE_URL}/thankyou`,
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

function toSlug(text: string) {
  return slugify(text, { lower: true, strict: true });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildProductPaths(product: any): Array<{ path: string; level: string }> {
  const category = toSlug(product.categoryType || '');
  const subcategory = toSlug(product.categorySubType || '');
  const productSlug = toSlug(product.name || '');
  const location = toSlug(product.location || '');

  const paths: Array<{ path: string; level: string }> = [];

  // Level 1: Category only
  if (category) {
    paths.push({
      path: `/products/${category}`,
      level: 'category'
    });
  }

  // Level 2: Category + Subcategory
  if (category && subcategory) {
    paths.push({
      path: `/products/${category}/${subcategory}`,
      level: 'subcategory'
    });
  }

  // Level 3: Category + Subcategory + Product
  if (category && subcategory && productSlug) {
    paths.push({
      path: `/products/${category}/${subcategory}/${productSlug}`,
      level: 'product'
    });
  }

  // Level 4: Category + Subcategory + Product + Location
  if (category && subcategory && productSlug && location) {
    paths.push({
      path: `/products/${category}/${subcategory}/${productSlug}/${location}`,
      level: 'product-location'
    });
  }

  return paths;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateMetadataForLevel(product: any, level: string) {
  const baseImage = `${process.env.BASE_URL}/image/metadata.jpg`;
  
  switch (level) {
    case 'category':
      return {
        title: `${product.categoryType} Products | Sabecho`,
        description: `Browse quality ${product.categoryType} products from trusted suppliers. Find the best deals and prices on Sabecho.`,
        keywords: [product.categoryType, 'products', 'suppliers', 'buy', 'price'],
        image: baseImage
      };

    case 'subcategory':
      return {
        title: `${product.categorySubType} - ${product.categoryType} | Sabecho`,
        description: `Discover ${product.categorySubType} in ${product.categoryType} category. Quality products from verified suppliers at competitive prices.`,
        keywords: [product.categorySubType, product.categoryType, 'products', 'suppliers'],
        image: baseImage
      };

    case 'product':
      return {
        title: `${product.name} | ${product.categorySubType} - Sabecho`,
        description: `Buy ${product.name} from trusted suppliers. Best prices for ${product.categorySubType} products on Sabecho.`,
        keywords: [product.name, product.categorySubType, product.categoryType, 'buy', 'price'],
        image: baseImage
      };

    case 'product-location':
      return {
        title: `${product.name} in ${product.location} | ${product.categorySubType} - Sabecho`,
        description: `Get the best price for ${product.name} in ${product.location}. Trusted ${product.categoryType} suppliers at Sabecho.`,
        keywords: [product.name, product.location, product.categorySubType, product.categoryType, 'suppliers'],
        image: baseImage
      };

    default:
      return {
        title: `${product.name} - Sabecho`,
        description: `Quality products available on Sabecho`,
        keywords: [product.name],
        image: baseImage
      };
  }
}

export async function seedProductMetadata() {
  await connectDb();

  const products = await Product.find();
  console.log(`📦 Processing ${products.length} products for metadata generation...`);

  // Track unique paths to avoid duplicates across products
  const processedPaths = new Set<string>();

  for (const product of products) {
    const pathsWithLevels = buildProductPaths(product);

    for (const { path, level } of pathsWithLevels) {
      // Skip if we've already processed this path
      if (processedPaths.has(path)) {
        console.log(`⏭️  Path "${path}" already processed. Skipping.`);
        continue;
      }

      const existing = await Metadata.findOne({ page: path });
      if (existing) {
        console.log(`✅ Metadata for "${path}" already exists. Skipping.`);
        processedPaths.add(path);
        continue;
      }

      const metadata = generateMetadataForLevel(product, level);
      
      // Generate unique slug based on the path
      const pathSegments = path.split('/').filter(Boolean);
      const slug = pathSegments.slice(1).join('-'); // Remove 'products' from slug

      try {
        await Metadata.create({
          title: metadata.title,
          description: metadata.description,
          slug: slug || 'products',
          page: path,
          image: metadata.image,
          keywords: metadata.keywords.filter(Boolean),
          canonicalUrl: `${process.env.BASE_URL}${path}`,
        });

        console.log(`✅ Inserted metadata for "${path}" (${level})`);
        processedPaths.add(path);
      } catch (err) {
        console.error(`❌ Error inserting metadata for "${path}":`, err);
      }
    }
  }

  console.log(`🎉 Metadata seeding completed! Processed ${processedPaths.size} unique paths.`);
}