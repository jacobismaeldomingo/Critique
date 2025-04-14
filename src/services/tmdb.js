// services/tmdb.js - Handles API requests from TMDb
const API_KEY = "85735e5d5dea33644bc4906ef03a0c44";
const BASE_URL = "https://api.themoviedb.org/3";

export const fetchMovieDetails = async (movieId) => {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}`
  );
  const data = await response.json();
  return data;
};

export const fetchTVSeriesDetails = async (seriesId) => {
  const response = await fetch(`${BASE_URL}/tv/${seriesId}?api_key=${API_KEY}`);
  const data = await response.json();
  return data;
};

export const fetchTVSeriesSeason = async (seriesId, seasonNumber) => {
  const response = await fetch(
    `${BASE_URL}/tv/${seriesId}/season/${seasonNumber}?api_key=${API_KEY}`
  );
  const data = await response.json();
  return data;
};

export const searchMovies = async (query) => {
  const response = await fetch(
    `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`
  );
  const data = await response.json();
  return data.results;
};

export const searchTVSeries = async (query) => {
  const response = await fetch(
    `${BASE_URL}/search/tv?api_key=${API_KEY}&query=${query}`
  );
  const data = await response.json();
  return data.results;
};

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
