
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchBooks, OpenLibrarySearchResponse, OpenLibraryBook } from "@/services/openLibraryService";

export const useBookSearch = (query: string, enabled: boolean = true) => {
  return useQuery<OpenLibrarySearchResponse, Error>({
    queryKey: ["books", query],
    queryFn: () => searchBooks(query),
    enabled: enabled && query.length > 2,
  });
};
