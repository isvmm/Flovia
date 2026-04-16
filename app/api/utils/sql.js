import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;

const sql = DATABASE_URL
  ? postgres(DATABASE_URL, { 
      ssl: 'require',
      max: 20, // Increased for better concurrency
      idle_timeout: 30,
      connect_timeout: 45, // More generous timeout for cold starts
      onnotice: () => {}, 
      // Basic connectivity logger
      onparameter: (name, value) => {
          if (name === 'application_name') console.log("DB connected");
      }
    })
  : new Proxy(() => {}, {
      get() {
        throw new Error('No DATABASE_URL provided');
      },
      apply() {
        throw new Error('No DATABASE_URL provided');
      },
    });

export default sql;
