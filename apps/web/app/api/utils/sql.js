import postgres from 'postgres';

const sql = process.env.DATABASE_URL
  ? postgres(process.env.DATABASE_URL, { 
      ssl: 'require',
      max: 10,
      idle_timeout: 20,
      connect_timeout: 30,
      onnotice: () => {}, // Disable notice spam
    })
  : new Proxy(() => {}, {
      get() {
        throw new Error(
          'No database connection string was provided. Perhaps process.env.DATABASE_URL has not been set'
        );
      },
      apply() {
        throw new Error(
          'No database connection string was provided. Perhaps process.env.DATABASE_URL has not been set'
        );
      },
    });

export default sql;
