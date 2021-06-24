
import extractOrigin from '../processes/extract-origin';

describe('Extracts origin', () => {
    it('From base URL', () => {
        const toyotaUrl = 'http://toyotainstituteaustralia.com.au';
        expect(extractOrigin(toyotaUrl)).toBe(toyotaUrl);
    });
    it('With tailing slash', () => {
        const toyotaUrl = 'http://toyotainstituteaustralia.com.au';
        expect(extractOrigin(`${toyotaUrl}/`)).toBe(toyotaUrl);
    });
    it('With tailing path', () => {
        const toyotaUrl = 'http://toyotainstituteaustralia.com.au';
        expect(extractOrigin(`${toyotaUrl}/some/path`)).toBe(toyotaUrl);
    });
});
