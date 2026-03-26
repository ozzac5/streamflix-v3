import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Simple password hashing (for production, use bcrypt)
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

export async function GET() {
  try {
    // Check if already seeded
    const existingCategories = await db.category.count();
    if (existingCategories > 0) {
      return NextResponse.json({ message: 'Database already seeded' });
    }

    // Create categories
    const categories = await Promise.all([
      db.category.create({ data: { name: 'أفلام', slug: 'movies', icon: 'film' } }),
      db.category.create({ data: { name: 'مسلسلات', slug: 'series', icon: 'tv' } }),
      db.category.create({ data: { name: 'رياضة', slug: 'sports', icon: 'trophy' } }),
      db.category.create({ data: { name: 'أخبار', slug: 'news', icon: 'newspaper' } }),
      db.category.create({ data: { name: 'ترفيه', slug: 'entertainment', icon: 'smile' } }),
    ]);

    // Create admin user
    await db.user.create({
      data: {
        email: 'admin@streamflix.com',
        name: 'Admin',
        password: simpleHash('admin123'),
        role: 'admin'
      }
    });

    // Create movies
    const moviesData = [
      { title: 'Oppenheimer', slug: 'oppenheimer', description: 'قصة الفيزيائي جي روبرت أوبنهايمر ودوره في تطوير القنبلة الذرية', year: 2023, duration: 180, imdbRating: 8.5, isFeatured: true, isTrending: true, quality: '4K', categoryId: categories[0].id },
      { title: 'Barbie', slug: 'barbie', description: 'مغامرات باربي في عالم باربي الساحر', year: 2023, duration: 114, imdbRating: 7.0, isFeatured: true, isTrending: true, quality: 'HD', categoryId: categories[0].id },
      { title: 'Dune: Part Two', slug: 'dune-part-two', description: 'تكملة ملحمة الخيال العلمي ديون', year: 2024, duration: 166, imdbRating: 8.8, isFeatured: true, isTrending: true, quality: '4K', categoryId: categories[0].id },
      { title: 'The Batman', slug: 'the-batman', description: 'باتمان يواجه الفساد في غوثام سيتي', year: 2022, duration: 176, imdbRating: 7.8, isFeatured: false, isTrending: true, quality: 'HD', categoryId: categories[0].id },
      { title: 'Avatar: The Way of Water', slug: 'avatar-way-of-water', description: 'عودة إلى عالم أفاتار مع مغامرات تحت الماء', year: 2022, duration: 192, imdbRating: 7.6, isFeatured: true, isTrending: false, quality: '4K', categoryId: categories[0].id },
      { title: 'Top Gun: Maverick', slug: 'top-gun-maverick', description: 'عودة مافريك لتدريب جيل جديد من الطيارين', year: 2022, duration: 130, imdbRating: 8.3, isFeatured: false, isTrending: true, quality: 'HD', categoryId: categories[0].id },
      { title: 'Interstellar', slug: 'interstellar', description: 'رحلة عبر الفضاء لإنقاذ البشرية', year: 2014, duration: 169, imdbRating: 8.7, isFeatured: false, isTrending: false, quality: 'HD', categoryId: categories[0].id },
      { title: 'The Dark Knight', slug: 'the-dark-knight', description: 'باتمان يواجه الجوكر', year: 2008, duration: 152, imdbRating: 9.0, isFeatured: false, isTrending: true, quality: 'HD', categoryId: categories[0].id },
      { title: 'Inception', slug: 'inception', description: 'سرقة الأحلام في عالم الأحلام', year: 2010, duration: 148, imdbRating: 8.8, isFeatured: false, isTrending: false, quality: 'HD', categoryId: categories[0].id },
      { title: 'Parasite', slug: 'parasite', description: 'قصة عائلة فقيرة تتسلل لعائلة غنية', year: 2019, duration: 132, imdbRating: 8.5, isFeatured: false, isTrending: false, quality: 'HD', categoryId: categories[0].id },
    ];

    for (const movie of moviesData) {
      await db.movie.create({ data: movie });
    }

    // Create series with seasons and episodes
    const seriesData = [
      { title: 'Game of Thrones', slug: 'game-of-thrones', description: 'صراع العروش على الممالك السبع', year: 2011, endYear: 2019, imdbRating: 9.2, isFeatured: true, isTrending: true, status: 'ended', categoryId: categories[1].id },
      { title: 'Breaking Bad', slug: 'breaking-bad', description: 'معلم كيمياء يتحول لتاجر مخدرات', year: 2008, endYear: 2013, imdbRating: 9.5, isFeatured: true, isTrending: true, status: 'ended', categoryId: categories[1].id },
      { title: 'The Last of Us', slug: 'the-last-of-us', description: 'رحلة بقاء في عالم ما بعد الكارثة', year: 2023, imdbRating: 8.8, isFeatured: true, isTrending: true, status: 'ongoing', categoryId: categories[1].id },
      { title: 'House of the Dragon', slug: 'house-of-the-dragon', description: 'قصة آل تارجاريان قبل صراع العروش', year: 2022, imdbRating: 8.4, isFeatured: false, isTrending: true, status: 'ongoing', categoryId: categories[1].id },
      { title: 'Stranger Things', slug: 'stranger-things', description: 'أطفال يواجهون قوى خارقة للطبيعة', year: 2016, imdbRating: 8.7, isFeatured: false, isTrending: true, status: 'ongoing', categoryId: categories[1].id },
    ];

    for (const series of seriesData) {
      const createdSeries = await db.series.create({ data: series });
      
      // Create 2 seasons for each series
      for (let s = 1; s <= 2; s++) {
        const season = await db.season.create({
          data: {
            seriesId: createdSeries.id,
            seasonNumber: s,
            title: `الموسم ${s}`,
            year: (series.year || 2020) + s - 1
          }
        });
        
        // Create 5 episodes for each season
        for (let e = 1; e <= 5; e++) {
          await db.episode.create({
            data: {
              seasonId: season.id,
              episodeNumber: e,
              title: `الحلقة ${e}`,
              duration: 45
            }
          });
        }
      }
    }

    // Create channels
    const channelsData = [
      { name: 'BeIN Sports 1', slug: 'bein-sports-1', isLive: true, country: 'Qatar', categoryId: categories[2].id },
      { name: 'BeIN Sports 2', slug: 'bein-sports-2', isLive: true, country: 'Qatar', categoryId: categories[2].id },
      { name: 'Al Jazeera', slug: 'al-jazeera', isLive: true, country: 'Qatar', categoryId: categories[3].id },
      { name: 'BBC Arabic', slug: 'bbc-arabic', isLive: true, country: 'UK', categoryId: categories[3].id },
      { name: 'MBC 1', slug: 'mbc-1', isLive: true, country: 'UAE', categoryId: categories[4].id },
      { name: 'MBC 2', slug: 'mbc-2', isLive: true, country: 'UAE', categoryId: categories[0].id },
      { name: 'MBC 3', slug: 'mbc-3', isLive: true, country: 'UAE', categoryId: categories[4].id },
      { name: 'Rotana Cinema', slug: 'rotana-cinema', isLive: true, country: 'Saudi Arabia', categoryId: categories[0].id },
      { name: 'Sky News Arabia', slug: 'sky-news-arabia', isLive: true, country: 'UAE', categoryId: categories[3].id },
      { name: 'Dubai Sports', slug: 'dubai-sports', isLive: true, country: 'UAE', categoryId: categories[2].id },
    ];

    for (const channel of channelsData) {
      await db.channel.create({ data: channel });
    }

    // Create banners
    await db.banner.createMany({
      data: [
        { title: 'مشاهدة Dune: Part Two', subtitle: 'الآن حصرياً على StreamFlix', imageUrl: '/banners/dune.jpg', order: 1 },
        { title: 'مسلسلات رمضان 2024', subtitle: 'أقوى المسلسلات الرمضانية', imageUrl: '/banners/ramadan.jpg', order: 2 },
        { title: 'البث المباشر', subtitle: 'شاهد القنوات المفضلة مباشرة', imageUrl: '/banners/live.jpg', order: 3 },
      ]
    });

    // Create settings
    await db.setting.createMany({
      data: [
        { key: 'site_name', value: 'StreamFlix' },
        { key: 'site_description', value: 'أفضل منصة لمشاهدة الأفلام والمسلسلات' },
        { key: 'contact_email', value: 'info@streamflix.com' },
      ]
    });

    return NextResponse.json({ 
      message: 'Database seeded successfully',
      categories: categories.length,
      movies: moviesData.length,
      series: seriesData.length,
      channels: channelsData.length
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
