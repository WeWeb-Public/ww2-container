<!-- This is a Vue.js single file component. -->
<!-- Check the Vue.js doc here :  -->
<!-- https://vuejs.org/v2/guide/ -->

<!-- This is your HTML -->
<template>
    <div class="ww-container" v-style="c_style">
        <wwLayout :options="wwObject.content.data.options" tag="div" :ww-list="wwObject.content.data.wwObjects" class="wwobjects-wrapper" @ww-add="add($event)" @ww-remove="remove($event)" @refresh-bindings="handleContentChanged">
            <wwObject v-for="wwObject in wwObject.content.data.wwObjects" :key="wwObject.uniqueId" :ww-object="wwObject"></wwObject>
        </wwLayout>
    </div>
</template>

<!-- This is your Javascript -->
<!-- ✨ Here comes the magic ✨ -->
<script>
/* wwManager:start */
import { mapGetters } from 'vuex';
/* wwManager:end */
import makeStories from './stories';
const wwu = window.wwLib.wwUtils;

const CONTAINER_CONTENT_CHANGED = 'ww-container:content-changed';

export default {
    name: '__COMPONENT_NAME__',
    props: {
        // The wwObject controller object is passed. You can access it anytime
        wwObjectCtrl: Object
    },
    data() {
        return {
            /* wwManager:start */
            d_screens: ['lg', 'md', 'sm', 'xs'],
            cmsTemplate: {},
            editedTemplateIdx: 0,
            isRootCmsTemplate: false
            /* wwManager:end */
        };
    },
    computed: {
        // The wwObject contains all the info and data about the wwObject
        // Use it as you like !
        wwObject() {
            return this.wwObjectCtrl.get();
        },
        c_style() {
            return { width: '100px', height: '100px' };
        },
        /* wwManager:start */
        ...mapGetters({ c_screen: 'front/getScreenSize' }),
        c_currentScreenOptions() {
            for (let screenIndex = this.d_screens.indexOf(this.c_screen); screenIndex > -1; screenIndex--) {
                if (this.wwObject.content.data.options[this.d_screens[screenIndex]]) {
                    return this.wwObject.content.data.options[this.d_screens[screenIndex]];
                }
            }
            for (let screenIndex = this.d_screens.indexOf(this.c_screen); screenIndex < this.d_screens.length; screenIndex++) {
                if (this.wwObject.content.data.options[this.d_screens[screenIndex]]) {
                    return this.wwObject.content.data.options[this.d_screens[screenIndex]];
                }
            }
            return {};
        },
        isConnected() {
            return Object(this.wwObject.content.cms) === this.wwObject.content.cms;
        }
        /* wwManager:end */
    },
    created() {
        this.initData();
        wwLib.$on(CONTAINER_CONTENT_CHANGED, this.handleContentChanged);
        this.wwObjectCtrl.onChildBindingUpdate(this.handleChildBindingChanged);
        this.wwObjectCtrl.onEditedTemplateIndex(newIndex => {
            this.editedTemplateIdx = newIndex;
        });
    },
    methods: {
        initData() {
            //Init objects
            let needUpdate = false;
            if (!this.wwObject.content.data.options) {
                this.wwObject.content.data.options = {
                    lg: {
                        direction: 'column',
                        reverse: false,
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexWrap: 'nowrap',
                        minHeight: '50%'
                    }
                };

                needUpdate = true;
            }

            if (!Array.isArray(this.wwObject.content.data.wwObjects)) {
                this.wwObject.content.data.wwObjects = [];
                needUpdate = true;
            }

            if (needUpdate) {
                this.wwObjectCtrl.update(this.wwObject);
            }
        },
        /* wwManager:start */
        async edit() {
            wwLib.wwObjectHover.setLock(this);

            const stories = makeStories(this.c_currentScreenOptions);
            Object.keys(stories).forEach(key => {
                wwLib.wwPopups.addStory(key, stories[key]);
            });

            let options = {
                firstPage: 'WWCONTAINER_EDIT',
                data: {
                    wwObject: this.wwObject
                }
            };

            try {
                const result = await wwLib.wwPopups.open(options);

                /*=============================================m_ÔÔ_m=============================================\
                  LAYOUT
                \================================================================================================*/
                /*
                this.wwObject.content.data.options = {
                    lg: {
                        direction: 'column',
                        reverse: false,
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexWrap: 'nowrap',
                        minHeight: '50%'
                    }
                };
                */

                if (!this.wwObject.content.data.options[this.c_screen]) {
                    this.wwObject.content.data.options[this.c_screen] = _.cloneDeep(this.wwObject.content.data.options.lg);
                }

                if (typeof result.direction != 'undefined') {
                    this.wwObject.content.data.options[this.c_screen].direction = result.direction;
                }

                if (typeof result.reverse != 'undefined') {
                    this.wwObject.content.data.options[this.c_screen].reverse = result.reverse;
                }

                if (typeof result.justifyContent != 'undefined') {
                    this.wwObject.content.data.options[this.c_screen].justifyContent = result.justifyContent;
                }

                if (typeof result.alignItems != 'undefined') {
                    this.wwObject.content.data.options[this.c_screen].alignItems = result.alignItems;
                }

                if (typeof result.flexWrap != 'undefined') {
                    this.wwObject.content.data.options[this.c_screen].flexWrap = result.flexWrap;
                }

                if (typeof result.minHeight != 'undefined') {
                    this.wwObject.content.data.options[this.c_screen].minHeight = result.minHeight;
                }

                this.wwObjectCtrl.update(this.wwObject);

                this.wwObjectCtrl.globalEdit(result);
            } catch (error) {
                console.log(error);
            }

            wwLib.wwObjectHover.removeLock();
        },
        initContentIfNecessary() {
            if (!Array.isArray(this.wwObject.content.data.wwObjects)) {
                this.wwObject.content.data.wwObjects = [];
            }
        },
        async add(options) {
            this.initContentIfNecessary();
            this.wwObject.content.data.wwObjects.splice(options.index, 0, options.wwObject);
            this.afterContentChanged();
        },
        async remove(options) {
            this.initContentIfNecessary();
            this.wwObject.content.data.wwObjects.splice(options.index, 1);
            this.afterContentChanged();
        },

        afterContentChanged() {
            this.wwObjectCtrl.update(this.wwObject);
            this.changeEditedTemplateIndex();
            wwLib.$emit(CONTAINER_CONTENT_CHANGED);
        },
        async changeEditedTemplateIndex() {
            if (!this.isRootCmsTemplate && this.isConnected) {
                await this.wwObjectCtrl.setEditedTemplateIndex(this.wwObject.content.cms.bindings.index);
            }
        },
        async connectCmsCollection() {
            const {
                bindings: { collection }
            } = await this.wwObjectCtrl.connectCmsCollection();
            this.cmsTemplate = this.getCmsTemplateCopy(this.wwObject.content.data.wwObjects[this.editedTemplateIdx]);
            this.isRootCmsTemplate = true;
            this.wwObject.content.cms = {
                bindings: {
                    collection: collection.name
                }
            };
            this.repeatTemplate(collection, this.cmsTemplate);
            this.wwObjectCtrl.update(this.wwObject);
        },
        repeatTemplate(collection, cmsTemplate) {
            collection.data.forEach((item, index) => {
                const clone = index > 0 ? this.getCmsTemplateCopy(cmsTemplate) : cmsTemplate;
                clone.content.cms = {
                    bindings: {
                        collection: collection.name,
                        index
                    }
                };
                if (index > 0) this.add({ wwObject: clone, index });
            });
        },

        async handleContentChanged() {
            if (this.isRootCmsTemplate) {
                this.updateCmsBoundedChildren();
                await this.wwObjectCtrl.update(this.wwObject);
            }
        },
        updateCmsBoundedChildren() {
            this.cmsTemplate = this.getCmsTemplateCopy(this.wwObject.content.data.wwObjects[this.editedTemplateIdx]);
            this.wwObject.content.data.wwObjects = this.wwObject.content.data.wwObjects.map((item, index) => {
                const clone = index === this.editedTemplateIdx ? this.cmsTemplate : this.getCmsTemplateCopy(this.cmsTemplate);
                clone.content.cms = {
                    bindings: {
                        collection: this.wwObject.content.cms.bindings.collection,
                        index
                    }
                };
                return clone;
            });
        },

        async handleChildBindingChanged(bindingUpdate) {
            // await this.changeEditedTemplateIndex();
            if (this.isRootCmsTemplate) {
                this.updateCmsBoundedChildren();
                await this.wwObjectCtrl.update(this.wwObject);
                const {
                    cms: {
                        bindings: { collection }
                    },
                    data: { wwObjects }
                } = this.wwObject.content;
                if (collection === bindingUpdate.collection) {
                    this.wwObjectCtrl.evaluateBindings(wwObjects);
                }
                this.wwObjectCtrl.update(this.wwObject);
            }
        },

        getCmsTemplateCopy(templateWwObject) {
            const clone = JSON.parse(JSON.stringify(templateWwObject));
            wwu.changeUniqueIds(clone);
            clone.uniqueId = wwu.getUniqueId();
            return clone;
        }
        /* wwManager:end */
    }
};
</script>

<!-- This is your CSS -->
<!-- Add "scoped" attribute to limit CSS to this component only -->
<!-- Add lang="scss" or others to use computed CSS -->
<style lang="scss" scoped>
.ww-container {
}
</style>
