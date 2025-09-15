const app = require('./app');
const db = require('./config/db');
require('dotenv').config()

const PORT = process.env.PORT || 3000;

db()

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});