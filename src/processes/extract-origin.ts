
function extractOrigin(url: string): string {
    return url.replace(/^((\w+:)?\/\/[^\/]+).*$/, '$1');
}

export default extractOrigin;
