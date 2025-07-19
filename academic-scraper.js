#!/usr/bin/env node

/**
 * Academic Content Scraper with Email Notifications
 * Monitors Google Scholar, CV, and other sources for updates
 * Sends email notifications for approval/rejection of changes
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class AcademicScraper {
    constructor() {
        this.configPath = 'data/scraper-config.json';
        this.pendingUpdatesPath = 'data/pending-updates.json';
        this.cvPath = 'assets/cv-tomas-veloz.pdf';
        this.contentPath = 'data/content.json';
        this.emailConfig = {
            recipient: 'tomas.veloz@vub.ac.be',
            sender: 'academic-scraper@yourwebsite.com'
        };
    }

    // Load scraper configuration
    loadConfig() {
        try {
            if (fs.existsSync(this.configPath)) {
                return JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
            } else {
                return this.createDefaultConfig();
            }
        } catch (error) {
            console.error('❌ Error loading scraper config:', error);
            return this.createDefaultConfig();
        }
    }

    // Create default scraper configuration
    createDefaultConfig() {
        const defaultConfig = {
            sources: {
                google_scholar: {
                    enabled: true,
                    url: "https://scholar.google.com/citations?user=q7HbZQ4AAAAJ",
                    check_frequency: "daily", // daily, weekly, monthly
                    last_check: null,
                    last_citation_count: 1147,
                    last_publication_count: 52
                },
                cv_monitoring: {
                    enabled: true,
                    check_frequency: "weekly",
                    last_check: null,
                    last_hash: null
                },
                orcid: {
                    enabled: false,
                    id: "0000-0000-0000-0000", // Replace with actual ORCID
                    check_frequency: "weekly",
                    last_check: null
                },
                researchgate: {
                    enabled: false,
                    profile: "Tomas-Veloz",
                    check_frequency: "weekly", 
                    last_check: null
                }
            },
            notifications: {
                email_enabled: true,
                slack_enabled: false,
                auto_approve_threshold: {
                    citation_increase: 10, // Auto-approve if citations increase by less than this
                    minor_cv_changes: true // Auto-approve formatting changes
                }
            },
            monitoring: {
                citation_changes: true,
                new_publications: true,
                co_author_publications: true,
                cv_changes: true,
                affiliation_changes: true
            },
            metadata: {
                last_full_scan: null,
                total_notifications_sent: 0,
                pending_approvals: 0
            }
        };

        this.saveConfig(defaultConfig);
        return defaultConfig;
    }

    // Save configuration
    saveConfig(config) {
        try {
            const dataDir = path.dirname(this.configPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            config.metadata.last_updated = new Date().toISOString();
            fs.writeFileSync(this.configPath, JSON.stringify(config, null, 2));
        } catch (error) {
            console.error('❌ Error saving scraper config:', error);
        }
    }

    // Load pending updates
    loadPendingUpdates() {
        try {
            if (fs.existsSync(this.pendingUpdatesPath)) {
                return JSON.parse(fs.readFileSync(this.pendingUpdatesPath, 'utf8'));
            } else {
                return { updates: [] };
            }
        } catch (error) {
            console.error('❌ Error loading pending updates:', error);
            return { updates: [] };
        }
    }

    // Save pending updates
    savePendingUpdates(updates) {
        try {
            const dataDir = path.dirname(this.pendingUpdatesPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }

            fs.writeFileSync(this.pendingUpdatesPath, JSON.stringify(updates, null, 2));
        } catch (error) {
            console.error('❌ Error saving pending updates:', error);
        }
    }

    // Generate update ID
    generateUpdateId() {
        return crypto.randomBytes(8).toString('hex');
    }

    // Check CV for changes
    async checkCVChanges() {
        console.log('🔍 Checking CV for changes...');
        
        if (!fs.existsSync(this.cvPath)) {
            console.log('⚠️  CV file not found');
            return null;
        }

        try {
            const cvContent = fs.readFileSync(this.cvPath);
            const currentHash = crypto.createHash('md5').update(cvContent).digest('hex');
            
            const config = this.loadConfig();
            const lastHash = config.sources.cv_monitoring.last_hash;

            if (lastHash && lastHash !== currentHash) {
                const update = {
                    id: this.generateUpdateId(),
                    type: 'cv_change',
                    source: 'CV File',
                    detected_at: new Date().toISOString(),
                    description: 'CV file has been modified',
                    details: {
                        old_hash: lastHash,
                        new_hash: currentHash,
                        file_path: this.cvPath
                    },
                    confidence: 'high',
                    auto_approve: false,
                    status: 'pending'
                };

                console.log('📄 CV changes detected');
                return update;
            } else {
                // Update hash for first time or no changes
                config.sources.cv_monitoring.last_hash = currentHash;
                config.sources.cv_monitoring.last_check = new Date().toISOString();
                this.saveConfig(config);
                console.log('✅ CV unchanged');
                return null;
            }
        } catch (error) {
            console.error('❌ Error checking CV:', error);
            return null;
        }
    }

    // Simulate Google Scholar scraping
    // async checkGoogleScholar() {
    //     console.log('🎓 Checking Google Scholar for updates...');
        
    //     // Simulate finding new publications or citation changes
    //     const simulatedUpdates = [
    //         {
    //             id: this.generateUpdateId(),
    //             type: 'new_publication',
    //             source: 'Google Scholar',
    //             detected_at: new Date().toISOString(),
    //             description: 'New publication detected',
    //             details: {
    //                 title: 'Advanced Chemical Organization Theory Applications',
    //                 authors: 'T. Veloz, F. Heylighen, S. Beigi',
    //                 journal: 'Nature Computational Science',
    //                 year: 2025,
    //                 citations: 0,
    //                 url: 'https://doi.org/10.1038/s43588-025-00123-4'
    //             },
    //             confidence: 'high',
    //             auto_approve: false,
    //             status: 'pending'
    //         },
    //         {
    //             id: this.generateUpdateId(),
    //             type: 'citation_increase',
    //             source: 'Google Scholar',
    //             detected_at: new Date().toISOString(),
    //             description: 'Citation count increased',
    //             details: {
    //                 publication_title: 'Reaction networks and evolutionary game theory',
    //                 old_citations: 145,
    //                 new_citations: 152,
    //                 increase: 7
    //             },
    //             confidence: 'high',
    //             auto_approve: true, // Small citation increases can be auto-approved
    //             status: 'pending'
    //         }
    //     ];

    //     console.log(`📊 Found ${simulatedUpdates.length} potential updates`);
    //     return simulatedUpdates;
    // }

    // Check all sources for updates
    async performFullScan() {
        console.log('🔍 Starting full academic content scan...');
        
        const allUpdates = [];
        const config = this.loadConfig();

        // Check CV changes
        if (config.sources.cv_monitoring.enabled) {
            const cvUpdate = await this.checkCVChanges();
            if (cvUpdate) allUpdates.push(cvUpdate);
        }

        // Check Google Scholar
        if (config.sources.google_scholar.enabled) {
            const scholarUpdates = await this.checkGoogleScholar();
            allUpdates.push(...scholarUpdates);
        }

        // Update scan metadata
        config.metadata.last_full_scan = new Date().toISOString();
        this.saveConfig(config);

        if (allUpdates.length > 0) {
            console.log(`📬 Found ${allUpdates.length} updates requiring attention`);
            await this.processUpdates(allUpdates);
        } else {
            console.log('✅ No updates found');
        }

        return allUpdates;
    }

    // Process and categorize updates
    async processUpdates(updates) {
        const pendingData = this.loadPendingUpdates();
        
        for (const update of updates) {
            // Check if auto-approval is possible
            if (this.shouldAutoApprove(update)) {
                console.log(`✅ Auto-approving: ${update.description}`);
                await this.approveUpdate(update.id, update);
            } else {
                console.log(`📮 Adding to pending: ${update.description}`);
                pendingData.updates.push(update);
            }
        }

        this.savePendingUpdates(pendingData);
        
        // Send email notification
        const pendingCount = pendingData.updates.filter(u => u.status === 'pending').length;
        if (pendingCount > 0) {
            await this.sendEmailNotification(pendingCount, pendingData.updates);
        }
    }

    // Determine if update should be auto-approved
    shouldAutoApprove(update) {
        const config = this.loadConfig();
        
        if (!config.notifications.auto_approve_threshold) return false;

        switch (update.type) {
            case 'citation_increase':
                const increase = update.details.increase || 0;
                return increase <= config.notifications.auto_approve_threshold.citation_increase;
            
            case 'cv_change':
                return config.notifications.auto_approve_threshold.minor_cv_changes && 
                       update.confidence === 'low';
            
            default:
                return false;
        }
    }

    // Send email notification
    async sendEmailNotification(pendingCount, updates) {
        console.log(`📧 Sending email notification for ${pendingCount} pending updates...`);
        
        const emailContent = this.generateEmailContent(updates);
        
        // In a real implementation, you would use a service like SendGrid, Nodemailer, etc.
        // For now, we'll simulate sending the email
        const emailData = {
            to: this.emailConfig.recipient,
            from: this.emailConfig.sender,
            subject: `🔔 Academic Website: ${pendingCount} Updates Pending Approval`,
            html: emailContent,
            timestamp: new Date().toISOString()
        };

        // Save email to file for debugging (replace with actual email service)
        const emailsDir = 'data/emails';
        if (!fs.existsSync(emailsDir)) {
            fs.mkdirSync(emailsDir, { recursive: true });
        }
        
        const emailFile = path.join(emailsDir, `email-${Date.now()}.json`);
        fs.writeFileSync(emailFile, JSON.stringify(emailData, null, 2));
        
        console.log(`✅ Email notification sent (saved to ${emailFile})`);
        
        // Update notification count
        const config = this.loadConfig();
        config.metadata.total_notifications_sent += 1;
        config.metadata.pending_approvals = pendingCount;
        this.saveConfig(config);
    }

    // Generate email content
    generateEmailContent(updates) {
        const pendingUpdates = updates.filter(u => u.status === 'pending');
        
        let html = `
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; }
                .update-item { border: 1px solid #e5e7eb; margin: 10px 0; padding: 15px; border-radius: 8px; }
                .update-type { font-weight: bold; color: #2563eb; }
                .approve-btn { background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px; }
                .reject-btn { background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
                .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🎓 Academic Website Updates</h1>
                <p>Your AI scraper has detected ${pendingUpdates.length} updates requiring your review</p>
            </div>
            
            <div class="content">
                <h2>Pending Updates:</h2>
        `;

        pendingUpdates.forEach(update => {
            html += `
                <div class="update-item">
                    <div class="update-type">${update.type.replace('_', ' ').toUpperCase()}</div>
                    <h3>${update.description}</h3>
                    <p><strong>Source:</strong> ${update.source}</p>
                    <p><strong>Detected:</strong> ${new Date(update.detected_at).toLocaleString()}</p>
                    <p><strong>Confidence:</strong> ${update.confidence}</p>
                    
                    ${update.type === 'new_publication' ? `
                        <p><strong>Title:</strong> ${update.details.title}</p>
                        <p><strong>Authors:</strong> ${update.details.authors}</p>
                        <p><strong>Journal:</strong> ${update.details.journal} (${update.details.year})</p>
                    ` : ''}
                    
                    ${update.type === 'citation_increase' ? `
                        <p><strong>Publication:</strong> ${update.details.publication_title}</p>
                        <p><strong>Citation Change:</strong> ${update.details.old_citations} → ${update.details.new_citations} (+${update.details.increase})</p>
                    ` : ''}
                    
                    <div style="margin-top: 15px;">
                        <a href="https://yourwebsite.com/admin/approve/${update.id}" class="approve-btn">✅ Approve</a>
                        <a href="https://yourwebsite.com/admin/reject/${update.id}" class="reject-btn">❌ Reject</a>
                    </div>
                </div>
            `;
        });

        html += `
                <div style="margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 8px;">
                    <h3>Quick Actions:</h3>
                    <p>
                        <a href="https://yourwebsite.com/admin/approve-all" style="color: #10b981;">✅ Approve All</a> | 
                        <a href="https://yourwebsite.com/admin/dashboard" style="color: #2563eb;">🔧 Go to Dashboard</a> | 
                        <a href="https://yourwebsite.com/admin/settings" style="color: #6b7280;">⚙️ Notification Settings</a>
                    </p>
                </div>
            </div>
            
            <div class="footer">
                <p>This is an automated message from your Academic Website AI Scraper</p>
                <p>You can manage these settings in your website's admin dashboard</p>
            </div>
        </body>
        </html>
        `;

        return html;
    }

    // Approve an update
    async approveUpdate(updateId, updateData = null) {
        const pendingData = this.loadPendingUpdates();
        const updateIndex = pendingData.updates.findIndex(u => u.id === updateId);
        
        if (updateIndex === -1 && !updateData) {
            console.log(`❌ Update ${updateId} not found`);
            return false;
        }

        const update = updateData || pendingData.updates[updateIndex];
        
        // Apply the update to the content
        await this.applyUpdate(update);
        
        // Remove from pending if it was in pending list
        if (updateIndex !== -1) {
            pendingData.updates.splice(updateIndex, 1);
            this.savePendingUpdates(pendingData);
        }
        
        console.log(`✅ Update approved and applied: ${update.description}`);
        return true;
    }

    // Reject an update
    async rejectUpdate(updateId) {
        const pendingData = this.loadPendingUpdates();
        const updateIndex = pendingData.updates.findIndex(u => u.id === updateId);
        
        if (updateIndex === -1) {
            console.log(`❌ Update ${updateId} not found`);
            return false;
        }

        pendingData.updates.splice(updateIndex, 1);
        this.savePendingUpdates(pendingData);
        
        console.log(`❌ Update rejected and removed: ${updateId}`);
        return true;
    }

    // Apply approved update to content
    async applyUpdate(update) {
        try {
            const contentData = JSON.parse(fs.readFileSync(this.contentPath, 'utf8'));

            switch (update.type) {
                case 'new_publication':
                    // Add new publication to content.json
                    const newPub = {
                        id: `pub_${update.details.title.toLowerCase().replace(/\s+/g, '_')}`,
                        type: 'publication',
                        title: update.details.title,
                        authors: update.details.authors,
                        journal: update.details.journal,
                        year: update.details.year,
                        citations: update.details.citations,
                        tags: ['new', 'recent'],
                        url: update.details.url
                    };
                    
                    contentData.content.publications = contentData.content.publications || [];
                    contentData.content.publications.push(newPub);
                    break;

                case 'citation_increase':
                    // Update citation count for existing publication
                    if (contentData.content.publications) {
                        const pubToUpdate = contentData.content.publications.find(p => 
                            p.title.includes(update.details.publication_title) || 
                            update.details.publication_title.includes(p.title)
                        );
                        if (pubToUpdate) {
                            pubToUpdate.citations = update.details.new_citations;
                        }
                    }
                    break;

                case 'cv_change':
                    // CV changes don't need content.json updates
                    console.log('CV change noted, no content.json update needed');
                    break;
            }

            // Update metadata
            contentData.metadata.last_updated = new Date().toISOString().split('T')[0];
            
            // Save updated content
            fs.writeFileSync(this.contentPath, JSON.stringify(contentData, null, 2));
            console.log('📝 Content database updated');

        } catch (error) {
            console.error('❌ Error applying update:', error);
        }
    }

    // Get dashboard data
    getDashboardData() {
        const config = this.loadConfig();
        const pendingData = this.loadPendingUpdates();
        
        return {
            status: {
                scraper_active: true,
                last_scan: config.metadata.last_full_scan,
                pending_count: pendingData.updates.filter(u => u.status === 'pending').length,
                total_notifications: config.metadata.total_notifications_sent
            },
            pending_updates: pendingData.updates,
            sources: config.sources,
            settings: config.notifications
        };
    }

    // Show help
    showHelp() {
        console.log(`
🤖 Academic Content Scraper

Usage: node academic-scraper.js [command]

Commands:
  scan         - Perform full scan of all sources
  check-cv     - Check CV for changes only
  check-scholar - Check Google Scholar only
  dashboard    - Get dashboard data
  approve [id] - Approve pending update
  reject [id]  - Reject pending update
  list-pending - List all pending updates
  config       - Show current configuration
  help         - Show this help

Examples:
  node academic-scraper.js scan
  node academic-scraper.js approve abc123def
  node academic-scraper.js list-pending

Configuration file: ${this.configPath}
Pending updates: ${this.pendingUpdatesPath}
        `);
    }
}

// Command line interface
async function main() {
    const scraper = new AcademicScraper();
    const command = process.argv[2] || 'help';
    const args = process.argv.slice(3);

    switch (command) {
        case 'scan':
            await scraper.performFullScan();
            break;
            
        case 'check-cv':
            const cvUpdate = await scraper.checkCVChanges();
            if (cvUpdate) {
                console.log('CV changes detected:', cvUpdate);
            } else {
                console.log('No CV changes detected');
            }
            break;
            
        case 'check-scholar':
            const scholarUpdates = await scraper.checkGoogleScholar();
            console.log(`Found ${scholarUpdates.length} Scholar updates:`, scholarUpdates);
            break;
            
        case 'dashboard':
            const dashboardData = scraper.getDashboardData();
            console.log('📊 Dashboard Data:');
            console.log(JSON.stringify(dashboardData, null, 2));
            break;
            
        case 'approve':
            if (args[0]) {
                await scraper.approveUpdate(args[0]);
            } else {
                console.log('❌ Please provide update ID');
            }
            break;
            
        case 'reject':
            if (args[0]) {
                await scraper.rejectUpdate(args[0]);
            } else {
                console.log('❌ Please provide update ID');
            }
            break;
            
        case 'list-pending':
            const pendingData = scraper.loadPendingUpdates();
            console.log(`📋 Pending Updates (${pendingData.updates.length}):`);
            pendingData.updates.forEach((update, index) => {
                console.log(`${index + 1}. [${update.id}] ${update.type}: ${update.description}`);
                console.log(`   Source: ${update.source}, Detected: ${update.detected_at}`);
                console.log(`   Auto-approve: ${update.auto_approve}, Status: ${update.status}`);
                console.log('');
            });
            break;
            
        case 'config':
            const config = scraper.loadConfig();
            console.log('⚙️ Current Configuration:');
            console.log(JSON.stringify(config, null, 2));
            break;
            
        case 'help':
        default:
            scraper.showHelp();
            break;
    }
}

// Export for use as module
module.exports = AcademicScraper;

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}