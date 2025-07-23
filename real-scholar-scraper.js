#!/usr/bin/env node

/**
 * Real Google Scholar Scraper - IMPROVED VERSION
 * Better timeout handling, retry logic, and fallback mechanisms
 */

const https = require('https');
const http = require('http');
const fs = require('fs');

class RealScholarScraper {
    constructor() {
        this.userAgents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        ];
        this.scholarBaseUrl = 'https://scholar.google.com';
        this.profileUrl = 'https://scholar.google.com/citations?user=q7HbZQ4AAAAJ&hl=en';
        this.maxRetries = 3;
        this.timeoutMs = 15000; // 15 seconds
        this.retryDelayMs = 5000; // 5 seconds between retries
    }

    // Make HTTP request with better error handling and retries
    makeRequest(url, attempt = 1) {
        return new Promise((resolve, reject) => {
            const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
            
            const options = {
                headers: {
                    'User-Agent': userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate',
                    'Connection': 'keep-alive',
                    'Cache-Control': 'max-age=0',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'none'
                },
                timeout: this.timeoutMs
            };

            console.log(`🔍 Attempt ${attempt}/${this.maxRetries}: Connecting to Google Scholar...`);

            const protocol = url.startsWith('https') ? https : http;
            
            const req = protocol.get(url, options, (res) => {
                let data = '';
                
                // Handle redirects
                if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                    console.log(`🔄 Redirect to: ${res.headers.location}`);
                    return this.makeRequest(res.headers.location, attempt).then(resolve).catch(reject);
                }
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    console.log(`✅ Request completed (${res.statusCode}), data length: ${data.length}`);
                    resolve({
                        statusCode: res.statusCode,
                        data: data,
                        headers: res.headers
                    });
                });
            });
            
            req.on('error', (error) => {
                console.log(`❌ Request error on attempt ${attempt}: ${error.message}`);
                
                if (attempt < this.maxRetries) {
                    console.log(`⏳ Waiting ${this.retryDelayMs}ms before retry...`);
                    setTimeout(() => {
                        this.makeRequest(url, attempt + 1).then(resolve).catch(reject);
                    }, this.retryDelayMs);
                } else {
                    reject(new Error(`Failed after ${this.maxRetries} attempts: ${error.message}`));
                }
            });
            
            req.on('timeout', () => {
                req.abort();
                console.log(`⏰ Request timeout on attempt ${attempt}`);
                
                if (attempt < this.maxRetries) {
                    console.log(`⏳ Waiting ${this.retryDelayMs}ms before retry...`);
                    setTimeout(() => {
                        this.makeRequest(url, attempt + 1).then(resolve).catch(reject);
                    }, this.retryDelayMs);
                } else {
                    reject(new Error(`Timeout after ${this.maxRetries} attempts`));
                }
            });

            req.setTimeout(this.timeoutMs);
        });
    }

    // Parse citation count from Google Scholar profile
    parseCitationCount(html) {
        try {
            // Multiple patterns to try
            const patterns = [
                /Cited by (\d+)/,
                /"citation":{"count":"(\d+)"/,
                /<td class="gsc_rsb_std">(\d+)<\/td>/,
                /Citations<\/a><\/td><td class="gsc_rsb_std">(\d+)<\/td>/,
                /All<\/th><th class="gsc_g_th">Since 2019<\/th><\/tr><tr><td>Citations<\/td><td class="gsc_rsb_std">(\d+)<\/td>/
            ];

            for (const pattern of patterns) {
                const match = html.match(pattern);
                if (match) {
                    const count = parseInt(match[1]);
                    console.log(`📊 Found citations using pattern: ${count}`);
                    return count;
                }
            }

            console.log('⚠️  No citation patterns matched');
            return null;
        } catch (error) {
            console.error('Error parsing citation count:', error);
            return null;
        }
    }

    // Parse publication count
    parsePublicationCount(html) {
        try {
            // Count publication rows
            const patterns = [
                /<tr class="gsc_a_tr">/g,
                /<div class="gsc_a_b">/g,
                /<a[^>]*class="gsc_a_at"[^>]*>/g
            ];

            for (const pattern of patterns) {
                const matches = Array.from(html.matchAll(pattern));
                if (matches.length > 0) {
                    console.log(`📚 Found ${matches.length} publications using pattern`);
                    return matches.length;
                }
            }

            console.log('⚠️  No publication patterns matched');
            return 0;
        } catch (error) {
            console.error('Error parsing publication count:', error);
            return 0;
        }
    }

    // Parse top publications with better error handling
    parseTopPublications(html) {
        try {
            const publications = [];
            
            // Try different table structures
            const pubPatterns = [
                /<tr class="gsc_a_tr">(.*?)<\/tr>/gs,
                /<div class="gsc_a_b">(.*?)<\/div>/gs
            ];

            let pubMatches = [];
            for (const pattern of pubPatterns) {
                pubMatches = Array.from(html.matchAll(pattern));
                if (pubMatches.length > 0) {
                    console.log(`📖 Found ${pubMatches.length} publication entries`);
                    break;
                }
            }

            for (let i = 0; i < Math.min(10, pubMatches.length); i++) {
                const pubHtml = pubMatches[i][1];
                
                // Extract title with multiple patterns
                const titlePatterns = [
                    /<a[^>]*class="gsc_a_at"[^>]*>(.*?)<\/a>/,
                    /<div class="gsc_a_t"><a[^>]*>(.*?)<\/a>/,
                    /<span class="gsc_a_at">(.*?)<\/span>/
                ];

                let title = 'Unknown Title';
                for (const pattern of titlePatterns) {
                    const match = pubHtml.match(pattern);
                    if (match) {
                        title = match[1].replace(/<[^>]*>/g, '').trim();
                        break;
                    }
                }

                // Extract authors
                const authorPatterns = [
                    /<div class="gs_gray">(.*?)<\/div>/,
                    /<span class="gs_gray">(.*?)<\/span>/,
                    /<div class="gsc_a_at">(.*?)<\/div>/
                ];

                let authors = 'T. Veloz';
                for (const pattern of authorPatterns) {
                    const match = pubHtml.match(pattern);
                    if (match) {
                        authors = match[1].replace(/<[^>]*>/g, '').trim();
                        break;
                    }
                }

                // Extract citation count
                const citationPatterns = [
                    /<a[^>]*class="gsc_a_ac[^"]*"[^>]*>(\d+)<\/a>/,
                    /<span class="gsc_a_ac[^"]*">(\d+)<\/span>/,
                    /Citations: (\d+)/
                ];

                let citations = 0;
                for (const pattern of citationPatterns) {
                    const match = pubHtml.match(pattern);
                    if (match) {
                        citations = parseInt(match[1]);
                        break;
                    }
                }

                // Extract year
                const yearPatterns = [
                    /<span class="gsc_a_h gsc_a_hc gs_ibl">(\d{4})<\/span>/,
                    /<div class="gsc_a_y"><span class="gsc_a_h">(\d{4})<\/span>/,
                    /(\d{4})/
                ];

                let year = new Date().getFullYear();
                for (const pattern of yearPatterns) {
                    const match = pubHtml.match(pattern);
                    if (match) {
                        const parsedYear = parseInt(match[1]);
                        if (parsedYear >= 1990 && parsedYear <= new Date().getFullYear() + 1) {
                            year = parsedYear;
                            break;
                        }
                    }
                }

                if (title !== 'Unknown Title' || citations > 0) {
                    publications.push({
                        title: title.trim(),
                        authors: authors.trim(),
                        year: year,
                        citations: citations,
                        rank: i + 1
                    });
                }
            }
            
            // Sort by citation count (highest first)
            publications.sort((a, b) => b.citations - a.citations);
            
            // Re-rank after sorting
            publications.forEach((pub, index) => {
                pub.rank = index + 1;
            });
            
            console.log(`📚 Successfully parsed ${publications.length} publications`);
            return publications;
        } catch (error) {
            console.error('Error parsing publications:', error);
            return [];
        }
    }

    // Main scraping function with better error handling
    async scrapeScholarProfile() {
        try {
            console.log('🔍 Scraping Google Scholar profile...');
            
            const response = await this.makeRequest(this.profileUrl);
            
            if (response.statusCode !== 200) {
                throw new Error(`HTTP ${response.statusCode}: ${response.data}`);
            }
            
            const html = response.data;
            
            // Check if we got a meaningful response
            if (html.length < 1000) {
                throw new Error('Response too short, may be blocked or redirected');
            }

            if (html.includes('Our systems have detected unusual traffic') || 
                html.includes('blocked') || 
                html.includes('captcha')) {
                throw new Error('Google Scholar has detected unusual traffic - temporarily blocked');
            }
            
            // Parse the data
            const totalCitations = this.parseCitationCount(html);
            const totalPublications = this.parsePublicationCount(html);
            const topPublications = this.parseTopPublications(html);
            
            const scholarData = {
                totalCitations: totalCitations || 0,
                totalPublications: totalPublications || 0,
                mostCitedPublications: topPublications,
                lastUpdated: new Date().toISOString(),
                source: 'Google Scholar Live Scraping',
                profileUrl: this.profileUrl,
                scrapingMethod: 'HTTP with retries'
            };
            
            console.log(`✅ Successfully scraped Scholar data:`);
            console.log(`   Citations: ${scholarData.totalCitations}`);
            console.log(`   Publications: ${scholarData.totalPublications}`);
            console.log(`   Top publications: ${scholarData.mostCitedPublications.length}`);
            
            return scholarData;
            
        } catch (error) {
            console.error('❌ Error scraping Google Scholar:', error.message);
            
            // Return fallback data with error info
            return {
                totalCitations: 0,
                totalPublications: 0,
                mostCitedPublications: [],
                lastUpdated: new Date().toISOString(),
                source: 'Fallback - Scraping Failed',
                error: error.message,
                fallbackReason: 'Network error or blocking detected'
            };
        }
    }

    // Enhanced save function
    async saveToFile(data, filename = 'data/scholar-data.json') {
        try {
            const dir = 'data';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(filename, JSON.stringify(data, null, 2));
            console.log(`✅ Scholar data saved to ${filename}`);
        } catch (error) {
            console.error('❌ Error saving data:', error);
        }
    }

    // Load existing data with better error handling
    loadExistingData(filename = 'data/scholar-data.json') {
        try {
            if (fs.existsSync(filename)) {
                const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
                const lastUpdate = new Date(data.lastUpdated);
                const hoursSinceUpdate = (new Date() - lastUpdate) / (1000 * 60 * 60);
                
                console.log(`📄 Found existing data from ${lastUpdate.toLocaleString()}`);
                console.log(`⏰ Data is ${hoursSinceUpdate.toFixed(1)} hours old`);
                
                return data;
            }
        } catch (error) {
            console.error('❌ Error loading existing data:', error);
        }
        return null;
    }

    // Check if data needs updating (configurable threshold)
    needsUpdate(existingData, hoursThreshold = 6) {
        if (!existingData || !existingData.lastUpdated) return true;
        
        const lastUpdate = new Date(existingData.lastUpdated);
        const hoursSinceUpdate = (new Date() - lastUpdate) / (1000 * 60 * 60);
        
        return hoursSinceUpdate >= hoursThreshold;
    }

    // Enhanced main function with temporary manual fallback
    async getFreshScholarData() {
        const existingData = this.loadExistingData();
        
        if (existingData && !this.needsUpdate(existingData)) {
            console.log('✅ Using cached Scholar data (still fresh)');
            return existingData;
        }
        
        console.log('🔄 Fetching fresh Scholar data...');
        const freshData = await this.scrapeScholarProfile();
        
        // If scraping failed and we have existing data, keep the existing data
        if (freshData.error && existingData && !existingData.error) {
            console.log('⚠️  Scraping failed, keeping existing data');
            return existingData;
        }
        
        await this.saveToFile(freshData);
        return freshData;
    }

    // Manual data entry function (temporary solution)
    createManualData(citations, publications, topPubs = []) {
        console.log('📝 Creating manual Scholar data...');
        
        const manualData = {
            totalCitations: parseInt(citations) || 0,
            totalPublications: parseInt(publications) || 0,
            mostCitedPublications: topPubs,
            lastUpdated: new Date().toISOString(),
            source: 'Manual Entry - Temporary',
            manual: true
        };
        
        this.saveToFile(manualData);
        console.log(`✅ Manual data created: ${citations} citations, ${publications} publications`);
        
        return manualData;
    }
}

// Export for use in other modules
module.exports = RealScholarScraper;

// Command line interface
async function main() {
    const scraper = new RealScholarScraper();
    const command = process.argv[2] || 'scrape';
    
    switch (command) {
        case 'scrape':
            const data = await scraper.getFreshScholarData();
            console.log('\n📊 Final Data:');
            console.log(JSON.stringify(data, null, 2));
            break;
            
        case 'force':
            console.log('🔄 Force scraping (ignoring cache)...');
            const freshData = await scraper.scrapeScholarProfile();
            await scraper.saveToFile(freshData);
            console.log('\n📊 Fresh Data:');
            console.log(JSON.stringify(freshData, null, 2));
            break;

        case 'manual':
            // Manual data entry for temporary use
            const citations = process.argv[3];
            const publications = process.argv[4];
            
            if (!citations || !publications) {
                console.log('Usage: node real-scholar-scraper.js manual <citations> <publications>');
                console.log('Example: node real-scholar-scraper.js manual 1147 52');
                break;
            }
            
            scraper.createManualData(citations, publications);
            break;
            
        case 'load':
            const cached = scraper.loadExistingData();
            if (cached) {
                console.log('📄 Cached Data:');
                console.log(JSON.stringify(cached, null, 2));
            } else {
                console.log('❌ No cached data found');
            }
            break;
            
        default:
            console.log(`
🔬 Real Google Scholar Scraper - IMPROVED VERSION

Usage: node real-scholar-scraper.js [command]

Commands:
  scrape             - Get Scholar data (uses cache if fresh)
  force              - Force fresh scraping (ignores cache)
  manual <cit> <pub> - Create manual data entry (temporary solution)
  load               - Load existing cached data
  help               - Show this help

Examples:
  node real-scholar-scraper.js scrape
  node real-scholar-scraper.js force
  node real-scholar-scraper.js manual 1147 52

If Google Scholar is blocking requests:
1. Try: node real-scholar-scraper.js manual <your_citations> <your_publications>
2. Wait a few hours and try scraping again
3. The system will automatically retry with delays
            `);
            break;
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}