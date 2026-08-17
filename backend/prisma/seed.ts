import { PrismaClient, Role, DiscountType, OrderStatus, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import process from 'process';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing data
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.cMSSetting.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data.');

  // 2. Create Users
  const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
  const customerPasswordHash = await bcrypt.hash('CustomerPassword123!', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@zedech.com',
      name: 'System Admin',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      isEmailVerified: true,
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'customer@zedech.com',
      name: 'Jane Doe',
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      isEmailVerified: true,
      loyaltyPoints: 120,
    },
  });

  console.log('Created Users:', { admin: admin.email, customer: customer.email });

  // 3. Create Addresses
  await prisma.address.create({
    data: {
      userId: customer.id,
      type: 'shipping',
      name: 'Jane Doe',
      street: '123 Infinite Loop',
      city: 'Cupertino',
      state: 'CA',
      postalCode: '95014',
      country: 'United States',
      phone: '123-456-7890',
      isDefault: true,
    },
  });

  await prisma.address.create({
    data: {
      userId: customer.id,
      type: 'billing',
      name: 'Jane Doe',
      street: '123 Infinite Loop',
      city: 'Cupertino',
      state: 'CA',
      postalCode: '95014',
      country: 'United States',
      phone: '123-456-7890',
      isDefault: true,
    },
  });

  // 4. Create Categories
  const footwear = await prisma.category.create({
    data: {
      name: 'Footwear',
      slug: 'footwear',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    },
  });

  const apparel = await prisma.category.create({
    data: {
      name: 'Apparel',
      slug: 'apparel',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    },
  });

  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    },
  });

  const accessories = await prisma.category.create({
    data: {
      name: 'Accessories',
      slug: 'accessories',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    },
  });

  console.log('Created Categories.');

  // 5. Create Products
  const productsData = [
    {
      name: 'Apex Pro Runner',
      slug: 'apex-pro-runner',
      description: 'Engineered for speed, durability, and comfort. Features a carbon fiber plate and responsive foam cushioning for unmatched energy return.',
      price: 180.00,
      originalPrice: 220.00,
      categoryId: footwear.id,
      brand: 'Nike',
      sku: 'NIK-APX-PR-001',
      countInStock: 25,
      images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&auto=format&fit=crop&q=80'
      ],
      colors: ['Neon Red', 'Stealth Black', 'Volt Green'],
      sizes: ['US 8', 'US 9', 'US 10', 'US 11'],
      isFeatured: true,
      isNew: true,
      isBestSeller: true,
      tags: ['running', 'shoes', 'performance', 'nike'],
    },
    {
      name: 'AeroShield Windbreaker',
      slug: 'aeroshield-windbreaker',
      description: 'Ultra-lightweight, water-resistant athletic jacket. Packable design with strategic ventilation to keep you dry and comfortable in any weather.',
      price: 95.00,
      originalPrice: 120.00,
      categoryId: apparel.id,
      brand: 'Nike',
      sku: 'NIK-ARS-WB-002',
      countInStock: 40,
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&auto=format&fit=crop&q=80'
      ],
      colors: ['Charcoal Gray', 'Sky Blue', 'White'],
      sizes: ['S', 'M', 'L', 'XL'],
      isFeatured: true,
      isNew: false,
      isBestSeller: false,
      tags: ['jacket', 'outerwear', 'fitness', 'apparel'],
    },
    {
      name: 'Studio-Max ANC Headphones',
      slug: 'studio-max-anc-headphones',
      description: 'Immersive sound with industry-leading Active Noise Cancellation. Seamless device switching, premium aluminum earcups, and 30-hour battery life.',
      price: 349.00,
      originalPrice: 399.00,
      categoryId: electronics.id,
      brand: 'Apple',
      sku: 'APL-SDM-HP-003',
      countInStock: 15,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80'
      ],
      colors: ['Space Gray', 'Silver', 'Sky Blue'],
      sizes: ['One Size'],
      isFeatured: true,
      isNew: true,
      isBestSeller: true,
      tags: ['audio', 'headphones', 'anc', 'apple', 'premium'],
    },
    {
      name: 'Horizon Smart Watch V2',
      slug: 'horizon-smart-watch-v2',
      description: 'Your ultimate health and fitness companion. Features an Always-On Retina display, blood oxygen tracking, ECG app, and cellular connectivity.',
      price: 299.00,
      categoryId: electronics.id,
      brand: 'Apple',
      sku: 'APL-HRZ-SW-004',
      countInStock: 8,
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80'
      ],
      colors: ['Space Black', 'Gold', 'Rose Red'],
      sizes: ['41mm', '45mm'],
      isFeatured: false,
      isNew: false,
      isBestSeller: true,
      isTrending: true,
      tags: ['wearables', 'watch', 'fitness', 'smartwatch', 'apple'],
    },
    {
      name: 'Tailored Wool Trench Coat',
      slug: 'tailored-wool-trench-coat',
      description: 'Double-breasted trench coat crafted from a premium wool blend. Features structured shoulders, waist belt, and signature Zara-cut detailing.',
      price: 220.00,
      categoryId: apparel.id,
      brand: 'Zara',
      sku: 'ZAR-TWC-CT-005',
      countInStock: 12,
      images: [
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&auto=format&fit=crop&q=80'
      ],
      colors: ['Camel Brown', 'Navy Blue', 'Classic Black'],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      isFeatured: false,
      isNew: true,
      isBestSeller: false,
      isTrending: true,
      tags: ['coat', 'wool', 'fashion', 'zara', 'minimalist'],
    },
    {
      name: 'Minimalist Leather Cardholder',
      slug: 'minimalist-leather-cardholder',
      description: 'Sleek card holder hand-crafted from full-grain vegetable-tanned leather. Holds up to 6 cards and folded cash with RFID protection.',
      price: 45.00,
      originalPrice: 55.00,
      categoryId: accessories.id,
      brand: 'Zara',
      sku: 'ZAR-MLC-WH-006',
      countInStock: 50,
      images: [
        'https://images.unsplash.com/photo-1627124424074-7227c2c0bdc5?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1588444839799-eb00f490ba9e?w=800&auto=format&fit=crop&q=80'
      ],
      colors: ['Cognac Brown', 'Dark Espresso', 'Midnight Black'],
      sizes: ['One Size'],
      isFeatured: false,
      isNew: false,
      isBestSeller: true,
      tags: ['leather', 'wallet', 'minimalist', 'accessories'],
    }
  ];

  const products = [];
  for (const item of productsData) {
    const p = await prisma.product.create({
      data: item,
    });
    products.push(p);
  }

  console.log(`Created ${products.length} Products.`);

  // 6. Create Coupons
  await prisma.coupon.create({
    data: {
      code: 'WELCOME10',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      expiryDate: new Date('2028-12-31T23:59:59Z'),
      maxUses: 100,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'SUMMER50',
      discountType: DiscountType.FIXED,
      discountValue: 50.00,
      expiryDate: new Date('2028-09-30T23:59:59Z'),
      maxUses: 50,
      isActive: true,
    },
  });

  await prisma.coupon.create({
    data: {
      code: 'FREESHIP',
      discountType: DiscountType.FREE_SHIPPING,
      discountValue: 0.00,
      expiryDate: new Date('2028-12-31T23:59:59Z'),
      isActive: true,
    },
  });

  console.log('Created Coupons.');

  // 7. Create Reviews
  const runner = products.find(p => p.slug === 'apex-pro-runner');
  if (runner) {
    await prisma.review.create({
      data: {
        userId: customer.id,
        productId: runner.id,
        rating: 5,
        title: 'Perfect running shoes!',
        comment: 'These are the most comfortable and springy shoes I have ever worn. My running time improved instantly. Highly recommended!',
        images: ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&auto=format&fit=crop&q=80'],
        helpful: 24,
      },
    });

    await prisma.review.create({
      data: {
        userId: admin.id, // using admin as a user reviewer for demo
        productId: runner.id,
        rating: 4,
        title: 'Excellent speed, runs slightly small',
        comment: 'Excellent energy return and cushioning. They fit slightly snug, so I would suggest ordering a half size up.',
        helpful: 3,
      },
    });

    // Update product stats
    await prisma.product.update({
      where: { id: runner.id },
      data: {
        ratings: 4.5,
        numReviews: 2,
      },
    });
  }

  const headphones = products.find(p => p.slug === 'studio-max-anc-headphones');
  if (headphones) {
    await prisma.review.create({
      data: {
        userId: customer.id,
        productId: headphones.id,
        rating: 5,
        title: 'Phenomenal Audio Quality',
        comment: 'The active noise cancellation is like pure magic. Blocked out all plane noise during my flights. Build quality is top-notch.',
        helpful: 15,
      },
    });

    await prisma.product.update({
      where: { id: headphones.id },
      data: {
        ratings: 5.0,
        numReviews: 1,
      },
    });
  }

  console.log('Created Reviews.');

  // 8. Create CMS Settings
  await prisma.cMSSetting.create({
    data: {
      key: 'homepage_hero',
      value: {
        title: 'Designed for the Future',
        subtitle: 'Experience minimal luxury and athletic innovation.',
        buttonText: 'Shop New Arrivals',
        buttonLink: '/shop',
        backgroundImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&auto=format&fit=crop&q=80',
        slides: [
          {
            title: 'Designed for the Future',
            subtitle: 'Experience minimal luxury and athletic innovation.',
            buttonText: 'Shop Footwear',
            buttonLink: '/category/footwear',
            backgroundImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1600&auto=format&fit=crop&q=80',
          },
          {
            title: 'Sleek Aesthetic Wear',
            subtitle: 'Elevate your daily wardrobe with minimal structures.',
            buttonText: 'Explore Apparel',
            buttonLink: '/category/apparel',
            backgroundImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=1600&auto=format&fit=crop&q=80',
          },
          {
            title: 'Studio-Grade Sound',
            subtitle: 'Immersive headphones with active noise cancellation.',
            buttonText: 'Shop Audio',
            buttonLink: '/product/studio-max-anc-headphones',
            backgroundImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80',
          }
        ]
      },
    },
  });

  await prisma.cMSSetting.create({
    data: {
      key: 'homepage_promotion',
      value: {
        title: 'Flash Sale: Up to 30% Off',
        subtitle: 'Use coupon code WELCOME10 for an additional 10% off at checkout.',
        endDate: new Date('2028-12-31T23:59:59Z').toISOString(),
        isActive: true,
      },
    },
  });

  await prisma.cMSSetting.create({
    data: {
      key: 'faqs',
      value: [
        {
          category: 'Shipping',
          question: 'How long does shipping take?',
          answer: 'Standard shipping takes 3–5 business days within the continental United States. International orders usually arrive in 7–14 business days. Priority shipping is available at checkout for expedited delivery.'
        },
        {
          category: 'Shipping',
          question: 'Do you offer free shipping?',
          answer: 'Yes! We offer free complimentary standard shipping on all orders over $150. For orders under $150, a standard shipping fee of $15 applies.'
        },
        {
          category: 'Returns',
          question: 'What is your return policy?',
          answer: 'We accept returns on all unworn, unused items with original tags intact within 30 days of purchase. Returns can be easily initiated from your user profile order history panel.'
        },
        {
          category: 'Returns',
          question: 'Are returns free?',
          answer: 'Yes. Once a return request is approved in your profile, we generate a pre-paid courier shipping label for you to print and attach to your package.'
        },
        {
          category: 'Products',
          question: 'Are your items authentic?',
          answer: 'Absolutely. We design, manufacture, and sell all products directly. We do not source from third-party resellers, ensuring that every product you buy is 100% authentic and covered under our manufacturer warranty.'
        },
        {
          category: 'Payments',
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, Mastercard, American Express), Apple Pay, Google Pay, and PayPal.'
        }
      ]
    },
  });

  await prisma.cMSSetting.create({
    data: {
      key: 'our_story',
      value: {
        title: 'Redefining Minimal Luxury',
        subtitle: 'We believe that products should be designed to last, executed with architectural precision, and stripped of unnecessary noise.',
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&auto=format&fit=crop&q=80',
        visionTitle: 'The Vision',
        visionText: 'Zedech was founded in 2026 out of a frustration with hyper-disposable fashion and tech. We set out to build an ecosystem of premium goods that integrate seamlessly into modern workspaces and lifestyles. We source high-grade sustainable materials and utilize precise, low-waste manufacturing processes.',
        craftTitle: 'The Craftsmanship',
        craftText: 'Every curve, thread, and interface is scrutinized in our design labs. From carbon-fiber plate integration in our athletic footwear to the sound acoustics in our active noise-canceling headphones, we blend engineering with premium aesthetics to deliver functional art.',
        pillarsTitle: 'Our Core Pillars',
        pillars: [
          {
            emoji: '📐',
            title: 'Architectural Design',
            description: 'Stripped back layouts, harmonious geometries, and intuitive ergonomics guide every collection.'
          },
          {
            emoji: '🔋',
            title: 'Optimal Performance',
            description: 'Whether it is speed on the track or clarity in high-definition audio, output is never compromised.'
          },
          {
            emoji: '🌍',
            title: 'Ethical Development',
            description: 'Sourcing materials from carbon-neutral suppliers and prioritizing fair labor conditions globally.'
          }
        ]
      }
    }
  });

  console.log('Created CMS settings.');

  // 9. Create a test Order
  if (runner) {
    const testOrder = await prisma.order.create({
      data: {
        userId: customer.id,
        shippingAddress: {
          name: 'Jane Doe',
          street: '123 Infinite Loop',
          city: 'Cupertino',
          state: 'CA',
          postalCode: '95014',
          country: 'United States',
          phone: '123-456-7890',
        },
        billingAddress: {
          name: 'Jane Doe',
          street: '123 Infinite Loop',
          city: 'Cupertino',
          state: 'CA',
          postalCode: '95014',
          country: 'United States',
          phone: '123-456-7890',
        },
        shippingMethod: 'Standard',
        paymentMethod: 'stripe',
        paymentStatus: PaymentStatus.PAID,
        orderStatus: OrderStatus.PROCESSING,
        itemsPrice: 180.00,
        shippingPrice: 0.00,
        taxPrice: 14.40,
        discountPrice: 0.00,
        totalPrice: 194.40,
        stripePaymentIntentId: 'pi_test_1234567890',
        orderItems: {
          create: {
            productId: runner.id,
            name: runner.name,
            quantity: 1,
            price: 180.00,
            color: 'Neon Red',
            size: 'US 10',
            image: runner.images[0],
          }
        }
      }
    });

    console.log('Created sample test order:', testOrder.id);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
