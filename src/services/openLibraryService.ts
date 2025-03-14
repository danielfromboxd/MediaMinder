
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

export const getBookCoverUrl = (coverId: number, size: "S" | "M" | "L" = "M"): string => {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
};

export const getBookDetails = async (key: string): Promise<any> => {
  const response = await fetch(`${OPEN_LIBRARY_API_URL}${key}.json`);
  
  if (!response.ok) {
    throw new Error("Failed to fetch book details");
  }

  return response.json();
};
