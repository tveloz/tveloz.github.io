const cron = require('node-cron');
require('dotenv').config();
const { RealScholarScraper } = require('./real-scholar-scraper');

cron.schedule('0 3 * * *', async () => { // Run daily at 3 AM
    const scraper = new RealScholarScraper();
    const data = await scraper.scrapeProfile();
    fs.writeFileSync('data/scholar-data.json', JSON.stringify(data));
});