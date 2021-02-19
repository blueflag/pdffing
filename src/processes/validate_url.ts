
const validationTests: RegExp[] = [
  /https?:\/\/(staging\.)?toyotainstituteaustralia.com.au\/.*/,
  /https?:\/\/blueflag.com.au\/.*/,
  /https?:\/\/bigdatr.com\/.*/
]

export default function validateUrl(url: string): boolean {
  return validationTests.findIndex((test) => test.test(url)) >= 0;
} 
