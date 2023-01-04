class MainController extends Controller {
    load(data) {
        console.log("MAIN: Load")
        console.log(Object.entries(data))
        this.id = data.id;
        this.link = data.url;
        this.page = 0;
        this.ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";
        this.data = {
            list: [], loading: false
        };
        this.onRefresh()
    }

    parseData(html) {
        const doc = HTMLParser.parse(html);
        const results = [];
        const articles = doc.querySelectorAll("article.short");
        for (const article of articles) {
            const title = article.querySelector("h2.sh-title").textContent.trim();
            const link = article.querySelector("a.short-poster").getAttribute("href");
            const imageSrc = this.link.slice(0, -1) + article.querySelector("a.short-poster > img.poster").getAttribute("data-src");
            results.push({title, link, picture: imageSrc})
        }
        return results;
    }

    async onPressed(index) {
        await this.navigateTo('book', {
            data: this.data.list[index]
        });
    }

    async reload() {
        this.setState(() => {
            this.data.loading = true;
        });
        const html = await fetch(this.link, {
            headers: {
                "User-Agent": this.ua
            }
        }).then(res => res.text());
        const results = this.parseData(html);
        this.setState(() => {
            this.data.loading = false;
            this.data.list = results;
        })
    }

    onRefresh() {
        console.log("onRefresh");
        this.reload();
    }
}

module.exports = MainController;