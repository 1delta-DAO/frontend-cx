import { ONE_18, TEN } from 'constants/1delta'
import { BigNumber, ethers } from 'ethers'

const expScale = ONE_18
const doubleScale = TEN.pow(36)
const halfExpScale = ONE_18.div(2)
const mantissaOne = expScale
const TWO = ethers.BigNumber.from(2)

export interface Exp {
  mantissa: BigNumber
}

interface Double {
  mantissa: BigNumber
}

/**
 * @dev Truncates the given exp to a whole number value.
 *      For example, truncate(Exp{mantissa: 15 * expScale}) = 15
 */
export const truncate = (exp: Exp): BigNumber => {
  // Note: We are not using careful math here as we're performing a division that cannot fail
  return exp.mantissa.div(expScale)
}

/**
 * @dev Multiply an Exp by a scalar, then truncate to return an unsigned integer.
 */
export const mul_ScalarTruncate = (a: Exp, scalar: BigNumber): BigNumber => {
  const product: Exp = mulExpBn_(a, scalar)
  return truncate(product)
}

/**
 * @dev Multiply an Exp by a scalar, truncate, then add an to an unsigned integer, returning an unsigned integer.
 */
export const mul_ScalarTruncateAddUInt = (a: Exp, scalar: BigNumber, addend: BigNumber): BigNumber => {
  const product: Exp = mulExpBn_(a, scalar)
  return add_(truncate(product), addend)
}

/**
 * @dev Checks if first Exp is less than second Exp.
 */
export const lessThanExp = (left: Exp, right: Exp): boolean => {
  return left.mantissa < right.mantissa
}

/**
 * @dev Checks if left Exp <= right Exp.
 */
export const lessThanOrEqualExp = (left: Exp, right: Exp): boolean => {
  return left.mantissa <= right.mantissa
}

/**
 * @dev Checks if left Exp > right Exp.
 */
export const greaterThanExp = (left: Exp, right: Exp): boolean => {
  return left.mantissa > right.mantissa
}

/**
 * @dev returns true if Exp is exactly zero
 */
export const isZeroExp = (value: Exp): boolean => {
  return value.mantissa.eq(0)
}

// export const safe224 = (n: BigNumber, string memory errorMessage): BigNumber => {
//   require(n < 2 ** 224, errorMessage);
//   return uint224(n);
// }

// export const safe32 = (n: BigNumber, string memory errorMessage): BigNumber {
//   require(n < 2 ** 32, errorMessage);
//   return uint32(n);
// }

export const addExp_ = (a: Exp, b: Exp): Exp => {
  return { mantissa: add_(a.mantissa, b.mantissa) }
}

export const addDouble_ = (a: Double, b: Double): Double => {
  return { mantissa: add_(a.mantissa, b.mantissa) }
}

export const add_ = (a: BigNumber, b: BigNumber): BigNumber => {
  return a.add(b)
}

export const subExp_ = (a: Exp, b: Exp): Exp => {
  return { mantissa: sub_(a.mantissa, b.mantissa) }
}

export const subDouble_ = (a: Double, b: Double): Double => {
  return { mantissa: sub_(a.mantissa, b.mantissa) }
}

export const sub_ = (a: BigNumber, b: BigNumber): BigNumber => {
  return a.sub(b)
}

export const mulExp_ = (a: Exp, b: Exp): Exp => {
  return { mantissa: mul_(a.mantissa, b.mantissa).div(expScale) }
}

export const mulExpBn_ = (a: Exp, b: BigNumber): Exp => {
  return { mantissa: mul_(a.mantissa, b) }
}

export const mulBnExp_ = (a: BigNumber, b: Exp): BigNumber => {
  return mul_(a, b.mantissa).div(expScale)
}

export const mulDouble_ = (a: Double, b: Double): Double => {
  return { mantissa: mul_(a.mantissa, b.mantissa).div(doubleScale) }
}

export const mulDoubleBn_ = (a: Double, b: BigNumber): Double => {
  return { mantissa: mul_(a.mantissa, b) }
}

export const mulBnDouble_ = (a: BigNumber, b: Double): BigNumber => {
  return mul_(a, b.mantissa).div(doubleScale)
}

export const mul_ = (a: BigNumber, b: BigNumber): BigNumber => {
  return a.mul(b)
}

export const divExp_ = (a: Exp, b: Exp): Exp => {
  return { mantissa: div_(mul_(a.mantissa, expScale), b.mantissa) }
}

export const divExpBn_ = (a: Exp, b: BigNumber): Exp => {
  return { mantissa: div_(a.mantissa, b) }
}

export const divBnExp_ = (a: BigNumber, b: Exp): BigNumber => {
  return div_(mul_(a, expScale), b.mantissa)
}

export const divDouble_ = (a: Double, b: Double): Double => {
  return { mantissa: div_(mul_(a.mantissa, doubleScale), b.mantissa) }
}

export const divDoubleBn_ = (a: Double, b: BigNumber): Double => {
  return { mantissa: div_(a.mantissa, b) }
}

export const divBnDouble_ = (a: BigNumber, b: Double): BigNumber => {
  return div_(mul_(a, doubleScale), b.mantissa)
}

export const div_ = (a: BigNumber, b: BigNumber): BigNumber => {
  return a.div(b)
}

export const fraction = (a: BigNumber, b: BigNumber): Double => {
  return { mantissa: div_(mul_(a, doubleScale), b) }
}
