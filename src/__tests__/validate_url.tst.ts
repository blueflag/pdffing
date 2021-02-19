import validateUrl from '../processes/validate_url';

describe('validate url', () => {
    describe('accepts toyota url', () => {
        it('Base URL', () => {
          expect(validateUrl('http://toyotainstituteaustralia.com.au/')).toBe(true);
        });
        it('Staging URL', () => {
          expect(validateUrl('http://staging.toyotainstituteaustralia.com.au/')).toBe(true);
        });
        it('Gap report', () => {
          expect(validateUrl('http://toyotainstituteaustralia.com.au/#/gapreport/technical_overview?_k=9tmgew')).toBe(true);
        });
    });
    describe('accepts blueflag url', () => {
        it('Base URL', () => {
          expect(validateUrl('https://blueflag.com.au/')).toBe(true);
        });
        it('HTTP', () => {
          expect(validateUrl('http://blueflag.com.au/')).toBe(true);
        });
        it('Blog', () => {
          expect(validateUrl('https://blueflag.com.au/blog/')).toBe(true);
        });
    });
    describe('Rejects other domains', () => {
        it('Google', () => {
          expect(validateUrl('http://google.com/')).toBe(false);
        });
    });
    describe('Rejects Toyota subdomains', () => {
        it('Google', () => {
          expect(validateUrl('http://other.toyotainstituteaustralia.com.au/')).toBe(true);
        });
    });
});

