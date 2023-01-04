async function request(url) {
    const html = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
        }
    })
        .then(res => res.text())
    return HTMLParser.parse(html);
}

module.exports = {
    pagesCount: async (url) => {
        const doc = await request(url);
        const buttonText = doc.querySelector("span.but_mob_glavs.page_buts.page_buts_none").textContent.trim();
        return parseInt(buttonText.split("/")[1]);
    }
};