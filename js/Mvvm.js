const log = console.log;

/**
 * 存放实例的一些参数
 * @param {Object} options 
 */
function MVVM(options = {}) {
    //将所有属性挂载在$options
    this.$options = options;
    let data = this._data = this.$options.data;

    // 观察实例的data
    observe(data);

    // 数据代理 使用vm.a 方式代替vm._data.a
    for (let key in data) {
        Object.defineProperty(this, key, {
            enumerable: true,
            configurable: true,
            get() {
                return this._data[key];
            },
            set(newVal) {
                this._data[key] = newVal
            }
        })
    }

    //编译实例
    new Compile(options.el, this);

}