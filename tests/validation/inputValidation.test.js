// Input validation helpers
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const validateUsername = (username) => {
  // 3-20 characters, alphanumeric and underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

const validateWorkoutTime = (time) => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

describe('Input Validation', () => {
  describe('Email Validation', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org'
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com',
        'test@.com'
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const validPasswords = [
        'Password123',
        'StrongP@ss1',
        'MySecure123'
      ];

      validPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(true);
      });
    });

    it('should reject weak passwords', () => {
      const invalidPasswords = [
        'password',      // no uppercase, no number
        'PASSWORD123',   // no lowercase
        'Password',      // no number
        'Pass1',         // too short
        '12345678'       // no letters
      ];

      invalidPasswords.forEach(password => {
        expect(validatePassword(password)).toBe(false);
      });
    });
  });

  describe('Username Validation', () => {
    it('should validate correct usernames', () => {
      const validUsernames = [
        'user123',
        'test_user',
        'Username',
        'user_name_123'
      ];

      validUsernames.forEach(username => {
        expect(validateUsername(username)).toBe(true);
      });
    });

    it('should reject invalid usernames', () => {
      const invalidUsernames = [
        'us',              // too short
        'this_is_a_very_long_username', // too long
        'user-name',       // contains hyphen
        'user name',       // contains space
        'user@name'        // contains special char
      ];

      invalidUsernames.forEach(username => {
        expect(validateUsername(username)).toBe(false);
      });
    });
  });

  describe('Time Validation', () => {
    it('should validate correct time formats', () => {
      const validTimes = [
        '07:00',
        '23:59',
        '00:00',
        '12:30',
        '9:15'
      ];

      validTimes.forEach(time => {
        expect(validateWorkoutTime(time)).toBe(true);
      });
    });

    it('should reject invalid time formats', () => {
      const invalidTimes = [
        '25:00',    // invalid hour
        '12:60',    // invalid minute
        '7:5',      // single digit minute
        '12',       // missing minute
        'abc:def'   // non-numeric
      ];

      invalidTimes.forEach(time => {
        expect(validateWorkoutTime(time)).toBe(false);
      });
    });
  });
});