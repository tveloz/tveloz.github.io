#!/usr/bin/env node

/**
 * Simple Admin API for Academic Website
 * Handles approve/reject requests from email notifications
 * Provides web interface for content management
 */

const express = require('express');
const path = require('path');
const AcademicScraper = require('./academic-scraper');
const ContentManager = require('./content-manager');

class AdminAPI {
    constructor(port = 3000) {
        this.app = express();
        this.port = port;
        this.scraper = new AcademicScraper();
        this.contentManager = new ContentManager();
        
        this.setupMiddleware();
        this.setupRoutes();
    }

    setupMiddleware() {
        // Parse JSON bodies
        this.app.use(express.json());
        
        // Parse URL-encoded bodies (for form data)
        this.app.use(express.urlencoded({ extended: true }));
        
        // Serve static files
        this.app.use('/assets', express.static('assets'));
        this.app.use('/pics', express.static('pics'));
        
        // CORS for local development
        this.app.use((req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            next();
        });
    }

    setupRoutes() {
        // Email notification approval endpoints
        this.app.get('/admin/approve/:updateId', this.handleApproval.bind(this));
        this.app.get('/admin/reject/:updateId', this.handleRejection.bind(this));
        this.app.get('/admin/approve-all', this.handleApproveAll.bind(this));

        // Dashboard API endpoints
        this.app.get('/api/dashboard', this.getDashboard.bind(this));
        this.app.get('/api/pending-updates', this.getPendingUpdates.bind(this));
        this.app.post('/api/approve/:updateId', this.apiApprove.bind(this));
        this.app.post('/api/reject/:updateId', this.apiReject.bind(this));
        
        // Content management endpoints
        this.app.get('/api/content/:type', this.getContent.bind(this));
        this.app.post('/api/content', this.addContent.bind(this));
        this.app.delete('/api/content/:id', this.deleteContent.bind(this));
        this.app.post('/api/rebuild-carousels', this.rebuildCarousels.bind(this));
        
        // Scraper control endpoints
        this.app.post('/api/scraper/scan', this.forceScan.bind(this));
        this.app.get('/api/scraper/status', this.getScraperStatus.bind(this));
        
        // Simple web interface
        this.app.get('/admin/dashboard', this.serveDashboard.bind(this));
        this.app.get('/admin', (req, res) => res.redirect('/admin/dashboard'));
        
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ status: 'ok', timestamp: new Date().toISOString() });
        });
    }

    // Handle approval from email link
    async handleApproval(req, res) {
        const { updateId } = req.params;
        
        try {
            const success = await this.scraper.approveUpdate(updateId);
            
            if (success) {
                // Rebuild affected carousels
                this.contentManager.updateAllPages();
                
                res.send(`
                    <html>
                    <head><title>Update Approved</title></head>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1 style="color: #10b981;">✅ Update Approved</h1>
                        <p>The update has been successfully approved and applied to your website.</p>
                        <a href="/admin/dashboard" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
                    </body>
                    </html>
                `);
            } else {
                res.status(404).send(`
                    <html>
                    <head><title>Update Not Found</title></head>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1 style="color: #ef4444;">❌ Update Not Found</h1>
                        <p>The update ${updateId} was not found or has already been processed.</p>
                        <a href="/admin/dashboard" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
                    </body>
                    </html>
                `);
            }
        } catch (error) {
            console.error('Error approving update:', error);
            res.status(500).send('Error processing approval');
        }
    }

    // Handle rejection from email link
    async handleRejection(req, res) {
        const { updateId } = req.params;
        
        try {
            const success = await this.scraper.rejectUpdate(updateId);
            
            if (success) {
                res.send(`
                    <html>
                    <head><title>Update Rejected</title></head>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1 style="color: #ef4444;">❌ Update Rejected</h1>
                        <p>The update has been rejected and will not be applied to your website.</p>
                        <a href="/admin/dashboard" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
                    </body>
                    </html>
                `);
            } else {
                res.status(404).send('Update not found');
            }
        } catch (error) {
            console.error('Error rejecting update:', error);
            res.status(500).send('Error processing rejection');
        }
    }

    // Handle approve all from email
    async handleApproveAll(req, res) {
        try {
            const pendingData = this.scraper.loadPendingUpdates();
            const pendingUpdates = pendingData.updates.filter(u => u.status === 'pending');
            
            let approvedCount = 0;
            for (const update of pendingUpdates) {
                const success = await this.scraper.approveUpdate(update.id);
                if (success) approvedCount++;
            }
            
            // Rebuild all carousels
            this.contentManager.updateAllPages();
            
            res.send(`
                <html>
                <head><title>All Updates Approved</title></head>
                <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                    <h1 style="color: #10b981;">✅ All Updates Approved</h1>
                    <p>${approvedCount} updates have been approved and applied to your website.</p>
                    <a href="/admin/dashboard" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
                </body>
                </html>
            `);
        } catch (error) {
            console.error('Error approving all updates:', error);
            res.status(500).send('Error processing approval');
        }
    }

    // API endpoints for dashboard
    async getDashboard(req, res) {
        try {
            const dashboardData = this.scraper.getDashboardData();
            const contentStats = this.contentManager.getStats();
            
            res.json({
                ...dashboardData,
                content_stats: contentStats
            });
        } catch (error) {
            console.error('Error getting dashboard data:', error);
            res.status(500).json({ error: 'Error loading dashboard data' });
        }
    }

    async getPendingUpdates(req, res) {
        try {
            const pendingData = this.scraper.loadPendingUpdates();
            res.json(pendingData);
        } catch (error) {
            console.error('Error getting pending updates:', error);
            res.status(500).json({ error: 'Error loading pending updates' });
        }
    }

    async apiApprove(req, res) {
        try {
            const { updateId } = req.params;
            const success = await this.scraper.approveUpdate(updateId);
            
            if (success) {
                this.contentManager.updateAllPages();
                res.json({ success: true, message: 'Update approved and applied' });
            } else {
                res.status(404).json({ success: false, message: 'Update not found' });
            }
        } catch (error) {
            console.error('Error approving update:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async apiReject(req, res) {
        try {
            const { updateId } = req.params;
            const success = await this.scraper.rejectUpdate(updateId);
            
            if (success) {
                res.json({ success: true, message: 'Update rejected' });
            } else {
                res.status(404).json({ success: false, message: 'Update not found' });
            }
        } catch (error) {
            console.error('Error rejecting update:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getContent(req, res) {
        try {
            const { type } = req.params;
            const config = this.contentManager.loadConfig();
            
            let content = [];
            if (type === 'all') {
                content = [
                    ...config.content.photos,
                    ...config.content.videos,
                    ...(config.content.publications || [])
                ];
            } else if (config.content[type]) {
                content = config.content[type];
            }
            
            res.json(content);
        } catch (error) {
            console.error('Error getting content:', error);
            res.status(500).json({ error: 'Error loading content' });
        }
    }

    async addContent(req, res) {
        try {
            const contentData = req.body;
            const newContent = this.contentManager.addContent(contentData);
            
            // Update affected pages
            this.contentManager.updateAllPages();
            
            res.json({ success: true, content: newContent });
        } catch (error) {
            console.error('Error adding content:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async deleteContent(req, res) {
        try {
            const { id } = req.params;
            const success = this.contentManager.removeContent(id);
            
            if (success) {
                this.contentManager.updateAllPages();
                res.json({ success: true, message: 'Content deleted' });
            } else {
                res.status(404).json({ success: false, message: 'Content not found' });
            }
        } catch (error) {
            console.error('Error deleting content:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async rebuildCarousels(req, res) {
        try {
            this.contentManager.updateAllPages();
            res.json({ success: true, message: 'All carousels rebuilt' });
        } catch (error) {
            console.error('Error rebuilding carousels:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async forceScan(req, res) {
        try {
            const updates = await this.scraper.performFullScan();
            res.json({ success: true, updates_found: updates.length, updates });
        } catch (error) {
            console.error('Error performing scan:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getScraperStatus(req, res) {
        try {
            const config = this.scraper.loadConfig();
            const status = {
                enabled: true,
                last_scan: config.metadata.last_full_scan,
                total_notifications: config.metadata.total_notifications_sent,
                pending_approvals: config.metadata.pending_approvals
            };
            res.json(status);
        } catch (error) {
            console.error('Error getting scraper status:', error);
            res.status(500).json({ error: 'Error loading scraper status' });
        }
    }

    // Serve simple dashboard HTML
    serveDashboard(req, res) {
        const dashboardHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Academic Website Admin Dashboard</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
                .container { max-width: 1200px; margin: 0 auto; }
                .card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                .header { text-align: center; color: #333; }
                .status { display: flex; gap: 20px; }
                .status-item { flex: 1; text-align: center; padding: 15px; background: #e3f2fd; border-radius: 5px; }
                .pending-updates { margin: 20px 0; }
                .update-item { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
                .btn { background: #2563eb; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; }
                .btn-danger { background: #ef4444; }
                .btn-success { background: #10b981; }
                .btn:hover { opacity: 0.8; }
                .loading { text-align: center; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <h1 class="header">🔧 Academic Website Admin Dashboard</h1>
                </div>
                
                <div class="card">
                    <h2>📊 Status Overview</h2>
                    <div class="status" id="statusOverview">
                        <div class="loading">Loading dashboard data...</div>
                    </div>
                </div>
                
                <div class="card">
                    <h2>📬 Pending Updates</h2>
                    <div id="pendingUpdates">
                        <div class="loading">Loading pending updates...</div>
                    </div>
                </div>
                
                <div class="card">
                    <h2>⚙️ Quick Actions</h2>
                    <button class="btn" onclick="forceScan()">🔄 Force Scholar Scan</button>
                    <button class="btn" onclick="rebuildCarousels()">🔧 Rebuild Carousels</button>
                    <button class="btn" onclick="approveAll()">✅ Approve All Pending</button>
                    <button class="btn" onclick="location.href='../index.html'">🏠 Back to Website</button>
                </div>
                
                <div class="card">
                    <h2>📈 Content Statistics</h2>
                    <div id="contentStats">
                        <div class="loading">Loading content statistics...</div>
                    </div>
                </div>
            </div>
            
            <script>
                async function loadDashboard() {
                    try {
                        const response = await fetch('/api/dashboard');
                        const data = await response.json();
                        
                        // Update status overview
                        const statusHTML = \`
                            <div class="status-item">
                                <h3>Scraper Status</h3>
                                <p>\${data.status.scraper_active ? '🟢 Active' : '🔴 Inactive'}</p>
                            </div>
                            <div class="status-item">
                                <h3>Pending Updates</h3>
                                <p>\${data.status.pending_count || 0}</p>
                            </div>
                            <div class="status-item">
                                <h3>Total Notifications</h3>
                                <p>\${data.status.total_notifications || 0}</p>
                            </div>
                            <div class="status-item">
                                <h3>Last Scan</h3>
                                <p>\${data.status.last_scan ? new Date(data.status.last_scan).toLocaleDateString() : 'Never'}</p>
                            </div>
                        \`;
                        document.getElementById('statusOverview').innerHTML = statusHTML;
                        
                        // Update content stats
                        const statsHTML = \`
                            <div class="status">
                                <div class="status-item">
                                    <h4>Photos</h4>
                                    <p>\${data.content_stats.photos}</p>
                                </div>
                                <div class="status-item">
                                    <h4>Videos</h4>
                                    <p>\${data.content_stats.videos}</p>
                                </div>
                                <div class="status-item">
                                    <h4>Publications</h4>
                                    <p>\${data.content_stats.publications}</p>
                                </div>
                                <div class="status-item">
                                    <h4>Last Updated</h4>
                                    <p>\${data.content_stats.last_updated}</p>
                                </div>
                            </div>
                        \`;
                        document.getElementById('contentStats').innerHTML = statsHTML;
                        
                    } catch (error) {
                        console.error('Error loading dashboard:', error);
                    }
                }
                
                async function loadPendingUpdates() {
                    try {
                        const response = await fetch('/api/pending-updates');
                        const data = await response.json();
                        
                        if (data.updates.length === 0) {
                            document.getElementById('pendingUpdates').innerHTML = '<p>No pending updates.</p>';
                            return;
                        }
                        
                        const updatesHTML = data.updates.map(update => \`
                            <div class="update-item">
                                <h4>\${update.type.replace('_', ' ').toUpperCase()}: \${update.description}</h4>
                                <p><strong>Source:</strong> \${update.source}</p>
                                <p><strong>Detected:</strong> \${new Date(update.detected_at).toLocaleString()}</p>
                                <p><strong>Confidence:</strong> \${update.confidence}</p>
                                \${update.details ? \`<p><strong>Details:</strong> \${JSON.stringify(update.details, null, 2)}</p>\` : ''}
                                <button class="btn btn-success" onclick="approveUpdate('\${update.id}')">✅ Approve</button>
                                <button class="btn btn-danger" onclick="rejectUpdate('\${update.id}')">❌ Reject</button>
                            </div>
                        \`).join('');
                        
                        document.getElementById('pendingUpdates').innerHTML = updatesHTML;
                        
                    } catch (error) {
                        console.error('Error loading pending updates:', error);
                    }
                }
                
                async function approveUpdate(updateId) {
                    try {
                        const response = await fetch(\`/api/approve/\${updateId}\`, { method: 'POST' });
                        const result = await response.json();
                        
                        if (result.success) {
                            alert('Update approved successfully!');
                            loadPendingUpdates();
                            loadDashboard();
                        } else {
                            alert('Error approving update: ' + result.message);
                        }
                    } catch (error) {
                        alert('Error approving update');
                        console.error(error);
                    }
                }
                
                async function rejectUpdate(updateId) {
                    try {
                        const response = await fetch(\`/api/reject/\${updateId}\`, { method: 'POST' });
                        const result = await response.json();
                        
                        if (result.success) {
                            alert('Update rejected successfully!');
                            loadPendingUpdates();
                            loadDashboard();
                        } else {
                            alert('Error rejecting update: ' + result.message);
                        }
                    } catch (error) {
                        alert('Error rejecting update');
                        console.error(error);
                    }
                }
                
                async function forceScan() {
                    const btn = event.target;
                    btn.disabled = true;
                    btn.textContent = '🔄 Scanning...';
                    
                    try {
                        const response = await fetch('/api/scraper/scan', { method: 'POST' });
                        const result = await response.json();
                        
                        if (result.success) {
                            alert(\`Scan completed! Found \${result.updates_found} updates.\`);
                            loadPendingUpdates();
                            loadDashboard();
                        } else {
                            alert('Error performing scan');
                        }
                    } catch (error) {
                        alert('Error performing scan');
                        console.error(error);
                    } finally {
                        btn.disabled = false;
                        btn.textContent = '🔄 Force Scholar Scan';
                    }
                }
                
                async function rebuildCarousels() {
                    const btn = event.target;
                    btn.disabled = true;
                    btn.textContent = '🔧 Rebuilding...';
                    
                    try {
                        const response = await fetch('/api/rebuild-carousels', { method: 'POST' });
                        const result = await response.json();
                        
                        if (result.success) {
                            alert('Carousels rebuilt successfully!');
                        } else {
                            alert('Error rebuilding carousels');
                        }
                    } catch (error) {
                        alert('Error rebuilding carousels');
                        console.error(error);
                    } finally {
                        btn.disabled = false;
                        btn.textContent = '🔧 Rebuild Carousels';
                    }
                }
                
                async function approveAll() {
                    if (!confirm('Are you sure you want to approve all pending updates?')) {
                        return;
                    }
                    
                    try {
                        const response = await fetch('/admin/approve-all');
                        if (response.ok) {
                            alert('All updates approved successfully!');
                            loadPendingUpdates();
                            loadDashboard();
                        } else {
                            alert('Error approving all updates');
                        }
                    } catch (error) {
                        alert('Error approving all updates');
                        console.error(error);
                    }
                }
                
                // Load data on page load
                loadDashboard();
                loadPendingUpdates();
                
                // Refresh every 30 seconds
                setInterval(() => {
                    loadDashboard();
                    loadPendingUpdates();
                }, 30000);
            </script>
        </body>
        </html>
        `;
        
        res.send(dashboardHTML);
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`🚀 Admin API server running on port ${this.port}`);
            console.log(`📊 Dashboard: http://localhost:${this.port}/admin/dashboard`);
            console.log(`🔗 Health check: http://localhost:${this.port}/health`);
        });
    }
}

// Command line interface
function main() {
    const port = process.argv[2] || 3000;
    const api = new AdminAPI(port);
    api.start();
}

// Export for use as module
module.exports = AdminAPI;

// Run if called directly
if (require.main === module) {
    main();
}