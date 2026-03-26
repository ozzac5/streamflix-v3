import { NextRequest, NextResponse } from 'next/server';

// IMDB API Base URL (Free API from imdbapi.dev)
const IMDB_API_BASE_FREE = 'https://imdb-api.projects.thetuhin.com';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const query = searchParams.get('query');
  const id = searchParams.get('id');

  try {
    let data: unknown;

    switch (action) {
      case 'search':
        if (!query) {
          return NextResponse.json({ error: 'Query parameter required' }, { status: 400 });
        }
        // Search for movies/series
        const searchRes = await fetch(`${IMDB_API_BASE_FREE}/search/${encodeURIComponent(query)}`);
        data = await searchRes.json();
        break;

      case 'title':
        if (!id) {
          return NextResponse.json({ error: 'ID parameter required' }, { status: 400 });
        }
        // Get title details
        const titleRes = await fetch(`${IMDB_API_BASE_FREE}/title/${id}`);
        data = await titleRes.json();
        break;

      case 'popular':
        // Get popular movies
        const popularRes = await fetch(`${IMDB_API_BASE_FREE}/MostPopularMovies`);
        data = await popularRes.json();
        break;

      case 'top250':
        // Get top 250 movies
        const top250Res = await fetch(`${IMDB_API_BASE_FREE}/Top250Movies`);
        data = await top250Res.json();
        break;

      case 'comingsoon':
        // Get coming soon movies
        const comingSoonRes = await fetch(`${IMDB_API_BASE_FREE}/ComingSoon`);
        data = await comingSoonRes.json();
        break;

      default:
        return NextResponse.json({ error: 'Invalid action. Use: search, title, popular, top250, comingsoon' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('IMDB API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from IMDB API' },
      { status: 500 }
    );
  }
}
