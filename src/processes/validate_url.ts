
const validationTests: RegExp[] = [
    /https?:\/\/(staging\.)?toyotainstituteaustralia.com.au\/.*/,
    /https?:\/\/(staging\.)?lexusacademy.com.au\/.*/,
    /https?:\/\/blueflag.com.au\/.*/,
    /https?:\/\/bigdatr.com\/.*/,
    /https?:\/\/manytools.org.*/ // Used for testing headers
];

export default function validateUrl(url: string): boolean {
    return validationTests.findIndex((test) => test.test(url)) >= 0;
} 
