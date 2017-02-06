var callback = function () {
    requirejs(['jquery', 'jqueryui', 'colorpicker', 'index/m_tree', 'index/m_component', 'helper'], function ($, jqueryui, colorpicker, Tree, Component, Helper) {

        /**
         * 编辑器Controller
         * @constructor
         */
        var EditController = {};

        var _currentElementId = {};

        /**
         * 更新组件属性栏的属性
         * @param event
         * @param element 当前视图区组件元素
         * @private
         */
        var _attrUpdateCallback = function (event, element) {
            event.stopPropagation();

            // 设置当前domTree中被选中的domId
            Tree.setCurDomId(element.attr('id'));

            var value = 'undefined',
                dom = element[0],
                cssData = Tree.getCurDom().data.css;

            switch ($(this).data('item')) {
                // 自适应特殊处理
                case 'self-adaption':
                    cssData.margin = dom.style.margin;
                    $(this)[0].checked = dom.style.margin != '0px';
                    break;

                // 基础属性
                case 'position':
                    cssData.position = value = dom.style.position;
                    break;
                case 'position-left':
                    cssData.left = value = dom.style.left;
                    break;
                case 'position-top':
                    cssData.top = value = dom.style.top;
                    break;
                case 'position-zIndex':
                    cssData.zIndex = value = dom.style.zIndex;
                    break;
                case 'size-width':
                    cssData.width = value = dom.style.width;
                    break;
                case 'size-height':
                    cssData.height = value = dom.style.height;
                    break;

                // 边框属性
                case 'border-width':
                    cssData.borderWidth = value = dom.style.borderWidth;
                    break;
                case 'border-style':
                    cssData.borderStyle = value = dom.style.borderStyle;
                    break;
                case 'border-color':
                    cssData.borderColor = value = Helper.rgb2hex(dom.style.borderColor);
                    break;

                // 背景属性
                case 'background-position':
                    cssData.backgroundPosition = value = dom.style.backgroundPosition;
                    break;
                case 'background-image':
                    cssData.backgroundImage = value = dom.style.backgroundImage.slice(5, -2);
                    break;
                case 'background-color':
                    cssData.backgroundColor = value = Helper.rgb2hex(dom.style.backgroundColor);
                    break;
                case 'background-repeat':
                    cssData.backgroundRepeat = value = dom.style.backgroundRepeat;
                    break;
                case 'background-size':
                    cssData.backgroundSize = value = dom.style.backgroundSize == 'initial' ? '' : dom.style.backgroundSize;
                    break;

                default:
                    break;
            }

            if (value !== 'undefined') {
                $(this).val(value);
            }

            if (cssData.id) {
                Tree.updateDomData(cssData.id, 'css', cssData);
            }
        };

        /**
         * 组件更新视图
         * @param event
         * @param element 当前属性区元素
         * @private
         */
        var _elementUpdateCallback = function (event, element) {
            event.stopPropagation();

            var css = {},
                value = $.trim(element.val()),
                cssData = Tree.getCurDom().data.css;
            switch (element.data('item')) {
                // 自适应特殊处理
                case 'self-adaption':
                    cssData.margin = css.margin = element[0].checked ? '0 auto' : '0';
                    break;

                // 基础属性
                case 'position':
                    cssData.position = css.position = value;
                    break;
                case 'position-left':
                    cssData.left = css.left = value;
                    break;
                case 'position-top':
                    cssData.top = css.top = value;
                    break;
                case 'position-zIndex':
                    cssData.zIndex = css['z-index'] = value;
                    break;
                case 'size-width':
                    cssData.width = css.width = value;
                    break;
                case 'size-height':
                    cssData.height = css.height = value;
                    break;

                // 边框属性
                case 'border-width':
                    cssData.borderWidth = css['border-width'] = value;
                    break;
                case 'border-style':
                    cssData.borderStyle = css['border-style'] = value;
                    break;
                case 'border-color':
                    cssData.borderColor = css['border-color'] = value;
                    break;

                // 背景属性
                case 'background-position':
                    cssData.backgroundPosition = css['background-position'] = value;
                    break;
                case 'background-image':
                    cssData.backgroundImage = value;
                    css['background-image'] = 'url(' + value + ')';
                    break;
                case 'background-color':
                    cssData.backgroundColor = css['background-color'] = value;
                    break;
                case 'background-repeat':
                    cssData.backgroundRepeat = css['background-repeat'] = value;
                    break;
                case 'background-size':
                    cssData.backgroundSize = css['background-size'] = value;
                    break;

                default:
                    break;
            }

            if (JSON.stringify(css) !== '{}') {
                $(this).css(css);
            }

            if (cssData.id) {
                Tree.updateDomData(cssData.id, 'css', cssData);
            }
        };

        /**
         * 删除视图区组件回调函数
         * @param event
         * @private
         */
        var _componentDelete = function (event) {
            event.stopPropagation();

            Tree.deleteDom($(this).attr('id'));
            Tree.setCurDomId('');
            $(this).remove();

            console.log(Tree.getDomTree());
        };

        /**
         * 获取视图区域组件最大的zIndex值
         * @returns {*}
         * @private
         */
        var _getMaxZIndex = function () {
            var zIndex = [1000];

            $('.canvas').find('.component').each(function (index, element) {
                zIndex.push(element.style.zIndex);
            });

            return Math.max.apply(Math, zIndex);
        };

        /**
         * 初始化事件
         * @private
         */
        var _initEvent = function () {
            // 属性区域操作
            $('.attr-item')
                .on('attr_update', _attrUpdateCallback)
                .on('change', function (event) {
                    event.stopPropagation();
                    _currentElementId = Tree.getCurDomId();

                    if (!_currentElementId) {
                        return false;
                    }

                    // 调整属性区域时联动改变其他属性区域的值
                    switch ($(this).data('item')) {
                        case 'position':
                            $('.position-left').val('0px').trigger('change');
                            $('.position-top').val('0px').trigger('change');
                            break;
                        case 'self-adaption':
                            if ($(this)[0].checked) {
                                $('.position-left').val('0px').trigger('change');
                                $('.position-top').val('0px').trigger('change');
                            }
                            break;

                        default:
                            break;
                    }

                    // 属性区改变同时作用于当前选中元素在视图区的显示
                    $('#' + _currentElementId).trigger('element_update', [$(this)]);
                });

            // 添加组件到视图区
            $('.component-menu li').on('click', 'a', function () {
                var parent = 'canvas',
                    type = $(this).data('item'),
                    zIndex = _getMaxZIndex() + 1,
                    component = Component.createComponent(type, {zIndex: zIndex});

                component
                    .render({
                        elementUpdateCallback: _elementUpdateCallback,
                        componentDelete: _componentDelete,
                        parent: parent
                    })
                    .appendTo('#' + parent);

                // 添加到dom树
                console.log(Tree.addDomTree(component));
            });

            // 画布区域绑定droppable事件
            $('.canvas').droppable({
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

                    $(this).trigger('moveDom', [ui.helper[0].id, '_root_']);
                }
            }).on('moveDom', function (event, currentId, parentId) {
                event.stopPropagation();
                console.log(Tree.moveDom(currentId, parentId));
            });

            // 导出按钮
            $('.export').on('click', function (event) {
                event.stopPropagation();

                var code = Tree.exportCode();
                console.log(code);

                var form = $('<form method="post" action="/export"></form>')
                    .append($('<input type="hidden" name="html">').val(code.html))
                    .append($('<input type="hidden" name="css">').val(code.css))
                    .append($('<input type="hidden" name="file">').val(code.file));
                form.submit();
            });

            // 保存数据
            $('.save').on('click', function (event) {
                event.stopPropagation();
                var treeData = Tree.getTreeData();

                // TODO 将数据写入数据库
                sessionStorage.setItem('treeData', JSON.stringify(treeData));
            });

            /**
             * 属性设置颜色拾取器初始化
             */
            $('.color-picker').ColorPicker({
                flat: false,
                onBeforeShow: function () {
                    $(this).ColorPickerSetColor(this.value);
                    return false;
                },
                onShow: function (element) {
                    $(element).css({'z-index': 9999}).fadeIn(500);
                    return false;
                },
                onHide: function (element) {
                    $(element).fadeOut(500);
                    return false;
                },
                onChange: function (hsb, hex, rgb) {
                },
                onSubmit: function (hsb, hex, rgb, element) {
                    $(element).val('#' + hex).ColorPickerHide();

                    _currentElementId = Tree.getCurDomId();
                    if (_currentElementId) {
                        $('#' + _currentElementId).trigger('element_update', [$(element)]);
                    }
                }
            });
        };

        /**
         * 加载已经保存的视图区域dom
         * @private
         */
        var _initDom = function () {
            // TODO 从数据表中获取
            var treeData = JSON.parse(sessionStorage.getItem('treeData')),
                domArr = Tree.initDomTree(treeData),
                reformTree = {};

            if (treeData) {
                domArr.forEach(function (element) {
                    if (element.parent != -1) {
                        reformTree[element.data.css.id] = element.data.render({
                            elementUpdateCallback: _elementUpdateCallback,
                            componentDelete: _componentDelete,
                            parent: element.parent == treeData.root ? 'canvas' : element.parent
                        });
                    } else {
                        reformTree[treeData.root] = $('#canvas');
                    }

                    var firstChild = element.firstChild;
                    while (firstChild !== null) {
                        var index = element.parent != -1 ? element.data.css.id : treeData.root;
                        reformTree[index] = reformTree[index].append(reformTree[firstChild.child]);
                        firstChild = firstChild.next;
                    }
                });
            }
        };

        // 控制器入口
        EditController.init = function () {
            _initDom();
            _initEvent();
        }();
    });
};

requirejs(['../config'], callback);
