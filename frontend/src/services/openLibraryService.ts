/**
 * OpenLibrary API Service
 * Docs: https://openlibrary.org/developers/api
 */

const OPEN_LIBRARY_API_URL = "https://openlibrary.org";

// Create a persistent cache that survives page refreshes
const getSessionCache = () => {
  try {
    const cache = sessionStorage.getItem('openLibraryCache');
    return cache ? JSON.parse(cache) : {};
  } catch (err) {
    return {};
  }
};

const saveToSessionCache = (key: string, data: any) => {
  try {
    const cache = getSessionCache();
    cache[key] = {
      data,
      timestamp: Date.now()
    };
    sessionStorage.setItem('openLibraryCache', JSON.stringify(cache));
  } catch (err) {
    console.warn('Failed to save to session cache', err);
  }
};

const getFromSessionCache = (key: string, maxAgeMs = 3600000) => { // Default 1 hour
  try {
    const cache = getSessionCache();
    const item = cache[key];
    if (item && Date.now() - item.timestamp < maxAgeMs) {
      return item.data;
    }
    return null;
  } catch (err) {
    return null;
  }
};

// Helper function to use a CORS proxy if needed
const fetchWithProxy = async (url: string): Promise<Response> => {
  try {
    // Try direct fetch first
    const directResponse = await fetch(url);
    
    if (directResponse.ok) {
      return directResponse;
    }
    
    // If direct request fails with CORS or 5xx error, try with a different proxy
    // AllOrigins is generally more reliable than cors-anywhere
    const corsProxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    console.log("Retrying with CORS proxy:", corsProxyUrl);
    
    return await fetch(corsProxyUrl);
  } catch (error) {
    console.error("Fetch failed:", error);
    throw error;
  }
};

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

// Make the searchBooks function use caching
export const searchBooks = async (query: string): Promise<OpenLibrarySearchResponse> => {
  const cacheKey = `search_${query}`;
  const cachedData = getFromSessionCache(cacheKey, 600000); // 10 minute cache
  
  if (cachedData) {
    console.log("Using cached search results for:", query);
    return cachedData;
  }
  
  const url = `${OPEN_LIBRARY_API_URL}/search.json?q=${encodeURIComponent(query)}&limit=10`;
  
  try {
    // First try without proxy - faster if it works
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      saveToSessionCache(cacheKey, data);
      return data;
    }
    
    // Fall back to proxy if needed
    console.log("Direct API call failed, using proxy");
    const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    const proxyResponse = await fetch(proxyUrl);
    
    if (!proxyResponse.ok) {
      throw new Error("Failed to search books");
    }
    
    const data = await proxyResponse.json();
    saveToSessionCache(cacheKey, data);
    return data;
  } catch (error) {
    console.error("Error searching books:", error);
    throw new Error("Failed to search books");
  }
};

/**
 * Get a book cover URL with multiple fallback options
 * @param bookOrId Either a book object or cover ID
 * @param size Size of the cover image (S, M, L)
 * @returns URL to the book cover image
 */
export const getBookCoverUrl = (bookOrId: any, size: 'S' | 'M' | 'L' = 'M'): string => {
  // Set default placeholder URL
  const placeholder = 'https://via.placeholder.com/200x300?text=No+Cover';
  
  try {
    // Case 1: String ID (could be numeric string or OLID)
    if (typeof bookOrId === 'string') {
      // If it looks like an OLID
      if (bookOrId.startsWith('OL') && (bookOrId.endsWith('M') || bookOrId.endsWith('W'))) {
        return `https://covers.openlibrary.org/b/olid/${bookOrId}-${size}.jpg`;
      }
      // Otherwise treat as a numeric ID
      return `https://covers.openlibrary.org/b/id/${bookOrId}-${size}.jpg`;
    }
    
    // Case 2: Number ID (direct cover_i)
    if (typeof bookOrId === 'number') {
      return `https://covers.openlibrary.org/b/id/${bookOrId}-${size}.jpg`;
    }
    
    // Case 3: Book Object with imageUrl already calculater
    if (bookOrId && typeof bookOrId === 'object' && bookOrId.imageUrl) {
      return bookOrId.imageUrl;
    }
    
    // Case 4: Book Object - try multiple sources in priority order
    if (bookOrId && typeof bookOrId === 'object') {
      // Check cover_i (most reliable from search results)
      if (bookOrId.cover_i) {
        return `https://covers.openlibrary.org/b/id/${bookOrId.cover_i}-${size}.jpg`;
      }
      
      // Check cover_edition_key (reliable from book details)
      if (bookOrId.cover_edition_key) {
        return `https://covers.openlibrary.org/b/olid/${bookOrId.cover_edition_key}-${size}.jpg`;
      }
      
      // Check for ISBN (another option)
      if (bookOrId.isbn) {
        const isbn = Array.isArray(bookOrId.isbn) ? bookOrId.isbn[0] : bookOrId.isbn;
        return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;
      }
      
      // Check posterPath (our saved property)
      if (bookOrId.posterPath) {
        // Check if posterPath contains "olid:" prefix
        if (typeof bookOrId.posterPath === 'string' && bookOrId.posterPath.startsWith('olid:')) {
          const olid = bookOrId.posterPath.replace('olid:', '');
          return `https://covers.openlibrary.org/b/olid/${olid}-${size}.jpg`;
        }
        return `https://covers.openlibrary.org/b/id/${bookOrId.posterPath}-${size}.jpg`;
      }
    }
    
    // Return placeholder if no valid source found
    return placeholder;
  } catch (error) {
    console.error("Error generating book cover URL:", error);
    return placeholder;
  }
};

/**
 * Get book details by ID
 * @param bookId OpenLibrary book ID
 * @returns Book details
 */
export const getBookDetails = async (bookId: string): Promise<any> => {
  // Clean the book ID if necessary
  if (bookId.startsWith('book_')) {
    bookId = bookId.replace('book_', '');
  }
  if (!bookId.startsWith('/')) {
    bookId = `/works/${bookId}`;
  }
  
  const cacheKey = `details_${bookId}`;
  const cachedData = getFromSessionCache(cacheKey); // Unlimited cache duration for book details
  
  if (cachedData) {
    console.log("Using cached book details for:", bookId);
    return cachedData;
  }
  
  try {
    // Simplified to a single API call - just get the essential data
    const url = `https://openlibrary.org${bookId}.json`;
    let response;
    
    // Try direct fetch first
    try {
      response = await fetch(url);
      if (!response.ok) throw new Error("Direct fetch failed");
    } catch (err) {
      // Fall back to proxy
      console.log("Using proxy for book details");
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      response = await fetch(proxyUrl);
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch book details');
    }
    
    const bookData = await response.json();
    
    // Add author names via a simplified approach
    if (bookData.authors && bookData.authors.length > 0) {
      // Extract author names from the author references if possible
      // Instead of making individual API calls, set placeholder names
      // and update them asynchronously
      bookData.author_name = bookData.authors.map((author: any) => 
        author.name || "Unknown Author"
      );
      
      // Fire and forget - update the cache when author data comes in
      setTimeout(async () => {
        try {
          const authorPromises = bookData.authors
            .filter((author: any) => author.author && author.author.key)
            .map(async (authorRef: any) => {
              const authorKey = authorRef.author.key;
              try {
                const authorUrl = `https://openlibrary.org${authorKey}.json`;
                const authorResponse = await fetch(authorUrl);
                if (authorResponse.ok) {
                  const authorData = await authorResponse.json();
                  return authorData.name || authorData.personal_name;
                }
              } catch (err) {
                console.warn("Author fetch failed:", err);
              }
              return null;
            });
          
          const authorNames = (await Promise.all(authorPromises)).filter(Boolean);
          if (authorNames.length > 0) {
            bookData.author_name = authorNames;
            saveToSessionCache(cacheKey, bookData);
          }
        } catch (err) {
          console.warn("Could not fetch author details:", err);
        }
      }, 0);
    }
    
    saveToSessionCache(cacheKey, bookData);
    return bookData;
  } catch (error) {
    console.error('Error fetching book details:', error);
    throw error;
  }
};

// Old popular books
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
    const recentChangesUrl = `${OPEN_LIBRARY_API_URL}/subjects/new_releases.json?limit=30`;
    const recentChangesResponse = await fetchWithProxy(recentChangesUrl);

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
    const trendingUrl = `${OPEN_LIBRARY_API_URL}/trending/daily.json?limit=50`;
    const trendingResponse = await fetchWithProxy(trendingUrl);
    
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
    const yearSearchUrl = `${OPEN_LIBRARY_API_URL}/search.json?q=${currentYear}&limit=10`;
    const yearSearchResponse = await fetchWithProxy(yearSearchUrl);
    
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
    
    const url = `${OPEN_LIBRARY_API_URL}/subjects/${randomSubject}.json?limit=10`;
    const response = await fetchWithProxy(url);
    
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
