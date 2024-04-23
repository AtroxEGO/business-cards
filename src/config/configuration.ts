export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  database: {
    host: process.env.DATABASE_HOST,
  },
  api: {
    baseUrl:
      process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`,
  },
});
