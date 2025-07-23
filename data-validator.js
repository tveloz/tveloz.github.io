#!/usr/bin/env node

/**
 * Data Validator and Recovery System
 * Validates scraped data and provides fallback mechanisms
 * Ensures data quality and prevents bad data from corrupting the website
 */

const fs = require('fs');
const path = require('path');

class DataValidator {
    constructor() {
        this.validationRules = {
            totalCitations: {
                type: 'number',
                min: 0,
                max: 100000, // Reasonable upper bound
                required: true
            },
            totalPublications: {
                type: 'number',
                min: 0,
                max: 1000, // Reasonable upper bound for individual researcher
                required: true
            },
            mostCitedPublications: {
                type: 'array',
                minLength: 0,
                maxLength: 50,
                required: true
            }
        };
        
        this.backupDir = 'data/backups';
        this.maxBackups = 10;
    }

    // Validate Scholar data structure and content
    validateScholarData(data) {
        const errors = [];
        const warnings = [];

        if (!data || typeof data !== 'object') {
            errors.push('Data must be an object');
            return { isValid: false, errors, warnings, data: null };
        }

        // Check required fields
        for (const [field, rules] of Object.entries(this.validationRules)) {
            if (rules.required && !(field in data)) {
                errors.push(`Missing required field: ${field}`);
                continue;
            }

            const value = data[field];

            // Type validation
            if (field in data) {
                if (rules.type === 'number' && typeof value !== 'number') {
                    errors.push(`Field ${field} must be a number, got ${typeof value}`);
                } else if (rules.type === 'array' && !Array.isArray(value)) {
                    errors.push(`Field ${field} must be an array, got ${typeof value}`);
                }

                // Range validation for numbers
                if (rules.type === 'number' && typeof value === 'number') {
                    if (rules.min !== undefined && value < rules.min) {
                        errors.push(`Field ${field} (${value}) is below minimum (${rules.min})`);
                    }
                    if (rules.max !== undefined && value > rules.max) {
                        warnings.push(`Field ${field} (${value}) is above expected maximum (${rules.max})`);
                    }
                }

                // Array validation
                if (rules.type === 'array' && Array.isArray(value)) {
                    if (rules.minLength !== undefined && value.length < rules.minLength) {
                        errors.push(`Field ${field} array is too short (${value.length} < ${rules.minLength})`);
                    }
                    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
                        warnings.push(`Field ${field} array is very long (${value.length} > ${rules.maxLength})`);
                    }
                }
            }
        }

        // Validate publication objects
        if (data.mostCitedPublications && Array.isArray(data.mostCitedPublications)) {
            data.mostCitedPublications.forEach((pub, index) => {
                if (!pub.title || typeof pub.title !== 'string') {
                    warnings.push(`Publication ${index + 1} missing or invalid title`);
                }
                if (!pub.authors || typeof pub.authors !== 'string') {
                    warnings.push(`Publication ${index + 1} missing or invalid authors`);
                }
                if (typeof pub.citations !== 'number' || pub.citations < 0) {
                    warnings.push(`Publication ${index + 1} invalid citation count: ${pub.citations}`);
                }
                if (typeof pub.year !== 'number' || pub.year < 1900 || pub.year > new Date().getFullYear() + 1) {
                    warnings.push(`Publication ${index + 1} invalid year: ${pub.year}`);
                }
            });
        }

        // Cross-validation checks
        if (data.totalCitations && data.mostCitedPublications) {
            const topCitations = data.mostCitedPublications.slice(0, 5).reduce((sum, pub) => sum + (pub.citations || 0), 0);
            if (topCitations > data.totalCitations) {
                errors.push(`Top 5 publications have more citations (${topCitations}) than total (${data.totalCitations})`);
            }
        }

        // Timestamp validation
        if (data.lastUpdated) {
            const updateTime = new Date(data.lastUpdated);
            const now = new Date();
            if (updateTime > now) {
                warnings.push('Data timestamp is in the future');
            }
            if (now - updateTime > 30 * 24 * 60 * 60 * 1000) { // 30 days
                warnings.push('Data is more than 30 days old');
            }
        }

        const isValid = errors.length === 0;
        
        return {
            isValid,
            errors,
            warnings,
            data: isValid ? this.cleanData(data) : null,
            summary: {
                totalErrors: errors.length,
                totalWarnings: warnings.length,
                dataAge: data.lastUpdated ? Math.floor((new Date() - new Date(data.lastUpdated)) / (1000 * 60 * 60 * 24)) : null
            }
        };
    }

    // Clean and normalize data
    cleanData(data) {
        const cleaned = { ...data };

        // Ensure numeric fields are properly typed
        cleaned.totalCitations = parseInt(cleaned.totalCitations) || 0;
        cleaned.totalPublications = parseInt(cleaned.totalPublications) || 0;

        // Clean publications array
        if (cleaned.mostCitedPublications && Array.isArray(cleaned.mostCitedPublications)) {
            cleaned.mostCitedPublications = cleaned.mostCitedPublications
                .filter(pub => pub && pub.title && pub.authors) // Remove invalid entries
                .map((pub, index) => ({
                    title: String(pub.title).trim(),
                    authors: String(pub.authors).trim(),
                    journal: pub.journal ? String(pub.journal).trim() : 'Unknown Journal',
                    year: parseInt(pub.year) || new Date().getFullYear(),
                    citations: parseInt(pub.citations) || 0,
                    rank: index + 1
                }))
                .sort((a, b) => b.citations - a.citations) // Sort by citations descending
                .slice(0, 20); // Keep top 20
        }

        // Add validation metadata
        cleaned._validation = {
            validated: true,
            validatedAt: new Date().toISOString(),
            version: '1.0'
        };

        return cleaned;
    }

    // Create backup of current data
    createBackup(data, reason = 'manual') {
        try {
            if (!fs.existsSync(this.backupDir)) {
                fs.mkdirSync(this.backupDir, { recursive: true });
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `scholar-data-backup-${timestamp}-${reason}.json`;
            const filepath = path.join(this.backupDir, filename);

            const backupData = {
                ...data,
                _backup: {
                    createdAt: new Date().toISOString(),
                    reason,
                    originalFile: 'data/scholar-data.json'
                }
            };

            fs.writeFileSync(filepath, JSON.stringify(backupData, null, 2));
            console.log(`✅ Backup created: ${filepath}`);

            // Clean up old backups
            this.cleanupOldBackups();

            return filepath;
        } catch (error) {
            console.error('❌ Error creating backup:', error);
            return null;
        }
    }

    // Clean up old backup files
    cleanupOldBackups() {
        try {
            if (!fs.existsSync(this.backupDir)) return;

            const files = fs.readdirSync(this.backupDir)
                .filter(file => file.startsWith('scholar-data-backup-') && file.endsWith('.json'))
                .map(file => ({
                    name: file,
                    path: path.join(this.backupDir, file),
                    mtime: fs.statSync(path.join(this.backupDir, file)).mtime
                }))
                .sort((a, b) => b.mtime - a.mtime); // Sort by modification time, newest first

            // Keep only the most recent backups
            if (files.length > this.maxBackups) {
                const filesToDelete = files.slice(this.maxBackups);
                filesToDelete.forEach(file => {
                    fs.unlinkSync(file.path);
                    console.log(`🗑️  Deleted old backup: ${file.name}`);
                });
            }
        } catch (error) {
            console.error('❌ Error cleaning up backups:', error);
        }
    }

    // Get list of available backups
    getAvailableBackups() {
        try {
            if (!fs.existsSync(this.backupDir)) return [];

            return fs.readdirSync(this.backupDir)
                .filter(file => file.startsWith('scholar-data-backup-') && file.endsWith('.json'))
                .map(file => {
                    const filepath = path.join(this.backupDir, file);
                    const stats = fs.statSync(filepath);
                    
                    let metadata = null;
                    try {
                        const content = JSON.parse(fs.readFileSync(filepath, 'utf8'));
                        metadata = {
                            citations: content.totalCitations,
                            publications: content.totalPublications,
                            reason: content._backup?.reason,
                            source: content.source
                        };
                    } catch (e) {
                        // Could not parse metadata
                    }

                    return {
                        filename: file,
                        filepath,
                        created: stats.mtime,
                        size: stats.size,
                        metadata
                    };
                })
                .sort((a, b) => b.created - a.created);
        } catch (error) {
            console.error('❌ Error getting backups:', error);
            return [];
        }
    }

    // Restore from backup
    restoreFromBackup(backupFilename, targetPath = 'data/scholar-data.json') {
        try {
            const backupPath = path.join(this.backupDir, backupFilename);
            
            if (!fs.existsSync(backupPath)) {
                throw new Error(`Backup file not found: ${backupFilename}`);
            }

            // Validate backup data before restoring
            const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
            const validation = this.validateScholarData(backupData);

            if (!validation.isValid) {
                throw new Error(`Backup data is invalid: ${validation.errors.join(', ')}`);
            }

            // Create backup of current data before restoring
            if (fs.existsSync(targetPath)) {
                const currentData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
                this.createBackup(currentData, 'pre-restore');
            }

            // Restore the backup
            fs.writeFileSync(targetPath, JSON.stringify(validation.data, null, 2));
            console.log(`✅ Restored from backup: ${backupFilename}`);

            return {
                success: true,
                data: validation.data,
                warnings: validation.warnings
            };
        } catch (error) {
            console.error('❌ Error restoring from backup:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    // Generate fallback data when all else fails
    generateFallbackData() {
        console.log('⚠️  Generating fallback Scholar data...');
        
        return {
            totalCitations: 0,
            totalPublications: 0,
            mostCitedPublications: [],
            lastUpdated: new Date().toISOString(),
            source: 'Fallback - Auto-generated',
            error: 'Real data unavailable, using fallback',
            _validation: {
                validated: true,
                validatedAt: new Date().toISOString(),
                isFallback: true
            }
        };
    }

    // Validate and save data with automatic backup and recovery
    validateAndSave(data, targetPath = 'data/scholar-data.json') {
        try {
            console.log('🔍 Validating Scholar data...');
            
            const validation = this.validateScholarData(data);
            
            if (validation.errors.length > 0) {
                console.error('❌ Data validation failed:');
                validation.errors.forEach(error => console.error(`  - ${error}`));
                
                // Try to load previous good data
                if (fs.existsSync(targetPath)) {
                    console.log('🔄 Attempting to keep previous data...');
                    return {
                        success: false,
                        errors: validation.errors,
                        action: 'kept_previous_data'
                    };
                } else {
                    // No previous data, use fallback
                    console.log('🔄 Using fallback data...');
                    const fallbackData = this.generateFallbackData();
                    fs.writeFileSync(targetPath, JSON.stringify(fallbackData, null, 2));
                    return {
                        success: true,
                        errors: validation.errors,
                        action: 'used_fallback',
                        data: fallbackData
                    };
                }
            }

            if (validation.warnings.length > 0) {
                console.log('⚠️  Data validation warnings:');
                validation.warnings.forEach(warning => console.log(`  - ${warning}`));
            }

            // Data is valid, create backup of existing data
            if (fs.existsSync(targetPath)) {
                try {
                    const existingData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
                    this.createBackup(existingData, 'auto-update');
                } catch (e) {
                    console.log('⚠️  Could not backup existing data:', e.message);
                }
            }

            // Save validated data
            const dir = path.dirname(targetPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            fs.writeFileSync(targetPath, JSON.stringify(validation.data, null, 2));
            console.log('✅ Data validated and saved successfully');

            return {
                success: true,
                warnings: validation.warnings,
                action: 'saved_new_data',
                data: validation.data,
                summary: validation.summary
            };

        } catch (error) {
            console.error('❌ Error in validateAndSave:', error);
            
            // Emergency fallback
            try {
                const fallbackData = this.generateFallbackData();
                fs.writeFileSync(targetPath, JSON.stringify(fallbackData, null, 2));
                return {
                    success: true,
                    error: error.message,
                    action: 'emergency_fallback',
                    data: fallbackData
                };
            } catch (fallbackError) {
                return {
                    success: false,
                    error: error.message,
                    fallbackError: fallbackError.message,
                    action: 'total_failure'
                };
            }
        }
    }

    // Show validation report
    showValidationReport(filePath = 'data/scholar-data.json') {
        try {
            if (!fs.existsSync(filePath)) {
                console.log('❌ No data file found');
                return;
            }

            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            const validation = this.validateScholarData(data);

            console.log('\n📋 VALIDATION REPORT');
            console.log('==================');
            console.log(`File: ${filePath}`);
            console.log(`Status: ${validation.isValid ? '✅ VALID' : '❌ INVALID'}`);
            console.log(`Errors: ${validation.errors.length}`);
            console.log(`Warnings: ${validation.warnings.length}`);
            
            if (validation.summary.dataAge !== null) {
                console.log(`Data Age: ${validation.summary.dataAge} days`);
            }

            if (validation.errors.length > 0) {
                console.log('\n❌ ERRORS:');
                validation.errors.forEach(error => console.log(`  - ${error}`));
            }

            if (validation.warnings.length > 0) {
                console.log('\n⚠️  WARNINGS:');
                validation.warnings.forEach(warning => console.log(`  - ${warning}`));
            }

            if (data.totalCitations !== undefined) {
                console.log(`\n📊 DATA SUMMARY:`);
                console.log(`  Citations: ${data.totalCitations}`);
                console.log(`  Publications: ${data.totalPublications}`);
                console.log(`  Top Publications: ${data.mostCitedPublications?.length || 0}`);
                console.log(`  Source: ${data.source || 'Unknown'}`);
                console.log(`  Last Updated: ${data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'Unknown'}`);
            }

            console.log('\n');

        } catch (error) {
            console.error('❌ Error reading validation report:', error);
        }
    }

    // Show backup status
    showBackupStatus() {
        console.log('\n💾 BACKUP STATUS');
        console.log('================');

        const backups = this.getAvailableBackups();
        
        if (backups.length === 0) {
            console.log('No backups found');
            return;
        }

        console.log(`Total backups: ${backups.length}`);
        console.log('\nRecent backups:');
        
        backups.slice(0, 5).forEach((backup, index) => {
            console.log(`${index + 1}. ${backup.filename}`);
            console.log(`   Created: ${backup.created.toLocaleString()}`);
            console.log(`   Size: ${Math.round(backup.size / 1024)} KB`);
            if (backup.metadata) {
                console.log(`   Citations: ${backup.metadata.citations}, Publications: ${backup.metadata.publications}`);
                console.log(`   Reason: ${backup.metadata.reason || 'Unknown'}`);
            }
            console.log('');
        });

        if (backups.length > 5) {
            console.log(`... and ${backups.length - 5} more backups`);
        }
    }
}

// Command line interface
async function main() {
    const validator = new DataValidator();
    const command = process.argv[2] || 'help';
    const args = process.argv.slice(3);

    switch (command) {
        case 'validate':
            const filePath = args[0] || 'data/scholar-data.json';
            validator.showValidationReport(filePath);
            break;

        case 'backup':
            try {
                const data = JSON.parse(fs.readFileSync('data/scholar-data.json', 'utf8'));
                const reason = args[0] || 'manual';
                validator.createBackup(data, reason);
            } catch (error) {
                console.error('❌ Error creating backup:', error.message);
            }
            break;

        case 'restore':
            if (!args[0]) {
                console.error('❌ Please specify backup filename');
                console.log('Available backups:');
                validator.getAvailableBackups().forEach(b => console.log(`  - ${b.filename}`));
                break;
            }
            const result = validator.restoreFromBackup(args[0]);
            if (result.success) {
                console.log('✅ Restore completed successfully');
                if (result.warnings.length > 0) {
                    console.log('⚠️  Warnings:', result.warnings.join(', '));
                }
            } else {
                console.error('❌ Restore failed:', result.error);
            }
            break;

        case 'backups':
            validator.showBackupStatus();
            break;

        case 'clean':
            validator.cleanupOldBackups();
            break;

        case 'test':
            // Test with sample invalid data
            const testData = {
                totalCitations: -100, // Invalid: negative
                totalPublications: 'not a number', // Invalid: wrong type
                // Missing mostCitedPublications
                lastUpdated: 'invalid date'
            };
            
            console.log('🧪 Testing with invalid data...');
            const validation = validator.validateScholarData(testData);
            console.log('Validation result:', validation);
            break;

        case 'help':
        default:
            console.log(`
🔍 Data Validator and Recovery System

Usage: node data-validator.js [command] [options]

Commands:
  validate [file]     - Validate data file (default: data/scholar-data.json)
  backup [reason]     - Create backup of current data
  restore <filename>  - Restore from backup
  backups            - Show backup status
  clean              - Clean up old backups
  test               - Test validation with sample data
  help               - Show this help

Examples:
  node data-validator.js validate
  node data-validator.js backup pre-update
  node data-validator.js restore scholar-data-backup-2025-01-01-manual.json
  node data-validator.js backups

Files:
  data/scholar-data.json    - Main data file
  data/backups/            - Backup directory
            `);
            break;
    }
}

// Export for use as module
module.exports = DataValidator;

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}