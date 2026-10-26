export const BIT_VALUES = [128, 64, 32, 16, 8, 4, 2, 1] as const

export const bitsOf = (n: number): (0 | 1)[] => BIT_VALUES.map((v) => ((n & v) !== 0 ? 1 : 0))

export const valueOf = (bits: (0 | 1)[]): number => bits.reduce<number>((s, b, i) => s + (b ? BIT_VALUES[i] : 0), 0)
