define(['jquery', 'jqueryui', 'helper', 'index/m_tree'], function ($, jqueryui, Helper, Tree) {

    /**
     * 组件基类
     * @param option
     * @constructor
     */
    function Base(option) {
        this.css = {};

        this.css.id = option.id;
        this.css.position = option.position == undefined ? 0 : option.position;
        this.css.left = option.left == undefined ? 0 : option.left;
        this.css.top = option.top == undefined ? 0 : option.top;
        this.css.width = option.width == undefined ? 0 : option.width;
        this.css.height = option.height == undefined ? 0 : option.height;
        this.css.zIndex = option.zIndex == undefined ? 1000 : option.zIndex;
        this.css.margin = option.margin == undefined ? 0 : option.margin;
        this.css.padding = option.padding == undefined ? 0 : option.padding;
    }

    Base.prototype.render = function (parent, dom) {
    };
    Base.prototype.reform = function () {
    };

    /**
     * 生成css的属性
     * @param name
     * @param attr
     * @param value_prefix
     * @param value_suffix
     * @returns {string}
     */
    Base.prototype.createCssAttr = function (name, attr, value_prefix, value_suffix) {
        attr = attr || name;
        value_prefix = value_prefix || '';
        value_suffix = value_suffix || '';

        return this[name] != undefined && this[name] != '' ? [attr, ':', value_prefix, this[name], value_suffix, ';'].join('') : '';
    };

    /**
     * 区块类
     * @param option
     * @constructor
     */
    function Block(option) {
        Base.call(this, option);

        this.css.borderWidth = option.borderWidth == undefined ? '1px' : option.borderWidth;
        this.css.borderStyle = option.borderStyle == undefined ? 'solid' : option.borderStyle;
        this.css.borderColor = option.borderColor == undefined ? '#ccc' : option.borderColor;

        this.css.backgroundPosition = option.backgroundPosition == undefined ? '0 0' : option.backgroundPosition;
        this.css.backgroundImage = option.backgroundImage == undefined ? '' : option.backgroundImage;
        this.css.backgroundColor = option.backgroundColor == undefined ? '#ffffff' : option.backgroundColor;
        this.css.backgroundRepeat = option.backgroundRepeat == undefined ? 'repeat' : option.backgroundRepeat;
        this.css.backgroundSize = option.backgroundSize == undefined ? '' : option.backgroundSize;
    }

    Block.prototype = Object.create(Base.prototype);
    Block.prototype.constructor = Block;

    /**
     * 区块组件渲染
     * @param parent
     * @param data
     */
    Block.prototype.render = function (parent, data) {
        data = data || {};

        var that = this,
            deleter = $('<a href="javascript:;" class="component-delete hide"></a>'),
            wrapper = $('<div class="component" id="' + that.css.id + '"></div>'),
            css = $.extend({
                position: that.css.position,
                left: that.css.left,
                top: that.css.top,
                'z-index': that.css.zIndex,
                width: that.css.width,
                height: that.css.height,
                margin: that.css.margin,
                padding: that.css.padding,
                background: [that.css.backgroundColor, 'url(' + that.css.backgroundImage + ')', that.css.backgroundPosition, that.css.backgroundRepeat, that.css.backgroundSize].join(' '),
                border: [that.css.borderWidth, that.css.borderStyle, that.css.borderColor].join(' ')
            }, data.css || {});

        // 组件删除按钮点击
        deleter.on('click', function (event) {
            event.stopPropagation();

            $(this).parent('.component').trigger('component_delete');
        });

        wrapper
            .append(deleter)
            .css(css)
            .data('parent', $(parent).attr('id'))
            .on('mousedown', function (event) {
                event.stopPropagation();

                // 添加选中态样式
                $('.component').removeClass('focus');
                $('.component .component-delete').addClass('hide');
                $(this).addClass('focus').children('.component-delete').removeClass('hide');

                // 设置当前domTree中被选中的domId
                Tree.setCurDomId(that.css.id);

                // 触发更新属性事件
                $('.attr-item').trigger('attr_update', [$(this)]);
            })
            .on('element_update', data.elementUpdateCallback)
            .on('component_delete', data.componentDelete)
            .draggable({
                cursor: "move",
                scroll: true,
                scrollSensitivity: 10,
                drag: function (event, ui) {
                    $('.attr-item').trigger('attr_update', [ui.helper]);
                }
            })
            .droppable({
                greedy: true,
                hoverClass: 'state-hover',
                drop: function (event, ui) {
                    var parent = $(this).attr('id');
                    if (parent != ui.helper.data('parent')) {
                        ui.helper
                            .data('parent', parent)
                            .css({position: 'absolute', left: 0, top: 0});
                    }
                    ui.helper.appendTo($(this));

                    $('.attr-item').trigger('attr_update', [ui.helper]);

                    console.log(Tree.moveDom(ui.helper[0].id, parent));
                }
            })
            .resizable({
                resize: function (event, ui) {
                    $('.attr-item').trigger('attr_update', [ui.helper]);
                }
            })
            .appendTo(parent);

        // 添加到dom树
        console.log(Tree.addDomTree(this));

        return this;
    };

    /**
     * 重新生成组件dom用于导出
     * @returns {{html: (*|jQuery|HTMLElement), css: string}}
     */
    Block.prototype.reform = function () {
        return {
            html: $('<div id="' + this.css.id + '"></div>'),
            css: this.createCss()
        };
    };

    /**
     * 生成css
     * @returns {string}
     */
    Block.prototype.createCss = function () {
        var css = [
            '#' + this.css.id + '{',
            this.createCssAttr('position'),
            this.createCssAttr('left'),
            this.createCssAttr('top'),
            this.createCssAttr('zIndex', 'z-index'),
            this.createCssAttr('width'),
            this.createCssAttr('height'),
            this.createCssAttr('margin'),
            this.createCssAttr('padding'),
            this.createCssAttr('borderWidth', 'border-width'),
            this.createCssAttr('borderStyle', 'border-style'),
            this.createCssAttr('borderColor', 'border-color'),
            this.createCssAttr('backgroundPosition', 'background-position'),
            this.createCssAttr('backgroundImage', 'background-image', 'url(', ')'),
            this.createCssAttr('backgroundColor', 'background-color'),
            this.createCssAttr('backgroundRepeat', 'background-repeat'),
            this.createCssAttr('backgroundSize', 'background-size'),
            '}'
        ];

        return css.join('');
    };

    /**
     * 文本组件
     * @param option
     * @constructor
     */
    function TextBox(option) {
        Base.call(this, option);
    }

    TextBox.prototype = Object.create(Base.prototype);
    TextBox.prototype.constructor = TextBox;

    /**
     * 图片类
     * @param option
     * @constructor
     */
    function Image(option) {
        Base.call(this, option);
    }

    Image.prototype = Object.create(Base.prototype);
    Image.prototype.constructor = Image;

    /**
     * 生成组件对象，工厂模式
     * @type {{block: Component.block, text: Component.text, image: Component.image, factory: Component.factory}}
     */
    var Component = {
        block: function (data) {
            data = $.extend({
                id: Helper.randomChar(1, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') + Helper.randomChar(5),// css命名规范，首字母不要用数字
                position: data.position || 'absolute',
                width: data.width || '200px',
                height: data.height || '100px',
                left: data.left != undefined ? data.left : '0px',
                top: data.top != undefined ? data.top : '0px',
                zIndex: data.zIndex || 1001,
                margin: data.margin != undefined ? data.margin : '0px',
                padding: data.padding != undefined ? data.padding : '0px',
                borderWidth: data.borderWidth || '1px',
                borderStyle: data.borderStyle || 'solid',
                borderColor: data.borderColor || '#ccc',
                backgroundPosition: data.backgroundPosition || 'left top',
                backgroundImage: data.backgroundImage != undefined ? data.backgroundImage : '',
                backgroundColor: data.backgroundColor || '#ffffff',
                backgroundRepeat: data.backgroundRepeat || 'no-repeat',
                backgroundSize: data.backgroundSize || ''
            }, data);

            return new Block(data);
        },
        text: function (data) {
            return new Text(data);
        },
        image: function (data) {
            return new Image(data);
        },
        factory: function (type, data) {
            try {
                type = type.toLowerCase();

                return Component[type](data);
            } catch (e) {
                return {};
            }
        }
    };

    return {
        createComponent: Component.factory
    };
});