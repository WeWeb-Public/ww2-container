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
            isRootCmsTemplate: false,
            lastBindingUpdate: {}
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
    },
    methods: {
        initData() {
            //Init objects
            let needUpdate = false;
            if (!this.wwObject.content.data.options) {
                this.wwObject.content.data.options = {
                    lg: {
                        direction: 'row',
                        reverse: false,
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        flexWrap: 'nowrap',
                        minHeight: '25%'
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

        isContainer(wwObject) {
            return wwObject.content.type === 'ww_container';
        },
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

                await this.wwObjectCtrl.update(this.wwObject);

                await this.wwObjectCtrl.globalEdit(result);

                await this.afterContentChanged();
            } catch (error) {
                console.log(error);
            }

            wwLib.wwObjectHover.removeLock();
        },
        initContent() {
            if (!Array.isArray(this.wwObject.content.data.wwObjects)) {
                this.wwObject.content.data.wwObjects = [];
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
            this.registerSubscriptionsOnRootCmsTemplate();
            this.duplicateFirstChild(collection, this.cmsTemplate);
            this.wwObjectCtrl.update(this.wwObject);
        },
        duplicateFirstChild(collection, cmsTemplate) {
            collection.data.forEach((item, index) => {
                const clone = index > 0 ? this.getCmsTemplateCopy(cmsTemplate) : cmsTemplate;
                if (this.isContainer(clone)) {
                    this.bindDirectChildContainer(clone, collection.name, index);
                }
                if (index > 0) this.add({ wwObject: clone, index });
            });
        },
        registerSubscriptionsOnRootCmsTemplate() {
            this.wwObjectCtrl.onChildBindingUpdate(this.handleChildBindingChanged);
            this.wwObjectCtrl.onEditedTemplateIndex(newIndex => {
                this.editedTemplateIdx = newIndex;
            });
            wwLib.$on(CONTAINER_CONTENT_CHANGED, this.handleContentChanged);
        },
        async add(options) {
            this.initContent();
            this.wwObject.content.data.wwObjects.splice(options.index, 0, options.wwObject);
            await this.afterContentChanged();
        },
        async remove(options) {
            this.initContent();
            this.wwObject.content.data.wwObjects.splice(options.index, 1);
            await this.afterContentChanged();
        },

        async afterContentChanged() {
            await this.wwObjectCtrl.update(this.wwObject);
            await this.changeEditedTemplateIndex();
            wwLib.$emit(CONTAINER_CONTENT_CHANGED);
        },
        async changeEditedTemplateIndex() {
            if (!this.isRootCmsTemplate && this.isConnected) {
                await this.wwObjectCtrl.setEditedTemplateIndex(this.wwObject.content.cms.bindings.index);
            }
        },

        async handleContentChanged() {
            this.updateCmsBoundedChildren();
            await this.wwObjectCtrl.update(this.wwObject);
            await this.evaluateBindings(this.lastBindingUpdate);
        },
        updateCmsBoundedChildren() {
            this.cmsTemplate = this.getCmsTemplateCopy(this.wwObject.content.data.wwObjects[this.editedTemplateIdx]);
            this.wwObject.content.data.wwObjects = this.wwObject.content.data.wwObjects.map((item, index) => {
                const clone = index === this.editedTemplateIdx ? this.cmsTemplate : this.getCmsTemplateCopy(this.cmsTemplate);
                if (this.isContainer(clone)) {
                    this.bindDirectChildContainer(clone, this.wwObject.content.cms.bindings.collection, index);
                }
                return clone;
            });
        },

        async handleChildBindingChanged(bindingUpdate) {
            this.lastBindingUpdate = bindingUpdate;
            this.updateCmsBoundedChildren();
            await this.wwObjectCtrl.update(this.wwObject);
            await this.evaluateBindings(bindingUpdate);
        },

        async evaluateBindings(bindingUpdate) {
            if (bindingUpdate.collection === undefined) return;
            await this.wwObjectCtrl.evaluateBindings(this.wwObject.content.data.wwObjects);
            await this.wwObjectCtrl.update(this.wwObject);
        },

        getCmsTemplateCopy(templateWwObject) {
            const clone = JSON.parse(JSON.stringify(templateWwObject));
            wwu.changeUniqueIds(clone);
            clone.uniqueId = wwu.getUniqueId();
            return clone;
        },
        bindDirectChildContainer(child, collection, index) {
            child.content.cms = {
                bindings: {
                    collection,
                    index
                }
            };
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