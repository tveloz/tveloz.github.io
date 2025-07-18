#!/usr/bin/env node

/**
 * Multimedia Content Manager for Academic Website
 * Manages tagged photos and videos for multiple carousels
 */

const fs = require('fs');
const path = require('path');

class ContentManager {
    constructor() {
        this.contentConfigPath = 'data/content.json';
        this.mediaDirectory = 'media/';
        this.picsDirectory = 'pics/';
        this.videosDirectory = 'videos/';
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

    // Create default configuration with tagged content
    createDefaultConfig() {
        const defaultConfig = {
            content: {
                photos: [
                    {
                        id: "conference_agi_2024",
                        filename: "2.png",
                        type: "photo",
                        title: "AGI Conference 2024",
                        description: "Artificial General Intelligence Summit",
                        location: "Panama City, Panama",
                        date: "2024-01-15",
                        tags: ["conference", "presentation", "research", "agi", "about-me"],
                        fallback_color: "#667eea",
                        fallback_text: "Conference+Presentation"
                    },
                    {
                        id: "vub_collaboration_2024",
                        filename: "1.jpg",
                        type: "photo",
                        title: "VUB Research Collaboration",
                        description: "Talk by Richard Solé at UVA (Amsterdam) with Joe from UPD Philippines - SYMP lab collaborations Centre Leo Apostel",
                        location: "UVA Amsterdam, The Netherlands",
                        date: "2024-01-10",
                        tags: ["research", "collaboration", "vub", "symp", "about-me", "interdisciplinarity"],
                        fallback_color: "#764ba2",
                        fallback_text: "Research+Lab"
                    },
                    {
                        id: "profile_photo_2024",
                        filename: "4.jpeg",
                        type: "photo",
                        title: "Profile Photo",
                        description: "Professional headshot",
                        location: "Brussels, Belgium",
                        date: "2024-01-10",
                        tags: ["profile", "about-me"],
                        fallback_color: "#f093fb",
                        fallback_text: "About+me"
                    },
                    {
                        id: "international_collaboration_2024",
                        filename: "3.jpg",
                        type: "photo",
                        title: "International Research Meeting",
                        description: "Research collaboration meeting with international partners",
                        location: "Tokyo, Japan",
                        date: "2024-08-01",
                        tags: ["collaboration", "international", "research", "about-me", "interdisciplinarity"],
                        fallback_color: "#4ade80",
                        fallback_text: "Collaboration"
                    }
                ],
                videos: [
                    {
                        id: "cot_intro_2023",
                        youtube_id: "dQw4w9WgXcQ", // Replace with actual YouTube IDs
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
                        youtube_id: "dQw4w9WgXcQ", // Replace with actual YouTube IDs
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
                        youtube_id: "dQw4w9WgXcQ", // Replace with actual YouTube IDs
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
                        youtube_id: "dQw4w9WgXcQ", // Replace with actual YouTube IDs
                        type: "video",
                        title: "Foundations of Transdisciplinary Research",
                        description: "What makes truly interdisciplinary collaboration possible?",
                        duration: "35:12",
                        date: "2024-05-18",
                        tags: ["interdisciplinarity", "transdisciplinary", "collaboration", "foundations"],
                        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
                    }
                ]
            },
            carousels: {
                "about-me": {
                    name: "About Me Photos",
                    type: "photo",
                    description: "Personal and professional photos"
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
                version: "1.0",
                total_photos: 4,
                total_videos: 4
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

        // Filter by tags
        const filteredContent = content.filter(item => 
            tags.some(tag => item.tags.includes(tag))
        );

        return filteredContent;
    }

    // Generate carousel JavaScript for a specific set of tags
    generateCarouselCode(carouselId, tags, type = 'all') {
        const content = this.getContentByTags(tags, type);
        const config = this.loadConfig();
        const carouselConfig = config.carousels[carouselId] || {};

        const jsCode = `
        // ${carouselConfig.name || carouselId} carousel data - Auto-generated
        // Last updated: ${config.metadata.last_updated}
        const ${carouselId}CarouselData = ${JSON.stringify(content, null, 8)};
        
        // Carousel configuration
        const ${carouselId}Config = ${JSON.stringify(carouselConfig, null, 8)};`;

        return jsCode;
    }

    // Update a research page with carousel data
    updateResearchPage(pageId, tags, type = 'mixed') {
        const pagePath = `research/${pageId}.html`;
        
        if (!fs.existsSync(pagePath)) {
            console.log(`⚠️  Research page ${pagePath} not found`);
            return false;
        }

        try {
            let html = fs.readFileSync(pagePath, 'utf8');
            const newCode = this.generateCarouselCode(pageId, tags, type);

            // Find and replace the carousel data section
            const carouselDataRegex = new RegExp(`\\/\\/ ${pageId} carousel data[\\s\\S]*?const ${pageId}Config = \\{[\\s\\S]*?\\};`);
            
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

    // Add new content (photo or video)
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
        }

        this.saveConfig(config);
        console.log('✅ New content added:', newContent.title);
        return newContent;
    }

    // List content by tags
    listContentByTags(tags) {
        const config = this.loadConfig();
        console.log(`📋 Content with tags: ${tags.join(', ')}\n`);

        const content = this.getContentByTags(tags);
        
        content.forEach((item, index) => {
            const icon = item.type === 'photo' ? '📸' : '🎥';
            console.log(`${index + 1}. ${icon} ${item.title}`);
            console.log(`   Type: ${item.type}`);
            console.log(`   Description: ${item.description}`);
            console.log(`   Tags: ${item.tags.join(', ')}`);
            console.log(`   Date: ${item.date}`);
            console.log('');
        });

        console.log(`Found ${content.length} items with specified tags`);
    }

    // Show help
    showHelp() {
        console.log(`
🎯 Content Manager for Academic Website

Usage: node content-manager.js [command] [options]

Commands:
  list-tags [tag1,tag2,...]    - List content by tags
  generate [carousel-id]       - Generate carousel code for carousel
  update [page-id]             - Update research page with latest content
  add-photo                    - Add new photo (interactive)
  add-video                    - Add new video (interactive)
  help                         - Show this help

Examples:
  node content-manager.js list-tags cot,theory
  node content-manager.js generate chemical-organization-theory
  node content-manager.js update quantum-cognition

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