import { track,trigger } from "./effect";
/**
 * 创建getter回调方法
 */
function createGetter() {
    return function get(target:object,key:string | symbol,receiver:object) {
        //ES6标准将对象的方法转移到了Reflect对象上，Reflect是一种封装了底层操作的API        
        //使用响应性对象时，操作的都是返回的代理对象，且打点调用的执行上下文也是代理对象
        //想要代理到源对象执行get、set就需要Reflect.get的第三个参数receiver（指定上下文）
        const res = Reflect.get(target,key,receiver);
        track(target,key);
        return res;
    }
}
/**
 * 创建setter回调方法
 */
function createSetter() {
    return function set(target:object,key:string | symbol,value:unknown,receiver:object) {
        const res = Reflect.set(target,key,value,receiver);
        trigger(target,key)
        return res;
    }
}
/**
 * getter回调方法
 */
const get = createGetter();
/**
 * setter回调方法
 */
const set = createSetter();
/**
 * handler代理对象，包含get和set函数
 */
export const mutableHandlers:ProxyHandler<object> = {
    get,
    set
}