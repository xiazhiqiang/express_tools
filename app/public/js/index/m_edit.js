define(['jquery', 'helper', 'jqueryui'], function ($, Helper) {

    /**
     * 组件基类
     * @param option
     * @constructor
     */
    function Base(option) {
        this.id = option.id == undefined ? Helper.randomChar(6) : option.id;
        this.position = option.position == undefined ? 0 : option.position;
        this.left = option.left == undefined ? 0 : option.left;
        this.top = option.top == undefined ? 0 : option.top;
        this.width = option.width == undefined ? 0 : option.width;
        this.height = option.height == undefined ? 0 : option.height;
        this.zIndex = option.zIndex == undefined ? 1000 : option.zIndex;
        this.margin = option.margin == undefined ? 0 : option.margin;
        this.padding = option.padding == undefined ? 0 : option.padding;
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

        this.borderWidth = option.borderWidth == undefined ? '1px' : option.borderWidth;
        this.borderStyle = option.borderStyle == undefined ? 'solid' : option.borderStyle;
        this.borderColor = option.borderColor == undefined ? '#ccc' : option.borderColor;

        this.backgroundPosition = option.backgroundPosition == undefined ? '0 0' : option.backgroundPosition;
        this.backgroundImage = option.backgroundImage == undefined ? '' : option.backgroundImage;
        this.backgroundColor = option.backgroundColor == undefined ? '#ffffff' : option.backgroundColor;
        this.backgroundRepeat = option.backgroundRepeat == undefined ? 'repeat' : option.backgroundRepeat;
        this.backgroundSize = option.backgroundSize == undefined ? '' : option.backgroundSize;
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
            wrapper = $('<div class="component" id="' + that.id + '"></div>'),
            css = $.extend({
                position: that.position,
                left: that.left,
                top: that.top,
                'z-index': that.zIndex,
                width: that.width,
                height: that.height,
                margin: that.margin,
                padding: that.padding,
                background: [that.backgroundColor, 'url(' + that.backgroundImage + ')', that.backgroundPosition, that.backgroundRepeat, that.backgroundSize].join(' '),
                border: [that.borderWidth, that.borderStyle, that.borderColor].join(' '),
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
                setCurDomId(that.id);

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
                },
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

                    console.log(moveDom(ui.helper[0].id, parent));
                },
            })
            .resizable({
                resize: function (event, ui) {
                    $('.attr-item').trigger('attr_update', [ui.helper]);
                },
            })
            .appendTo(parent);

        // 添加到dom树
        console.log(addDomTree(this));

        return this;
    };

    /**
     * 重新生成组件dom用于导出
     * @returns {{html: (*|jQuery|HTMLElement), css: string}}
     */
    Block.prototype.reform = function () {
        return {
            html: $('<div id="' + this.id + '"></div>'),
            css: this.createCss(),
        };
    };

    /**
     * 生成css
     * @returns {string}
     */
    Block.prototype.createCss = function () {
        var css = [
            '#' + this.id + '{',
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
            '}',
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

    //---------------------------------------------------------------------------

    /**
     * 生成组件对象
     * @param type
     * @param option
     * @param data
     * @returns {*}
     */
    var createComponent = function (type, data) {
        try {
            var component;
            switch (type) {
                case 'block':
                    component = new Block({
                        id: Helper.randomChar(6),
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
                        backgroundSize: data.backgroundSize || '',
                    });
                    break;
                case 'text':
                    component = new TextBox({});
                    break;
                case 'image':
                    component = new Image({});
                    break;

                default:
                    component = {};
            }

            return component;
        } catch (e) {
            return {};
        }
    };

    /**
     * 画布的组件dom树
     * @type {{firstHead: string, dom: {_root_: {parent: number, firstChild: null, rightSib: null, data: null}}, current: string}}
     * @private
     */
    var _domTree = {
        firstHead: '_root_',
        dom: {// 采用双亲、孩子和兄弟表示法做dom树
            '_root_': {
                parent: -1,
                firstChild: null,
                rightSib: null,
                data: null
            },// 根节点
        },
        current: '',
    };

    var _htmlFrame = function (html, css) {
        html = html || '';
        css = css || '';

        return [
            '<!DOCTYPE html><html>',
            '<head>',
            '<meta charset="utf-8">',
            '<meta http-equiv="X-UA-Compatible" content="IE=edge">',
            '<title>Demo</title>',
            css ? '<style type="text/css">' + css + '</style>' : css,
            '</head><body>',
            html,
            '</body></html>',
        ].join('');
    };

    /**
     * 导出html,css代码
     * @returns {{html: (string|*|string|string|string|string), css: string}}
     */
    var exportCode = function () {
        var _reformTree = {_css_: []};

        // 后序遍历所有节点生成子树和css
        _postOrder('_root_', _reformTree, function (id) {
            var parent = _domTree.dom[id].parent,
                reform = parent != -1 ? _domTree.dom[id].data.reform() : {html: $('<div id="canvas"></div>'), css: ''};

            this[id] = reform.html;

            var firstChild = _domTree.dom[id].firstChild;
            while (firstChild !== null) {
                this[id] = this[id].append(this[firstChild.child]);
                firstChild = firstChild.next;
            }

            this._css_ = reform.css + this._css_;
        });

        console.log(_reformTree._root_[0]);

        return {
            html: _reformTree._root_[0].innerHTML,
            css: _reformTree._css_,
            file: _htmlFrame(_reformTree._root_[0].innerHTML, _reformTree._css_),
        };
    };

    /**
     * 添加组件到domTree中
     * @param data
     * @returns {*}
     */
    var addDomTree = function (data) {
        // 添加dom
        _domTree.dom[data.id] = {
            parent: '_root_',
            firstChild: null,
            data: data,
        };

        // 追加树关系
        _appendRelation(data.id, '_root_');

        return _domTree.dom;
    };

    /**
     * 移动组件到某个父元素下
     * @param id
     * @param parent
     * @returns {*}
     */
    var moveDom = function (id, parent) {
        parent = parent || '_root_';// 默认为根节点
        if (_domTree.dom[id] == undefined || _domTree.dom[parent] == undefined || _domTree.dom[id].parent == undefined) {
            return false;
        }

        // 删除原先的树关系（类似链表删除）
        _deleteRelation(id);

        // 追加到新的parent子树
        _appendRelation(id, parent);

        return _domTree.dom;
    };

    /**
     * 从dom树删除dom
     * @param id
     * @returns {*}
     */
    var deleteDom = function (id) {
        if (_domTree.dom[id] == undefined) {
            return true;
        }

        // 删除原先的树关系
        _deleteRelation(id);

        // 遍历要删除dom的ID
        var _arr = [];
        _preOrder(id, _arr, function (id) {
            Array.prototype.push.call(this, id);
        });
        _arr.forEach(function (element) {
            delete _domTree.dom[element];// 只删除的当前元素，应该包括其下的所有子元素
        });

        return _domTree.dom;
    };

    /**
     * 前序遍历
     * @param id
     * @param obj
     * @param callback
     * @private
     */
    var _preOrder = function (id, obj, callback) {
        callback.apply(obj, [id]);

        var firstChild = _domTree.dom[id].firstChild;
        if (firstChild !== null) {
            _preOrder(firstChild.child, obj, callback);

            while (firstChild.next !== null) {
                _preOrder(firstChild.next.child, obj, callback);

                firstChild = firstChild.next;
            }
        }
    };

    /**
     * 后序遍历
     * @param id
     * @param obj
     * @param callback
     * @private
     */
    var _postOrder = function (id, obj, callback) {
        var firstChild = _domTree.dom[id].firstChild;
        if (firstChild !== null) {
            _postOrder(firstChild.child, obj, callback);

            while (firstChild.next !== null) {
                _postOrder(firstChild.next.child, obj, callback);
                firstChild = firstChild.next;
            }

            callback.apply(obj, [id]);
        } else {
            callback.apply(obj, [id]);
        }
    };

    /**
     * 追加树关系（类似插入元素到链表末尾）
     * @param id
     * @param parent
     * @private
     */
    var _appendRelation = function (id, parent) {
        var firstChild = _domTree.dom[parent].firstChild;
        if (firstChild === null) {
            _domTree.dom[parent].firstChild = {
                child: id,
                next: null,
            };
        } else {
            while (firstChild.child != id && firstChild.next !== null) {
                firstChild = firstChild.next;
            }

            // 避免重复append
            if (firstChild.child != id) {
                firstChild.next = {
                    child: id,
                    next: null,
                };
            }
        }

        _domTree.dom[id].parent = parent;
    };

    /**
     * 删除原先的树关系（类似链表元素删除）
     * @param id
     * @private
     */
    var _deleteRelation = function (id) {
        var parent = _domTree.dom[_domTree.dom[id].parent],
            firstChild = parent.firstChild,
            lastChild = firstChild,
            flag = false;

        while (firstChild !== null) {
            if (firstChild.child == id) {
                flag = true;
                break;
            }

            lastChild = firstChild;
            firstChild = firstChild.next;
        }

        if (flag) {
            // dom关系的第一个节点
            if (parent.firstChild.child == id) {
                parent.firstChild = firstChild.next;
            } else {
                lastChild.next = firstChild.next;
            }
        }
    };

    /**
     * 更新dom树数据
     * @param id
     * @param data
     * @returns {*}
     */
    var updateDomData = function (id, data) {
        if (_domTree.dom[id]) {
            _domTree.dom[id].data = $.extend(_domTree.dom[id].data, data);

            return _domTree.dom[id];
        }

        return {};
    };

    /**
     * 获取组件dom树中的数据
     * @param id
     * @returns {*|{}}
     */
    var getDom = function (id) {
        return _domTree.dom[id] || {};
    };

    var getCurDom = function () {
        return _domTree.dom[_domTree.current] || {};
    };

    /**
     * 设置当前选中domId
     * @param id
     * @returns {string}
     */
    var setCurDomId = function (id) {
        _domTree.current = id;

        return _domTree.current;
    };

    /**
     * 获取当前选中的domId
     * @returns {string}
     */
    var getCurDomId = function () {
        return _domTree.current;
    };

    var getDomTree = function () {
        return _domTree;
    };

    return {
        moveDom: moveDom,
        deleteDom: deleteDom,
        addDomTree: addDomTree,
        updateDomData: updateDomData,
        exportCode: exportCode,


        getDom: getDom,
        getCurDom: getCurDom,
        getDomTree: getDomTree,
        setCurDomId: setCurDomId,
        getCurDomId: getCurDomId,
        createComponent: createComponent,
    };
});