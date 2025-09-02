const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

class SecretsManager {
  constructor() {
    this.client = new SecretManagerServiceClient();
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'biblereading-f222a';
    this.secretsCache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes cache
  }

  async getSecret(secretName, version = 'latest') {
    const cacheKey = `${secretName}:${version}`;
    const cached = this.secretsCache.get(cacheKey);
    
    if (cached && Date.now() < cached.expiresAt) {
      return cached.value;
    }

    try {
      const name = `projects/${this.projectId}/secrets/${secretName}/versions/${version}`;
      const [response] = await this.client.accessSecretVersion({ name });
      const payload = response.payload.data.toString('utf8');
      
      // Cache the result
      this.secretsCache.set(cacheKey, {
        value: payload,
        expiresAt: Date.now() + this.cacheTTL
      });
      
      return payload;
    } catch (error) {
      console.error(`Failed to retrieve secret ${secretName}:`, error);
      throw error;
    }
  }

  async getFirebaseServiceAccount() {
    try {
      const serviceAccountJson = await this.getSecret('firebase-service-account');
      return JSON.parse(serviceAccountJson);
    } catch (error) {
      console.error('Failed to retrieve Firebase service account:', error);
      throw error;
    }
  }

  async getFirebaseConfig() {
    try {
      const configJson = await this.getSecret('firebase-web-config');
      return JSON.parse(configJson);
    } catch (error) {
      console.error('Failed to retrieve Firebase web config:', error);
      throw error;
    }
  }

  clearCache() {
    this.secretsCache.clear();
  }
}

module.exports = new SecretsManager();