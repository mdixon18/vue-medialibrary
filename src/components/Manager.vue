<template>
    <div class="media-library">
        <div class="media-library__inner">
            <header class="media-library__header">
                Media Library

                <span class="media-library__close" @click="close">
                    <app-icon icon="times" />
                </span>
            </header>

            <div v-if="loading.wrapper" class="media-library__loader">
                <app-medialibrary-loader />
            </div>
            <div v-else-if="error" class="media-library__error">
                <span class="media-library__error__ttl">Oh Dear!</span>
                <p class="media-library__error__msg">There was a serious problem... This is likely because something isn't setup properly. Please consult the documentation.</p>
                <app-svg-error />
            </div>
            <div v-else class="media-library__manager">
                <div class="media-library__manager__nav">
                    <div>
                        <span 
                            v-if="types.images"
                            class="media-library__manager__nav__option" 
                            :class="{ 'active': type == 'images', 'inactive': type != 'images' }"
                            @click="openFile = null; type = 'images'"
                        >Images <strong>({{ store.images.total }})</strong></span>
                        <span 
                            v-else
                            class="media-library__manager__nav__option deactive"
                        >Images <strong>({{ store.images.total }})</strong></span>

                        <span 
                            v-if="types.files"
                            class="media-library__manager__nav__option" 
                            :class="{ 'active': type == 'files', 'inactive': type != 'files' }"
                            @click="openFile = null; type = 'files'"
                        >Files <strong>({{ store.files.total }})</strong></span>
                        <span 
                            v-else
                            class="media-library__manager__nav__option deactive"
                        >Files <strong>({{ store.files.total }})</strong></span>
                    </div>
                    <div class="media-library__manager__nav__push">
                        <span 
                            class="media-library__manager__nav__button" 
                            :class="{ 'active': toggles.upload }"
                            @click="toggles.upload = !toggles.upload"
                        >Upload</span>
                        <input class="media-library__manager__nav__search" id="medialibrary-search" type="text" placeholder="Type to search..." v-model="search">
                    </div>
                </div>

                <div class="media-library__manager__content" style="height: 0%;">
                    <div class="media-library__manager__content__images" :class="{'open': toggles.file }">
                        <div class="media-library__manager__content__images__inner">
                            <div class="media-library__manager__upload" v-if="toggles.upload">
                                <div class="media-library__manager__upload__zone">
                                    <button class="media-library__manager__upload__zone__button" @click="$refs.file.click()">Add new</button>
                                    <input name="files[]" type="file" multiple="true" ref="file" @change="uploadFilesByButton"/>
                                    <span class="media-library__manager__upload__zone__text">or drop new files here</span>
                                </div>
                            </div>
                            <div v-if="store[type].data.length == 0" class="media-library__error media-library__error--sml">
                                <span class="media-library__error__ttl">Not a great start!</span>
                                <p class="media-library__error__msg">You don't have any media yet... Upload some media above to get started!</p>
                                <app-svg-media />
                            </div>
                            <div v-else>
                                <div class="media-library__manager__content__images__grid">
                                    <div class="media-library__manager__content__images__grid__images" v-if="type == 'images'">
                                        <div
                                            v-for="(m, i) in store.images.data"
                                            :key="i"
                                            class="grid-item"
                                            :class="{'grid-item--active': store.images.selected.indexOf(m.id) > -1}"
                                            @click="selectManual('images', m.id)"
                                        >
                                            <div class="grid-item__inner" :style="`background: url('${m.fullUrl}'); background-repeat: no-repeat; background-size: cover;`"></div>
                                        </div>
                                    </div>
                                    <div class="media-library__manager__content__images__grid__files" v-else-if="type == 'files'">
                                        <table class="media-library-table">
                                            <tbody>
                                                <tr
                                                    v-for="(f, i) in store.files.data"
                                                    :key="i"
                                                    @click="selectManual('files', f.id)"
                                                    :class="{'active': store.files.selected.indexOf(f.id) > -1}"
                                                >
                                                    <td>
                                                        <input type="checkbox" v-model="store.files.selectedModel[f.id]">
                                                    </td>
                                                    <td v-html="f.file_name"></td>
                                                    <td v-html="f.humanSize"></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <infinite-loading @infinite="scroll" style="margin-bottom: 1.5rem;"> <div slot="no-more"></div> <div slot="no-results"></div> </infinite-loading>
                            </div>
                        </div>
                    </div>
                    <div class="media-library__manager__content__info" v-if="toggles.file && openFile">
                        <div v-if="loading.info" class="media-library__manager__content__info__loading">
                            <app-medialibrary-loader />
                        </div>
                        <div v-else>
                            <div class="media-library__manager__content__info__section">
                                <div class="media-library__manager__content__info__image">
                                    <img v-if="type == 'images'" :src="openFile.fullUrl" style="width: auto; height: auto; max-width: 150px; max-height: 150px;">
                                </div>
                                <span class="media-library__manager__content__info__text" v-html="openFile.file_name" style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;" />
                                <span class="media-library__manager__content__info__text media-library__manager__content__info__text--secondary" v-if="type == 'images'">Dimensions: {{ openFile.image.width }} × {{ openFile.image.height }}</span>
                                <!-- <span class="media-library__manager__content__info__text media-library__manager__content__info__text--secondary" v-if="type == 'images'">Responsive conversions: x{{ typeof openFile.responsive_images != 'undefined' && typeof openFile.responsive_images.medialibrary_original != 'undefined' && typeof openFile.responsive_images.medialibrary_original.urls != 'undefined' ? openFile.responsive_images.medialibrary_original.urls.length : 0 }}</span> -->
                                <div style="display: flex;  margin: 0.75rem -0.25rem 0 -0.25rem;">
                                    <div style="flex-grow: 1; padding: 0 0.2rem;">
                                        <a :href="openFile.downloadUrl" class="media-library__manager__content__info__button">Download</a>
                                    </div>
                                    <div style="flex-grow: 1; padding: 0 0.2rem;">
                                        <button @click="deleteSelected" class="media-library__manager__content__info__button media-library__manager__content__info__button--delete">Delete</button>
                                    </div>
                                </div>
                            </div>
                            <div class="media-library__manager__content__info__section" v-if="type == 'images'">
                                <div>
                                    <label class="media-library__manager__content__info__label" for="alt-text">
                                        Alt text
                                    </label>
                                    <input v-model="openFile.alt_text" class="media-library__manager__content__info__input" id="alt-text" type="text">
                                </div>
                                <div>
                                    <label class="media-library__manager__content__info__label" for="caption">
                                        Caption
                                    </label>
                                    <textarea v-model="openFile.caption" class="media-library__manager__content__info__input" id="caption" rows="3" />
                                </div>
                            </div>
                            <div class="media-library__manager__content__info__section" style="display: flex; margin: 0 -0.5rem;">
                                <div style="padding: 0 0.5rem;" :style="`width: ${type != 'images' ? 100 : 50}%;`">
                                    <button @click="toggles.file = false; clearSelected('images');" class="media-library__manager__content__info__button media-library__manager__content__info__button--close">Close</button>
                                </div>
                                <div v-if="type == 'images'" style="width: 50%; padding: 0 0.5rem;">
                                    <button @click="save" class="media-library__manager__content__info__button media-library__manager__content__info__button--save">Save</button>
                                </div>
                            </div>
                            <div class="media-library__manager__content__info__section" style="display: flex; margin: 0 -0.5rem;" v-if="selectable">
                                <button @click="select(openFile)" class="media-library__manager__content__info__button media-library__manager__content__info__button--success">Insert</button>
                            </div>
                        </div>
                    </div>
                    <div class="media-library__manager__content__files" v-if="toggles.file && !openFile">
                        <div v-if="loading.info" class="media-library__manager__content__files__loading">
                            <app-medialibrary-loader />
                        </div>
                        <div v-else>
                            <div class="media-library__manager__content__info__section">
                                <span style="display: block; margin-bottom: 1rem;"><strong>{{ store[type].selected.length }}</strong> {{ type }} selected.</span>
                                <button @click="deleteSelected" class="media-library__manager__content__info__button media-library__manager__content__info__button--delete">Delete</button>
                            </div>

                            <div class="flex media-library__manager__content__info__section" style="margin: 0 -0.5rem;">
                                <div style="padding: 0 0.5rem; width: 100%;">
                                    <button @click="toggles.file = false; clearSelected('images');" class="media-library__manager__content__info__button media-library__manager__content__info__button--close">Close / Clear</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import Vue from 'vue';
    import Loader from './Loader';
    import SvgError from './svgs/Error';
    import SvgMedia from './svgs/Media';
    import InfiniteLoading from 'vue-infinite-loading';
    import debounce from 'lodash/debounce';
    import axios from 'axios';
        
    export default {
        name: 'app-medialibrary-manager',

        components: {
            'app-medialibrary-loader': Loader,
            'app-svg-error': SvgError,
            'app-svg-media': SvgMedia,
            'infinite-loading': InfiniteLoading
        },

        props: {
            types: {
                type: Object,
                required: false,
                default: () => ({
                    images: true,
                    files: true
                })
            },
            selectable: {
                type: Boolean,
                required: false,
                default: false
            },
            selected: {
                required: false
            },
            filetypes: {
                type: Array,
                required: false,
                default: () => ([])
            }
        },

        data: () => ({
            toggles: {
                file: false,
                upload: false
            },

            loading: {
                wrapper: true,
                files: false,
                info: false
            },

            error: false,

            store: {
                images: {
                    data: [],
                    page: 1,
                    total: 0,
                    noMore: false,
                    paginationCount: 32,
                    selectedModel: {},
                    selected: []
                },
                files: {
                    data: [],
                    page: 1,
                    total: 0,
                    noMore: false,
                    paginationCount: 50,
                    selectedModel: {},
                    selected: []
                },
            },

            openFile: null,
            type: 'images',
            search: '',
        }),

        mounted() {
            this.type = typeof this.types.images !== 'undefined' && this.types.images ? 'images' : (typeof this.types.files !== 'undefined' && this.types.files ? 'files' : null);

            if (this.type) {
                this.setPaginationCount();

                this.getAllMedia()
                    .then(response => {
                        if (this.selectable) {
                            this.getFile()
                                .then(response => {
                                    this.loading.wrapper = false;
                                })
                        } else {
                            this.loading.wrapper = false;
                        }
                    });
            } else {
                this.error = true;
                this.loading.wrapper = false;
            }
        },

        methods: {
            url(path) {
                return `${this.$medialibrary.API_URL.replace(/\/$/, "")}/${path.replace(/\/$/, "")}`;
            },

            select(file) {
                this.$emit('select', file);
            },
            
            save() {
                if (this.openFile) {
                    this.loading.info = true;
                
                    return axios.post(this.url("/media-library-api/save"), { id: this.openFile.id, alt_text: this.openFile.alt_text, caption: this.openFile.caption })
                        .then(response => {
                            this.loading.info = false;

                            this.getAllMedia()
                                .then(response => {
                                    this.loading.wrapper = false;
                                });
                        });
                }
            },

            setPaginationCount() {
                if (window.innerWidth >= 300 && window.innerWidth <= 799) {
                    this.store.images.paginationCount = 12;
                    this.store.files.paginationCount = 20;
                } else if (window.innerWidth >= 800 && window.innerWidth <= 999) {
                    this.store.images.paginationCount = 18;
                    this.store.files.paginationCount = 30;
                } else if (window.innerWidth >= 1000 && window.innerWidth <= 1199) {
                    this.store.images.paginationCount = 28;
                    this.store.files.paginationCount = 40;
                } else if (window.innerWidth >= 1200 && window.innerWidth <= 1399) {
                    this.store.images.paginationCount = 30;
                    this.store.files.paginationCount = 50;
                } else if (window.innerWidth >= 1400 && window.innerWidth <= 1599) {
                    this.store.images.paginationCount = 35;
                    this.store.files.paginationCount = 50;
                } else if (window.innerWidth >= 1600 && window.innerWidth <= 1799) {
                    this.store.images.paginationCount = 42;
                    this.store.files.paginationCount = 50;
                } else if (window.innerWidth >= 1800) {
                    this.store.images.paginationCount = 48;
                    this.store.files.paginationCount = 50;
                }
            },

            getFile() {
                return axios.get(this.url(`/media-library-api/file?name=${this.selected}`))
                    .catch(error => {
                        this.$emit('fail-to-find', true);
                    })
                    .then(({ data }) => {
                        if (data.file) {
                            this.openFile = data.file;
                            
                            this.select(data.file);
                        }
                    });
            },

            getAllMedia() {
                this.clearMedia();

                this.loading.wrapper = true;

                return this.getMedia('images')
                    .catch(error => {
                        this.loading.wrapper = false;
                        this.error = true;
                    })
                    .then(response => {
                        this.getMedia('files')
                            .then(response => {
                                if (this.store.images.data.length == 0 && this.store.files.data.length == 0) {
                                    this.toggles.upload = true;
                                }
                            });
                    });
            },

            getMedia(type) {
                return axios.get(this.url(`/media-library-api/media?type=${type}&page=${this.store[type].page}&pcount=${this.store[type].paginationCount}&search=${this.search}&filetypes=${this.filetypes.join(',')}`))
                    .then(({ data }) => {
                        if (data.media.length > 0) {
                            data.media.forEach(item => {
                                this.store[type].data.push(item);
                                Vue.set(this.store[type].selectedModel, item.id, false);
                            });

                            this.store[type].total = data.total;
                        } else {
                            this.store[type].noMore = true;
                        }
                    });

            },

            scroll($state) {
                if (!this.store[this.type].noMore) {
                    this.store[this.type].page += 1;

                    this.getMedia(this.type)
                        .then(response => {
                            $state.loaded();
                        });
                } else {
                    $state.complete();
                }
            },

            clearMedia() {
                this.store.images.data = [];
                this.store.images.selected = [];
                this.store.images.selectedModel = {};
                this.store.images.page = 1;
                this.store.images.total = 0;
                this.store.images.noMore = false;

                this.store.files.data = [];
                this.store.files.selected = [];
                this.store.files.selectedModel = {};
                this.store.files.page = 1;
                this.store.files.total = 0;
                this.store.files.noMore = false;
            },

            uploadFilesByButton(e) {
                let files = e.target.files || e.dataTransfer.files;
                if (!files.length)
                    return;

                // Toggle loading
                this.loading.wrapper = true;

                // Upload files
                for (var i = 0; i < files.length; i++) {
                    if (i == (files.length - 1)) {
                        this.uploadFile(files[i], i)
                            .then(response => {
                                this.getAllMedia()
                                    .then(response => {
                                        this.loading.wrapper = false;
                                    });
                            });
                    } else {
                        this.uploadFile(files[i], i);
                    }
                }
            },

            uploadFile(file, id) {
                let uploaderForm = new FormData(); // Create new FormData
                uploaderForm.append("file", file);

                return axios.post(this.url("/media-library-api/upload"), uploaderForm)
                        .then(response => {
                            if(typeof response.data.message != 'undefined') {
                                this.$toasted.show(response.data.message, {
                                    type: "success",
                                    position: "bottom-right",
                                    duration : 5000
                                });
                            }
                        })
                        .catch(error => {
                            if(typeof error.response.data.message != 'undefined') {
                                this.$toasted.show(error.response.data.message, {
                                    type: "error",
                                    position: "bottom-right",
                                    duration : 5000
                                });
                            }
                        });
            },

            close() {
                this.$emit('close');
            },

            selectManual(type, id) {
                // Clear before we select as they can only select one
                if (this.selectable) {
                    this.clearSelected(type);
                }

                this.store[type].selectedModel[id] = !this.store[type].selectedModel[id];

                this.setSelected(type);
            },  

            clearSelected(type) {
                this.store[type].selected = [];

                for(let id in this.store[type].selectedModel) {
                    this.store[type].selectedModel[id] = false;
                }

                this.openFile = null;
            },

            setSelected(type) {
                this.store[type].selected = [];

                for(let id in this.store[type].selectedModel) {
                    if (this.store[type].selectedModel[id]) {
                        this.store[type].selected.push(parseInt(id));
                    }
                }

                if (this.type == type && this.store[type].selected.length > 0) {
                    this.toggles.file = true;

                    if (this.store[type].selected.length > 1) {
                        this.openFile = null;
                    }  else {
                        this.store[type].data.forEach(item => {
                            if (item.id == this.store[type].selected[0]) {
                                this.openFile = item;
                            }
                        });
                    }
                } else {
                    this.toggles.file = false;
                }
            },

            deleteSelected() {
                this.loading.info = true;
                
                return axios.post(this.url("/media-library-api/delete"), { items: this.store[this.type].selected })
                    .then(response => {
                        this.loading.info = false;
                        this.getAllMedia()
                            .then(response => {
                                this.loading.wrapper = false;
                            });

                        if(typeof response.data.message != 'undefined') {
                            this.$toasted.show(response.data.message, {
                                type: "success",
                                position: "bottom-right",
                                duration : 5000
                            });
                        }
                    });
            },

            debouncer: debounce(callback => callback(), 500),
        },

        watch: {
            search() {
                this.debouncer(() => {
                    this.toggles.file = false; 
                    this.openFile = null;

                    this.getAllMedia()
                        .then(response => {
                            this.loading.wrapper = false;

                            setTimeout(() => {
                                document.getElementById("medialibrary-search").focus();
                            }, 250);
                        });
                });
            },

            'store.files.selectedModel': {
                handler(val) {
                    this.setSelected('files');
                },
                deep: true
            },

            'store.images.selectedModel': {
                handler(val) {
                    this.setSelected('images');
                },
                deep: true
            }
        }
    }
</script>
