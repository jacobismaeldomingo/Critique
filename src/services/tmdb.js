// services/tmdb.js - Handles API requests from TMDb
const API_KEY = "85735e5d5dea33644bc4906ef03a0c44";
const BASE_URL = "https://api.themoviedb.org/3";

/**
 * Fetches detailed information about a specific movie.
 * @param {string} movieId - The ID of the movie to fetch.
 */
export const fetchMovieDetails = async (movieId) => {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`
  );
  const data = await response.json();
  return data;
};

/**
 * Fetches detailed information about a specific TV series.
 * @param {string} seriesId - The ID of the TV series to fetch.
 */
export const fetchTVSeriesDetails = async (seriesId) => {
  const response = await fetch(`${BASE_URL}/tv/${seriesId}?api_key=${API_KEY}`);
  const data = await response.json();
  return data;
};

/**
 * Fetches information for a specific season of a TV series.
 * @param {string} seriesId - The ID of the TV series.
 * @param {number} seasonNumber - The season number to fetch.
 */
export const fetchTVSeriesSeason = async (seriesId, seasonNumber) => {
  const response = await fetch(
    `${BASE_URL}/tv/${seriesId}/season/${seasonNumber}?api_key=${API_KEY}`
  );
  const data = await response.json();
  return data;
};

/**
 * Searches for movies that match the given query string.
 * @param {string} query - The search query (movie title).
 */
export const searchMovies = async (query) => {
  const response = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`
  );
  const data = await response.json();
  return data.results;
};

/**
 * Searches for TV series that match the given query string.
 * @param {string} query - The search query (series title).
 */
export const searchTVSeries = async (query) => {
  const response = await fetch(
    `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${query}`
  );
  const data = await response.json();
  return data.results;
};

/**
 * Fetches a list of trending movies for the week.
 * @param {number} [page=1] - The page number for pagination.
 */
export const fetchTrendingMovies = async (page = 1) => {
  const response = await fetch(
    `${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${page}`
  );
  const data = await response.json();
  return data.results.map((movie) => ({
    ...movie,
    media_type: "movies",
  }));
};

/**
 * Fetches a list of trending TV series for the week.
 * @param {number} [page=1] - The page number for pagination.
 */
export const fetchTrendingTVSeries = async (page = 1) => {
  const response = await fetch(
    `${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`
  );
  const data = await response.json();
  const series = data.results.map((series) => ({
    ...series,
    media_type: "tvSeries",
  }));
  return series;
};

/**
 * Fetches a list of popular movies, filtering out adult content.
 * @param {number} [page=1] - The page number for pagination.
 */
export const fetchPopularMovies = async (page = 1) => {
  const response = await fetch(
    `${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`
  );
  const data = await response.json();

  // Filter out movies where `adult` is true
  const movies = data.results
    .filter((movie) => !movie.adult)
    .map((movie) => ({
      ...movie,
      media_type: "movies",
    }));

  return movies;
};

/**
 * Fetches a list of popular TV series.
 * @param {number} [page=1] - The page number for pagination.
 */
export const fetchPopularTVSeries = async (page = 1) => {
  const response = await fetch(
    `${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`
  );
  const data = await response.json();
  const series = data.results.map((series) => ({
    ...series,
    media_type: "tvSeries",
  }));
  return series;
};

/**
 * Fetches a list of movies that are currently playing in theaters.
 * @param {number} [page=1] - The page number for pagination.
 */
export const fetchNowPlaying = async (page = 1) => {
  const response = await fetch(
    `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&page=${page}`
  );
  const data = await response.json();
  const movies = data.results.map((movie) => ({
    ...movie,
    media_type: "movies",
  }));
  return movies;
};

// Returns a hardcoded list of genres along with their associated color codes.
export const fetchGenres = async () => {
  return (genres = [
    { id: 28, name: "Action", color: "#FF5733" },
    { id: 12, name: "Adventure", color: "#F39C12" },
    { id: 16, name: "Animation", color: "#568203" },
    { id: 35, name: "Comedy", color: "#EFCD05" },
    { id: 80, name: "Crime", color: "#34495E" },
    { id: 99, name: "Documentary", color: "#2E86C1" },
    { id: 18, name: "Drama", color: "#85C1E9" },
    { id: 10751, name: "Family", color: "#FFB6C1" },
    { id: 14, name: "Fantasy", color: "#9B59B6" },
    { id: 36, name: "History", color: "#D35400" },
    { id: 27, name: "Horror", color: "#000000" },
    { id: 10402, name: "Music", color: "#E67E22" },
    { id: 9648, name: "Mystery", color: "#34495E" },
    { id: 10749, name: "Romance", color: "#E74C3C" },
    { id: 878, name: "Science Fiction", color: "#8E44AD" },
    { id: 10770, name: "TV Movie", color: "#95A5A6" },
    { id: 53, name: "Thriller", color: "#2C3E50" },
    { id: 10752, name: "War", color: "#5D6D7E" },
    { id: 37, name: "Western", color: "#D2691E" },
    { id: 10759, name: "Action & Adventure", color: "#E67E22" },
    { id: 10762, name: "Kids", color: "#FF69B4" },
    { id: 10763, name: "News", color: "#3498DB" },
    { id: 10764, name: "Reality", color: "#27AE60" },
    { id: 10765, name: "Sci-Fi & Fantasy", color: "#6C3483" },
    { id: 10766, name: "Soap", color: "#EC7063" },
    { id: 10767, name: "Talk", color: "#1ABC9C" },
    { id: 10768, name: "War & Politics", color: "#A93226" },
  ]);
};

/**
 * Fetches the list of streaming providers for a specific movie in Canada.
 * @param {string} movieId - The ID of the movie to fetch providers for.
 */
export const fetchMoviesProviders = async (movieId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}/watch/providers?api_key=${API_KEY}`
    );
    const data = await response.json();

    if (!data.results) return null;

    // Extract providers for Canada only
    const caFRProviders = data.results.CA?.flatrate || [];
    const caBuyProviders = data.results.CA?.buy || [];
    const caRentProviders = data.results.CA?.rent || [];

    // Use a Map to remove duplicates based on provider_id
    const providerMap = new Map();

    [...caFRProviders, ...caBuyProviders, ...caRentProviders].forEach(
      (provider) => {
        providerMap.set(provider.provider_id, provider);
      }
    );

    // Convert the Map values back into an array
    return Array.from(providerMap.values());
  } catch (error) {
    console.error("Error fetching movie watch providers:", error);
    return null;
  }
};

/**
 * Fetches the cast list of a specific movie.
 * @param {string} movieId - The ID of the movie to fetch the cast for.
 */
export const fetchMovieCast = async (movieId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`
    );
    const data = await response.json();
    return data.cast;
  } catch (error) {
    console.error("Error fetching Movie cast:", error);
    return null;
  }
};

// export const fetchMovieFullCast = async (movieId) => {
//   try {
//     const response = await fetch(
//       `${BASE_URL}/movie/${movieId}/credits?api_key=${API_KEY}`
//     );
//     const data = await response.json();

//     if (!response.ok) {
//       console.error("API Error:", data);
//       return null;
//     }

//     return {
//       cast: data.cast || [],
//       crew: data.crew || [],
//     };
//   } catch (error) {
//     console.error("Error fetching Movie cast:", error);
//     return null;
//   }
// };

/**
 * Fetches streaming providers for a specific TV series in Canada.
 * @param {number} seriesId - The TMDB ID of the TV series.
 */
export const fetchTVSeriesProviders = async (seriesId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/${seriesId}/watch/providers?api_key=${API_KEY}`
    );
    const data = await response.json();

    if (!data.results) return null;

    // Extract providers for Canada only
    const caProviders = data.results.CA?.flatrate || [];

    return caProviders;
  } catch (error) {
    console.error("Error fetching TV series watch providers:", error);
    return null;
  }
};

/**
 * Fetches cast information for a specific TV series.
 * @param {number} seriesId - The TMDB ID of the TV series.
 */
export const fetchTVSeriesCast = async (seriesId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/${seriesId}/aggregate_credits?api_key=${API_KEY}`
    );
    const data = await response.json();
    return data.cast;
  } catch (error) {
    console.error("Error fetching TV series cast:", error);
    return null;
  }
};

// export const fetchTVSeriesFullCast = async (seriesId) => {
//   try {
//     const response = await fetch(
//       `${BASE_URL}/tv/${seriesId}/aggregate_credits?api_key=${API_KEY}`
//     );
//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Error fetching TV series cast:", error);
//     return null;
//   }
// };

/**
 * Fetches detailed information about a specific season of a TV series.
 * @param {number} seriesId - The TMDB ID of the TV series.
 * @param {number} seasonNumber - The season number to fetch.
 */
export const fetchSeason = async (seriesId, seasonNumber) => {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/${seriesId}/season/${seasonNumber}?api_key=${API_KEY}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching episodes:", error);
  }
};

/**
 * Fetches a list of movies based on selected genre IDs.
 * @param {Array<number>} genres - An array of genre IDs.
 * @param {number} [page=1] - Page number for pagination.
 */
export const fetchMoviesByGenres = async (genres, page = 1) => {
  try {
    if (!genres || genres.length === 0) {
      console.log("No genres provided.");
      return [];
    }

    const response = await fetch(
      `${BASE_URL}/discover/movie?include_adult=false&include_null_first_air_dates=false&language=en-US&page=${page}&sort_by=popularity.desc&with_genres=${genres}&api_key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.results || !Array.isArray(data.results)) {
      console.log("Invalid response format for movies");
      return [];
    }

    const movies = data.results.map((movie) => ({
      ...movie,
      media_type: "movies",
    }));
    return movies;
  } catch (error) {
    console.error("Error fetching movies by genres:", error);
    return [];
  }
};

/**
 * Fetches a list of TV series based on selected genre IDs.
 * @param {Array<number>} genres - An array of genre IDs.
 * @param {number} [page=1] - Page number for pagination.
 */
export const fetchTVSeriesByGenres = async (genres, page = 1) => {
  try {
    if (!genres || genres.length === 0) {
      console.log("No genres provided.");
      return [];
    }

    const response = await fetch(
      `${BASE_URL}/discover/tv?include_adult=false&include_null_first_air_dates=false&language=en-US&page=${page}&sort_by=popularity.desc&with_genres=${genres}&api_key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.results || !Array.isArray(data.results)) {
      console.log("Invalid response format for TV series");
      return [];
    }

    const series = data.results.map((series) => ({
      ...series,
      media_type: "tvSeries",
    }));
    return series;
  } catch (error) {
    console.error("Error fetching tv series by genres:", error);
    return [];
  }
};

/**
 * Fetches trailer videos for a specific movie.
 * @param {number} movieId - The TMDB ID of the movie.
 */
export const fetchMovieVideos = async (movieId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/movie/${movieId}/videos?api_key=${API_KEY}`
    );
    const data = await response.json();
    // Filter videos to include only trailers
    const trailers = data.results.filter((video) => video.type === "Trailer");
    return trailers;
  } catch (error) {
    console.error("Error fetching movie videos:", error);
    return [];
  }
};

/**
 * Fetches trailer videos for a specific TV series.
 * @param {number} seriesId - The TMDB ID of the TV series.
 */
export const fetchTVSeriesVideos = async (seriesId) => {
  try {
    const response = await fetch(
      `${BASE_URL}/tv/${seriesId}/videos?api_key=${API_KEY}`
    );
    const data = await response.json();
    // Filter videos to include only trailers
    const trailers = data.results.filter((video) => video.type === "Trailer");
    return trailers;
  } catch (error) {
    console.error("Error fetching movie videos:", error);
    return [];
  }
};

/**
 * Checks for new releases: latest season/episode for TV shows or release date for movies.
 * @param {Object} mediaItem - The media object containing `id` and `type` ("tv" or "movie").
 */
export async function checkForNewReleases(mediaItem) {
  try {
    if (mediaItem.type === "tv") {
      // Get latest season data
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${mediaItem.id}?api_key=${API_KEY}`
      );
      const data = await response.json();

      // Get the latest season
      const latestSeason = data.seasons[data.seasons.length - 1];

      return {
        season: latestSeason.season_number,
        episode: latestSeason.episode_count,
        lastAirDate: latestSeason.air_date,
      };
    } else {
      // For movies - get release dates
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${mediaItem.id}/release_dates?api_key=${API_KEY}`
      );
      const data = await response.json();

      // Find theatrical release
      const theaterRelease = data.results.find((r) => r.type === 3);
      return {
        theaterRelease: theaterRelease?.release_dates[0]?.release_date || null,
      };
    }
  } catch (error) {
    console.error("TMDB API error:", error);
    throw error;
  }
}
