const bookFetch = require("./bookInfo");
const {pagesCount} = require("./chapterInfo")
// processor.js
// Processor will be used in two satuations
//   1. Load manga pictures.
//   2. Detect if a manga has new chapter.
class MangaProcesser extends Processor {
    // The unique identifier for detecting which manga chapter is processing on.
    get key() {
        return this.data.link;
    }

    /**
     * Start load pictures, need override
     *
     * @param {*} state The saved state.
     * @return Promise
     */
    async load(state) {
        console.log("PROCESSOR: Load")
        console.log("\n" + JSON.stringify(this.data, null, 2));
        console.log("\n" + JSON.stringify(state || {}, null, 2));
        const rootUrl = this.data.link;
        this.loading = true;
        if (!(state && state.urls)) {
            const pages = await pagesCount(rootUrl);
            const urls = [];
            for (let i = 0; i < pages; i++) {
                const newURL = rootUrl.replace(/p=\d+/i, `p=${i + 1}`);
                urls.push(newURL);
            }
            state = {
                index: 0, urls: urls, offset: 0
            }
        }
        const that = this;

        function parseDoc(doc, index) {
            const imgSrc = "https://gitmanga.com" + doc.querySelector("div.pr > img").getAttribute("src");
            console.log("imgSrc", imgSrc)
            that.setDataAt({
                url: imgSrc
            }, index);
        }

        while (state.index < state.urls.length) {
            this.save(false, state);
            let url = state.urls[state.index];
            let doc = HTMLParser.parse(await fetch(url).then(res => res.text()));
            if (this.disposed) return;
            parseDoc(doc, state.index);
            console.log("index", state.index);
            state.index++;
            state.offset = state.index;
        }
        this.save(true, state);
        this.loading = false;
    };

    // Called in `dispose`, need override
    unload() {
    };

    /**
     * Check for new chapter, need override
     *
     * @return Promise<{title, key}> The information of last chapter
     */
    async checkNew() {
        let url = this.data.link;
        let data = await bookFetch(url);
        var item = data.list[data.list.length - 1];
        /**
         * @property {String}title The last chapter title.
         * @property {String}key The unique identifier of last chpater.
         */
        return {
            title: item.title, key: item.link,
        };
    }

    /**
     * After getting the picture information, set the picture data than
     * it will be shown.
     * @param data.url {String} The picture url
     * @param data.headers {Object} Optional, The picture http headers.
     * @param list {List} A list ot picture information.
     setDataAt(data) {
    };

     setData(list) {
    };
     */

}

module.exports = MangaProcesser;