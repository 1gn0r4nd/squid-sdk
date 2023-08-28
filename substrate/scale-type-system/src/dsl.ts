import {Bytes} from '@subsquid/scale-codec'
import {Type} from './type-checker'
import {GetType} from './type-util'
import {ArrayType} from './types/array'
import {EnumDefinition, EnumStruct, EnumType, GetEnumType} from './types/enum'
import {ExternalEnum, ExternalEnumType} from './types/externalEnum'
import {OptionType} from './types/option'
import {
    AnyType,
    BigIntType,
    BooleanType,
    BytesType,
    NumberType,
    NumericType,
    StringType,
    UnitType,
    UnknownType
} from './types/primitives'
import {GetStructType, StructType} from './types/struct'
import {TupleType} from './types/tuple'
import {UnionType} from './types/union'


export {GetType, ExternalEnum}


const numberType = new NumberType()
const bigintType = new BigIntType()
const numericType = new NumericType()
const stringType = new StringType()
const bytesType = new BytesType()
const booleanType = new BooleanType()
const anyType = new AnyType()
const unknownType = new UnknownType()
const unitType = new UnitType()
const externalEnumType = new ExternalEnumType()


export function number(): Type<number> {
    return numberType
}


export function bigint(): Type<bigint> {
    return bigintType
}


export function numeric(): Type<number | bigint> {
    return numericType
}


export function string(): Type<string> {
    return stringType
}


export function bytes(): Type<Bytes> {
    return bytesType
}


export function boolean(): Type<boolean> {
    return booleanType
}


export function any(): Type<any> {
    return anyType
}


export function unknown(): Type<unknown> {
    return unknownType
}


export function unit(): Type<null> {
    return unitType
}


export function array<T extends Type>(def: Get<T>): Type<GetType<T>[]> {
    return new ArrayType(getter(def))
}


export function tuple(): Type<null>
export function tuple<T extends Type>(t: T): Type<[GetType<T>]>
export function tuple<T1 extends Type, T2 extends Type>(t1: T1, t2: T2): Type<[GetType<T1>, GetType<T2>]>
export function tuple<T1 extends Type, T2 extends Type, T3 extends Type>(t1: T1, t2: T2, t3: T3): Type<[GetType<T1>, GetType<T2>, GetType<T3>]>
export function tuple<T1 extends Type, T2 extends Type, T3 extends Type, T4 extends Type>(t1: T1, t2: T2, t3: T3, t4: T4): Type<[GetType<T1>, GetType<T2>, GetType<T3>, GetType<T4>]>
export function tuple<T1 extends Type, T2 extends Type, T3 extends Type, T4 extends Type, T5 extends Type>(t1: T1, t2: T2, t3: T3, t4: T4, t5: T5): Type<[GetType<T1>, GetType<T2>, GetType<T3>, GetType<T4>, GetType<T5>]>
export function tuple<T1 extends Type, T2 extends Type, T3 extends Type, T4 extends Type, T5 extends Type, T6 extends Type>(t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6): Type<[GetType<T1>, GetType<T2>, GetType<T3>, GetType<T4>, GetType<T5>, GetType<T6>]>
export function tuple(...def: Type[]): Type<any[] | null> {
    if (def.length == 0) {
        return unit()
    } else {
        return new TupleType(def)
    }
}


export function struct<T extends Record<string, Type>>(def: Get<T>): Type<GetStructType<T>> {
    return new StructType(getter(def))
}


export function option<T>(type: Get<Type<T>>): Type<T | undefined> {
    return new OptionType(getter(type))
}


export function openEnum<Variants extends EnumDefinition>(variants: Get<Variants>): Type<GetEnumType<Variants> | {__kind: '*'}> {
    return new EnumType(getter(variants), true)
}


export function closedEnum<Variants extends EnumDefinition>(variants: Get<Variants>): Type<GetEnumType<Variants>> {
    return new EnumType(getter(variants), false)
}


export function enumStruct<T extends Record<string, Type>>(def: T): EnumStruct<GetStructType<T>> {
    return new EnumStruct(struct(def))
}


export function externalEnum(): Type<ExternalEnum>
export function externalEnum<Variants extends EnumDefinition>(
    variants: Get<Variants>
): Type<GetEnumType<Variants> | {__kind: '*', value: {__kind: string}}>
export function externalEnum(variants?: Get<EnumDefinition>): Type<any> {
    if (variants == null) {
        return externalEnumType
    } else {
        return new EnumType(getter(variants), 'external')
    }
}


export function union<T1 extends Type, T2 extends Type>(t1: T1, t2: T2): Type<GetType<T1> | GetType<T2>>
export function union<T1 extends Type, T2 extends Type, T3 extends Type>(t1: T1, t2: T2, t3: T3): Type<GetType<T1> | GetType<T2> | GetType<T3>>
export function union<T1 extends Type, T2 extends Type, T3 extends Type, T4 extends Type>(t1: T1, t2: T2, t3: T3, t4: T4): Type<GetType<T1> | GetType<T2> | GetType<T3> | GetType<T4>>
export function union(...types: Type[]): Type<any> {
    return new UnionType(types)
}


type Get<T> = T | (() => T)


function getter<T>(get: Get<T>): () => T {
    if (typeof get == 'function') {
        return get as () => T
    } else {
        return () => get
    }
}
