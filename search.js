class SearchController extends Controller {
    load(data) {
        console.log("SEARCH: Load")
        console.log(data)
        this.data = {
            list: [], focus: false, hints: [], text: '', loading: false, hasMore: false
        }
    }

    onHintPressed(index) {
    }

    onLoadMore() {
    }

    async onPressed(index) {
        await this.navigateTo('book', {
            data: this.data.list[index]
        });
    }

    onTextChange(text) {
        this.data.text = text;
    }

    async onTextSubmit() {
        this.setState(() => {
            this.data.loading = true;
        });
        const list = await this.request();
        console.log(list.map(e => e.title))
        this.setState(() => {
            this.data.list = list;
            this.data.loading = false;
            this.data.hasMore = false;
        });
    }

    onRefresh() {
    }

    async request() {
        console.log(this.data.text);
        if (this.data.text.length < 4) return;
        const html = await fetch("https://gitmanga.com/index.php?do=search", {
            method: "POST",
            body: "do=search&subaction=search&search_start=0&full_search=0&result_from=1&story=" + encodeURIComponent(this.data.text),
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "*/*"
            }
        }).then(res => res.text());
        console.log("Response");
        return this.parseData(html);
    }

    parseData(html) {
        const doc = HTMLParser.parse(html);
        const results = [];
        const articles = doc.querySelectorAll("div#dle-content > article#short");
        for (const article of articles) {
            const title = article.querySelector("div.sh-title").textContent.trim();
            const link = article.querySelector("a.short-poster").getAttribute("href");
            const imageSrc = "https://gitmanga.com" + article.querySelector("a.short-poster > img.poster").getAttribute("data-src");
            results.push({title, link, picture: imageSrc})
        }
        return results;
    }
}

module.exports = SearchController;