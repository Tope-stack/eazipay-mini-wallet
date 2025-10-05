const { encryptPrivateKey, decryptPrivateKey } = require('../../util/encryption');

describe('Encryption Utility', () => {
  describe('encryptPrivateKey', () => {
    test('should encrypt a private key', () => {
      const privateKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const encrypted = encryptPrivateKey(privateKey);
      
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(privateKey);
      expect(encrypted).toContain(':'); // IV:encrypted format
    });

    test('should produce different output each time (random IV)', () => {
      const privateKey = '0x1234567890abcdef';
      const encrypted1 = encryptPrivateKey(privateKey);
      const encrypted2 = encryptPrivateKey(privateKey);
      
      expect(encrypted1).not.toBe(encrypted2); // Different IVs
    });
  });

  describe('decryptPrivateKey', () => {
    test('should decrypt an encrypted private key', () => {
      const originalKey = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      const encrypted = encryptPrivateKey(originalKey);
      const decrypted = decryptPrivateKey(encrypted);
      
      expect(decrypted).toBe(originalKey);
    });

    test('should handle multiple encrypt/decrypt cycles', () => {
      const originalKey = '0xabcdef1234567890';
      
      const encrypted1 = encryptPrivateKey(originalKey);
      const decrypted1 = decryptPrivateKey(encrypted1);
      
      const encrypted2 = encryptPrivateKey(decrypted1);
      const decrypted2 = decryptPrivateKey(encrypted2);
      
      expect(decrypted2).toBe(originalKey);
    });
  });

  describe('encryption integration', () => {
    test('should encrypt and decrypt correctly', () => {
      const testKeys = [
        '0x1234567890abcdef',
        '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
        '0x0000000000000000000000000000000000000000000000000000000000000001'
      ];
      
      testKeys.forEach(key => {
        const encrypted = encryptPrivateKey(key);
        const decrypted = decryptPrivateKey(encrypted);
        expect(decrypted).toBe(key);
      });
    });
  });
});