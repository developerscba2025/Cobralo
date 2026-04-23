import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

const getEncryptionKey = (): Buffer => {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error('ENCRYPTION_KEY environment variable is required for secure operations.');
    }
    // Ensures key is exactly 32 bytes for aes-256-gcm using SHA-256 (no static salts)
    // or use it directly if it spans exactly 32 bytes.
    if (Buffer.from(key).length === 32) return Buffer.from(key);
    return crypto.createHash('sha256').update(key).digest();
};

export const encrypt = (text: string): string => {
    try {
        const iv = crypto.randomBytes(16);
        const key = getEncryptionKey();
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
        
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        // Format: iv:authTag:encryptedText
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt data');
    }
};

export const decrypt = (encryptedData: string): string => {
    try {
        const parts = encryptedData.split(':');
        
        if (parts.length !== 3) {
            console.warn('Attempted to decrypt data that does not match expected format. Returning original string.');
            return encryptedData;
        }

        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encryptedText = parts[2];
        const key = getEncryptionKey();
        
        try {
            const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
            decipher.setAuthTag(authTag);
            
            let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (e) {
            // Fallback for previously encrypted data with static salt
            const legacyKey = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);
            const legacyDecipher = crypto.createDecipheriv(ALGORITHM, legacyKey, iv);
            legacyDecipher.setAuthTag(authTag);
            let decrypted = legacyDecipher.update(encryptedText, 'hex', 'utf8');
            decrypted += legacyDecipher.final('utf8');
            return decrypted;
        }
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt data');
    }
};
