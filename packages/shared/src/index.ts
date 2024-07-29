/**
 * 将值转为字符串
 */
export const toDisplayString = (val:unknown):string =>{
    // unknown和any的区别就在于：unknown当未被定义的时候，不能使用到对应的方法，而any相当于不进行类型检测
    return String(val)
}
/**
 * 判断是否是数组
 */
export const isArray = Array.isArray;
/**
 * 判断是否是对象
 */
export const isObject = (value:unknown):value is object=> value!==null && typeof value === 'object'
/**
 * 对比两个数据是否变化
 */
export const hasChanged = (v1:unknown,v2:unknown):boolean=>Object.is(v1,v2)
/**
 * 判断是否是函数
 */
export const isFunction = (value:unknown):value is Function=>typeof value === 'function'
/**
 * Object.assign合并
 */
export const extend = Object.assign
/**
 * 只读的空对象
 */
export const EMPTY_OBJ:{readonly[key:string]:any} = {}
/**
 * 是否是一个string
 */
// is谓词的作用就在于进行类型倒退，当value为any或者unknoown时，直接赋为boolean类型会使得即使value在后续已经知道类型，也不会变为该类型
// 使用is谓词之后，就能根据结果到退出value的类型
export const isString=(value:unknown):value is string=>typeof value==='string';
/**
 * 是否以on开头，且符合规范
 */
export const isOn=(value:string):boolean=> /^on[^a-z]/.test(value);
/**
 * 永远返回false
 */
export const NO = (value:unknown):false => false;
/**
 * 规范化class类，处理class的增强
 */
export function normalizeClass(value:unknown):string {
    let str = ''
    if(isString(value)){
        return value;
    }else if(isArray(value)){
        for(let i =0;i<value.length;i++){
            const normalizedString = normalizeClass(value[i]);
            str += normalizedString + ' '; //留存空格
        }
    }else if(isObject(value)){
        for(let name in value){
            if(value[name]){
                str += name + ' '
            }
        }
    }
    return str.trim();
}
/**
 * enum ShapeFlags
 * 巧妙使用位运算来判断类型
 */
export const enum ShapeFlags{
    /**
     * Element类型
     */
    ELEMENT = 1,
    /**
	 * 函数组件
	 */
	FUNCTIONAL_COMPONENT = 1 << 1,
	/**
	 * 有状态（响应数据）组件
	 */
	STATEFUL_COMPONENT = 1 << 2,
	/**
	 * children = Text
	 */
	TEXT_CHILDREN = 1 << 3,
	/**
	 * children = Array
	 */
	ARRAY_CHILDREN = 1 << 4,
	/**
	 * children = slot
	 */
	SLOTS_CHILDREN = 1 << 5,
	/**
	 * 组件：有状态（响应数据）组件 | 函数组件
	 */
	COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT
}
