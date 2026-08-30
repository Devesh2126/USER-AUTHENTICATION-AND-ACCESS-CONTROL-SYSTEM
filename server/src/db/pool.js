const { Pool } = require('pg');

// A pool, not a single client: Express handles many requests concurrently,
// and each in-flight query needs its own connection. The pool hands one out
// per query and returns it to the pool when done, instead of one shared
// connection that would serialize every request behind it.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
