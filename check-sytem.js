// check-system.js - Verifies Node.js, npm, and dependencies
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('\n+--------------------------------------------------------------+');
console.log("|     St. Mary's Kibabii - System Verification Tool            |");
console.log('+--------------------------------------------------------------+\n');

// Check Node.js version
const nodeVersion = process.version;
console.log(`✅ Node.js version: ${nodeVersion}`);
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion < 18) {
    console.warn(`⚠️ Warning: Node.js version ${majorVersion} is outdated. Recommended: v18 or higher`);
} else {
    console.log(`✅ Node.js version is compatible`);
}

// Check npm availability
try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
    console.log(`✅ npm version: ${npmVersion}`);
} catch (error) {
    console.error('❌ npm is not installed or not in PATH');
    console.log('   Please install Node.js from https://nodejs.org/');
}

// Check required files
const requiredFiles = ['server.js', 'database.js', 'package.json'];
const frontendFiles = ['index.html', 'style.css', 'script.js'];

console.log('\n📁 Checking backend files...');
requiredFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
        console.log(`   ✅ ${file}`);
    } else {
        console.log(`   ❌ ${file} - MISSING`);
    }
});

console.log('\n📁 Checking frontend files...');
const frontendPath = path.join(__dirname, '../frontend');
if (fs.existsSync(frontendPath)) {
    frontendFiles.forEach(file => {
        if (fs.existsSync(path.join(frontendPath, file))) {
            console.log(`   ✅ ${file}`);
        } else {
            console.log(`   ⚠️ ${file} - NOT FOUND`);
        }
    });
} else {
    console.log('   ❌ frontend folder not found');
}

// Check video files
console.log('\n🎬 Checking video files...');
const videosPath = path.join(frontendPath, 'videos');
if (fs.existsSync(videosPath)) {
    const videos = fs.readdirSync(videosPath);
    if (videos.includes('background.mp4')) console.log('   ✅ background.mp4');
    else console.log('   ⚠️ background.mp4 - MISSING');
    if (videos.includes('losder.mp4')) console.log('   ✅ losder.mp4');
    else console.log('   ⚠️ losder.mp4 - MISSING');
} else {
    console.log('   ❌ videos folder not found');
}

// Check audio files
console.log('\n🎵 Checking audio files...');
const audioPath = path.join(frontendPath, 'audio');
if (fs.existsSync(audioPath)) {
    const audio = fs.readdirSync(audioPath);
    if (audio.some(f => f.includes('kiba-anthem'))) console.log('   ✅ kiba-anthem.mp3 found');
    else console.log('   ⚠️ kiba-anthem.mp3 - MISSING');
} else {
    console.log('   ⚠️ audio folder not found');
}

// Check dependencies
console.log('\n📦 Checking dependencies...');
const packageJson = require('./package.json');
const deps = packageJson.dependencies || {};
const missingDeps = [];
Object.keys(deps).forEach(dep => {
    try {
        require.resolve(dep);
        console.log(`   ✅ ${dep}`);
    } catch (e) {
        console.log(`   ❌ ${dep} - NOT INSTALLED`);
        missingDeps.push(dep);
    }
});

if (missingDeps.length > 0) {
    console.log(`\n⚠️ Run 'npm install' to install missing dependencies: ${missingDeps.join(', ')}`);
}

console.log('\n✅ System check completed!\n');