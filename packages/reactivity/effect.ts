import { extend, isArray } from '../../packages/shared'
import { Dep,createDep } from "./dep.ts";
/**
 * effect函数类,包含fn函数，run执行方法
 */
export type EffectScheduler = Map<any,Dep>
export class ReactiveEffect<T=any> {    
    // computed?:ComputedRefImpl<T>
    constructor(public fn:()=>T,public scheduler:EffectScheduler | null = null){

    }
    run(){ //响应性副作用执行时，将this赋值给activeEffect当前副作用
        activeEffect = this;
        return this.fn(); //run方法执行获得当前副作用中的函数
    }
}
/**
 * 单例的，当前的effect函数
 */
export let activeEffect: ReactiveEffect | undefined;
/**
 * 收集全部依赖
 * 1. `key`：响应性对象
 * 2. `value`：`Map` 对象
 * 		1. `key`：响应性对象的指定属性
 * 		2. `value`：指定对象的指定属性的 执行函数
 */
//----------------------------------------------------------------------------------------
// 响应性存储桶结构为：weakMap嵌套map嵌套set的结构，第一层标识对象，第二层标识属性，第三层set存放副作用函数
type KeyToDepMap = Map<any,Dep>
const targetMap = new WeakMap<any,KeyToDepMap>()
/**
 * track函数用于收集目标对象属性的依赖函数
 */
export function track(target:object,key:unknown) {
    //此时需要定义一个activeEffect作为当前执行的函数，通过activeEffect变量来限制只有当前副作用中用到的依赖才进行收集
    //例如每次访问对象属性时，并不总是想要触发track函数（例如console）
    if(!activeEffect) return //当前无活跃副作用，直接返回
    let depsMap = targetMap.get(target);
    if(!depsMap){ //如果桶中没有目标对象，添加一个，并获得depsMap
        targetMap.set(target,(depsMap = new Map()))
    }
    let dep = depsMap.get(key); //从depsMap中获取对应属性对应的set集合
    if(!dep){ //如果没有，设置对应属性对应的set集合（存放副作用函数）
        depsMap.set(key,(dep = createDep()))
    }
    trackEffects(dep);
}
/**
 * 将activeEffect添加到当前对应对象属性对应的set集合中（副作用集合）
 */
export function trackEffects(dep:Dep) {
    dep.add(activeEffect!) //非空断言，断言不是null或者undefined
}
/**
 * 触发依赖
 * @param target 响应性对象
 * @param key 对象属性
 */
export function trigger(target:object,key?:unknown) {
    const depsMap = targetMap.get(target);
    if(!depsMap) return;
    let dep:Dep | undefined = depsMap.get(key);
    if(!dep) return;
    triggerEffects(dep); //遍历set集合，触发副作用函数
}
/**
 * 依次触发set集合中保存的作用函数
 */
export function triggerEffects(dep:Dep) {
    const effects = isArray(dep)?dep:[...dep];
    for(let item of effects){
        triggerEffect(item);
    }
    /**
     * 计算属性之后有所变更
     */
}
/**
 * 触发单个依赖
 */
export function triggerEffect(effect:ReactiveEffect) {
    /**
     * 添加调度后有所变更
     */
    effect.run();
}
/**
 * 响应性对象参数
 */
export interface ReactiveEffectOptions{
    lazy?: boolean
    /**
     * 调度器后有所变更
     */
}
export function effect<T = any>(fn:()=>T,options?:ReactiveEffectOptions) {
    // 生成ReactiveEffect实例
    const _effect = new ReactiveEffect(fn);
    if(options){
        extend(_effect,options)
    }
    /**
     * options中配制lazy后有所变更
     */
    _effect.run(); //执行副作用，该边当前副作用
}
