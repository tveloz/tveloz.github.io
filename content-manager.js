#!/usr/bin/env node

/**
 * Enhanced Multimedia Content Manager for Academic Website
 * Manages tagged photos, videos, and publications for multiple carousels
 * Compatible with the new content.json structure
 */

const fs = require('fs');
const path = require('path');

class ContentManager {
    constructor() {
        this.contentConfigPath = 'data/content.json';
        this.mediaDirectory = 'media/';
        this.picsDirectory = 'pics/';
        this.videosDirectory = 'videos/';
        this.researchPagesDir = 'research/';
        this.indexHtmlPath = 'index.html';
    }

    // Load content configuration
    loadConfig() {
        try {
            if (fs.existsSync(this.contentConfigPath)) {
                const config = JSON.parse(fs.readFileSync(this.contentConfigPath, 'utf8'));
                return config;
            } else {
                console.log('📁 No content.json found, creating default configuration...');
                return this.createDefaultConfig();
            }
        } catch (error) {
            console.error('❌ Error loading content config:', error);
            return this.createDefaultConfig();
        }
    }

    // Create default configuration with the new structure
    createDefaultConfig() {
        const defaultConfig = {
            content: {
                photos: [
                    {
                        id: "conference_2024",
                        filename: "2.png",
                        type: "photo",
                        title: "Conference Participation",
                        description: "Artificial General Intelligence Summit",
                        location: "Panama City, Panama",
                        date: "2024-01-15",
                        tags: ["conference", "presentation", "research", "about-me"],
                        fallback_color: "#667eea",
                        fallback_text: "Conference+Presentation",
                        priority: 1
                    },
                    {
                        id: "vub_lab_2024",
                        filename: "1.jpg",
                        type: "photo",
                        title: "Collaborating from VUB",
                        description: "Visiting UVA (Amsterdam) with Joe from UPD Philippines",
                        location: "UVA Amsterdam, The Netherlands",
                        date: "2024-01-10",
                        tags: ["research", "lab", "VUB", "SYMP", "about-me", "interdisciplinarity"],
                        fallback_color: "#764ba2",
                        fallback_text: "Research+Lab",
                        priority: 2
                    },
                    {
                        id: "face_2024",
                        filename: "4.jpeg",
                        type: "photo",
                        title: "About me",
                        description: "Tomas Veloz, Full Stack Interdisciplinary Researcher",
                        location: "Brussels, Belgium",
                        date: "2024-01-10",
                        tags: ["profile", "about-me"],
                        fallback_color: "#f093fb",
                        fallback_text: "About+me",
                        priority: 3
                    },
                    {
                        id: "collaboration_2024",
                        filename: "3.jpg",
                        type: "photo",
                        title: "International Collaboration",
                        description: "Research collaboration meeting with international partners",
                        location: "Tokyo Japan",
                        date: "2024-08-01",
                        tags: ["collaboration", "international", "research", "about-me", "interdisciplinarity"],
                        fallback_color: "#4ade80",
                        fallback_text: "Collaboration",
                        priority: 4
                    }
                ],
                videos: [
                    {
                        id: "cot_intro_2023",
                        youtube_id: "dQw4w9WgXcQ",
                        type: "video",
                        title: "Introduction to Chemical Organization Theory",
                        description: "Basic concepts and applications of COT in complex systems",
                        duration: "15:30",
                        date: "2023-06-15",
                        tags: ["cot", "chemical-organization-theory", "tutorial", "theory"],
                        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
                    },
                    {
                        id: "quantum_cognition_lecture_2023",
                        youtube_id: "dQw4w9WgXcQ",
                        type: "video",
                        title: "Quantum Structures in Cognitive Science",
                        description: "How quantum mathematical frameworks can model cognitive phenomena",
                        duration: "42:18",
                        date: "2023-09-22",
                        tags: ["quantum-cognition", "lecture", "cognitive-science", "theory"],
                        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
                    },
                    {
                        id: "wicked_problems_workshop_2024",
                        youtube_id: "dQw4w9WgXcQ",
                        type: "video",
                        title: "Mathematical Modeling of Wicked Problems",
                        description: "Workshop on systems thinking approaches to complex societal challenges",
                        duration: "28:45",
                        date: "2024-03-10",
                        tags: ["wicked-problems", "mathematical-modeling", "workshop", "systems-thinking"],
                        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
                    },
                    {
                        id: "interdisciplinarity_foundations_2024",
                        youtube_id: "dQw4w9WgXcQ",
                        type: "video",
                        title: "Foundations of Transdisciplinary Research",
                        description: "What makes truly interdisciplinary collaboration possible?",
                        duration: "35:12",
                        date: "2024-05-18",
                        tags: ["interdisciplinarity", "transdisciplinary", "collaboration", "foundations"],
                        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
                    }
                ],
                publications: [
                    {
                        id: "featured_pub_1",
                        type: "publication",
                        title: "Chemical Organization Theory as a General Modeling Framework for Self-Sustaining Systems",
                        authors: "F. Heylighen, S. Beigi, T. Veloz",
                        journal: "Systems",
                        year: 2024,
                        volume: "12(4)",
                        citations: 8,
                        tags: ["featured", "cot", "chemical-organization-theory", "recent"],
                        abstract: "We present Chemical Organization Theory (COT) as a general framework for modeling self-sustaining systems across multiple domains.",
                        url: "https://doi.org/10.3390/systems12040123",
                        featured: true
                    },
                    {
                        id: "featured_pub_2",
                        type: "publication",
                        title: "Towards an analytic framework for system resilience based on reaction networks",
                        authors: "T. Veloz, P. Maldonado, E. Busseniers, A. Bassi, S. Beigi, M. Lenartowicz, F. Heylighen",
                        journal: "Complexity",
                        year: 2022,
                        citations: 23,
                        tags: ["featured", "resilience", "reaction-networks", "highly-cited"],
                        abstract: "This paper develops an analytical framework for understanding system resilience through the lens of reaction network theory.",
                        url: "https://doi.org/10.1155/2022/1234567",
                        featured: true
                    },
                    {
                        id: "featured_pub_3",
                        type: "publication",
                        title: "A multi-faceted framework for researching the integration of emerging technologies into education",
                        authors: "L. Kausel, R. Videla, F. Alamos-Grau, T. Veloz, et al.",
                        journal: "Educational Technology Research",
                        year: 2025,
                        citations: 0,
                        tags: ["featured", "education", "technology", "recent"],
                        abstract: "We propose a comprehensive framework for studying how emerging technologies can be effectively integrated into educational contexts.",
                        url: "https://doi.org/10.1080/12345678.2025.123456",
                        featured: true
                    }
                ]
            },
            carousels: {
                "about-me": {
                    name: "About Me Photos",
                    type: "photo",
                    description: "Personal and professional photos"
                },
                "featured-publications": {
                    name: "Featured Publications",
                    type: "publication",
                    description: "Highlighted research publications"
                },
                "chemical-organization-theory": {
                    name: "Chemical Organization Theory",
                    type: "mixed",
                    description: "Videos and images related to COT research"
                },
                "quantum-cognition": {
                    name: "Quantum Cognition",
                    type: "mixed",
                    description: "Research on quantum structures in cognitive science"
                },
                "mathematical-modeling": {
                    name: "Mathematical Modeling",
                    type: "mixed",
                    description: "Wicked problems and complex systems modeling"
                },
                "interdisciplinarity": {
                    name: "Inter/Transdisciplinarity",
                    type: "mixed",
                    description: "Foundations and applications of interdisciplinary research"
                }
            },
            metadata: {
                last_updated: new Date().toISOString().split('T')[0],
                version: "2.0",
                total_photos: 4,
                total_videos: 4,
                total_publications: 3
            }
        };

        this.saveConfig(defaultConfig);
        return defaultConfig;
    }

    // Save configuration
    saveConfig(config) {
        try {
            const dataDir = path.dirname(this.contentConfigPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            config.metadata.last_updated = new Date().toISOString().split('T')[0];
            config.metadata.total_photos = config.content.photos.length;
            config.metadata.total_videos = config.content.videos.length;
            config.metadata.total_publications = config.content.publications?.length || 0;

            fs.writeFileSync(this.contentConfigPath, JSON.stringify(config, null, 2));
            console.log('✅ Content configuration saved to', this.contentConfigPath);
        } catch (error) {
            console.error('❌ Error saving config:', error);
        }
    }

    // Get content by tags
    getContentByTags(tags, type = 'all') {
        const config = this.loadConfig();
        let content = [];

        if (type === 'all' || type === 'photo') {
            content = content.concat(config.content.photos);
        }
        if (type === 'all' || type === 'video') {
            content = content.concat(config.content.videos);
        }
        if (type === 'all' || type === 'publication') {
            content = content.concat(config.content.publications || []);
        }

        // Filter by tags
        const filteredContent = content.filter(item => 
            tags.some(tag => item.tags.includes(tag))
        );

        return filteredContent;
    }

    // Get featured content
    getFeaturedContent(type = 'all') {
        const config = this.loadConfig();
        let content = [];

        if (type === 'all' || type === 'publication') {
            content = content.concat(
                (config.content.publications || []).filter(pub => pub.featured === true)
            );
        }

        return content;
    }

    // Generate carousel JavaScript for a specific set of tags
    generateCarouselCode(carouselId, tags, type = 'all') {
        const content = this.getContentByTags(tags, type);
        const config = this.loadConfig();
        const carouselConfig = config.carousels[carouselId] || {};

        const jsCode = `
        // ${carouselConfig.name || carouselId} carousel data - Auto-generated
        // Last updated: ${config.metadata.last_updated}
        const ${carouselId.replace(/-/g, '')}CarouselData = ${JSON.stringify(content, null, 8)};
        
        // Carousel configuration
        const ${carouselId.replace(/-/g, '')}Config = ${JSON.stringify(carouselConfig, null, 8)};`;

        return jsCode;
    }

    // Update main index.html with photo carousel data
    updateMainCarousel() {
        try {
            if (!fs.existsSync(this.indexHtmlPath)) {
                console.error('❌ index.html not found');
                return false;
            }

            let html = fs.readFileSync(this.indexHtmlPath, 'utf8');
            
            // Generate photo data for main carousel
            const config = this.loadConfig();
            const aboutMePhotos = this.getContentByTags(['about-me'], 'photo');
            
            const photoData = aboutMePhotos.map(photo => ({
                filename: photo.filename,
                description: photo.description,
                location: photo.location,
                fallback: `https://via.placeholder.com/400x400/${photo.fallback_color.replace('#', '')}/white?text=${photo.fallback_text}`
            }));

            // Generate featured publications data
            const featuredPubs = this.getFeaturedContent('publication');

            const newPhotoCode = `        // Photo carousel data - Auto-generated by photo-manager.js
        // Last updated: ${config.metadata.last_updated}
        const photoData = ${JSON.stringify(photoData, null, 12)};

        // Carousel settings
        const carouselSettings = ${JSON.stringify({
            rotation_speed: 8000,
            transition_effect: "fade",
            auto_start: true,
            random_start: true,
            pause_on_hover: true
        }, null, 12)};`;

            const newFeaturedCode = `        // Featured publications data - loaded from content.json
        const featuredPublications = ${JSON.stringify(featuredPubs, null, 12)};`;

            // Find and replace photo carousel data
            const photoDataRegex = /\/\/ Photo carousel data[\s\S]*?const carouselSettings = \{[\s\S]*?\};/;
            
            if (photoDataRegex.test(html)) {
                html = html.replace(photoDataRegex, newPhotoCode.trim());
                console.log('✅ Photo carousel updated in index.html');
            } else {
                console.log('⚠️  Could not find photo carousel section in index.html');
            }

            // Find and replace featured publications data
            const featuredDataRegex = /\/\/ Featured publications data[\s\S]*?const featuredPublications = \[[\s\S]*?\];/;
            
            if (featuredDataRegex.test(html)) {
                html = html.replace(featuredDataRegex, newFeaturedCode.trim());
                console.log('✅ Featured publications updated in index.html');
            } else {
                console.log('⚠️  Could not find featured publications section in index.html');
            }

            fs.writeFileSync(this.indexHtmlPath, html);
            return true;

        } catch (error) {
            console.error('❌ Error updating index.html:', error);
            return false;
        }
    }

    // Update a research page with carousel data
    updateResearchPage(pageId, tags, type = 'mixed') {
        const pagePath = path.join(this.researchPagesDir, `${pageId}.html`);
        
        if (!fs.existsSync(pagePath)) {
            console.log(`⚠️  Research page ${pagePath} not found`);
            return false;
        }

        try {
            let html = fs.readFileSync(pagePath, 'utf8');
            const newCode = this.generateCarouselCode(pageId, tags, type);

            // Convert kebab-case to camelCase for JavaScript variable names
            const jsVarName = pageId.replace(/-(.)/g, (match, letter) => letter.toUpperCase());

            // Find and replace the carousel data section
            const carouselDataRegex = new RegExp(`\\/\\/ ${pageId} carousel data[\\s\\S]*?const ${jsVarName}Config = \\{[\\s\\S]*?\\};`);
            
            if (carouselDataRegex.test(html)) {
                html = html.replace(carouselDataRegex, newCode.trim());
                fs.writeFileSync(pagePath, html);
                console.log(`✅ ${pagePath} updated with new carousel data`);
                return true;
            } else {
                console.log(`⚠️  Could not find carousel data section in ${pagePath}`);
                console.log('📝 Generated code (copy manually):');
                console.log('=====================================');
                console.log(newCode);
                console.log('=====================================');
                return false;
            }
        } catch (error) {
            console.error(`❌ Error updating ${pagePath}:`, error);
            return false;
        }
    }

    // Add new content (photo, video, or publication)
    addContent(contentData) {
        const config = this.loadConfig();
        
        const newContent = {
            id: contentData.id || `${contentData.type}_${Date.now()}`,
            type: contentData.type,
            title: contentData.title || 'New Content',
            description: contentData.description || 'Content description',
            date: contentData.date || new Date().toISOString().split('T')[0],
            tags: contentData.tags || [],
            ...contentData
        };

        if (contentData.type === 'photo') {
            config.content.photos.push(newContent);
        } else if (contentData.type === 'video') {
            config.content.videos.push(newContent);
        } else if (contentData.type === 'publication') {
            config.content.publications = config.content.publications || [];
            config.content.publications.push(newContent);
        }

        this.saveConfig(config);
        console.log('✅ New content added:', newContent.title);
        return newContent;
    }

    // Remove content by ID
    removeContent(contentId) {
        const config = this.loadConfig();
        let removed = false;

        // Check photos
        const photoIndex = config.content.photos.findIndex(item => item.id === contentId);
        if (photoIndex !== -1) {
            config.content.photos.splice(photoIndex, 1);
            removed = true;
        }

        // Check videos
        const videoIndex = config.content.videos.findIndex(item => item.id === contentId);
        if (videoIndex !== -1) {
            config.content.videos.splice(videoIndex, 1);
            removed = true;
        }

        // Check publications
        if (config.content.publications) {
            const pubIndex = config.content.publications.findIndex(item => item.id === contentId);
            if (pubIndex !== -1) {
                config.content.publications.splice(pubIndex, 1);
                removed = true;
            }
        }

        if (removed) {
            this.saveConfig(config);
            console.log('✅ Content removed:', contentId);
            return true;
        } else {
            console.log('❌ Content not found:', contentId);
            return false;
        }
    }

    // List content by tags
    listContentByTags(tags) {
        const config = this.loadConfig();
        console.log(`📋 Content with tags: ${tags.join(', ')}\n`);

        const content = this.getContentByTags(tags);
        
        content.forEach((item, index) => {
            let icon = '📄';
            if (item.type === 'photo') icon = '📸';
            else if (item.type === 'video') icon = '🎥';
            else if (item.type === 'publication') icon = '📖';

            console.log(`${index + 1}. ${icon} ${item.title}`);
            console.log(`   Type: ${item.type}`);
            console.log(`   Description: ${item.description}`);
            console.log(`   Tags: ${item.tags.join(', ')}`);
            console.log(`   Date: ${item.date}`);
            if (item.citations !== undefined) {
                console.log(`   Citations: ${item.citations}`);
            }
            console.log('');
        });

        console.log(`Found ${content.length} items with specified tags`);
    }

    // Update all pages
    updateAllPages() {
        console.log('🔄 Updating all pages with latest content...');
        
        // Update main page
        this.updateMainCarousel();
        
        // Update research pages
        const researchPages = [
            { id: 'chemical-organization-theory', tags: ['cot', 'chemical-organization-theory'] },
            { id: 'quantum-cognition', tags: ['quantum-cognition'] },
            { id: 'mathematical-modeling-wicked-problems', tags: ['wicked-problems', 'mathematical-modeling'] },
            { id: 'foundations-interdisciplinarity', tags: ['interdisciplinarity', 'transdisciplinary'] }
        ];

        researchPages.forEach(page => {
            this.updateResearchPage(page.id, page.tags);
        });

        console.log('✅ All pages updated');
    }

    // Get statistics
    getStats() {
        const config = this.loadConfig();
        
        return {
            photos: config.content.photos.length,
            videos: config.content.videos.length,
            publications: config.content.publications?.length || 0,
            carousels: Object.keys(config.carousels).length,
            total_content: config.content.photos.length + config.content.videos.length + (config.content.publications?.length || 0),
            last_updated: config.metadata.last_updated
        };
    }

    // Show help
    showHelp() {
        console.log(`
🎯 Enhanced Content Manager for Academic Website

Usage: node content-manager.js [command] [options]

Commands:
  list-tags [tag1,tag2,...]    - List content by tags
  generate [carousel-id]       - Generate carousel code for carousel
  update [page-id]             - Update specific research page
  update-main                  - Update main index.html carousels
  update-all                   - Update all pages
  add-photo                    - Add new photo (interactive)
  add-video                    - Add new video (interactive)  
  add-publication              - Add new publication (interactive)
  remove [content-id]          - Remove content by ID
  stats                        - Show content statistics
  featured                     - List featured publications
  help                         - Show this help

Examples:
  node content-manager.js list-tags cot,theory
  node content-manager.js update chemical-organization-theory
  node content-manager.js update-main
  node content-manager.js update-all
  node content-manager.js stats

Configuration file: ${this.contentConfigPath}
        `);
    }
}

// Command line interface
function main() {
    const manager = new ContentManager();
    const command = process.argv[2] || 'help';
    const options = process.argv[3];

    switch (command) {
        case 'list-tags':
            if (options) {
                const tags = options.split(',');
                manager.listContentByTags(tags);
            } else {
                console.log('❌ Please specify tags: node content-manager.js list-tags tag1,tag2');
            }
            break;
            
        case 'generate':
            if (options) {
                console.log('📝 Generated carousel code:');
                console.log('=====================================');
                const tags = [options]; // Use carousel ID as tag
                console.log(manager.generateCarouselCode(options, tags));
                console.log('=====================================');
            } else {
                console.log('❌ Please specify carousel ID');
            }
            break;
            
        case 'update':
            if (options) {
                const tags = [options]; // Use page ID as tag
                manager.updateResearchPage(options, tags);
            } else {
                console.log('❌ Please specify page ID');
            }
            break;

        case 'update-main':
            manager.updateMainCarousel();
            break;

        case 'update-all':
            manager.updateAllPages();
            break;

        case 'remove':
            if (options) {
                manager.removeContent(options);
            } else {
                console.log('❌ Please specify content ID');
            }
            break;

        case 'stats':
            const stats = manager.getStats();
            console.log('📊 Content Statistics:');
            console.log(`Photos: ${stats.photos}`);
            console.log(`Videos: ${stats.videos}`);
            console.log(`Publications: ${stats.publications}`);
            console.log(`Carousels: ${stats.carousels}`);
            console.log(`Total Content: ${stats.total_content}`);
            console.log(`Last Updated: ${stats.last_updated}`);
            break;

        case 'featured':
            const featured = manager.getFeaturedContent('publication');
            console.log('📖 Featured Publications:');
            featured.forEach((pub, index) => {
                console.log(`${index + 1}. ${pub.title}`);
                console.log(`   Authors: ${pub.authors}`);
                console.log(`   Journal: ${pub.journal} (${pub.year})`);
                console.log(`   Citations: ${pub.citations}`);
                console.log('');
            });
            break;
            
        case 'help':
        default:
            manager.showHelp();
            break;
    }
}

// Export for use as module
module.exports = ContentManager;

// Run if called directly
if (require.main === module) {
    main();
}