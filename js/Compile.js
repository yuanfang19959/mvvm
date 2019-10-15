/**
 * 编译
 * @param {String} el 
 * @param {Object} vm 当前mvvm实例
 */
function Compile(el, vm) {
    // el表示替换的范围，其实就是id为app的那个div及div内的所有元素
    vm.$el = document.querySelector(el);

    // 将$el中的内容插入到fragment中 其实是内存中
    let fragment = document.createDocumentFragment();

    // 这边将el的内容放进fragment片段中，放一次少一次
    while (child = vm.$el.firstChild) {
        fragment.appendChild(child)
    }

    // 处理片段
    replace(fragment, vm);

    // 将处理过的片段还给实例vm的$el属性
    vm.$el.appendChild(fragment)
}


/**
 *用于替换和匹配dom节点中的{{}}
 * @param {*} fragment  取出片段
 * @param {Object} vm   当前mvvm实例
 */
function replace(fragment, vm) {
    //循环dom节点的每一层
    Array.from(fragment.childNodes).forEach(node => {
        let text = node.textContent; //取出 节点的文本内容
        let reg = /\{\{(.*)\}\}/;

        // 判断是不是文本节点，且含有{{}}
        if (node.nodeType === 3 && reg.test(text)) {
            // 这里打印的是 {{}} 中的内容
            log(RegExp.$1)

            let arr = RegExp.$1.split('.');  // [a,a]
            let val = vm;
            // 这个遍历的作用是取值
            arr.forEach(key => {
                val = val[key]
            })

            // 此处解析 将{{jj}} 变量替换为值
            node.textContent = text.replace(reg, val);

            // 这边更改新值后，watcher开始监听 并触发notify
            new Watcher(vm, RegExp.$1, function (newVal) {
                node.textContent = text.replace(reg, newVal);
            })
        }

        //根据指令判断 'Z-model'
        // nodeType等于1是元素节点
        if (node.nodeType === 1) {
            let nodeAttrs = node.attributes; //获取当前节点的所有属性
            Array.from(nodeAttrs).forEach(function (attr) {
                let attrName = attr.name;
                let attrVal = attr.value;
                // 存放attrVal值的数组
                let attrArr = attrVal.split('.'); 
                if (attrName.indexOf('z-model') == 0) {
                    newObjVal = vm;
                    attrArr.forEach(key => {
                        newObjVal = newObjVal[key]
                    })
                    node.value = newObjVal;

                    // 订阅
                    new Watcher(vm, attrVal, function (newVal) {
                        node.value = newVal;
                    })

                    // 输入时触发
                    node.addEventListener('input', function (e) {
                        let newVal = e.target.value;
                        // 当这里重新设置值的时候会触发set里面的notify方法
                        let obj = vm
                        let len = attrArr.length;

                        // 当z-model中不嵌套的情况 即len = 0
                        if (len === 1) {
                            vm[attrVal] = newVal;
                        } else {
                            attrArr.forEach((key, index) => {
                                obj = obj[key]
                                // 这里数组长度减去2得到的是 拥有最后一个属性名的那个对象
                                if (index === (attrArr.length - 2)) {
                                    // 此时的obj对象为最后一次循环前的那个对象，否则取最后一次循环就变成值了
                                    // 表述有点不清楚 具体请实验
                                    log(obj)

                                    let lastAttrName = attrArr[len-1]

                                    // 将新结果赋给这个属性 由于这边最开始是浅拷贝 所以 给obj赋值相当于给vm赋值
                                    obj[lastAttrName] = newVal;
                                }
                            })
                        }
                    })
                }

            })
        }

        // 如果当前节点还有节点就继续 编译replace
        if (node.childNodes) {
            replace(node, vm);
        }
    })
}