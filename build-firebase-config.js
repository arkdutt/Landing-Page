#!/usr/bin/env node

/**
 * Build script to generate firebase-config.js from .env file
 * Usage: node build-firebase-config.js
 * Or: npm run build:config
 */

import { config } from 'dotenv';
import { writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
console.log('Loading environment variables from .env...');
const result = config();

if (result.error) {
  console.error('Error loading .env file:', result.error.message);
  process.exit(1);
}

// Get Firebase config values
const apiKey = process.env.API_KEY || '';
const authDomain = process.env.AUTH_DOMAIN || '';
const projectId = process.env.PROJECT_ID || '';
const storageBucket = process.env.STORAGE_BUCKET || '';
const messagingSenderId = process.env.MESSAGING_SENDER_ID || '';
const appId = process.env.APP_ID || '';
const measurementId = process.env.MEASUREMENT_ID || '';

// Check if all required values are present
const allPresent = apiKey && authDomain && projectId && storageBucket && 
                    messagingSenderId && appId && measurementId;

if (!allPresent) {
  console.warn('\n⚠️  Warning: Some environment variables are missing!\n');
  console.log(`API_KEY:              ${apiKey ? '✓' : '✗'}`);
  console.log(`AUTH_DOMAIN:          ${authDomain ? '✓' : '✗'}`);
  console.log(`PROJECT_ID:           ${projectId ? '✓' : '✗'}`);
  console.log(`STORAGE_BUCKET:       ${storageBucket ? '✓' : '✗'}`);
  console.log(`MESSAGING_SENDER_ID:  ${messagingSenderId ? '✓' : '✗'}`);
  console.log(`APP_ID:               ${appId ? '✓' : '✗'}`);
  console.log(`MEASUREMENT_ID:       ${measurementId ? '✓' : '✗'}`);
  console.log('\nMake sure your .env file is formatted correctly:');
  console.log('API_KEY=your-api-key\nAUTH_DOMAIN=your-domain\n...\n');
}

// Generate the config file
const configContent = `// Firebase Configuration
// This file is auto-generated from .env - DO NOT EDIT MANUALLY
// Run: npm run build:config to regenerate

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const firebaseConfig = {
  apiKey: "${apiKey}",
  authDomain: "${authDomain}",
  projectId: "${projectId}",
  storageBucket: "${storageBucket}",
  messagingSenderId: "${messagingSenderId}",
  appId: "${appId}",
  measurementId: "${measurementId}"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, signInWithEmailAndPassword, onAuthStateChanged, signOut };
`;

// Write to firebase-config.js
const outputPath = join(__dirname, 'js', 'firebase-config.js');

try {
  writeFileSync(outputPath, configContent, 'utf8');
  console.log(`\n✓ Successfully generated ${outputPath}`);
  console.log('✓ Firebase configuration is ready!\n');
} catch (error) {
  console.error('Error writing file:', error.message);
  process.exit(1);
}

