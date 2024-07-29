import { isObject } from "../../packages/shared";
import { mutableHandlers } from "./baseHandlers";
export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive'
}
/**
 * 返回响应性对象
 */
const reactiveMap = new WeakMap<object,any>()
export function reactive(target:object) {
    // 使用reactive函数时，创建一个响应性对象
    return createReactiveObject(target,mutableHandlers,reactiveMap);
}
/**
 * 创建响应性对象
 */
function createReactiveObject(target:Object,baseHandlers:ProxyHandler<any>,proxyMap:WeakMap<object,any>) {
    const existingProxy = proxyMap.get(target); //如果对象被代理过，直接读取即可
    if(existingProxy){
        return existingProxy
    }else{
        const proxy = new Proxy(target,baseHandlers); //对象没被代理过，进行代理
        proxy[ReactiveFlags.IS_REACTIVE] = true; //标识该代理对象是响应式的
        proxyMap.set(target,proxy)
        return proxy;
    }
}
/**
 * 判断是否是Reactive
 */
type ReactiveProxy<T>={
    get:(target:T,key:keyof T)=> T[keyof T];
    set:(target:T,key:keyof T,value:any)=> boolean
}
export function isReactive(value:object):value is ReactiveProxy<object> {
    return !!(value && value[ReactiveFlags.IS_REACTIVE])
}