/**
 * OpenLibrary API Service
 * Docs: https://openlibrary.org/developers/api
 */

const OPEN_LIBRARY_API_URL = "https://openlibrary.org";

export interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  edition_count?: number;
  
  // Add these properties for covers
  cover_edition_key?: string;
  covers?: number[];
  isbn?: string[];
}

export interface OpenLibrarySearchResponse {
  numFound: number;
  start: number;
  docs: OpenLibraryBook[];
}

export const searchBooks = async (query: string): Promise<OpenLibrarySearchResponse> => {
  const response = await fetch(
    `${OPEN_LIBRARY_API_URL}/search.json?q=${encodeURIComponent(query)}&limit=10`
  );

  if (!response.ok) {
    throw new Error("Failed to search books");
  }

  return response.json();
};

export const getBookCoverUrl = (bookData: any, size: "S" | "M" | "L" = "M"): string | null => {
  // Nothing to work with
  if (!bookData) return null;
  
  // PRIORITY 1: Use cover_i (internal ID) - no rate limiting
  if (bookData.cover_i || (typeof bookData === 'number')) {
    const coverId = typeof bookData === 'number' ? bookData : bookData.cover_i;
    return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
  }
  
  // PRIORITY 2: Use OLID - no rate limiting
  if (bookData.key && typeof bookData.key === 'string') {
    // Extract OLID from /works/OL12345W format
    const olid = bookData.key.split('/').pop();
    if (olid && olid.startsWith('OL')) {
      return `https://covers.openlibrary.org/b/olid/${olid}-${size}.jpg`;
    }
  }
  
  // Alternative: if book directly has OLID
  if (bookData.cover_edition_key) {
    return `https://covers.openlibrary.org/b/olid/${bookData.cover_edition_key}-${size}.jpg`;
  }
  
  // PRIORITY 3: ISBN (rate-limited)
  if (bookData.isbn && bookData.isbn[0]) {
    return `https://covers.openlibrary.org/b/isbn/${bookData.isbn[0]}-${size}.jpg`;
  }
  
  // No viable cover source found
  return null;
};

export const getBookDetails = async (key: string): Promise<any> => {
  // Normalize the key format
  let workKey = key;
  
  // If it doesn't start with /works/ but looks like an OL ID, add the prefix
  if (!workKey.startsWith('/works/') && workKey.match(/^OL\d+W$/)) {
    workKey = `/works/${workKey}`;
  }
  
  // Remove any leading slash to prevent double slashes in the URL
  if (workKey.startsWith('/')) {
    workKey = workKey.substring(1);
  }
  
  const response = await fetch(
    `${OPEN_LIBRARY_API_URL}/${workKey}.json`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch book details for ${key}`);
  }

  return response.json();
};
/*
export const getTrendingBooks = async (): Promise<OpenLibraryBook[]> => {
  // OpenLibrary doesn't have a proper trending API, so we'll get popular books by subject
  const popularSubjects = ['fiction', 'fantasy', 'bestseller'];
  const randomSubject = popularSubjects[Math.floor(Math.random() * popularSubjects.length)];
  
  const response = await fetch(
    `${OPEN_LIBRARY_API_URL}/subjects/${randomSubject}.json?limit=10`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch popular books for subject: ${randomSubject}`);
  }

  const data = await response.json();
  return data.works || [];
};
*/

// Update in openLibraryService.ts
export const getRecentBooks = async (): Promise<OpenLibraryBook[]> => {
  // Get current year and previous year dynamically
  const currentYear = new Date().getFullYear();
  const lastYear = currentYear - 1;
  
  try {
    // Try the newest additions via recent changes first
    const recentChangesResponse = await fetch(
      `${OPEN_LIBRARY_API_URL}/subjects/new_releases.json?limit=30`
    );

    if (recentChangesResponse.ok) {
      const data = await recentChangesResponse.json();
      const works = data.works || [];
      
      // Filter by current or previous year
      const recentBooks = works.filter(book => 
        book.first_publish_year === currentYear || 
        book.first_publish_year === lastYear
      );
      
      console.log(`Found ${recentBooks.length} recent books from current/previous year`);
      
      // If we have at least 2 recent books, return them
      if (recentBooks.length >= 2) {
        return recentBooks;
      }
    }
    
    // Fallback: try trending books and filter by year
    const trendingResponse = await fetch(
      `${OPEN_LIBRARY_API_URL}/trending/daily.json?limit=50`
    );
    
    if (trendingResponse.ok) {
      const data = await trendingResponse.json();
      const works = data.works || [];
      
      // Filter by current or previous year
      const recentBooks = works.filter(book => 
        book.first_publish_year === currentYear || 
        book.first_publish_year === lastYear
      );
      
      // If we have at least 2 recent books, return them
      if (recentBooks.length >= 2) {
        return recentBooks;
      }
      
      // If we still don't have enough recent books,
      // just take the most recent ones regardless of year
      // and sort them by publish year (newest first)
      const sortedByYear = works
        .filter(book => book.first_publish_year) // Only books with a publish year
        .sort((a, b) => b.first_publish_year - a.first_publish_year);
      
      return sortedByYear.slice(0, 5); // Take top 5 most recent
    }
    
    // Last resort: search for books with the current year in title
    const yearSearchResponse = await fetch(
      `${OPEN_LIBRARY_API_URL}/search.json?q=${currentYear}&limit=10`
    );
    
    if (yearSearchResponse.ok) {
      const data = await yearSearchResponse.json();
      return data.docs || [];
    }
    
    // If all else fails, return an empty array
    return [];
  } catch (error) {
    console.error("Error fetching recent books:", error);
    return [];
  }
};

// Fallback function to get some popular books in case the API fails
const getFallbackBooks = async (): Promise<OpenLibraryBook[]> => {
  // Try a popular subject search as fallback
  try {
    const subjects = ['fiction', 'fantasy', 'bestseller', 'new'];
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
    
    const response = await fetch(
      `${OPEN_LIBRARY_API_URL}/subjects/${randomSubject}.json?limit=10`
    );
    
    if (!response.ok) {
      throw new Error("Fallback book fetch failed");
    }
    
    const data = await response.json();
    return data.works || [];
  } catch (error) {
    console.error("Fallback book fetch failed:", error);
    return [];
  }
};
