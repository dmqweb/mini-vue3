/**
 * VNode
 */
export interface VNode {
    __v_isVNode: true,
    key: any,
    type: any,
    props: any,
    children: any,
    shapeFlag: number
}