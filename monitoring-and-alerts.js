#!/usr/bin/env node

/**
 * System Monitoring and Alert Script
 * Monitors the real data system health and sends alerts when issues are detected
 * Can be run periodically via cron to ensure system reliability
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class SystemMonitor {
    constructor() {
        this.alertThresholds = {
            dataMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
            backupMaxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            minCitations: 0, // Minimum expected citations
            maxCitations: 100000, // Maximum reasonable citations
            minPublications: 0, // Minimum expected publications
            maxPublications: 1000, // Maximum reasonable publications
            maxErrorRate: 0.1 // 10% error rate threshold
        };
        
        this.alerts = [];
        this.warnings = [];
        this.systemInfo = this.gatherSystemInfo();
    }

    // Gather basic system information
    gatherSystemInfo() {
        return {
            hostname: os.hostname(),
            platform: os.platform(),
            nodeVersion: process.version,
            uptime: os.uptime(),
            freeMemory: os.freemem(),
            totalMemory: os.totalmem(),
            loadAverage: os.loadavg(),
            timestamp: new Date().toISOString()
        };
    }

    // Add alert
    addAlert(severity, message, component, data = null) {
        const alert = {
            severity, // 'critical', 'warning', 'info'
            message,
            component,
            data,
            timestamp: new Date().toISOString()
        };

        if (severity === 'critical') {
            this.alerts.push(alert);
        } else {
            this.warnings.push(alert);
        }

        const icon = severity === 'critical' ? '🚨' : '⚠️';
        console.log(`${icon} ${severity.toUpperCase()}: [${component}] ${message}`);
    }

    // Check file system health
    checkFileSystemHealth() {
        console.log('📁 Checking file system health...');
        
        const criticalFiles = [
            'real-scholar-scraper.js',
            'academic-scraper.js', 
            'simple-admin.js',
            'data-validator.js',
            'index.html'
        ];

        const dataFiles = [
            'data/scholar-data.json',
            'data/scraper-config.json'
        ];

        const directories = [
            'data',
            'data/backups',
            'data/emails'
        ];

        // Check critical files
        for (const file of criticalFiles) {
            if (!fs.existsSync(file)) {
                this.addAlert('critical', `Missing critical file: ${file}`, 'filesystem');
            } else {
                const stats = fs.statSync(file);
                if (stats.size === 0) {
                    this.addAlert('critical', `Empty critical file: ${file}`, 'filesystem');
                }
            }
        }

        // Check data files
        for (const file of dataFiles) {
            if (!fs.existsSync(file)) {
                this.addAlert('warning', `Missing data file: ${file}`, 'filesystem');
            } else {
                try {
                    const content = JSON.parse(fs.readFileSync(file, 'utf8'));
                    if (!content || Object.keys(content).length === 0) {
                        this.addAlert('warning', `Empty data file: ${file}`, 'filesystem');
                    }
                } catch (error) {
                    this.addAlert('critical', `Corrupted JSON file: ${file} - ${error.message}`, 'filesystem');
                }
            }
        }

        // Check directories
        for (const dir of directories) {
            if (!fs.existsSync(dir)) {
                this.addAlert('warning', `Missing directory: ${dir}`, 'filesystem');
            }
        }
    }

    // Check data quality and freshness
    checkDataQuality() {
        console.log('📊 Checking data quality...');
        
        const scholarDataPath = 'data/scholar-data.json';
        
        if (!fs.existsSync(scholarDataPath)) {
            this.addAlert('critical', 'Scholar data file does not exist', 'data');
            return;
        }

        try {
            const data = JSON.parse(fs.readFileSync(scholarDataPath, 'utf8'));
            
            // Check data freshness
            if (data.lastUpdated) {
                const dataAge = Date.now() - new Date(data.lastUpdated).getTime();
                if (dataAge > this.alertThresholds.dataMaxAge) {
                    const daysOld = Math.floor(dataAge / (24 * 60 * 60 * 1000));
                    this.addAlert('warning', `Scholar data is ${daysOld} days old`, 'data', { dataAge: daysOld });
                }
            } else {
                this.addAlert('warning', 'Scholar data has no timestamp', 'data');
            }

            // Check data ranges
            if (typeof data.totalCitations === 'number') {
                if (data.totalCitations < this.alertThresholds.minCitations || 
                    data.totalCitations > this.alertThresholds.maxCitations) {
                    this.addAlert('warning', `Unusual citation count: ${data.totalCitations}`, 'data', 
                        { citations: data.totalCitations });
                }
            } else {
                this.addAlert('critical', 'Invalid citation count data type', 'data');
            }

            if (typeof data.totalPublications === 'number') {
                if (data.totalPublications < this.alertThresholds.minPublications || 
                    data.totalPublications > this.alertThresholds.maxPublications) {
                    this.addAlert('warning', `Unusual publication count: ${data.totalPublications}`, 'data',
                        { publications: data.totalPublications });
                }
            } else {
                this.addAlert('critical', 'Invalid publication count data type', 'data');
            }

            // Check for error indicators
            if (data.error) {
                this.addAlert('warning', `Data contains error: ${data.error}`, 'data');
            }

            // Check publications array
            if (!Array.isArray(data.mostCitedPublications)) {
                this.addAlert('critical', 'Publications data is not an array', 'data');
            } else if (data.mostCitedPublications.length === 0 && data.totalPublications > 0) {
                this.addAlert('warning', 'No publication details despite having publications', 'data');
            }

            // Check source information
            if (data.source && data.source.includes('Fallback')) {
                this.addAlert('warning', `Using fallback data source: ${data.source}`, 'data');
            }

        } catch (error) {
            this.addAlert('critical', `Cannot parse scholar data: ${error.message}`, 'data');
        }
    }

    // Check backup system health
    checkBackupSystem() {
        console.log('💾 Checking backup system...');
        
        const backupDir = 'data/backups';
        
        if (!fs.existsSync(backupDir)) {
            this.addAlert('warning', 'Backup directory does not exist', 'backup');
            return;
        }

        try {
            const backupFiles = fs.readdirSync(backupDir)
                .filter(file => file.endsWith('.json'))
                .map(file => {
                    const filepath = path.join(backupDir, file);
                    const stats = fs.statSync(filepath);
                    return {
                        name: file,
                        path: filepath,
                        mtime: stats.mtime,
                        size: stats.size
                    };
                })
                .sort((a, b) => b.mtime - a.mtime);

            if (backupFiles.length === 0) {
                this.addAlert('warning', 'No backup files found', 'backup');
            } else {
                // Check if most recent backup is too old
                const latestBackup = backupFiles[0];
                const backupAge = Date.now() - latestBackup.mtime.getTime();
                
                if (backupAge > this.alertThresholds.backupMaxAge) {
                    const daysOld = Math.floor(backupAge / (24 * 60 * 60 * 1000));
                    this.addAlert('warning', `Latest backup is ${daysOld} days old`, 'backup');
                }

                // Check backup file sizes
                const suspiciouslySmallBackups = backupFiles.filter(b => b.size < 100);
                if (suspiciouslySmallBackups.length > 0) {
                    this.addAlert('warning', `${suspiciouslySmallBackups.length} suspiciously small backup files`, 'backup');
                }

                console.log(`✅ Found ${backupFiles.length} backup files, latest: ${latestBackup.name}`);
            }

        } catch (error) {
            this.addAlert('critical', `Cannot access backup directory: ${error.message}`, 'backup');
        }
    }

    // Check scraper configuration
    checkScraperConfig() {
        console.log('⚙️ Checking scraper configuration...');
        
        const configPath = 'data/scraper-config.json';
        
        if (!fs.existsSync(configPath)) {
            this.addAlert('warning', 'Scraper configuration file missing', 'config');
            return;
        }

        try {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            
            // Check Google Scholar configuration
            if (!config.sources || !config.sources.google_scholar) {
                this.addAlert('warning', 'Google Scholar source not configured', 'config');
            } else {
                const scholarConfig = config.sources.google_scholar;
                
                if (!scholarConfig.enabled) {
                    this.addAlert('info', 'Google Scholar scraping is disabled', 'config');
                }

                if (!scholarConfig.url || !scholarConfig.url.includes('scholar.google.com')) {
                    this.addAlert('warning', 'Invalid Google Scholar URL in configuration', 'config');
                }

                // Check last check time
                if (scholarConfig.last_check) {
                    const lastCheckAge = Date.now() - new Date(scholarConfig.last_check).getTime();
                    const hoursOld = Math.floor(lastCheckAge / (60 * 60 * 1000));
                    
                    if (hoursOld > 48) { // More than 2 days
                        this.addAlert('warning', `Scholar data hasn't been checked for ${hoursOld} hours`, 'config');
                    }
                }
            }

            // Check notification settings
            if (config.notifications && config.notifications.email_enabled === false) {
                this.addAlert('info', 'Email notifications are disabled', 'config');
            }

        } catch (error) {
            this.addAlert('critical', `Cannot parse scraper configuration: ${error.message}`, 'config');
        }
    }

    // Check system resources
    checkSystemResources() {
        console.log('💻 Checking system resources...');
        
        const freeMemoryPercent = (this.systemInfo.freeMemory / this.systemInfo.totalMemory) * 100;
        
        if (freeMemoryPercent < 10) {
            this.addAlert('critical', `Low memory: ${freeMemoryPercent.toFixed(1)}% free`, 'system');
        } else if (freeMemoryPercent < 20) {
            this.addAlert('warning', `Low memory: ${freeMemoryPercent.toFixed(1)}% free`, 'system');
        }

        // Check load average (Unix-like systems)
        if (this.systemInfo.loadAverage && this.systemInfo.loadAverage[0] > 2.0) {
            this.addAlert('warning', `High system load: ${this.systemInfo.loadAverage[0].toFixed(2)}`, 'system');
        }

        // Check disk space for data directory
        try {
            if (fs.existsSync('data')) {
                const stats = fs.statSync('data');
                // Note: Getting actual disk space requires additional modules
                // This is a simplified check
                console.log('✅ Data directory accessible');
            }
        } catch (error) {
            this.addAlert('critical', `Cannot access data directory: ${error.message}`, 'system');
        }
    }

    // Check for recent errors in log files
    checkRecentErrors() {
        console.log('📝 Checking for recent errors...');
        
        const logFiles = [
            'migration.log',
            'admin.log',
            'scraper.log'
        ];

        for (const logFile of logFiles) {
            if (fs.existsSync(logFile)) {
                try {
                    const content = fs.readFileSync(logFile, 'utf8');
                    const lines = content.split('\n');
                    
                    // Check last 100 lines for errors
                    const recentLines = lines.slice(-100);
                    const errorLines = recentLines.filter(line => 
                        line.toLowerCase().includes('error') || 
                        line.toLowerCase().includes('failed') ||
                        line.includes('❌')
                    );

                    if (errorLines.length > 0) {
                        const errorRate = errorLines.length / recentLines.length;
                        if (errorRate > this.alertThresholds.maxErrorRate) {
                            this.addAlert('warning', 
                                `High error rate in ${logFile}: ${errorLines.length} errors in last 100 lines`, 
                                'logs',
                                { errorCount: errorLines.length, recentSample: errorLines.slice(0, 3) }
                            );
                        }
                    }
                } catch (error) {
                    this.addAlert('warning', `Cannot read log file ${logFile}: ${error.message}`, 'logs');
                }
            }
        }
    }

    // Generate monitoring report
    generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            systemInfo: this.systemInfo,
            summary: {
                status: this.alerts.length === 0 ? 'HEALTHY' : 'ISSUES_DETECTED',
                criticalAlerts: this.alerts.length,
                warnings: this.warnings.length,
                totalIssues: this.alerts.length + this.warnings.length
            },
            alerts: this.alerts,
            warnings: this.warnings,
            recommendations: this.generateRecommendations()
        };

        // Save report
        try {
            const reportsDir = 'data/monitoring-reports';
            if (!fs.existsSync(reportsDir)) {
                fs.mkdirSync(reportsDir, { recursive: true });
            }

            const reportFile = path.join(reportsDir, `monitor-${Date.now()}.json`);
            fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
            console.log(`📄 Monitoring report saved: ${reportFile}`);
        } catch (error) {
            console.log(`⚠️ Could not save monitoring report: ${error.message}`);
        }

        return report;
    }

    // Generate recommendations based on findings
    generateRecommendations() {
        const recommendations = [];

        if (this.alerts.length > 0) {
            recommendations.push('🚨 Address critical alerts immediately');
            recommendations.push('🔧 Run system diagnostics: node testing-suite.js all');
        }

        if (this.warnings.length > 0) {
            recommendations.push('⚠️ Review and address warnings when possible');
        }

        // Specific recommendations based on alert types
        const dataAlerts = [...this.alerts, ...this.warnings].filter(a => a.component === 'data');
        if (dataAlerts.length > 0) {
            recommendations.push('📊 Run data validation: node data-validator.js validate');
            recommendations.push('🔄 Consider forcing Scholar update: node real-scholar-scraper.js force');
        }

        const backupAlerts = [...this.alerts, ...this.warnings].filter(a => a.component === 'backup');
        if (backupAlerts.length > 0) {
            recommendations.push('💾 Create manual backup: node data-validator.js backup manual');
        }

        const systemAlerts = [...this.alerts, ...this.warnings].filter(a => a.component === 'system');
        if (systemAlerts.length > 0) {
            recommendations.push('💻 Check system resources and restart if necessary');
        }

        if (recommendations.length === 0) {
            recommendations.push('✅ System appears healthy - no immediate action required');
            recommendations.push('🔄 Continue regular monitoring');
        }

        return recommendations;
    }

    // Run complete monitoring check
    async runCompleteCheck() {
        console.log('🔍 Starting complete system monitoring check...\n');
        
        const startTime = Date.now();

        // Run all checks
        this.checkFileSystemHealth();
        this.checkDataQuality();
        this.checkBackupSystem();
        this.checkScraperConfig();
        this.checkSystemResources();
        this.checkRecentErrors();

        const duration = Math.round((Date.now() - startTime) / 1000);

        // Generate and display report
        console.log('\n📋 MONITORING REPORT');
        console.log('===================');
        
        const status = this.alerts.length === 0 ? '✅ SYSTEM HEALTHY' : '🚨 ISSUES DETECTED';
        console.log(`Status: ${status}`);
        console.log(`Critical Alerts: ${this.alerts.length}`);
        console.log(`Warnings: ${this.warnings.length}`);
        console.log(`Check Duration: ${duration} seconds`);

        if (this.alerts.length > 0) {
            console.log('\n🚨 CRITICAL ALERTS:');
            this.alerts.forEach(alert => {
                console.log(`  - [${alert.component}] ${alert.message}`);
            });
        }

        if (this.warnings.length > 0) {
            console.log('\n⚠️ WARNINGS:');
            this.warnings.forEach(warning => {
                console.log(`  - [${warning.component}] ${warning.message}`);
            });
        }

        const recommendations = this.generateRecommendations();
        console.log('\n💡 RECOMMENDATIONS:');
        recommendations.forEach(rec => console.log(`  ${rec}`));

        // Save report
        const report = this.generateReport();

        // Return status for exit code
        return this.alerts.length === 0;
    }

    // Send alerts (placeholder for email/webhook integration)
    async sendAlerts() {
        if (this.alerts.length === 0 && this.warnings.length === 0) {
            return; // Nothing to send
        }

        console.log('\n📧 Alert sending (placeholder)...');
        
        // In a real implementation, you would integrate with:
        // - Email service (nodemailer)
        // - Slack webhooks
        // - SMS service
        // - Monitoring platforms (Datadog, New Relic, etc.)

        const alertSummary = {
            critical: this.alerts.length,
            warnings: this.warnings.length,
            hostname: this.systemInfo.hostname,
            timestamp: new Date().toISOString()
        };

        // Save alert for external processing
        try {
            fs.writeFileSync('data/latest-alerts.json', JSON.stringify({
                summary: alertSummary,
                alerts: this.alerts,
                warnings: this.warnings
            }, null, 2));
            
            console.log('📧 Alert data saved for external processing: data/latest-alerts.json');
        } catch (error) {
            console.log(`⚠️ Could not save alert data: ${error.message}`);
        }
    }
}

// Command line interface
async function main() {
    const monitor = new SystemMonitor();
    const command = process.argv[2] || 'check';

    switch (command) {
        case 'check':
            const healthy = await monitor.runCompleteCheck();
            await monitor.sendAlerts();
            process.exit(healthy ? 0 : 1);
            break;

        case 'quick':
            // Quick health check - just critical items
            monitor.checkFileSystemHealth();
            monitor.checkDataQuality();
            const quickHealthy = monitor.alerts.length === 0;
            console.log(quickHealthy ? '✅ Quick check passed' : '❌ Issues detected');
            process.exit(quickHealthy ? 0 : 1);
            break;

        case 'data':
            monitor.checkDataQuality();
            break;

        case 'files':
            monitor.checkFileSystemHealth();
            break;

        case 'backups':
            monitor.checkBackupSystem();
            break;

        case 'config':
            monitor.checkScraperConfig();
            break;

        case 'system':
            monitor.checkSystemResources();
            break;

        case 'help':
        default:
            console.log(`
🔍 System Monitoring and Alert Script

Usage: node monitoring-and-alerts.js [command]

Commands:
  check    - Run complete monitoring check (default)
  quick    - Run quick health check (critical items only)
  data     - Check data quality only
  files    - Check file system only
  backups  - Check backup system only
  config   - Check configuration only
  system   - Check system resources only
  help     - Show this help

Exit codes:
  0 = System healthy (no critical alerts)
  1 = Issues detected (critical alerts present)

Examples:
  node monitoring-and-alerts.js check     # Full monitoring
  node monitoring-and-alerts.js quick     # Quick check for cron jobs

Cron job example (daily at 8 AM):
  0 8 * * * cd /path/to/website && node monitoring-and-alerts.js check

Output files:
  data/monitoring-reports/  - Detailed monitoring reports
  data/latest-alerts.json   - Latest alerts for external processing
            `);
            break;
    }
}

// Export for use as module
module.exports = SystemMonitor;

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Monitoring failed:', error.message);
        process.exit(1);
    });
}