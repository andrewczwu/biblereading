#!/usr/bin/env node

const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const fs = require('fs');
const path = require('path');

const client = new SecretManagerServiceClient();
const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'biblereading-f222a';

async function createSecret(secretId, secretValue, description) {
  try {
    const parent = `projects/${projectId}`;

    // Create the secret
    const [secret] = await client.createSecret({
      parent: parent,
      secretId: secretId,
      secret: {
        labels: {
          environment: 'production',
          application: 'bible-reading-app'
        },
        replication: {
          automatic: {},
        },
      },
    });

    console.log(`✓ Created secret: ${secret.name}`);

    // Add a version with the secret data
    const [version] = await client.addSecretVersion({
      parent: secret.name,
      payload: {
        data: Buffer.from(secretValue),
      },
    });

    console.log(`✓ Added version: ${version.name}`);
    return secret;
  } catch (error) {
    if (error.code === 6) { // ALREADY_EXISTS
      console.log(`Secret ${secretId} already exists, adding new version...`);
      
      try {
        const [version] = await client.addSecretVersion({
          parent: `projects/${projectId}/secrets/${secretId}`,
          payload: {
            data: Buffer.from(secretValue),
          },
        });
        console.log(`✓ Added version: ${version.name}`);
      } catch (versionError) {
        console.error(`Failed to add version to existing secret ${secretId}:`, versionError);
        throw versionError;
      }
    } else {
      console.error(`Failed to create secret ${secretId}:`, error);
      throw error;
    }
  }
}

async function createFirebaseSecrets() {
  console.log(`Creating secrets for project: ${projectId}`);
  
  try {
    // 1. Create Firebase Service Account secret
    const serviceAccountPath = path.join(__dirname, '..', 'biblereading-pkey.json');
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccountJson = fs.readFileSync(serviceAccountPath, 'utf8');
      await createSecret(
        'firebase-service-account',
        serviceAccountJson,
        'Firebase Admin SDK service account credentials'
      );
    } else {
      console.warn('⚠️  Firebase service account file not found. Please create it manually in Secret Manager.');
      console.log('   You can add it later with: gcloud secrets create firebase-service-account --data-file=biblereading-pkey.json');
    }

    // 2. Create Firebase Web Config secret
    const clientEnvPath = path.join(__dirname, '..', 'client-new', '.env');
    if (fs.existsSync(clientEnvPath)) {
      const envContent = fs.readFileSync(clientEnvPath, 'utf8');
      const firebaseConfig = {};
      
      // Parse Firebase config from .env file
      envContent.split('\n').forEach(line => {
        if (line.startsWith('VITE_FIREBASE_')) {
          const [key, value] = line.split('=');
          const configKey = key.replace('VITE_FIREBASE_', '').toLowerCase();
          firebaseConfig[configKey] = value.replace(/"/g, '');
        }
      });

      await createSecret(
        'firebase-web-config',
        JSON.stringify(firebaseConfig, null, 2),
        'Firebase Web SDK configuration'
      );
    } else {
      console.warn('⚠️  Client .env file not found. Please create firebase-web-config secret manually.');
    }

    // 3. Create other application secrets
    await createSecret(
      'database-id',
      process.env.FIRESTORE_DATABASE_ID || 'biblereading',
      'Firestore database ID'
    );

    console.log('\\n✅ All secrets created successfully!');
    console.log('\\n📋 Next steps:');
    console.log('1. Set GOOGLE_CLOUD_PROJECT_ID environment variable in production');
    console.log('2. Ensure your application has proper IAM permissions to access Secret Manager');
    console.log('3. Test the application with the new secret integration');
    console.log('4. Remove or secure the local biblereading-pkey.json file');

  } catch (error) {
    console.error('❌ Failed to create secrets:', error);
    process.exit(1);
  }
}

// Handle command line execution
if (require.main === module) {
  createFirebaseSecrets().catch(console.error);
}

module.exports = { createFirebaseSecrets };