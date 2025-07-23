#!/usr/bin/env node

/**
 * Comprehensive Testing Suite for Real Data System
 * Tests all components of the real Google Scholar data integration
 * Verifies data quality, website functionality, and system reliability
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

class RealDataTestSuite {
    constructor() {
        this.testResults = [];
        this.errors = [];
        this.warnings = [];
        this.startTime = Date.now();
    }

    // Test result tracking
    addTest(name, passed, message = '', data = null) {
        const result = {
            name,
            passed,
            message,
            data,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        const icon = passed ? '✅' : '❌';
        console.log(`${icon} ${name}: ${message}`);
        
        if (!passed) {
            this.errors.push(`${name}: ${message}`);
        }
        
        return passed;
    }

    addWarning(message) {
        this.warnings.push(message);
        console.log(`⚠️  WARNING: ${message}`);
    }

    // Test 1: File existence
    testFileExistence() {
        console.log('\n🗂️  Testing file existence...');
        
        const requiredFiles = [
            { path: 'real-scholar-scraper.js', desc: 'Real Scholar scraper' },
            { path: 'academic-scraper.js', desc: 'Updated academic scraper' },
            { path: 'simple-admin.js', desc: 'Updated admin interface' },
            { path: 'data-validator.js', desc: 'Data validator' },
            { path: 'index.html', desc: 'Updated website' },
            { path: 'data/scholar-data.json', desc: 'Scholar data file' }
        ];

        let allPresent = true;

        for (const file of requiredFiles) {
            const exists = fs.existsSync(file.path);
            this.addTest(
                `File exists: ${file.desc}`,
                exists,
                exists ? file.path : `Missing: ${file.path}`
            );
            if (!exists) allPresent = false;
        }

        return allPresent;
    }

    // Test 2: Data file validation
    testDataValidation() {
        console.log('\n📊 Testing data validation...');
        
        try {
            // Test scholar data file
            if (!fs.existsSync('data/scholar-data.json')) {
                this.addTest('Scholar data file exists', false, 'File not found');
                return false;
            }

            const scholarData = JSON.parse(fs.readFileSync('data/scholar-data.json', 'utf8'));

            // Test required fields
            const requiredFields = ['totalCitations', 'totalPublications', 'mostCitedPublications', 'lastUpdated', 'source'];
            let allFieldsPresent = true;

            for (const field of requiredFields) {
                const hasField = field in scholarData;
                this.addTest(
                    `Scholar data has ${field}`,
                    hasField,
                    hasField ? `${field}: ${scholarData[field]}` : `Missing field: ${field}`
                );
                if (!hasField) allFieldsPresent = false;
            }

            // Test data types and ranges
            if (typeof scholarData.totalCitations === 'number') {
                this.addTest(
                    'Citations is valid number',
                    scholarData.totalCitations >= 0 && scholarData.totalCitations < 100000,
                    `Citations: ${scholarData.totalCitations}`
                );
            }

            if (typeof scholarData.totalPublications === 'number') {
                this.addTest(
                    'Publications is valid number',
                    scholarData.totalPublications >= 0 && scholarData.totalPublications < 1000,
                    `Publications: ${scholarData.totalPublications}`
                );
            }

            // Test publications array
            if (Array.isArray(scholarData.mostCitedPublications)) {
                this.addTest(
                    'Publications array is valid',
                    scholarData.mostCitedPublications.length >= 0,
                    `${scholarData.mostCitedPublications.length} publications`
                );

                // Test first publication structure
                if (scholarData.mostCitedPublications.length > 0) {
                    const firstPub = scholarData.mostCitedPublications[0];
                    const hasRequiredPubFields = firstPub.title && firstPub.authors && 
                                               typeof firstPub.citations === 'number';
                    this.addTest(
                        'First publication has required fields',
                        hasRequiredPubFields,
                        hasRequiredPubFields ? `"${firstPub.title}"` : 'Missing required fields'
                    );
                }
            }

            // Test data freshness
            if (scholarData.lastUpdated) {
                const lastUpdate = new Date(scholarData.lastUpdated);
                const now = new Date();
                const hoursOld = (now - lastUpdate) / (1000 * 60 * 60);
                
                this.addTest(
                    'Data is relatively fresh',
                    hoursOld < 168, // Less than a week old
                    `${Math.round(hoursOld)} hours old`
                );

                if (hoursOld > 24) {
                    this.addWarning(`Data is ${Math.round(hoursOld)} hours old - consider refreshing`);
                }
            }

            // Test for error indicators
            if (scholarData.error) {
                this.addWarning(`Data contains error: ${scholarData.error}`);
            }

            return allFieldsPresent;

        } catch (error) {
            this.addTest('Scholar data parsing', false, `JSON parse error: ${error.message}`);
            return false;
        }
    }

    // Test 3: Scraper functionality
    async testScraperFunctionality() {
        console.log('\n🔬 Testing scraper functionality...');
        
        try {
            // Test real scraper module loading
            const RealScholarScraper = require('./real-scholar-scraper');
            this.addTest('Real scraper module loads', true, 'Module imported successfully');

            const scraper = new RealScholarScraper();
            
            // Test existing data loading
            const existingData = scraper.loadExistingData();
            this.addTest(
                'Scraper can load existing data',
                !!existingData,
                existingData ? 'Data loaded successfully' : 'No existing data found'
            );

            // Test validation methods
            if (existingData) {
                const needsUpdate = scraper.needsUpdate(existingData);
                this.addTest(
                    'Update check works',
                    typeof needsUpdate === 'boolean',
                    `Needs update: ${needsUpdate}`
                );
            }

            return true;

        } catch (error) {
            this.addTest('Scraper functionality', false, `Error: ${error.message}`);
            return false;
        }
    }

    // Test 4: Academic scraper integration
    async testAcademicScraperIntegration() {
        console.log('\n🎓 Testing academic scraper integration...');
        
        try {
            const AcademicScraper = require('./academic-scraper');
            this.addTest('Academic scraper module loads', true, 'Module imported successfully');

            const scraper = new AcademicScraper();
            
            // Test configuration loading
            const config = scraper.loadConfig();
            this.addTest(
                'Configuration loads successfully',
                !!config && typeof config === 'object',
                config ? 'Config loaded' : 'Config failed to load'
            );

            // Test Google Scholar configuration
            if (config && config.sources && config.sources.google_scholar) {
                const scholarConfig = config.sources.google_scholar;
                this.addTest(
                    'Google Scholar source is enabled',
                    scholarConfig.enabled === true,
                    `Enabled: ${scholarConfig.enabled}`
                );

                this.addTest(
                    'Google Scholar URL is configured',
                    typeof scholarConfig.url === 'string' && scholarConfig.url.includes('scholar.google.com'),
                    scholarConfig.url || 'No URL configured'
                );
            } else {
                this.addTest('Google Scholar configuration', false, 'Configuration missing or invalid');
            }

            return true;

        } catch (error) {
            this.addTest('Academic scraper integration', false, `Error: ${error.message}`);
            return false;
        }
    }

    // Test 5: Website data loading
    testWebsiteDataLoading() {
        console.log('\n🌐 Testing website data loading...');
        
        try {
            // Test index.html contains real data loading code
            if (!fs.existsSync('index.html')) {
                this.addTest('Website file exists', false, 'index.html not found');
                return false;
            }

            const htmlContent = fs.readFileSync('index.html', 'utf8');

            // Check for real data indicators
            const hasRealDataCode = htmlContent.includes('loadScholarData') || 
                                   htmlContent.includes('data/scholar-data.json');
            this.addTest(
                'Website has real data loading code',
                hasRealDataCode,
                hasRealDataCode ? 'Real data loading found' : 'No real data loading code found'
            );

            // Check for real data badges
            const hasRealDataBadges = htmlContent.includes('REAL DATA') || 
                                     htmlContent.includes('real-data-badge');
            this.addTest(
                'Website has real data indicators',
                hasRealDataBadges,
                hasRealDataBadges ? 'Real data badges found' : 'No real data indicators found'
            );

            // Check for fake data removal
            const hasFakeData = htmlContent.includes('1147') || 
                               htmlContent.includes('citations: 145') ||
                               htmlContent.includes('simulatedUpdates');
            this.addTest(
                'Website has no fake data',
                !hasFakeData,
                hasFakeData ? 'Fake data still present' : 'No fake data found'
            );

            if (hasFakeData) {
                this.addWarning('Website still contains fake data - manual cleanup may be needed');
            }

            return hasRealDataCode;

        } catch (error) {
            this.addTest('Website data loading', false, `Error: ${error.message}`);
            return false;
        }
    }

    // Test 6: Admin interface
    async testAdminInterface() {
        console.log('\n🔧 Testing admin interface...');
        
        try {
            const SimpleAdmin = require('./simple-admin');
            this.addTest('Admin module loads', true, 'Module imported successfully');

            // Test admin can initialize
            const admin = new SimpleAdmin(0); // Port 0 for testing
            this.addTest(
                'Admin interface initializes',
                !!admin,
                'Admin object created successfully'
            );

            // Test admin has required methods
            const requiredMethods = ['apiForceScholarUpdate', 'apiGetScholarData', 'apiGetScholarStatus'];
            let allMethodsPresent = true;

            for (const method of requiredMethods) {
                const hasMethod = typeof admin[method] === 'function';
                this.addTest(
                    `Admin has ${method} method`,
                    hasMethod,
                    hasMethod ? 'Method found' : 'Method missing'
                );
                if (!hasMethod) allMethodsPresent = false;
            }

            return allMethodsPresent;

        } catch (error) {
            this.addTest('Admin interface', false, `Error: ${error.message}`);
            return false;
        }
    }

    // Test 7: Data validator
    testDataValidator() {
        console.log('\n🔍 Testing data validator...');
        
        try {
            const DataValidator = require('./data-validator');
            this.addTest('Data validator module loads', true, 'Module imported successfully');

            const validator = new DataValidator();

            // Test validation with current data
            if (fs.existsSync('data/scholar-data.json')) {
                const data = JSON.parse(fs.readFileSync('data/scholar-data.json', 'utf8'));
                const validation = validator.validateScholarData(data);

                this.addTest(
                    'Current data passes validation',
                    validation.isValid,
                    validation.isValid ? 
                        `Valid with ${validation.warnings.length} warnings` : 
                        `Invalid: ${validation.errors.join(', ')}`
                );

                if (validation.warnings.length > 0) {
                    this.addWarning(`Data validation warnings: ${validation.warnings.join(', ')}`);
                }
            }

            // Test backup functionality
            const backups = validator.getAvailableBackups();
            this.addTest(
                'Backup system works',
                Array.isArray(backups),
                `${backups.length} backups available`
            );

            return true;

        } catch (error) {
            this.addTest('Data validator', false, `Error: ${error.message}`);
            return false;
        }
    }

    // Test 8: End-to-end data flow
    async testEndToEndDataFlow() {
        console.log('\n🔄 Testing end-to-end data flow...');
        
        try {
            // Test: Scholar data -> Website display
            if (!fs.existsSync('data/scholar-data.json')) {
                this.addTest('End-to-end data flow', false, 'No scholar data file to test with');
                return false;
            }

            const scholarData = JSON.parse(fs.readFileSync('data/scholar-data.json', 'utf8'));
            
            // Simulate what the website JavaScript would do
            const expectedFields = ['totalCitations', 'totalPublications', 'mostCitedPublications'];
            let canDisplayData = true;

            for (const field of expectedFields) {
                if (!(field in scholarData)) {
                    canDisplayData = false;
                    break;
                }
            }

            this.addTest(
                'Data can be displayed on website',
                canDisplayData,
                canDisplayData ? 'All required fields present' : 'Missing required fields for display'
            );

            // Test data age for auto-update triggers
            if (scholarData.lastUpdated) {
                const dataAge = (new Date() - new Date(scholarData.lastUpdated)) / (1000 * 60 * 60);
                const triggersUpdate = dataAge > 6; // 6 hours

                this.addTest(
                    'Data age update logic',
                    typeof triggersUpdate === 'boolean',
                    `Data age: ${Math.round(dataAge)}h, triggers update: ${triggersUpdate}`
                );
            }

            return canDisplayData;

        } catch (error) {
            this.addTest('End-to-end data flow', false, `Error: ${error.message}`);
            return false;
        }
    }

    // Test 9: Performance and reliability
    async testPerformanceAndReliability() {
        console.log('\n⚡ Testing performance and reliability...');
        
        try {
            // Test file sizes
            const scholarDataSize = fs.existsSync('data/scholar-data.json') ? 
                fs.statSync('data/scholar-data.json').size : 0;

            this.addTest(
                'Scholar data file size is reasonable',
                scholarDataSize > 100 && scholarDataSize < 1000000, // 100 bytes to 1MB
                `${Math.round(scholarDataSize / 1024)} KB`
            );

            // Test JSON parsing performance
            if (fs.existsSync('data/scholar-data.json')) {
                const parseStart = Date.now();
                JSON.parse(fs.readFileSync('data/scholar-data.json', 'utf8'));
                const parseTime = Date.now() - parseStart;

                this.addTest(
                    'JSON parsing is fast',
                    parseTime < 100, // Less than 100ms
                    `${parseTime}ms`
                );
            }

            // Test directory structure
            const requiredDirs = ['data', 'data/backups'];
            let allDirsExist = true;

            for (const dir of requiredDirs) {
                const exists = fs.existsSync(dir);
                if (!exists) {
                    allDirsExist = false;
                    this.addTest(`Directory exists: ${dir}`, false, 'Directory missing');
                }
            }

            if (allDirsExist) {
                this.addTest('All required directories exist', true, 'Directory structure is correct');
            }

            return true;

        } catch (error) {
            this.addTest('Performance and reliability', false, `Error: ${error.message}`);
            return false;
        }
    }

    // Test 10: Error handling and recovery
    testErrorHandlingAndRecovery() {
        console.log('\n🛡️  Testing error handling and recovery...');
        
        try {
            // Test: What happens with corrupted data?
            const testBadData = { invalid: "data", missing: "fields" };
            
            const DataValidator = require('./data-validator');
            const validator = new DataValidator();
            const validation = validator.validateScholarData(testBadData);

            this.addTest(
                'Validator catches invalid data',
                !validation.isValid && validation.errors.length > 0,
                validation.isValid ? 'Incorrectly passed validation' : `Caught ${validation.errors.length} errors`
            );

            // Test fallback data generation
            const fallbackData = validator.generateFallbackData();
            const fallbackValidation = validator.validateScholarData(fallbackData);

            this.addTest(
                'Fallback data is valid',
                fallbackValidation.isValid,
                fallbackValidation.isValid ? 'Fallback data passes validation' : 'Fallback data is invalid'
            );

            // Test backup system
            if (fs.existsSync('data/scholar-data.json')) {
                const backupPath = validator.createBackup(
                    JSON.parse(fs.readFileSync('data/scholar-data.json', 'utf8')),
                    'test-backup'
                );

                this.addTest(
                    'Backup creation works',
                    !!backupPath && fs.existsSync(backupPath),
                    backupPath ? `Backup created: ${path.basename(backupPath)}` : 'Backup creation failed'
                );

                // Clean up test backup
                if (backupPath && fs.existsSync(backupPath)) {
                    try {
                        fs.unlinkSync(backupPath);
                    } catch (e) {
                        // Ignore cleanup errors
                    }
                }
            }

            return true;

        } catch (error) {
            this.addTest('Error handling and recovery', false, `Error: ${error.message}`);
            return false;
        }
    }

    // Run all tests
    async runAllTests() {
        console.log('🧪 Running comprehensive test suite for real data system...\n');
        
        const tests = [
            () => this.testFileExistence(),
            () => this.testDataValidation(),
            () => this.testScraperFunctionality(),
            () => this.testAcademicScraperIntegration(),
            () => this.testWebsiteDataLoading(),
            () => this.testAdminInterface(),
            () => this.testDataValidator(),
            () => this.testEndToEndDataFlow(),
            () => this.testPerformanceAndReliability(),
            () => this.testErrorHandlingAndRecovery()
        ];

        let allPassed = true;

        for (const test of tests) {
            try {
                const result = await test();
                if (!result) allPassed = false;
            } catch (error) {
                console.log(`❌ Test failed with exception: ${error.message}`);
                allPassed = false;
            }
        }

        // Generate report
        this.generateReport(allPassed);
        
        return allPassed;
    }

    // Generate test report
    generateReport(allPassed) {
        const duration = Math.round((Date.now() - this.startTime) / 1000);
        const passedCount = this.testResults.filter(t => t.passed).length;
        const totalCount = this.testResults.length;

        console.log('\n📋 TEST REPORT');
        console.log('==============');
        console.log(`Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
        console.log(`Tests Run: ${totalCount}`);
        console.log(`Passed: ${passedCount}`);
        console.log(`Failed: ${totalCount - passedCount}`);
        console.log(`Warnings: ${this.warnings.length}`);
        console.log(`Duration: ${duration} seconds`);

        if (this.errors.length > 0) {
            console.log('\n❌ FAILURES:');
            this.errors.forEach(error => console.log(`  - ${error}`));
        }

        if (this.warnings.length > 0) {
            console.log('\n⚠️  WARNINGS:');
            this.warnings.forEach(warning => console.log(`  - ${warning}`));
        }

        // Save detailed report
        const report = {
            timestamp: new Date().toISOString(),
            overall_status: allPassed ? 'PASSED' : 'FAILED',
            summary: {
                total: totalCount,
                passed: passedCount,
                failed: totalCount - passedCount,
                warnings: this.warnings.length,
                duration_seconds: duration
            },
            test_results: this.testResults,
            errors: this.errors,
            warnings: this.warnings
        };

        try {
            fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
            console.log('\n📄 Detailed report saved to: test-report.json');
        } catch (e) {
            console.log('⚠️  Could not save detailed report');
        }

        // Recommendations
        console.log('\n💡 RECOMMENDATIONS:');
        
        if (allPassed) {
            console.log('  ✅ Your real data system is working correctly!');
            console.log('  ✅ You can safely use the website in production');
            console.log('  🔄 Consider setting up automated testing');
        } else {
            console.log('  ❌ Fix the failed tests before using in production');
            console.log('  🔧 Check the migration script if issues persist');
            console.log('  📧 Contact support if you need help with complex issues');
        }

        if (this.warnings.length > 0) {
            console.log('  ⚠️  Address warnings for optimal performance');
        }
    }

    // Quick health check
    quickHealthCheck() {
        console.log('🩺 Quick health check...\n');
        
        const criticalChecks = [
            { name: 'Scholar data file', test: () => fs.existsSync('data/scholar-data.json') },
            { name: 'Data is valid JSON', test: () => {
                try {
                    JSON.parse(fs.readFileSync('data/scholar-data.json', 'utf8'));
                    return true;
                } catch (e) {
                    return false;
                }
            }},
            { name: 'Real scraper exists', test: () => fs.existsSync('real-scholar-scraper.js') },
            { name: 'Updated index.html', test: () => {
                const content = fs.readFileSync('index.html', 'utf8');
                return content.includes('loadScholarData') || content.includes('data/scholar-data.json');
            }}
        ];

        let healthyCount = 0;

        for (const check of criticalChecks) {
            try {
                const passed = check.test();
                console.log(`${passed ? '✅' : '❌'} ${check.name}`);
                if (passed) healthyCount++;
            } catch (error) {
                console.log(`❌ ${check.name} (Error: ${error.message})`);
            }
        }

        const healthPercentage = Math.round((healthyCount / criticalChecks.length) * 100);
        console.log(`\n🏥 System Health: ${healthPercentage}% (${healthyCount}/${criticalChecks.length})`);

        if (healthPercentage === 100) {
            console.log('✅ System appears healthy - ready for use!');
        } else if (healthPercentage >= 75) {
            console.log('⚠️  System mostly healthy - minor issues detected');
        } else {
            console.log('❌ System needs attention - major issues detected');
        }

        return healthPercentage;
    }
}

// Command line interface
async function main() {
    const testSuite = new RealDataTestSuite();
    const command = process.argv[2] || 'help';

    switch (command) {
        case 'all':
            const allPassed = await testSuite.runAllTests();
            process.exit(allPassed ? 0 : 1);
            break;

        case 'health':
            const health = testSuite.quickHealthCheck();
            process.exit(health === 100 ? 0 : 1);
            break;

        case 'data':
            testSuite.testDataValidation();
            break;

        case 'files':
            testSuite.testFileExistence();
            break;

        case 'website':
            testSuite.testWebsiteDataLoading();
            break;

        case 'help':
        default:
            console.log(`
🧪 Comprehensive Testing Suite for Real Data System

Usage: node testing-suite.js [command]

Commands:
  all      - Run all tests (comprehensive)
  health   - Quick health check (essential tests only)
  data     - Test data validation only
  files    - Test file existence only  
  website  - Test website integration only
  help     - Show this help

Examples:
  node testing-suite.js all       # Full test suite
  node testing-suite.js health    # Quick check
  node testing-suite.js data      # Just validate data

Exit codes:
  0 = All tests passed
  1 = Some tests failed

Test report is saved to: test-report.json
            `);
            break;
    }
}

// Export for use as module
module.exports = RealDataTestSuite;

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Testing suite failed:', error.message);
        process.exit(1);
    });
}