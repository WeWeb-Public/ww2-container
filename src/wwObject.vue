<!-- This is a Vue.js single file component. -->
<!-- Check the Vue.js doc here :  -->
<!-- https://vuejs.org/v2/guide/ -->

<!-- This is your HTML -->
<template>
    <div class="ww-container" v-style="c_style">
        <wwLayout :options="wwObject.content.data.options" tag="div" :ww-list="wwObject.content.data.wwObjects" class="wwobjects-wrapper" @ww-add="add($event)" @ww-remove="remove($event)">
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
            editedTemplateIdx: 0
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
            const { cms } = this.wwObject.content;
            return Object(cms) === cms && Object(cms.bindings) === cms.bindings;
        },
        isRootCmsTemplate() {
            const { cms } = this.wwObject.content;
            return this.isConnected && cms.bindings.collection && !('index' in cms.bindings);
        },
        templateIndex() {
            return this.isConnected && !this.isRootCmsTemplate ? this.wwObject.content.cms.bindings.index : -1;
        }
        /* wwManager:end */
    },
    created() {
        this.initData();
        this.initDataBindings();
        wwLib.$on(CONTAINER_CONTENT_CHANGED, this.handleContentChanged);
    },
    methods: {
        isContainer(wwObject) {
            return wwObject.content.type === 'ww_container';
        },
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
        initDataBindings() {
            if (this.isRootCmsTemplate) {
                this.updateSavedBoundedChildren();
                this.wwObjectCtrl.onBindingContextUpdate(this.handleBindingContextChanged);
            }
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
        async add(options) {
            this.wwObject.content.data.wwObjects.splice(options.index, 0, options.wwObject);
            await this.afterContentChanged();
        },
        async remove(options) {
            this.wwObject.content.data.wwObjects.splice(options.index, 1);
            await this.afterContentChanged();
        },
        findNearestConnectedContainer() {
            let parent = this;
            while (parent) {
                if (parent.isConnected) {
                    break;
                }
                parent = parent.$parent;
            }
            return parent;
        },
        async afterContentChanged() {
            await this.wwObjectCtrl.update(this.wwObject);
            const parentConnectedContainer = this.findNearestConnectedContainer();
            const { cms } = parentConnectedContainer.wwObject.content;
            wwLib.$emit(CONTAINER_CONTENT_CHANGED, cms.bindings.index);
        },

        async updateSavedBoundedChildren() {
            const collectionDescriptor = this.wwObjectCtrl.getCmsCollection(this.wwObject.content.cms.bindings.collection);
            this.updateRootCmsTemplate(collectionDescriptor);
            const updatedWwObject = this.wwObjectCtrl.evaluateBindings(this.wwObject.uniqueId);
            await this.wwObjectCtrl.update(updatedWwObject);
        },

        async connectCmsCollection() {
            const {
                bindings: { collectionDescriptor }
            } = await this.wwObjectCtrl.connectCmsCollection();
            this.updateRootCmsTemplate(collectionDescriptor);
            this.wwObjectCtrl.onBindingContextUpdate(this.handleBindingContextChanged);
            this.wwObjectCtrl.update(this.wwObject);
        },
        updateRootCmsTemplate(collectionDescriptor) {
            const cmsTemplateId = this.wwObject.content.data.wwObjects[this.editedTemplateIdx].uniqueId;
            this.cmsTemplate = this.getCmsTemplateCopy(this.wwObjectCtrl.getWwObjectById(cmsTemplateId));
            this.wwObject.content.cms = {
                bindings: {
                    collection: collectionDescriptor.name
                }
            };
            this.wwObject.content.data.wwObjects = collectionDescriptor.data.map((item, index) => {
                const clone = index === this.editedTemplateIdx ? this.cmsTemplate : this.getCmsTemplateCopy(this.cmsTemplate);
                this.bindDirectChild(clone, collectionDescriptor.name, index);
                return clone;
            });
        },
        async handleContentChanged(editedTemplateIndex) {
            if (this.isRootCmsTemplate) {
                this.updateUnsavedBoundedChildren(editedTemplateIndex);
                await this.wwObjectCtrl.update(this.wwObject);
                await this.evaluateChildBindings();
            }
        },
        updateUnsavedBoundedChildren(editedTemplateIndex) {
            const templateChild = this.wwObject.content.data.wwObjects[editedTemplateIndex];
            if (templateChild === undefined || !this.isConnected) return;
            this.cmsTemplate = this.getCmsTemplateCopy(templateChild);
            this.wwObject.content.data.wwObjects = this.wwObject.content.data.wwObjects.map((item, index) => {
                const clone = index === editedTemplateIndex ? this.cmsTemplate : this.getCmsTemplateCopy(this.cmsTemplate);
                this.bindDirectChild(clone, this.wwObject.content.cms.bindings.collection, index);
                return clone;
            });
        },

        async handleBindingContextChanged(bindingUpdate) {
            if (this.wwObject.uniqueId !== bindingUpdate.rootContainerId) return;
            const { editedTemplateIndex } = bindingUpdate;
            this.updateUnsavedBoundedChildren(editedTemplateIndex);
            await this.wwObjectCtrl.update(this.wwObject);
            await this.evaluateChildBindings();
        },

        async evaluateChildBindings() {
            const { wwObjects } = this.wwObject.content.data;
            const updatedContainers = wwObjects.map(wwObject => {
                return this.wwObjectCtrl.evaluateBindings(wwObject.uniqueId);
            });
            this.wwObject.content.data.wwObjects = updatedContainers;
            await this.wwObjectCtrl.update(this.wwObject);
        },

        getCmsTemplateCopy(templateWwObject) {
            const clone = JSON.parse(JSON.stringify(templateWwObject));
            wwu.changeUniqueIds(clone);
            clone.uniqueId = wwu.getUniqueId();
            return clone;
        },
        bindDirectChild(child, collection, index) {
            child.content.cms = {
                ...child.content.cms,
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
