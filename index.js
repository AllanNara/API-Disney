require('dotenv').config()
const app = require('./src/app');
const { db } = require('./src/db');

// Syncing all the models at once.
db.sync({ force: true }).then(() => {
    app.listen(process.env.PORT, () => {
        console.log(`%s listening at ${process.env.PORT}`); // eslint-disable-line no-console
    });
});