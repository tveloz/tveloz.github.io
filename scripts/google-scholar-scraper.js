// Google Scholar Data Scraper for Tomas Veloz
// This script fetches real-time data from Google Scholar

const https = require('https');
const { JSDOM } = require('jsdom');
const fs = require('fs');

class GoogleScholarScraper {
    constructor(userID = 'q7HbZQ4AAAAJ') {
        this.userID = userID;
        this.baseURL = `https://scholar.google.com/citations?user=${userID}&hl=en`;
    }

    async fetchPage(url) {
        return new Promise((resolve, reject) => {
            const options = {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            };

            https.get(url, options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(data));
            }).on('error', reject);
        });
    }

    async scrapeProfile() {
        try {
            console.log('Fetching Google Scholar profile...');
            const html = await this.fetchPage(this.baseURL);
            const dom = new JSDOM(html);
            const document = dom.window.document;

            // Extract basic stats
            const stats = this.extractStats(document);
            
            // Extract publications
            const publications = this.extractPublications(document);
            
            // Extract profile info
            const profile = this.extractProfile(document);

            const scholarData = {
                profile,
                stats,
                publications,
                lastUpdated: new Date().toISOString(),
                source: 'Google Scholar'
            };

            return scholarData;
        } catch (error) {
            console.error('Error scraping Google Scholar:', error);
            return this.getFallbackData();
        }
    }

    extractStats(document) {
        const stats = {
            totalCitations: 0,
            hIndex: 0,
            i10Index: 0,
            totalPublications: 0
        };

        try {
            // Citations table
            const statsTable = document.querySelector('#gsc_rsb_st tbody');
            if (statsTable) {
                const rows = statsTable.querySelectorAll('tr');
                
                if (rows[0]) {
                    const citationsCell = rows[0].querySelector('td:nth-child(2)');
                    if (citationsCell) {
                        stats.totalCitations = parseInt(citationsCell.textContent.replace(/,/g, '')) || 0;
                    }
                }
                
                if (rows[1]) {
                    const hIndexCell = rows[1].querySelector('td:nth-child(2)');
                    if (hIndexCell) {
                        stats.hIndex = parseInt(hIndexCell.textContent) || 0;
                    }
                }
                
                if (rows[2]) {
                    const i10IndexCell = rows[2].querySelector('td:nth-child(2)');
                    if (i10IndexCell) {
                        stats.i10Index = parseInt(i10IndexCell.textContent) || 0;
                    }
                }
            }

            // Count publications
            const pubRows = document.querySelectorAll('#gsc_a_t .gsc_a_tr');
            stats.totalPublications = pubRows.length;

        } catch (error) {
            console.error('Error extracting stats:', error);
        }

        return stats;
    }

    extractPublications(document) {
        const publications = [];
        
        try {
            const pubRows = document.querySelectorAll('#gsc_a_t .gsc_a_tr');
            
            pubRows.forEach((row, index) => {
                if (index < 20) { // Limit to first 20 publications
                    const pub = this.parsePublicationRow(row);
                    if (pub) {
                        publications.push(pub);
                    }
                }
            });
            
        } catch (error) {
            console.error('Error extracting publications:', error);
        }

        return publications;
    }

    parsePublicationRow(row) {
        try {
            const titleElement = row.querySelector('.gsc_a_at');
            const authorsElement = row.querySelector('.gs_gray:first-of-type');
            const journalElement = row.querySelector('.gs_gray:last-of-type');
            const yearElement = row.querySelector('.gsc_a_y');
            const citationsElement = row.querySelector('.gsc_a_c');

            if (!titleElement) return null;

            const title = titleElement.textContent.trim();
            const authors = authorsElement ? authorsElement.textContent.trim() : '';
            const journal = journalElement ? journalElement.textContent.trim() : '';
            const year = yearElement ? parseInt(yearElement.textContent) : new Date().getFullYear();
            const citations = citationsElement ? parseInt(citationsElement.textContent) || 0 : 0;
            const url = titleElement.href || '';

            // Check if it's a recent publication (within last 2 years)
            const currentYear = new Date().getFullYear();
            const isNew = year >= currentYear - 1;

            return {
                title,
                authors,
                journal,
                year,
                citations,
                url,
                isNew,
                rank: citations // Use citations as ranking metric
            };
        } catch (error) {
            console.error('Error parsing publication row:', error);
            return null;
        }
    }

    extractProfile(document) {
        const profile = {
            name: '',
            affiliation: '',
            verifiedEmail: '',
            researchInterests: []
        };

        try {
            // Name
            const nameElement = document.querySelector('#gsc_prf_in');
            if (nameElement) {
                profile.name = nameElement.textContent.trim();
            }

            // Affiliation
            const affiliationElement = document.querySelector('#gsc_prf_i .gsc_prf_il:first-child');
            if (affiliationElement) {
                profile.affiliation = affiliationElement.textContent.trim();
            }

            // Verified email
            const emailElement = document.querySelector('#gsc_prf_i .gsc_prf_il:nth-child(2)');
            if (emailElement) {
                profile.verifiedEmail = emailElement.textContent.trim();
            }

            // Research interests
            const interestsElements = document.querySelectorAll('#gsc_prf_i .gsc_prf_ila');
            interestsElements.forEach(element => {
                profile.researchInterests.push(element.textContent.trim());
            });

        } catch (error) {
            console.error('Error extracting profile:', error);
        }

        return profile;
    }

    getFallbackData() {
        // Fallback data based on known information about Tomas Veloz
        return {
            profile: {
                name: 'Tomas Veloz',
                affiliation: 'Universidad Tecnologica Metopolitana/Vrije Universiteit Brussel',
                verifiedEmail: 'vub.ac.be',
                researchInterests: ['Reaction Networks', 'Quantum Cognition', 'Interdisciplinary Science', 'Emergence', 'Worldviews']
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
                    rank: 8
                },
                {
                    title: "Towards an analytic framework for system resilience based on reaction networks",
                    authors: "T. Veloz, P. Maldonado, E. Busseniers, A. Bassi, S. Beigi, M. Lenartowicz, F. Heylighen",
                    journal: "Complexity",
                    year: 2022,
                    citations: 23,
                    url: "",
                    isNew: false,
                    rank: 23
                }
            ],
            lastUpdated: new Date().toISOString(),
            source: 'Fallback Data'
        };
    }

    // Generate HTML snippet with updated data
    generateHTMLUpdate(scholarData) {
        const jsCode = `
        // Updated Google Scholar data (Auto-generated)
        async function fetchGoogleScholarData() {
            return ${JSON.stringify(scholarData, null, 8)};
        }
        `;

        return jsCode;
    }

    // Save data to file
    saveData(scholarData, filename = 'src/data/scholar-data.json') {
        try {
            const dir = 'src/data';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(filename, JSON.stringify(scholarData, null, 2));
            console.log(`Data saved to ${filename}`);
            
            // Also save as JavaScript module
            const jsFilename = filename.replace('.json', '.js');
            const jsContent = `// Auto-generated Google Scholar data
export const scholarData = ${JSON.stringify(scholarData, null, 2)};
export default scholarData;
`;
            fs.writeFileSync(jsFilename, jsContent);
            console.log(`JavaScript module saved to ${jsFilename}`);
            
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    // Update HTML file with new data
    updateHTMLFile(scholarData, htmlFilename = 'index.html') {
        try {
            if (!fs.existsSync(htmlFilename)) {
                console.error(`HTML file ${htmlFilename} not found`);
                return;
            }

            let html = fs.readFileSync(htmlFilename, 'utf8');
            
            // Replace the fetchGoogleScholarData function
            const newFunction = `
        // Google Scholar data (Auto-updated: ${new Date().toISOString()})
        async function fetchGoogleScholarData() {
            try {
                return ${JSON.stringify(scholarData, null, 16)};
            } catch (error) {
                console.error('Error loading Google Scholar data:', error);
                return null;
            }
        }`;

            // Find and replace the function
            const functionRegex = /\/\/ Google Scholar API simulation[\s\S]*?async function fetchGoogleScholarData\(\)[\s\S]*?return scholarData;[\s\S]*?}/;
            
            if (functionRegex.test(html)) {
                html = html.replace(functionRegex, newFunction);
            } else {
                // If function not found, try a broader search
                const altRegex = /async function fetchGoogleScholarData\(\)[\s\S]*?return [\s\S]*?;[\s\S]*?}/;
                if (altRegex.test(html)) {
                    html = html.replace(altRegex, newFunction);
                } else {
                    console.warn('Could not find fetchGoogleScholarData function to replace');
                }
            }

            fs.writeFileSync(htmlFilename, html);
            console.log(`HTML file ${htmlFilename} updated with latest Google Scholar data`);
            
        } catch (error) {
            console.error('Error updating HTML file:', error);
        }
    }
}

// Usage example
async function main() {
    const scraper = new GoogleScholarScraper('q7HbZQ4AAAAJ');
    
    try {
        const scholarData = await scraper.scrapeProfile();
        
        console.log('=== Google Scholar Data ===');
        console.log('Total Citations:', scholarData.stats.totalCitations);
        console.log('Total Publications:', scholarData.stats.totalPublications);
        console.log('H-Index:', scholarData.stats.hIndex);
        console.log('Recent Publications:', scholarData.publications.filter(p => p.isNew).length);
        
        // Save data
        scraper.saveData(scholarData);
        
        // Update HTML file
        scraper.updateHTMLFile(scholarData);
        
        console.log('Data update completed successfully!');
        
    } catch (error) {
        console.error('Error in main function:', error);
    }
}

// Export for use in other modules
module.exports = { GoogleScholarScraper };

// Run if this file is executed directly
if (require.main === module) {
    main();
}