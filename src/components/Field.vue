<template>
    <div>
        <div class="media-library-field">
            <div v-if="loading" class="media-library-field__loader">
                <app-medialibrary-loader />
            </div>
            <div class="media-library-field__selector" v-else-if="content == null">
                <span 
                    @click="showManager = true"
                    class="media-library-field__selector__button"
                >Attach {{ types.images && types.files ? 'file' : (types.images && !types.files) ? 'image' : 'file' }}</span>

                <p v-if="helper" v-html="helper" class="media-library-field__selector__helper" />
            </div>
            <div v-else-if="file" class="media-library-field__selected">
                <div class="media-library-field__selected__inner">
                    <div class="media-library-field__selected__inner__img" v-if="file.collection_name == 'images'" @click="showManager = true">
                        <div class="media-library-field__selected__inner__img__frame">
                            <div class="media-library-field__selected__inner__img__frame__image" :style="`background-image: url('${file.fullUrl}');`"></div>
                        </div>

                        <div class="media-library-field__selected__inner__img__edit">
                            <span>Edit</span>
                        </div>
                    </div>
                    <div class="media-library-field__selected__inner__details">
                        <span class="media-library-field__selected__inner__details__name">{{ file.file_name }}</span>
                        <span class="media-library-field__selected__inner__details__dimensions" v-if="file.collection_name == 'images'">Dimensions: {{ file.image.width }} × {{ file.image.height }}</span>
                        <span class="media-library-field__selected__inner__details__edit" @click="showManager = true">Edit info</span>

                        <div style="display: flex;  margin: 2rem -0.5rem 0 -0.5rem;">
                            <div style="flex-grow: 1; padding: 0 0.5rem;">
                                <a :href="file.downloadUrl" class="media-library-field__selected__inner__details__button">Download</a>
                            </div>
                            <div style="flex-grow: 1; padding: 0 0.5rem;">
                                <button @click="clear" class="media-library-field__selected__inner__details__button media-library-field__selected__inner__details__button--delete">Remove</button>
                            </div>
                        </div>

                        <p v-if="helper" v-html="helper" class="media-library-field__selected__inner__details__helper" />
                    </div>
                </div>
            </div>
        </div>

        <vue-medialibrary-manager 
            v-show="showManager"
            :filetypes="filetypes"
            :types="types"
            :selected="value"
            :selectable="true"
            @close="showManager = false"
            @select="insert"
            @fail-to-find="clear"
        />
    </div>
</template>

<script>
    import Loader from './Loader';
    import axios from 'axios';

    export default {
        name: 'vue-medialibrary-field',

        components: {
            'app-medialibrary-loader': Loader
        },

        props: {
            value: {
                type: String,
                required: false
            },
            types: {
                type: Object,
                required: false,
                default: () => ({
                    images: true,
                    files: true
                })
            },
            filetypes: {
                type: Array,
                required: false,
                default: () => ([])
            },
            helper: {
                type: String,
                required: false
            }
        },

        data: () => ({
            loading: false,
            showManager: false,
            file: {},
            content: null,
        }),

        mounted() {
            this.content = this.value ? this.value : this.content;

            if (this.content) {
                this.loading = true;
            }
        },

        methods: {
            insert(value) {
                this.loading = false;
                this.showManager = false;
                
                this.file = value;
                this.content = value.file_name;

                this.change();
            },
            clear() {
                this.loading = false;
                this.content = this.file = null;

                this.$emit('input', null);
            },
            change() {
                this.$emit('input', this.content);
            }
        }
    }
</script>