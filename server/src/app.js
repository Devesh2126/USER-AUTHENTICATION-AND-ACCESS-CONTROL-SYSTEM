const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const env = require('./config/env');
const healthRoutes = require('./routes/health');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();

// Adds a set of protective HTTP response headers (e.g. disabling MIME
// sniffing, restricting where the page can be framed) as a baseline
// defense, before any of our own logic runs.
app.use(helmet());

// Only our known frontend origin may call this API with credentials
// (cookies, later on). No wildcard '*' — that would defeat the point of
// restricting this at all for authenticated requests.
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);

// Parses incoming JSON request bodies into req.body for every route below.
app.use(express.json());
app.use(cookieParser());

app.use('/api/health', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Must come after all real routes: only reached if nothing above matched.
app.use(notFoundHandler);

// Must be the LAST app.use() call: Express only treats a 4-argument
// function as an error handler, and only routes errors to it if it's
// registered after everything that might throw or call next(err).
app.use(errorHandler);

module.exports = app;
