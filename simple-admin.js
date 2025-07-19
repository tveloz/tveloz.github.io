#!/usr/bin/env node

/**
 * Simple Admin Server for Academic Website
 * Uses only Node.js built-in modules (no dependencies required)
 * Handles approve/reject requests from email notifications
 */

const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const AcademicScraper = require('./academic-scraper');
const ContentManager = require('./content-manager');

class SimpleAdmin {
    constructor(port = 3000) {
        this.port = port;
        this.scraper = new AcademicScraper();
        this.contentManager = new ContentManager();
    }

    // Simple HTTP server
    createServer() {
        return http.createServer(async (req, res) => {
            const parsedUrl = url.parse(req.url, true);
            const pathname = parsedUrl.pathname;
            const query = parsedUrl.query;

            // Set CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

            // Handle preflight requests
            if (req.method === 'OPTIONS') {
                res.writeHead(200);
                res.end();
                return;
            }

            try {
                await this.handleRequest(req, res, pathname, query);
            } catch (error) {
                console.error('Error handling request:', error);
                this.sendError(res, 500, 'Internal Server Error');
            }
        });
    }

    async handleRequest(req, res, pathname, query) {
        // Email approval/rejection endpoints
        if (pathname.startsWith('/admin/approve/')) {
            const updateId = pathname.split('/')[3];
            await this.handleApproval(res, updateId);
            return;
        }

        if (pathname.startsWith('/admin/reject/')) {
            const updateId = pathname.split('/')[3];
            await this.handleRejection(res, updateId);
            return;
        }

        if (pathname === '/admin/approve-all') {
            await this.handleApproveAll(res);
            return;
        }

        // Dashboard endpoints
        if (pathname === '/admin/dashboard') {
            this.serveDashboard(res);
            return;
        }

        if (pathname === '/admin' || pathname === '/admin/') {
            this.sendRedirect(res, '/admin/dashboard');
            return;
        }

        // API endpoints
        if (pathname === '/api/dashboard') {
            await this.apiGetDashboard(res);
            return;
        }

        if (pathname === '/api/pending-updates') {
            await this.apiGetPendingUpdates(res);
            return;
        }

        if (pathname.startsWith('/api/approve/')) {
            const updateId = pathname.split('/')[3];
            await this.apiApprove(res, updateId);
            return;
        }

        if (pathname.startsWith('/api/reject/')) {
            const updateId = pathname.split('/')[3];
            await this.apiReject(res, updateId);
            return;
        }

        if (pathname === '/api/scraper/scan' && req.method === 'POST') {
            await this.apiForceScan(res);
            return;
        }

        if (pathname === '/api/rebuild-carousels' && req.method === 'POST') {
            await this.apiRebuildCarousels(res);
            return;
        }

        // Health check
        if (pathname === '/health') {
            this.sendJSON(res, { status: 'ok', timestamp: new Date().toISOString() });
            return;
        }

        // 404 for everything else
        this.sendError(res, 404, 'Not Found');
    }

    // Handle approval from email link
    async handleApproval(res, updateId) {
        try {
            const success = await this.scraper.approveUpdate(updateId);
            
            if (success) {
                // Rebuild affected carousels
                this.contentManager.updateAllPages();
                
                this.sendHTML(res, `
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
                this.sendHTML(res, `
                    <html>
                    <head><title>Update Not Found</title></head>
                    <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
                        <h1 style="color: #ef4444;">❌ Update Not Found</h1>
                        <p>The update ${updateId} was not found or has already been processed.</p>
                        <a href="/admin/dashboard" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a>
                    </body>
                    </html>
                `, 404);
            }
        } catch (error) {
            console.error('Error approving update:', error);
            this.sendError(res, 500, 'Error processing approval');
        }
    }

    // Handle rejection from email link
    async handleRejection(res, updateId) {
        try {
            const success = await this.scraper.rejectUpdate(updateId);
            
            if (success) {
                this.sendHTML(res, `
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
                this.sendError(res, 404, 'Update not found');
            }
        } catch (error) {
            console.error('Error rejecting update:', error);
            this.sendError(res, 500, 'Error processing rejection');
        }
    }

    // Handle approve all
    async handleApproveAll(res) {
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
            
            this.sendHTML(res, `
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
            this.sendError(res, 500, 'Error processing approval');
        }
    }

    // API endpoints
    async apiGetDashboard(res) {
        try {
            const dashboardData = this.scraper.getDashboardData();
            const contentStats = this.contentManager.getStats();
            
            this.sendJSON(res, {
                ...dashboardData,
                content_stats: contentStats
            });
        } catch (error) {
            console.error('Error getting dashboard data:', error);
            this.sendJSON(res, { error: 'Error loading dashboard data' }, 500);
        }
    }

    async apiGetPendingUpdates(res) {
        try {
            const pendingData = this.scraper.loadPendingUpdates();
            this.sendJSON(res, pendingData);
        } catch (error) {
            console.error('Error getting pending updates:', error);
            this.sendJSON(res, { error: 'Error loading pending updates' }, 500);
        }
    }

    async apiApprove(res, updateId) {
        try {
            const success = await this.scraper.approveUpdate(updateId);
            
            if (success) {
                this.contentManager.updateAllPages();
                this.sendJSON(res, { success: true, message: 'Update approved and applied' });
            } else {
                this.sendJSON(res, { success: false, message: 'Update not found' }, 404);
            }
        } catch (error) {
            console.error('Error approving update:', error);
            this.sendJSON(res, { success: false, error: error.message }, 500);
        }
    }

    async apiReject(res, updateId) {
        try {
            const success = await this.scraper.rejectUpdate(updateId);
            
            if (success) {
                this.sendJSON(res, { success: true, message: 'Update rejected' });
            } else {
                this.sendJSON(res, { success: false, message: 'Update not found' }, 404);
            }
        } catch (error) {
            console.error('Error rejecting update:', error);
            this.sendJSON(res, { success: false, error: error.message }, 500);
        }
    }

    async apiForceScan(res) {
        try {
            const updates = await this.scraper.performFullScan();
            this.sendJSON(res, { success: true, updates_found: updates.length, updates });
        } catch (error) {
            console.error('Error performing scan:', error);
            this.sendJSON(res, { success: false, error: error.message }, 500);
        }
    }

    async apiRebuildCarousels(res) {
        try {
            this.contentManager.updateAllPages();
            this.sendJSON(res, { success: true, message: 'All carousels rebuilt' });
        } catch (error) {
            console.error('Error rebuilding carousels:', error);
            this.sendJSON(res, { success: false, error: error.message }, 500);
        }
    }

    // Serve simple dashboard HTML
    serveDashboard(res) {
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
                .status { display: flex; gap: 20px; flex-wrap: wrap; }
                .status-item { flex: 1; min-width: 200px; text-align: center; padding: 15px; background: #e3f2fd; border-radius: 5px; }
                .pending-updates { margin: 20px 0; }
                .update-item { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; background: #fafafa; }
                .btn { background: #2563eb; color: white; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; margin-right: 10px; text-decoration: none; display: inline-block; }
                .btn-danger { background: #ef4444; }
                .btn-success { background: #10b981; }
                .btn:hover { opacity: 0.8; }
                .loading { text-align: center; color: #666; }
                .no-updates { text-align: center; color: #888; font-style: italic; }
                pre { background: #f0f0f0; padding: 10px; border-radius: 4px; overflow-x: auto; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="card">
                    <h1 class="header">🔧 Academic Website Admin Dashboard</h1>
                    <p class="header">Simple version - no dependencies required</p>
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
                    <a href="../index.html" class="btn">🏠 Back to Website</a>
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
                                <p>\${data.status?.scraper_active ? '🟢 Active' : '🔴 Inactive'}</p>
                            </div>
                            <div class="status-item">
                                <h3>Pending Updates</h3>
                                <p>\${data.status?.pending_count || 0}</p>
                            </div>
                            <div class="status-item">
                                <h3>Total Notifications</h3>
                                <p>\${data.status?.total_notifications || 0}</p>
                            </div>
                            <div class="status-item">
                                <h3>Last Scan</h3>
                                <p>\${data.status?.last_scan ? new Date(data.status.last_scan).toLocaleDateString() : 'Never'}</p>
                            </div>
                        \`;
                        document.getElementById('statusOverview').innerHTML = statusHTML;
                        
                        // Update content stats
                        if (data.content_stats) {
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
                        }
                        
                    } catch (error) {
                        console.error('Error loading dashboard:', error);
                        document.getElementById('statusOverview').innerHTML = '<div class="loading">Error loading dashboard data</div>';
                    }
                }
                
                async function loadPendingUpdates() {
                    try {
                        const response = await fetch('/api/pending-updates');
                        const data = await response.json();
                        
                        if (!data.updates || data.updates.length === 0) {
                            document.getElementById('pendingUpdates').innerHTML = '<p class="no-updates">No pending updates.</p>';
                            return;
                        }
                        
                        const updatesHTML = data.updates.map(update => \`
                            <div class="update-item">
                                <h4>\${update.type?.replace('_', ' ').toUpperCase() || 'UPDATE'}: \${update.description || 'No description'}</h4>
                                <p><strong>Source:</strong> \${update.source || 'Unknown'}</p>
                                <p><strong>Detected:</strong> \${update.detected_at ? new Date(update.detected_at).toLocaleString() : 'Unknown'}</p>
                                <p><strong>Confidence:</strong> \${update.confidence || 'Unknown'}</p>
                                \${update.details ? \`<details><summary>Details</summary><pre>\${JSON.stringify(update.details, null, 2)}</pre></details>\` : ''}
                                <div style="margin-top: 10px;">
                                    <button class="btn btn-success" onclick="approveUpdate('\${update.id}')">✅ Approve</button>
                                    <button class="btn btn-danger" onclick="rejectUpdate('\${update.id}')">❌ Reject</button>
                                </div>
                            </div>
                        \`).join('');
                        
                        document.getElementById('pendingUpdates').innerHTML = updatesHTML;
                        
                    } catch (error) {
                        console.error('Error loading pending updates:', error);
                        document.getElementById('pendingUpdates').innerHTML = '<div class="loading">Error loading pending updates</div>';
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
                    const originalText = btn.textContent;
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
                            alert('Error performing scan: ' + (result.error || 'Unknown error'));
                        }
                    } catch (error) {
                        alert('Error performing scan');
                        console.error(error);
                    } finally {
                        btn.disabled = false;
                        btn.textContent = originalText;
                    }
                }
                
                async function rebuildCarousels() {
                    const btn = event.target;
                    const originalText = btn.textContent;
                    btn.disabled = true;
                    btn.textContent = '🔧 Rebuilding...';
                    
                    try {
                        const response = await fetch('/api/rebuild-carousels', { method: 'POST' });
                        const result = await response.json();
                        
                        if (result.success) {
                            alert('Carousels rebuilt successfully!');
                        } else {
                            alert('Error rebuilding carousels: ' + (result.error || 'Unknown error'));
                        }
                    } catch (error) {
                        alert('Error rebuilding carousels');
                        console.error(error);
                    } finally {
                        btn.disabled = false;
                        btn.textContent = originalText;
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
                document.addEventListener('DOMContentLoaded', function() {
                    loadDashboard();
                    loadPendingUpdates();
                });
                
                // Refresh every 30 seconds
                setInterval(() => {
                    loadDashboard();
                    loadPendingUpdates();
                }, 30000);
            </script>
        </body>
        </html>
        `;
        
        this.sendHTML(res, dashboardHTML);
    }

    // Helper methods
    sendJSON(res, data, status = 200) {
        res.writeHead(status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(data));
    }

    sendHTML(res, html, status = 200) {
        res.writeHead(status, { 'Content-Type': 'text/html' });
        res.end(html);
    }

    sendError(res, status, message) {
        res.writeHead(status, { 'Content-Type': 'text/plain' });
        res.end(message);
    }

    sendRedirect(res, location) {
        res.writeHead(302, { 'Location': location });
        res.end();
    }

    start() {
        const server = this.createServer();
        
        server.listen(this.port, () => {
            console.log(`🚀 Simple Admin server running on port ${this.port}`);
            console.log(`📊 Dashboard: http://localhost:${this.port}/admin/dashboard`);
            console.log(`🔗 Health check: http://localhost:${this.port}/health`);
            console.log(`💡 No dependencies required - uses only Node.js built-ins`);
        });

        // Handle server errors
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                console.error(`❌ Port ${this.port} is already in use. Try a different port:`);
                console.error(`   node simple-admin.js ${this.port + 1}`);
            } else {
                console.error('❌ Server error:', err);
            }
        });
    }
}

// Command line interface
function main() {
    const port = process.argv[2] ? parseInt(process.argv[2]) : 3000;
    
    if (isNaN(port) || port < 1 || port > 65535) {
        console.error('❌ Invalid port number. Please provide a number between 1-65535');
        console.error('Usage: node simple-admin.js [port]');
        console.error('Example: node simple-admin.js 3000');
        process.exit(1);
    }
    
    const admin = new SimpleAdmin(port);
    admin.start();
}

// Export for use as module
module.exports = SimpleAdmin;

// Run if called directly
if (require.main === module) {
    main();
}