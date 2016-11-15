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
    }

    Base.prototype.render = function (parent, dom) {
    };
    Base.prototype.reform = function () {
    };

    /**
     * TODO 未完
     */
    Base.prototype.createCss = function () {

    };

    /**
     * 区块类
     * @param option
     * @constructor
     */
    function Block(option) {
        Base.call(this, option);

        this.componentType = this.constructor.name == 'Block' ? this.constructor.name : 'Block';

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
                width: that.width,
                height: that.height,
                'z-index': that.zIndex,
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
        // addDom(this);
        console.log(addDomTree(this));

        return this;
    };

    /**
     * 重新生成组件dom用于导出
     * todo 需要完善
     * @returns {{html: (*|jQuery|HTMLElement), css: string}}
     */
    Block.prototype.reform = function () {
        return {
            html: $('<div id="' + this.id + '"></div>'),
            css: this.createCss(),
        };
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
                        width: data.width || 200,
                        height: data.height || 100,
                        left: data.left != undefined ? data.left : 0,
                        top: data.top != undefined ? data.top : 0,
                        zIndex: data.zIndex || 1001,
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

    /**
     * 导出html代码
     * todo 需要完善css，html
     */
    var exportCode = function () {
        var _reformTree = {};
        _preOrder('_root_', _reformTree, function (id, obj) {
            var parent = _domTree.dom[id].parent;
            if (parent == -1) {
                obj['_root_'] = $('<div id="canvas"></div>');
            } else if (parent === '_root_') {
                obj[id] = _domTree.dom[id].data.reform().html;
            } else {
                obj[parent] = obj[parent].append(_domTree.dom[id].data.reform().html);
            }
        });

        var firstChild = _domTree.dom._root_.firstChild;
        while (firstChild !== null) {
            _reformTree['_root_'].append(_reformTree[firstChild.child]);
            delete _reformTree[firstChild.child];
            firstChild = firstChild.next;
        }

        console.log(_reformTree['_root_'][0].innerHTML);
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
        _preOrder(id, _arr, function (id, obj) {
            Array.prototype.push.call(obj, id);
        });
        _arr.forEach(function (element) {
            delete _domTree.dom[element];// 只删除的当前元素，应该包括其下的所有子元素
        });

        return _domTree.dom;
    };

    /**
     * 前序遍历
     * @param id
     * @param arr
     * @private
     */
    var _preOrderBack = function (id, arr) {
        arr.push(_domTree.dom[id].data);

        var firstChild = _domTree.dom[id].firstChild;
        if (firstChild !== null) {
            _preOrder(firstChild.child, arr);

            while (firstChild.next !== null) {
                _preOrder(firstChild.next.child, arr);

                firstChild = firstChild.next;
            }
        }
    };

    /**
     * 前序遍历
     * @param id
     * @param obj
     * @param callback
     * @private
     */
    var _preOrder = function (id, obj, callback) {
        callback(id, obj);

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