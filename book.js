const bookFetch = require("./bookInfo")


class BookController extends Controller {
    /**
     *
     * @property {String}key The unique identifier of the favorite item
     * @property {String}title The name of book
     * @property {String}subtitle The subtitle of book
     * @property {String}picture The cover of book.
     * @property {Object}data Data will be sent to book page.
     * @property {String}page The book page path.
     */
    get bookInfo() {
        return {
            key: this.link,
            title: this.data.title,
            subtitle: this.data.title,
            picture: this.data.picture,
            page: 'book',
            data: {
                link: this.link, title: this.data.title, picture: this.data.picture,
            },
        };
    }

    async load(data) {
        console.log("BOOK: Load")
        console.log("\n" + JSON.stringify(data, null, 2))
        this.link = data.link;
        this.data = {
            title: data.title, picture: data.picture, list: [], loading: false, editing: false,
        }
        this.selected = [];
        await this.reload();
        FavoritesManager.clearNew(this.link);
        // this.data.last = this.getLast();
        this.addHistory(this.bookInfo);
    }

    async reload() {
        this.setState(() => {
            this.data.loading = true;
        });
        console.log("this.link", this.link)
        await bookFetch(this.link).then((data) => {
            console.log("data.title", data.title)
            this.setState(() => {
                this.data.title = data.title;
                this.data.list = data.list;
                this.data.loading = false;
            });
        });

    }

    async onPressed(index) {
        if (this.data.editing) {
            this.setState(() => {
                let loc = this.selected.indexOf(index);
                if (loc >= 0) {
                    this.selected.splice(loc, 1);
                } else {
                    this.selected.push(index);
                }
            });
        } else {
            localStorage[`bookLastOpened:${this.link}`] = index
            await this.openBook({
                key: this.link, list: this.data.list, index,
            });
        }
    }

    onCheckPressed() {
        const downloadList = [];
        for (const index of this.selected) {
            const data = this.data.list[index];
            downloadList.push({
                key: data.link, title: this.data.title, link: this.link, picture: this.data.picture, data
            });
        }
        this.addDownload(downloadList);
        this.selected = [];
        this.setState(() => {
            this.data.editing = false;
        });
    }

    onDownloadPressed() {
        this.setState(() => {
            this.data.editing = true;
        });
    }

    isSelected(index) {
        return this.selected.indexOf(index) >= 0;
    }

    onClearPressed() {
        this.selected = [];
        this.setState(() => {
            this.data.editing = false;
        });
    }

    onRefresh() {
        this.reload()
    }

    onFavoritePressed() {
        this.setState(() => {
            if (this.isFavorite()) {
                FavoritesManager.remove(this.link)
            } else {
                /**
                 * Add to favorites list
                 *
                 * The first argument see `bookinfo`
                 *
                 * The second argument is optional
                 * @param {String}title The title of the last chapter
                 * @param {String}key The unique identifier of the last chapter
                 */
                const lastOpenedIndex = parseInt(localStorage[`bookLastOpened:${this.link}`])
                const data = this.data.list[lastOpenedIndex];
                const last = {
                    title: data.title, key: data.link,
                };
                this.addFavorite(this.bookInfo, last);
            }
        });
    }

    isDownloaded(index) {
        let item = this.data.list[index];
        return DownloadManager.exist(item.link);
    }

    getLast() {
        if (this.getLastKey) {
            let key = this.getLastKey(this.link);
            if (key) {
                for (let data of this.data.list) {
                    if (data.link === key) {
                        let title = data.title;
                        if (title.length > 18) {
                            title = '...' + title.slice(title.length - 16)
                        }
                        return title;
                    }
                }
            }
        }
        return null
    }

    isFavorite() {
        return FavoritesManager.exist(this.link);
    }
}

module.exports = BookController;