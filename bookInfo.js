async function bookInfo(url) {
    const html = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36"
        }
    })
        .then(res => res.text())
    const doc = HTMLParser.parse(html);
    const title = doc.querySelector("div#fheader").textContent.trim();
    const list = [];
    const listNodes = doc.querySelectorAll("li.chapters-list__item");
    for (const node of listNodes) {
        const aNode = node.querySelector("a.item-serial");
        const name = aNode.querySelector("div.item-title").textContent.trim();
        const link = aNode.getAttribute("href")
        list.push({title: name, link});
    }
    return {
        title, list: list
    }
}

module.exports = bookInfo;