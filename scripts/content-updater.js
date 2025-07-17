#!/usr/bin/env node

/**
 * Content Updater Script for Tomas Veloz Academic Website
 * This script updates all sections of the website with fresh content
 */

const fs = require('fs');
const path = require('path');
const { GoogleScholarScraper } = require('./google-scholar-scraper');

class ContentUpdater {
    constructor() {
        this.dataDir = path.join(__dirname, '../src/data');
        this.ensureDataDirectory();
        
        // Configuration for different content sources
        this.config = {
            googleScholar: {
                userID: 'q7HbZQ4AAAAJ',
                enabled: true,
                updateFrequency: 'daily'
            },
            affiliations: {
                primary: [
                    {
                        name: 'UTEM Chile',
                        title: 'Professor',
                        department: 'Mathematics Department',
                        location: 'Santiago, Chile',
                        url: 'https://www.utem.cl',
                        primary: true
                    },
                    {
                        name: 'VUB Belgium',
                        title: 'Director, SYMP Group',
                        department: 'Centre Leo Apostel (CLEA)',
                        location: 'Brussels, Belgium',
                        url: 'https://clea.research.vub.be',
                        primary: true
                    },
                    {
                        name: 'DICTA Foundation',
                        title: 'Founder & Director',
                        department: 'Interdisciplinary Development',
                        location: 'Chile',
                        url: 'https://dicta.cl',
                        primary: true
                    }
                ],
                secondary: [
                    {
                        name: 'UM6P Morocco',
                        title: 'Visiting Researcher',
                        department: 'Institute for Advanced Studies',
                        location: 'Morocco',
                        period: 'July - December 2025',
                        url: 'https://ias.um6p.ma'
                    }
                ]
            },
            researchAreas: [
                {
                    name: 'Chemical Organization Theory',
                    description: 'Developing mathematical frameworks for analyzing self-organizing systems using reaction networks',
                    keywords: ['COT', 'reaction networks', 'self-organization', 'mathematical modeling'],
                    color: 'blue'
                },
                {
                    name: 'Quantum Cognition',
                    description: 'Applying quantum structures to model cognitive and linguistic phenomena',
                    keywords: ['quantum theory', 'cognition', 'language', 'Hilbert space'],
                    color: 'purple'
                },
                {
                    name: 'Reaction Networks',
                    description: 'Mathematical modeling of complex adaptive systems and emergent phenomena',
                    keywords: ['complex systems', 'emergence', 'dynamics', 'stability'],
                    color: 'green'
                },
                {
                    name: 'Interdisciplinary Science',
                    description: 'Bridging physics, mathematics, cognitive science, and complex systems',
                    keywords: ['interdisciplinary', 'collaboration', 'integration', 'synthesis'],
                    color: 'orange'
                }
            ]
        };
    }

    ensureDataDirectory() {
        if (!fs.existsSync(this.dataDir)) {
            fs.mkdirSync(this.dataDir, { recursive: true });
            console.log(`Created data directory: ${this.dataDir}`);
        }
    }

    async updateGoogleScholarData() {
        try {
            console.log('🔄 Updating Google Scholar data...');
            
            const scraper = new GoogleScholarScraper(this.config.googleScholar.userID);
            const scholarData = await scraper.scrapeProfile();
            
            if (scholarData && scholarData.stats) {
                console.log(`✅ Scholar data updated: ${scholarData.stats.totalCitations} citations, ${scholarData.stats.totalPublications} publications`);
                
                // Save raw scholar data
                this.saveData('scholar-raw', scholarData);
                
                // Process and enhance the data
                const processedData = this.processScholarData(scholarData);
                this.saveData('publications', processedData);
                
                return processedData;
            } else {
                console.log('⚠️  Using fallback Google Scholar data');
                return this.getFallbackScholarData();
            }
            
        } catch (error) {
            console.error('❌ Error updating Google Scholar data:', error);
            return this.getFallbackScholarData();
        }
    }

    processScholarData(rawData) {
        const currentYear = new Date().getFullYear();
        
        return {
            stats: {
                totalCitations: rawData.stats.totalCitations || 1147,
                totalPublications: rawData.stats.totalPublications || 52,
                hIndex: rawData.stats.hIndex || 20,
                i10Index: rawData.stats.i10Index || 35
            },
            publications: rawData.publications.map(pub => ({
                ...pub,
                isNew: pub.year >= currentYear - 1,
                isRecent: pub.year >= currentYear - 3,
                category: this.categorizePublication(pub),
                relevanceScore: this.calculateRelevanceScore(pub)
            })).sort((a, b) => b.year - a.year || b.citations - a.citations),
            profile: rawData.profile || {
                name: 'Tomas Veloz',
                affiliation: 'Universidad Tecnologica Metropolitana/Vrije Universiteit Brussel',
                verifiedEmail: 'vub.ac.be'
            },
            lastUpdated: new Date().toISOString(),
            metadata: {
                source: 'Google Scholar',
                processingDate: new Date().toISOString(),
                dataQuality: this.assessDataQuality(rawData)
            }
        };
    }

    categorizePublication(pub) {
        const title = pub.title.toLowerCase();
        const journal = pub.journal.toLowerCase();
        
        if (title.includes('chemical organization') || title.includes('reaction network')) {
            return 'chemical-organization-theory';
        } else if (title.includes('quantum') && (title.includes('cognition') || title.includes('concept'))) {
            return 'quantum-cognition';
        } else if (title.includes('complex') || title.includes('system')) {
            return 'complex-systems';
        } else if (title.includes('interdisciplinary') || title.includes('collaboration')) {
            return 'interdisciplinary';
        } else {
            return 'other';
        }
    }

    calculateRelevanceScore(pub) {
        let score = 0;
        
        // Recent publications get higher scores
        const yearScore = Math.max(0, (pub.year - 2020) * 10);
        
        // Citations contribute to score
        const citationScore = Math.min(pub.citations * 2, 100);
        
        // Journal quality (simplified)
        const journalScore = this.getJournalScore(pub.journal);
        
        return Math.min(yearScore + citationScore + journalScore, 100);
    }

    getJournalScore(journal) {
        const highImpactJournals = ['nature', 'science', 'systems', 'complexity', 'plos'];
        const journalLower = journal.toLowerCase();
        
        for (const highImpact of highImpactJournals) {
            if (journalLower.includes(highImpact)) {
                return 30;
            }
        }
        
        return 10;
    }

    assessDataQuality(rawData) {
        let quality = 'good';
        
        if (!rawData.stats || rawData.stats.totalCitations === 0) {
            quality = 'poor';
        } else if (rawData.publications.length < 10) {
            quality = 'fair';
        } else if (rawData.publications.length >= 20 && rawData.stats.totalCitations > 500) {
            quality = 'excellent';
        }
        
        return quality;
    }

    getFallbackScholarData() {
        return {
            stats: {
                totalCitations: 1147,
                totalPublications: 52,
                hIndex: 20,
                i10Index: 35
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
                    category: 'chemical-organization-theory',
                    relevanceScore: 85
                }
            ],
            profile: {
                name: 'Tomas Veloz',
                affiliation: 'Universidad Tecnologica Metropolitana/Vrije Universiteit Brussel',
                verifiedEmail: 'vub.ac.be'
            },
            lastUpdated: new Date().toISOString(),
            metadata: {
                source: 'Fallback Data',
                processingDate: new Date().toISOString(),
                dataQuality: 'fallback'
            }
        };
    }

    async updateProjectsAndAwards() {
        console.log('🔄 Updating projects and awards...');
        
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        
        const data = {
            currentProjects: [
                {
                    id: 'um6p-residency',
                    title: 'UM6P Institute for Advanced Studies Residency',
                    organization: 'Mohammed VI Polytechnic University',
                    location: 'Morocco',
                    period: 'July - December 2025',
                    status: 'upcoming',
                    category: 'research_residency',
                    description: 'Research residency focusing on goal-directedness and metasystem transitions',
                    keywords: ['goal-directedness', 'metasystem transitions', 'Morocco', 'residency'],
                    priority: 'high',
                    visibility: 'public'
                },
                {
                    id: 'iqsa-2024',
                    title: 'IQSA 2024 Conference Organization',
                    organization: 'International Quantum Structures Association',
                    location: 'VUB, Brussels',
                    period: '2024',
                    status: 'ongoing',
                    category: 'conference_organization',
                    description: 'Main organizer of the biennial IQSA conference at VUB',
                    role: 'Main Organizer',
                    keywords: ['IQSA', 'quantum structures', 'conference', 'organization'],
                    priority: 'high',
                    visibility: 'public'
                },
                {
                    id: 'dicta-development',
                    title: 'DICTA Foundation Development',
                    organization: 'DICTA Foundation',
                    location: 'Chile',
                    period: 'Ongoing',
                    status: 'ongoing',
                    category: 'foundation_work',
                    description: 'Leading interdisciplinary projects with social impact',
                    keywords: ['interdisciplinary', 'social impact', 'foundation', 'Chile'],
                    priority: 'high',
                    visibility: 'public'
                }
            ],
            awards: [
                {
                    id: 'iqsa-secretary',
                    title: 'IQSA Secretary Appointment',
                    organization: 'International Quantum Structures Association',
                    year: 2022,
                    category: 'professional_appointment',
                    description: 'Appointed as Secretary of the prestigious biennial meeting organization',
                    significance: 'international',
                    keywords: ['IQSA', 'secretary', 'quantum structures', 'appointment']
                },
                {
                    id: 'templeton-grant',
                    title: 'Templeton Foundation Grant',
                    organization: 'John Templeton Foundation',
                    period: '2020-2023',
                    category: 'research_grant',
                    description: 'Co-PI for "The Origins of Goal-Directedness" project with Francis Heylighen',
                    amount: 'Substantial',
                    collaborators: ['Francis Heylighen'],
                    significance: 'international',
                    keywords: ['Templeton', 'goal-directedness', 'grant', 'collaboration']
                },
                {
                    id: 'airforce-grant',
                    title: 'US Air Force Research Grant',
                    organization: 'US Air Force',
                    year: 2020,
                    category: 'research_grant',
                    description: 'Research leader for epidemiological modeling team during COVID-19',
                    role: 'Research Leader',
                    significance: 'national',
                    keywords: ['Air Force', 'epidemiology', 'COVID-19', 'modeling']
                }
            ],
            lastUpdated: new Date().toISOString(),
            metadata: {
                totalProjects: 3,
                totalAwards: 3,
                updateFrequency: 'weekly'
            }
        };
        
        this.saveData('projects-awards', data);
        console.log('✅ Projects and awards updated');
        return data;
    }

    async updateEventsAndDissemination() {
        console.log('🔄 Updating events and dissemination...');
        
        const data = {
            upcomingEvents: [
                {
                    id: 'um6p-residency-2025',
                    title: 'UM6P Research Residency',
                    type: 'research_residency',
                    location: 'Mohammed VI Polytechnic University, Morocco',
                    date: 'July - December 2025',
                    status: 'confirmed',
                    description: 'Research residency focusing on goal-directedness and metasystem transitions',
                    category: 'research',
                    visibility: 'public',
                    priority: 'high'
                }
            ],
            recentEvents: [
                {
                    id: 'cot-music-2023',
                    title: 'COT x Music Seminar Series',
                    type: 'seminar_series',
                    location: 'CLEA/VUB',
                    date: '2023',
                    status: 'completed',
                    description: 'Introduction to Chemical Organization Theory through musical applications',
                    category: 'dissemination',
                    audience: 'academic',
                    impact: 'medium'
                },
                {
                    id: 'academic-tour-2024',
                    title: 'Academic Tour: 5 Months, 4 Continents',
                    type: 'academic_tour',
                    location: 'Multiple Institutions',
                    date: '2024-2025',
                    status: 'ongoing',
                    description: 'International academic tour visiting collaborators and institutions across Europe, Asia, and the Americas',
                    category: 'networking',
                    audience: 'international',
                    impact: 'high'
                },
                {
                    id: 'bcam-workshop-2024',
                    title: 'Goal-Directedness Workshop',
                    type: 'workshop',
                    location: 'BCAM, Bilbao',
                    date: '2024',
                    status: 'completed',
                    description: 'Theoretical and experimental approaches to goal-directed behavior, funded by John Templeton Foundation',
                    category: 'research',
                    funding: 'John Templeton Foundation',
                    audience: 'international',
                    impact: 'high'
                }
            ],
            disseminationActivities: [
                {
                    id: 'interdisciplinaria-magazine',
                    title: 'INTERDISCIPLINARIA Magazine',
                    type: 'magazine',
                    platform: 'DICTA Foundation',
                    status: 'ongoing',
                    description: 'Editorial leadership of interdisciplinary magazine showcasing research profiles',
                    audience: 'general_public',
                    languages: ['Spanish', 'English'],
                    impact: 'medium'
                },
                {
                    id: 'medium-blog',
                    title: 'Medium Blog',
                    type: 'blog',
                    platform: 'Medium',
                    status: 'active',
                    description: 'Regular articles on interdisciplinary science and philosophy',
                    audience: 'academic_public',
                    frequency: 'irregular',
                    impact: 'medium'
                }
            ],
            lastUpdated: new Date().toISOString(),
            metadata: {
                totalUpcoming: 1,
                totalRecent: 3,
                totalDissemination: 2
            }
        };
        
        this.saveData('events', data);
        console.log('✅ Events and dissemination updated');
        return data;
    }

    async updateBlogContent() {
        console.log('🔄 Updating blog content...');
        
        const data = {
            writings: [
                {
                    id: 'ai-spirit-transformations',
                    title: 'The Three Transformations of the AI-spirit',
                    type: 'medium_article',
                    platform: 'Medium',
                    date: '2023-11-07',
                    url: 'https://medium.com/@tveloz/the-three-transformations-of-the-ai-spitrit-2aba1f5ad2a1',
                    description: 'Exploring the conceptual foundations of "play" through bracketing and immersion in AI context',
                    category: 'philosophical_essay',
                    keywords: ['AI', 'philosophy', 'play', 'bracketing', 'immersion'],
                    readingTime: '5 min',
                    status: 'published'
                },
                {
                    id: 'interdisciplinaria-launch',
                    title: 'INTERDISCIPLINARIA Magazine Launch',
                    type: 'magazine_launch',
                    platform: 'DICTA Foundation',
                    date: '2024-01-01',
                    url: 'https://dicta.cl',
                    description: 'Relaunched foundation magazine focused on interdisciplinary profiles and social impact',
                    category: 'magazine',
                    keywords: ['interdisciplinary', 'magazine', 'DICTA', 'social impact'],
                    languages: ['Spanish', 'English'],
                    status: 'active'
                },
                {
                    id: 'cot-music-introduction',
                    title: 'COT x Music Series Introduction',
                    type: 'seminar_content',
                    platform: 'CLEA/VUB',
                    date: '2023-06-01',
                    url: 'https://clea.research.vub.be/cot-x-music-1-introduction-dr-tomas-veloz',
                    description: 'Introduction to Chemical Organization Theory through musical applications',
                    category: 'educational_content',
                    keywords: ['COT', 'music', 'education', 'theory'],
                    format: 'video_seminar',
                    status: 'published'
                }
            ],
            platforms: [
                {
                    name: 'Medium',
                    url: 'https://medium.com/@tveloz',
                    status: 'active',
                    followers: 'growing',
                    postFrequency: 'irregular'
                },
                {
                    name: 'DICTA Foundation',
                    url: 'https://dicta.cl',
                    status: 'active',
                    role: 'Editorial Director',
                    content: 'magazine'
                }
            ],
            lastUpdated: new Date().toISOString(),
            metadata: {
                totalWritings: 3,
                activePlatforms: 2,
                categories: ['philosophical_essay', 'magazine', 'educational_content']
            }
        };
        
        this.saveData('blog', data);
        console.log('✅ Blog content updated');
        return data;
    }

    async updateCollaborationInfo() {
        console.log('🔄 Updating collaboration information...');
        
        const data = {
            opportunities: [
                {
                    id: 'phd-supervision',
                    type: 'supervision',
                    title: 'PhD & Research Supervision',
                    description: 'Supervising graduate students in interdisciplinary research projects involving complex systems, quantum cognition, and reaction networks',
                    areas: ['complex systems', 'quantum cognition', 'reaction networks', 'interdisciplinary science'],
                    requirements: ['Strong mathematical background', 'Interest in interdisciplinary research', 'Programming skills (preferred)'],
                    availability: 'ongoing',
                    locations: ['VUB Brussels', 'UTEM Chile'],
                    contact: 'tomas.veloz@vub.ac.be'
                },
                {
                    id: 'research-collaboration',
                    type: 'research_collaboration',
                    title: 'Research Collaboration',
                    description: 'Collaborating with researchers worldwide on interdisciplinary projects bridging mathematics, physics, and cognitive science',
                    areas: ['mathematics', 'physics', 'cognitive science', 'complex systems'],
                    preferredAreas: ['Chemical Organization Theory', 'Quantum Cognition', 'Reaction Networks'],
                    availability: 'ongoing',
                    collaborationTypes: ['Joint publications', 'Grant applications', 'Conference presentations', 'Visiting positions'],
                    contact: 'tomas.veloz@vub.ac.be'
                },
                {
                    id: 'consulting-services',
                    type: 'consulting',
                    title: 'Consulting Services',
                    description: 'Providing expertise in AI, complex systems, and interdisciplinary research for organizations and institutions',
                    areas: ['AI applications', 'complex systems modeling', 'interdisciplinary research design', 'academic strategy'],
                    clientTypes: ['Academic institutions', 'Research organizations', 'Technology companies', 'Government agencies'],
                    availability: 'selective',
                    contact: 'tomas.veloz@vub.ac.be'
                },
                {
                    id: 'dicta-collaboration',
                    type: 'foundation_work',
                    title: 'DICTA Foundation Projects',
                    description: 'Leading interdisciplinary projects with social impact through the Foundation for Interdisciplinary Development of Science, Technology and Arts',
                    areas: ['social impact', 'interdisciplinary collaboration', 'sustainable development', 'technology transfer'],
                    projectTypes: ['Research initiatives', 'Educational programs', 'Community outreach', 'International partnerships'],
                    availability: 'ongoing',
                    contact: 'https://dicta.cl'
                }
            ],
            contact: {
                primary: {
                    email: 'tomas.veloz@vub.ac.be',
                    institution: 'VUB Brussels',
                    position: 'Director, Systemic Modeling Group'
                },
                secondary: {
                    institution: 'UTEM Chile',
                    position: 'Professor, Mathematics Department'
                },
                foundation: {
                    organization: 'DICTA Foundation',
                    position: 'Founder & Director',
                    website: 'https://dicta.cl'
                }
            },
            currentCapacity: {
                phdStudents: 'accepting',
                collaborations: 'selective',
                consulting: 'limited',
                foundationWork: 'ongoing'
            },
            lastUpdated: new Date().toISOString(),
            metadata: {
                totalOpportunities: 4,
                activeCollaborations: 'multiple',
                responseTime: '48-72 hours'
            }
        };
        
        this.saveData('collaboration', data);
        console.log('✅ Collaboration information updated');
        return data;
    }

    async updateAboutSection() {
        console.log('🔄 Updating about section...');
        
        const data = {
            profile: {
                name: 'Dr. Tomás Veloz',
                title: 'Full Stack Interdisciplinary Scientist',
                tagline: 'Bridging Physics, Mathematics, Cognitive Science & Complex Systems',
                bio: {
                    short: 'Leading Chilean interdisciplinary scientist bridging physics, mathematics, cognitive sciences, and complex systems research.',
                    medium: 'Dr. Tomás Veloz is a leading Chilean interdisciplinary scientist who bridges physics, mathematics, cognitive sciences, and complex systems research. He currently serves as Professor in the Mathematics Department at Universidad Tecnológica Metropolitana (UTEM) in Chile while simultaneously directing the "Systemic Modeling and Applications" (SYMP) research group at the Centre Leo Apostel, Vrije Universiteit Brussel in Belgium.',
                    full: 'Dr. Tomás Veloz is a leading Chilean interdisciplinary scientist who bridges physics, mathematics, cognitive sciences, and complex systems research. He currently serves as Professor in the Mathematics Department at Universidad Tecnológica Metropolitana (UTEM) in Chile while simultaneously directing the "Systemic Modeling and Applications" (SYMP) research group at the Centre Leo Apostel, Vrije Universiteit Brussel in Belgium. His research focuses on interdisciplinary mathematical modeling with main research areas in Chemical Organization Theory, where he has proven mathematical results such as the decomposition theorem and the existence of quantum-like organizational structures, and quantum cognition, where he has developed methods to represent collections of concepts in a Hilbert Space. Additionally, he is the founder and director of the Foundation for Interdisciplinary Development of Science, Technology and Arts (DICTA), a Chilean foundation which collaborates with CLEA and several other institutions worldwide to generate and disseminate integrated knowledge with social impact.'
                }
            },
            affiliations: this.config.affiliations,
            researchAreas: this.config.researchAreas,
            contact: {
                primary: 'tomas.veloz@vub.ac.be',
                social: {
                    linkedin: 'https://be.linkedin.com/in/tomas-veloz-028b6717',
                    googleScholar: 'https://scholar.google.com/citations?user=q7HbZQ4AAAAJ',
                    medium: 'https://medium.com/@tveloz',
                    dicta: 'https://dicta.cl'
                }
            },
            lastUpdated: new Date().toISOString(),
            metadata: {
                profileVersion: '2.0',
                lastMajorUpdate: new Date().toISOString()
            }
        };
        
        this.saveData('about', data);
        console.log('✅ About section updated');
        return data;
    }

    async updateAllContent() {
        console.log('🚀 Starting comprehensive content update...');
        
        const updateResults = {};
        
        try {
            // Update all sections
            updateResults.about = await this.updateAboutSection();
            updateResults.publications = await this.updateGoogleScholarData();
            updateResults.projectsAwards = await this.updateProjectsAndAwards();
            updateResults.events = await this.updateEventsAndDissemination();
            updateResults.blog = await this.updateBlogContent();
            updateResults.collaboration = await this.updateCollaborationInfo();
            
            // Create update summary
            const updateSummary = {
                timestamp: new Date().toISOString(),
                sections: Object.keys(updateResults),
                success: true,
                details: updateResults,
                nextUpdate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4 hours
            };
            
            this.saveData('update-summary', updateSummary);
            
            console.log('✅ All content updated successfully!');
            console.log(`📊 Updated ${Object.keys(updateResults).length} sections`);
            
            return updateSummary;
            
        } catch (error) {
            console.error('❌ Error during content update:', error);
            
            const errorSummary = {
                timestamp: new Date().toISOString(),
                success: false,
                error: error.message,
                partialResults: updateResults
            };
            
            this.saveData('update-error', errorSummary);
            throw error;
        }
    }

    saveData(filename, data) {
        const filePath = path.join(this.dataDir, `${filename}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`💾 Data saved to ${filePath}`);
    }

    loadData(filename) {
        const filePath = path.join(this.dataDir, `${filename}.json`);
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        }
        return null;
    }

    async generateNewContentNotifications() {
        console.log('🔍 Checking for new content...');
        
        const publications = this.loadData('publications');
        const newItems = [];
        
        if (publications && publications.publications) {
            const newPubs = publications.publications.filter(pub => pub.isNew);
            newItems.push(...newPubs.map(pub => ({
                type: 'publication',
                title: pub.title,
                data: pub,
                confidence: 95,
                suggestedPost: `🎉 New publication: "${pub.title}" published in ${pub.journal} (${pub.year})! Excited to share this work with the research community. #Research #AcademicPublishing #${pub.journal.replace(/\s+/g, '')}`
            })));
        }
        
        if (newItems.length > 0) {
            const notification = {
                timestamp: new Date().toISOString(),
                itemsCount: newItems.length,
                items: newItems,
                requiresApproval: true
            };
            
            this.saveData('new-content-notification', notification);
            console.log(`📢 Found ${newItems.length} new items requiring approval`);
            
            return notification;
        }
        
        return null;
    }
}

// Main execution
async function main() {
    const updater = new ContentUpdater();
    
    try {
        const updateResults = await updater.updateAllContent();
        
        // Check for new content needing approval
        const newContentNotification = await updater.generateNewContentNotifications();
        
        if (newContentNotification) {
            console.log('📧 New content notification generated');
        }
        
        console.log('🎉 Content update completed successfully!');
        
    } catch (error) {
        console.error('💥 Content update failed:', error);
        process.exit(1);
    }
}

// Export for use in other modules
module.exports = { ContentUpdater };

// Run if this file is executed directly
if (require.main === module) {
    main();
}