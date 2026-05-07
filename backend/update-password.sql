-- Update doctor password to 'password123'
UPDATE users 
SET password_hash = '$2b$10$yGqAiTAAt2/LwJ5N5.JC0utc7VWOSzT/uTGXFBE/Vkm2Il3Klqa0O',
    updated_at = NOW()
WHERE username = 'doctor';

-- Verify the update
SELECT username, email, password_hash 
FROM users 
WHERE username = 'doctor';
