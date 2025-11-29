// This file is kept for backwards compatibility with old scripts but no longer connects

export default Promise.reject(
  new Error("MongoDB is no longer used. The application now uses Neon PostgreSQL for all data storage."),
)
