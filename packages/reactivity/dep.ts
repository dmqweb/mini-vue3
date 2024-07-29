import { ReactiveEffect } from "./effect";
export type Dep = Set<ReactiveEffect>
/**
 * 生成响应性对象属性对应的set集合，存储副作用函数
 */
export const createDep = (effects?: ReactiveEffect[]):Dep => 
    new Set<ReactiveEffect>(effects) as Dep;