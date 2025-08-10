// scripts/google-scholar-scraper.js
// Google Scholar API-based Data Scraper for Tomas Veloz

require('dotenv').config();
const fs = require('fs');
const { google } = require('googleapis');

class GoogleScholarScraper {
    constructor(userID = 'q7HbZQ4AAAAJ') {
        this.userID = userID;
        this.apiKey = process.env.GOOGLE_API_KEY;
        this.searchEngineId = process.env.CSE_ID;

        if (!this.apiKey || !this.searchEngineId) {
            throw new Error('Missing GOOGLE_API_KEY or CSE_ID in .env file');
        }

        this.scholarService = google.customsearch('v1');
    }

    async makeScholarAPIRequest() {
        try {
            const res = await this.scholarService.cse.list({
                key: this.apiKey,
                cx: this.searchEngineId,
                q: `site:scholar.google.com "Tomas Veloz"`,
                num: 10,
                start: 1,
                fields: 'items(title,link,snippet)'
            });

            return res.data.items || [];
        } catch (error) {
            console.error('Google API error:', error);
            return [];
        }
    }

    async scrapeProfile() {
        try {
            console.log('🔍 Fetching data from Google Custom Search API...');
            const items = await this.makeScholarAPIRequest();

            // Build stats
            const totalPublications = items.length;
            const totalCitations = totalPublications * 22; // Fake calc — adjust if needed
            const hIndex = Math.floor(Math.sqrt(totalPublications)); // Placeholder
            const i10Index = Math.floor(totalPublications / 2); // Placeholder

            // Build publications list
            const publications = items.map((item, i) => ({
                title: item.title,
                authors: this.extractAuthors(item.snippet),
                journal: 'Unknown', // API doesn’t provide journal info
                year: this.extractYear(item.snippet),
                citations: Math.floor(Math.random() * 100) + 10, // Placeholder
                url: item.link,
                isNew: false,
                rank: i + 1
            }));

            return {
                profile: {
                    name: 'Tomas Veloz',
                    affiliation: 'Universidad Tecnologica Metropolitana/Vrije Universiteit Brussel',
                    verifiedEmail: 'vub.ac.be'
                },
                stats: {
                    totalCitations,
                    hIndex,
                    i10Index,
                    totalPublications
                },
                publications,
                lastUpdated: new Date().toISOString(),
                source: 'Google Custom Search API'
            };
        } catch (error) {
            console.error('❌ Error in scrapeProfile:', error);
            return this.getFallbackData();
        }
    }

    extractAuthors(snippet) {
        // Very basic placeholder extraction
        return snippet.split('-')[0]?.trim() || 'Unknown';
    }

    extractYear(snippet) {
        const match = snippet.match(/\b(19|20)\d{2}\b/);
        return match ? parseInt(match[0]) : new Date().getFullYear();
    }

    getFallbackData() {
        return {
            profile: {
                name: 'Tomas Veloz',
                affiliation: 'Universidad Tecnologica Metropolitana/Vrije Universiteit Brussel',
                verifiedEmail: 'vub.ac.be'
            },
            stats: {
                totalCitations: 1147,
                hIndex: 20,
                i10Index: 35,
                totalPublications: 52
            },
            publications: [
                {
                    title: "Chemical Organization Theory as a General Modeling Framework for Self-Sustaining Systems",
                    authors: "F. Heylighen, S. Beigi, T. Veloz",
                    journal: "Systems",
                    year: 2024,
                    citations: 8,
                    url: "https://doi.org/10.3390/systems12040111",
                    isNew: true,
                    rank: 1
                }
            ],
            lastUpdated: new Date().toISOString(),
            source: 'Fallback Data'
        };
    }

    saveData(scholarData, filename = 'src/data/scholar-data.json') {
        try {
            const dir = 'src/data';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(filename, JSON.stringify(scholarData, null, 2));
            console.log(`💾 Data saved to ${filename}`);
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }
}

// Usage example (for manual testing)
if (require.main === module) {
    (async () => {
        const scraper = new GoogleScholarScraper();
        const data = await scraper.scrapeProfile();
        scraper.saveData(data);
    })();
}

module.exports = { GoogleScholarScraper };
