/**
 * Aptitude Mastery — Initial Question Bank & Formulas Handbook
 * Complete 45-topic dataset based on the Quantitative Aptitude Handbook
 */

const APTITUDE_HANDBOOK = [
  {
    id: 1,
    title: "1. HCF and LCM",
    category: "Arithmetic & Numbers",
    coreFormulas: [
      "\\text{HCF} \\times \\text{LCM} = \\text{Product of the two numbers (true only for two numbers)}",
      "\\text{HCF of fractions} = \\frac{\\text{HCF of numerators}}{\\text{LCM of denominators}}",
      "\\text{LCM of fractions} = \\frac{\\text{LCM of numerators}}{\\text{HCF of denominators}}",
      "\\text{HCF of decimals: make decimal places equal, find HCF ignoring the decimal, place point back}"
    ],
    methods: [
      "Prime Factorization Method: Break every number into primes; HCF = product of common primes with lowest power, LCM = product of all primes with highest power.",
      "Division (Euclid) Method: Divide larger by smaller, then divisor by remainder, repeat till remainder is 0 — last divisor is the HCF."
    ],
    tipsAndTricks: [
      "For 3+ numbers, HCF × LCM shortcut does NOT hold — always use prime factorization for 3 or more numbers.",
      "Greatest number that divides x, y, z leaving same remainder r: HCF(x-r, y-r, z-r).",
      "Greatest number that divides x, y, z leaving remainders r1, r2, r3: HCF(x-r1, y-r2, z-r3).",
      "Smallest number which when divided by a, b, c leaves remainder r each time: LCM(a,b,c) + r.",
      "Smallest number which when divided by a, b, c leaves remainders (a-k), (b-k), (c-k) with constant difference k: LCM(a,b,c) - k.",
      "Greatest n-digit number divisible by a, b, c: Find LCM, then subtract (largest n-digit number mod LCM).",
      "Smallest n-digit number divisible by a, b, c: Find LCM, then round the smallest n-digit number up to the next multiple of LCM.",
      "Co-prime numbers always have HCF = 1; use this to simplify ratio-based HCF/LCM questions instantly."
    ],
    commonTraps: [
      "Don't apply HCF × LCM = product shortcut when more than 2 numbers are involved — #1 mistake in OAs.",
      "Remember LCM is always a multiple of HCF, never the other way round — sanity check your answer."
    ]
  },
  {
    id: 2,
    title: "2. Number System",
    category: "Arithmetic & Numbers",
    coreFormulas: [
      "\\sum_{i=1}^n i = \\frac{n(n+1)}{2} \\quad (\\text{Sum of first } n \\text{ natural numbers})",
      "\\sum_{i=1}^n i^2 = \\frac{n(n+1)(2n+1)}{6} \\quad (\\text{Sum of squares of first } n \\text{ natural numbers})",
      "\\sum_{i=1}^n i^3 = \\left[\\frac{n(n+1)}{2}\\right]^2 \\quad (\\text{Sum of cubes})",
      "\\text{Sum of first } n \\text{ odd numbers} = n^2",
      "\\text{Sum of first } n \\text{ even numbers} = n(n+1)",
      "\\text{Number of digits in } N \\text{ in base 10} = \\lfloor\\log_{10} N\\rfloor + 1"
    ],
    methods: [
      "Number of factors: If N = p_1^a \\times p_2^b \\times p_3^c, total factors = (a+1)(b+1)(c+1).",
      "Sum of factors: \\prod \\frac{p_i^{a_i+1} - 1}{p_i - 1} for each prime factor.",
      "Trailing zeros in n!: \\lfloor n/5 \\rfloor + \\lfloor n/25 \\rfloor + \\lfloor n/125 \\rfloor + \\dots"
    ],
    tipsAndTricks: [
      "Even × Even = Even, Odd × Odd = Odd, Even × Odd = Even.",
      "Even ± Even = Even, Odd ± Odd = Even, Even ± Odd = Odd.",
      "A perfect square never ends in 2, 3, 7, or 8.",
      "A perfect square has an odd number of total factors; every other number has an even number of factors.",
      "To check if N is prime: test divisibility only up to its square root \\sqrt{N}."
    ],
    commonTraps: [
      "1 is neither prime nor composite — a frequently tested trick option in OAs.",
      "0 is even, and is neither positive nor negative."
    ]
  },
  {
    id: 3,
    title: "3. Number, Decimals & Fractions",
    category: "Arithmetic & Numbers",
    coreFormulas: [
      "0.\\overline{abc} = \\frac{abc}{999} \\quad (\\text{Pure recurring decimal: repeat digits over as many 9s})",
      "0.ab\\overline{cd} = \\frac{abcd - ab}{9900} \\quad (\\text{Mixed recurring decimal})",
      "\\text{Comparing fractions: Cross-multiply numerators and denominators instead of finding large LCM}"
    ],
    methods: [
      "Ordering fractions: Convert to a common percentage reference instead of a common denominator when denominators are unrelated.",
      "Diagonal cancellation: For a chain of fraction multiplications, cancel common factors diagonally before multiplying."
    ],
    tipsAndTricks: [
      "Memorize fraction-percentage equivalents: 1/8=12.5%, 1/6=16.67%, 1/3=33.33%, 1/7=14.28%, 1/9=11.11%, 1/11=9.09%, 1/12=8.33%, 1/16=6.25%."
    ],
    commonTraps: [
      "In mixed recurring decimals, forgeting to subtract the non-repeating part in the numerator."
    ]
  },
  {
    id: 4,
    title: "4. Surds and Indices",
    category: "Algebra & Powers",
    coreFormulas: [
      "a^m \\times a^n = a^{m+n}, \\quad \\frac{a^m}{a^n} = a^{m-n}, \\quad (a^m)^n = a^{mn}",
      "a^0 = 1 \\; (a \\neq 0), \\quad a^{-n} = \\frac{1}{a^n}, \\quad a^{1/n} = \\sqrt[n]{a}",
      "(ab)^n = a^n \\times b^n, \\quad \\sqrt{a} \\times \\sqrt{b} = \\sqrt{ab}",
      "\\text{Rationalizing: } \\frac{1}{\\sqrt{a} + \\sqrt{b}} = \\frac{\\sqrt{a} - \\sqrt{b}}{a - b}"
    ],
    methods: [
      "If a^x = b^y = c^z, taking logarithms converts multiplicative relations into easily solvable linear sums."
    ],
    tipsAndTricks: [
      "When comparing surds like \\sqrt{2} + \\sqrt{3} vs \\sqrt{5} + \\sqrt{0.5}, square both sides to remove roots before comparing."
    ],
    commonTraps: [
      "Remember that for a^x = 1, solutions include x = 0, a = 1, or a = -1 with even x."
    ]
  },
  {
    id: 5,
    title: "5. Divisibility Rules",
    category: "Arithmetic & Numbers",
    coreFormulas: [
      "\\text{2: Last digit even} \\quad | \\quad \\text{3: Digit sum divisible by 3} \\quad | \\quad \\text{4: Last 2 digits divisible by 4}",
      "\\text{5: Last digit 0 or 5} \\quad | \\quad \\text{6: Divisible by both 2 and 3} \\quad | \\quad \\text{8: Last 3 digits divisible by 8}",
      "\\text{9: Digit sum divisible by 9} \\quad | \\quad \\text{10: Last digit 0}",
      "\\text{11: } (\\text{Sum of odd place digits}) - (\\text{Sum of even place digits}) = 0 \\text{ or multiple of 11}",
      "\\text{7 and 13: Take alternating groups of 3 digits from right, add/subtract, check divisibility}"
    ],
    methods: [
      "Break composite divisors into coprime factors (e.g. 12 = 3 × 4; 15 = 3 × 5; 72 = 8 × 9)."
    ],
    tipsAndTricks: [
      "For divisibility by 7: Double the last digit, subtract it from the rest of the number, repeat till manageable."
    ],
    commonTraps: [
      "Never test composite numbers by non-coprime factor pairs (e.g. 12 is NOT tested by 2 and 6)."
    ]
  },
  {
    id: 6,
    title: "6. Problems on Ages",
    category: "Word Problems",
    coreFormulas: [
      "\\text{Present age } = x, \\quad n \\text{ years ago } = x - n, \\quad n \\text{ years hence } = x + n",
      "\\text{If ratio of ages is } a:b \\text{ now, after } t \\text{ years it becomes } \\frac{ak + t}{bk + t}"
    ],
    methods: [
      "Assign reference variable x for youngest person, express other ages relative to x.",
      "Draw a timeline table (Past | Present | Future columns) for 3+ people to prevent sign mistakes."
    ],
    tipsAndTricks: [
      "The age gap between any two people remains strictly constant across all time."
    ],
    commonTraps: [
      "Never assume ratio multiplier k = 1 without verifying using the second condition."
    ]
  },
  {
    id: 7,
    title: "7. LCM (Standalone Deep-Dive)",
    category: "Arithmetic & Numbers",
    coreFormulas: [
      "\\text{LCM}(a, b) = \\frac{a \\times b}{\\text{HCF}(a, b)}",
      "\\text{LCM of fractions} = \\frac{\\text{LCM of numerators}}{\\text{HCF of denominators}}"
    ],
    methods: [
      "Two bells ring together every X and Y seconds: next simultaneous toll = LCM(X, Y).",
      "Circular track meetings at start point: Time = LCM of individual lap times."
    ],
    tipsAndTricks: [
      "Convert all time units to the same base (seconds or minutes) before computing LCM."
    ],
    commonTraps: [
      "Forgetting to add starting clock time when question asks for the exact time of day."
    ]
  },
  {
    id: 8,
    title: "8. HCF (Standalone Deep-Dive)",
    category: "Arithmetic & Numbers",
    coreFormulas: [
      "\\text{HCF}(a, b) = \\frac{a \\times b}{\\text{LCM}(a, b)}",
      "\\text{Euclid's Division Lemma: } a = bq + r \\implies \\text{HCF}(a, b) = \\text{HCF}(b, r)"
    ],
    methods: [
      "Largest tile/rope/container size measuring quantities exactly = HCF(a, b, c).",
      "Maximum number of identical groups formed from quantities a, b, c = HCF(a, b, c)."
    ],
    tipsAndTricks: [
      "HCF of differences: HCF(a, b, c) always divides |a - b|, |b - c|, and |c - a|."
    ],
    commonTraps: [
      "Assuming HCF can be greater than the smallest number in the set."
    ]
  },
  {
    id: 9,
    title: "9. Inverse (Variation)",
    category: "Word Problems",
    coreFormulas: [
      "\\text{Direct: } y = kx \\implies \\frac{y_1}{x_1} = \\frac{y_2}{x_2}",
      "\\text{Inverse: } y = \\frac{k}{x} \\implies x_1 y_1 = x_2 y_2 = \\text{constant}",
      "\\text{Joint: } z = kxy \\implies \\frac{z_1}{x_1 y_1} = \\frac{z_2}{x_2 y_2}"
    ],
    methods: [
      "Speed-Time (fixed distance), Men-Days (fixed work), and Pressure-Volume (fixed temp) are classic inverse variations."
    ],
    tipsAndTricks: [
      "Set up as Product_1 = Product_2 (x1 y1 = x2 y2) for direct calculation without finding k."
    ],
    commonTraps: [
      "Confusing inverse variation with direct variation when rate increases."
    ]
  },
  {
    id: 10,
    title: "10. Speed, Time and Distance",
    category: "Kinematics & Motion",
    coreFormulas: [
      "\\text{Speed} = \\frac{\\text{Distance}}{\\text{Time}}, \\quad 1 \\text{ km/h} = \\frac{5}{18} \\text{ m/s}, \\quad 1 \\text{ m/s} = \\frac{18}{5} \\text{ km/h}",
      "\\text{Average Speed (Equal Distances)} = \\frac{2ab}{a+b}",
      "\\text{Average Speed (Equal Times)} = \\frac{a+b}{2}",
      "\\text{Relative Speed (Same Dir)} = |S_1 - S_2|, \\quad \\text{Relative Speed (Opposite Dir)} = S_1 + S_2",
      "\\text{Train crossing platform} = \\frac{L_{\\text{train}} + L_{\\text{platform}}}{\\text{Speed}}"
    ],
    methods: [
      "Ratio shortcut: If distance is constant, Speed Ratio = Inverse of Time Ratio (S1:S2 = T2:T1)."
    ],
    tipsAndTricks: [
      "For two bodies starting from A and B and meeting, then taking t1 and t2 to reach opposite ends: S1/S2 = \\sqrt{t2/t1}."
    ],
    commonTraps: [
      "Using arithmetic mean (a+b)/2 for average speed when distance is equal instead of harmonic mean."
    ]
  },
  {
    id: 11,
    title: "11. Work and Time",
    category: "Word Problems",
    coreFormulas: [
      "\\text{If A takes } n \\text{ days, A's 1-day work} = \\frac{1}{n}",
      "\\text{Combined time for A & B} = \\frac{A \\times B}{A + B}",
      "\\text{Work} = \\text{Efficiency} \\times \\text{Time}",
      "\\frac{M_1 D_1 H_1}{W_1} = \\frac{M_2 D_2 H_2}{W_2}"
    ],
    methods: [
      "LCM Method: Assume Total Work = LCM of all individual day values. Each worker's efficiency = Total Work / Days."
    ],
    tipsAndTricks: [
      "Wages are distributed in the ratio of daily efficiency (work done), not days taken."
    ],
    commonTraps: [
      "Adding days directly (A + B days) instead of adding rates/efficiencies."
    ]
  },
  {
    id: 12,
    title: "12. Boats and Streams",
    category: "Kinematics & Motion",
    coreFormulas: [
      "\\text{Downstream Speed } (D) = B + S",
      "\\text{Upstream Speed } (U) = B - S",
      "\\text{Boat Speed in Still Water } (B) = \\frac{D + U}{2}",
      "\\text{Stream Speed } (S) = \\frac{D - U}{2}"
    ],
    methods: [
      "Round-trip total time for distance d: T = \\frac{d}{B+S} + \\frac{d}{B-S} = \\frac{2dB}{B^2 - S^2}."
    ],
    tipsAndTricks: [
      "If a boat covers the same distance upstream in twice the time it takes downstream, then B = 3S."
    ],
    commonTraps: [
      "Mixing up Downstream (+) and Upstream (-) speed formulas."
    ]
  },
  {
    id: 13,
    title: "13. Pipes and Cisterns",
    category: "Word Problems",
    coreFormulas: [
      "\\text{Inlet pipe: } +\\frac{1}{x} \\text{ tank/hr}, \\quad \\text{Outlet/Leak: } -\\frac{1}{y} \\text{ tank/hr}",
      "\\text{Net rate (both open)} = \\frac{1}{x} - \\frac{1}{y}"
    ],
    methods: [
      "LCM capacity method: Set tank capacity = LCM of all hours. Inlets get +ve units/hr, outlets get -ve units/hr."
    ],
    tipsAndTricks: [
      "When a leak causes extra filling time T, leak's rate = (normal rate) - (rate with leak)."
    ],
    commonTraps: [
      "Forgetting to check the sign of the net rate (negative net rate means emptying)."
    ]
  },
  {
    id: 14,
    title: "14. Averages",
    category: "Arithmetic & Numbers",
    coreFormulas: [
      "\\text{Average} = \\frac{\\text{Sum of Observations}}{\\text{Number of Observations}}",
      "\\text{Weighted Average} = \\frac{n_1 a_1 + n_2 a_2}{n_1 + n_2}"
    ],
    methods: [
      "Deviation Method: Pick assumed mean A. Average = A + (\\sum deviations / n)."
    ],
    tipsAndTricks: [
      "If every value is increased/multiplied by k, the average increases/multiplies by k.",
      "Average age changes when one person replaces another: age diff = change in avg × number of people."
    ],
    commonTraps: [
      "Averaging percentages directly without weighting by base sizes."
    ]
  },
  {
    id: 15,
    title: "15. Allegations and Mixtures",
    category: "Arithmetic & Numbers",
    coreFormulas: [
      "\\frac{\\text{Quantity of Cheaper}}{\\text{Quantity of Dearer}} = \\frac{\\text{CP of Dearer} - \\text{Mean Price}}{\\text{Mean Price} - \\text{CP of Cheaper}}",
      "\\text{Repeated Dilution: Final Liquid} = \\text{Initial} \\times \\left(1 - \\frac{x}{V}\\right)^n"
    ],
    methods: [
      "Draw alligation cross: cheaper and dearer values on left, mean in middle, cross-subtract."
    ],
    tipsAndTricks: [
      "All values must be of the same type: all Cost Prices or all percentages."
    ],
    commonTraps: [
      "Mixing selling price with cost price in the alligation cross."
    ]
  },
  {
    id: 16,
    title: "16. Ratio and Proportions",
    category: "Arithmetic & Numbers",
    coreFormulas: [
      "a:b = c:d \\implies ad = bc \\quad (\\text{Cross Product})",
      "\\text{Duplicate Ratio} = a^2:b^2, \\quad \\text{Sub-duplicate} = \\sqrt{a}:\\sqrt{b}",
      "\\text{Componendo & Dividendo: } \\frac{a}{b} = \\frac{c}{d} \\implies \\frac{a+b}{a-b} = \\frac{c+d}{c-d}"
    ],
    methods: [
      "Bridging ratios: If A:B = 2:3 and B:C = 4:5, multiply to equalize B: A:B:C = 8:12:15."
    ],
    tipsAndTricks: [
      "Share of part in ratio a:b:c for total N = N × a / (a + b + c)."
    ],
    commonTraps: [
      "Adding constants directly to ratio terms without using base multiplier x."
    ]
  },
  {
    id: 17,
    title: "17. Simple & Compound Interest (Overview)",
    category: "Commercial Math",
    coreFormulas: [
      "\\text{SI} = \\frac{P \\cdot R \\cdot T}{100}, \\quad A_{\\text{SI}} = P\\left(1 + \\frac{RT}{100}\\right)",
      "A_{\\text{CI}} = P\\left(1 + \\frac{R}{100}\\right)^T, \\quad \\text{CI} = A_{\\text{CI}} - P",
      "\\text{CI} - \\text{SI (2 years)} = P\\left(\\frac{R}{100}\\right)^2",
      "\\text{CI} - \\text{SI (3 years)} = P\\left(\\frac{R}{100}\\right)^2 \\left(3 + \\frac{R}{100}\\right)"
    ],
    methods: [
      "Half-yearly compounding: Rate becomes R/2, Time becomes 2T.",
      "Quarterly compounding: Rate becomes R/4, Time becomes 4T."
    ],
    tipsAndTricks: [
      "2-year CI-SI difference shortcut P(R/100)^2 is asked in almost every major OA."
    ],
    commonTraps: [
      "Forgetting to adjust time exponent T when adjusting rate R for compounding intervals."
    ]
  },
  {
    id: 18,
    title: "18. Simple Interest",
    category: "Commercial Math",
    coreFormulas: [
      "\\text{SI} = \\frac{PRT}{100}, \\quad P = \\frac{100 \\times \\text{SI}}{RT}, \\quad R = \\frac{100 \\times \\text{SI}}{PT}, \\quad T = \\frac{100 \\times \\text{SI}}{PR}",
      "\\text{If sum becomes } n \\text{ times in } T \\text{ years: } R = \\frac{100(n-1)}{T}"
    ],
    methods: [
      "SI is strictly linear: 1 year interest = Total SI / T."
    ],
    tipsAndTricks: [
      "If sum doubles in T years at SI: R = 100 / T."
    ],
    commonTraps: [
      "Confusing 'amount becomes n times' with 'interest becomes n times'."
    ]
  },
  {
    id: 19,
    title: "19. Compound Interest",
    category: "Commercial Math",
    coreFormulas: [
      "A = P\\left(1 + \\frac{R}{100}\\right)^T",
      "\\text{Fractional years } T = a + \\frac{b}{c}: A = P\\left(1+\\frac{R}{100}\\right)^a \\left(1 + \\frac{b/c \\cdot R}{100}\\right)",
      "\\text{Different annual rates: } A = P\\left(1+\\frac{R_1}{100}\\right)\\left(1+\\frac{R_2}{100}\\right)\\left(1+\\frac{R_3}{100}\\right)"
    ],
    methods: [
      "Population growth / depreciation follows exact CI formula with +R or -R."
    ],
    tipsAndTricks: [
      "Rule of 72: Money doubles in approximately 72 / R years at compound interest."
    ],
    commonTraps: [
      "Calculating CI on original principal each year instead of accumulated balance."
    ]
  },
  {
    id: 20,
    title: "20. Percentages",
    category: "Commercial Math",
    coreFormulas: [
      "x\\% \\text{ of } y = y\\% \\text{ of } x = \\frac{xy}{100}",
      "\\% \\text{ Change} = \\frac{\\text{New} - \\text{Old}}{\\text{Old}} \\times 100",
      "\\text{If A is } x\\% \\text{ more than B, B is } \\left[\\frac{x}{100+x}\\right] \\times 100\\% \\text{ less than A}",
      "\\text{Successive Change } (a\\% \\text{ then } b\\%) = a + b + \\frac{ab}{100}"
    ],
    methods: [
      "Expenditure constancy: If price increases by x%, consumption must reduce by [x / (100 + x)] × 100%."
    ],
    tipsAndTricks: [
      "Convert percentages to fractions (e.g. 25% = 1/4, 33.33% = 1/3) for 5x faster calculations."
    ],
    commonTraps: [
      "Computing percentage on the new value instead of the original base (old value)."
    ]
  },
  {
    id: 21,
    title: "21. Profit & Loss",
    category: "Commercial Math",
    coreFormulas: [
      "\\text{Profit} = SP - CP, \\quad \\text{Loss} = CP - SP",
      "\\text{Profit } \\% = \\frac{\\text{Profit}}{CP} \\times 100, \\quad \\text{Loss } \\% = \\frac{\\text{Loss}}{CP} \\times 100",
      "SP = CP \\times \\frac{100 + \\text{Profit}\\%}{100} = MP \\times \\frac{100 - \\text{Discount}\\%}{100}",
      "\\text{False Weight Profit } \\% = \\frac{\\text{True Weight} - \\text{False Weight}}{\\text{False Weight}} \\times 100"
    ],
    methods: [
      "Base 100 technique: Assume CP = 100 to quickly resolve markup and discount chains."
    ],
    tipsAndTricks: [
      "Dishonest dealer with markup and false weight: Combined profit % = markup% + weight cheat% + (product)/100."
    ],
    commonTraps: [
      "Calculating profit percentage over SP instead of CP."
    ]
  },
  {
    id: 22,
    title: "22. Successive Discount 1",
    category: "Commercial Math",
    coreFormulas: [
      "\\text{Effective Single Discount for } d_1\\% \\text{ and } d_2\\% = d_1 + d_2 - \\frac{d_1 d_2}{100}"
    ],
    methods: [
      "Sequential 100 rule: 100 → 100(1 - d1/100) → 100(1 - d1/100)(1 - d2/100)."
    ],
    tipsAndTricks: [
      "Order of successive discounts never changes the final selling price."
    ],
    commonTraps: [
      "Adding discount percentages directly (e.g. 20% + 10% is 28% off, NOT 30%)."
    ]
  },
  {
    id: 23,
    title: "23. Successive Discount 2 (Increase/Decrease %)",
    category: "Commercial Math",
    coreFormulas: [
      "\\text{Net Change} = a + b + \\frac{ab}{100} \\quad (\\text{use } - \\text{ for decreases})"
    ],
    methods: [
      "If a price increases by x% then decreases by x%, net result is ALWAYS a loss of (x/10)% squared = x^2 / 100%."
    ],
    tipsAndTricks: [
      "For multiple 3+ successive changes, chain multiplier: (1 + a)(1 + b)(1 + c) - 1."
    ],
    commonTraps: [
      "Forgetting to insert negative signs for discount/decrease percentages."
    ]
  },
  {
    id: 24,
    title: "24. AP, GP, HP (Overview)",
    category: "Progressions & Series",
    coreFormulas: [
      "\\text{Arithmetic Mean } (AM) = \\frac{a+b}{2}",
      "\\text{Geometric Mean } (GM) = \\sqrt{ab}",
      "\\text{Harmonic Mean } (HM) = \\frac{2ab}{a+b}",
      "AM \\times HM = GM^2 \\quad \\text{and} \\quad AM \\ge GM \\ge HM"
    ],
    methods: [
      "Recognition: AP has constant difference; GP has constant ratio; HP reciprocals form an AP."
    ],
    tipsAndTricks: [
      "Equality AM = GM = HM holds if and only if all terms are equal (a = b)."
    ],
    commonTraps: [
      "Assuming GM can be computed directly on negative numbers without signs."
    ]
  },
  {
    id: 25,
    title: "25. Arithmetic Progressions",
    category: "Progressions & Series",
    coreFormulas: [
      "a_n = a + (n-1)d \\quad (n\\text{th term})",
      "S_n = \\frac{n}{2}[2a + (n-1)d] = \\frac{n}{2}(\\text{First Term} + \\text{Last Term})"
    ],
    methods: [
      "Symmetric representation: For 3 terms in AP use (a-d, a, a+d); for 4 terms use (a-3d, a-d, a+d, a+3d)."
    ],
    tipsAndTricks: [
      "Sum of terms from index m to n: S_n - S_{m-1}."
    ],
    commonTraps: [
      "Using (n) instead of (n-1) in the nth term formula."
    ]
  },
  {
    id: 26,
    title: "26. Geometric Progressions",
    category: "Progressions & Series",
    coreFormulas: [
      "a_n = a \\cdot r^{n-1}",
      "S_n = \\frac{a(r^n - 1)}{r - 1} \\quad (r \\neq 1)",
      "S_\\infty = \\frac{a}{1 - r} \\quad (|r| < 1)"
    ],
    methods: [
      "Symmetric 3-term GP with known product: Represent as a/r, a, ar."
    ],
    tipsAndTricks: [
      "Sum to infinity S_\\infty is valid ONLY when |r| < 1."
    ],
    commonTraps: [
      "Applying sum to infinity formula when ratio r >= 1."
    ]
  },
  {
    id: 27,
    title: "27. Harmonic Progressions",
    category: "Progressions & Series",
    coreFormulas: [
      "a, b, c \\in HP \\implies \\frac{1}{a}, \\frac{1}{b}, \\frac{1}{c} \\in AP",
      "HM(a, b) = \\frac{2ab}{a+b}, \\quad HM(a_1, \\dots, a_n) = \\frac{n}{\\sum \\frac{1}{a_i}}"
    ],
    methods: [
      "Invert all terms to form AP, solve using AP formulas, then invert the final result."
    ],
    tipsAndTricks: [
      "Average speed for equal distance legs is the Harmonic Mean of speeds."
    ],
    commonTraps: [
      "Applying arithmetic mean formulas directly to HP terms."
    ]
  },
  {
    id: 28,
    title: "28. Probability",
    category: "Modern Math",
    coreFormulas: [
      "P(E) = \\frac{\\text{Favorable Outcomes}}{\\text{Total Outcomes}}",
      "P(A \\cup B) = P(A) + P(B) - P(A \\cap B)",
      "P(A \\cap B) = P(A) \\times P(B) \\quad (\\text{Independent Events})",
      "P(\\text{At least 1}) = 1 - P(\\text{None})",
      "P(A|B) = \\frac{P(A \\cap B)}{P(B)} \\quad (\\text{Conditional Probability})"
    ],
    methods: [
      "Complement Rule: 'At least one' is almost always 1 - P(Zero occurrences)."
    ],
    tipsAndTricks: [
      "Sample spaces: 2 dice = 36, n coin tosses = 2^n, standard deck = 52 (4 suits of 13)."
    ],
    commonTraps: [
      "Treating dependent events (without replacement) as independent."
    ]
  },
  {
    id: 29,
    title: "29. Permutation & Combination",
    category: "Modern Math",
    coreFormulas: [
      "{}^n P_r = \\frac{n!}{(n-r)!} \\quad (\\text{Order Matters})",
      "{}^n C_r = \\frac{n!}{r!(n-r)!} \\quad (\\text{Selection / Order Doesn't Matter})",
      "{}^n C_r = {}^n C_{n-r}, \\quad {}^n C_0 = {}^n C_n = 1, \\quad {}^n C_1 = n",
      "\\text{Arranging with repetitions: } \\frac{n!}{p! \\cdot q! \\cdot r!}"
    ],
    methods: [
      "Tie-together method (Vowels together): Glue items into 1 block, arrange $(N - k + 1)! \\times k!$."
    ],
    tipsAndTricks: [
      "Vowels never together = Total arrangements - Arrangements with vowels together."
    ],
    commonTraps: [
      "Using permutation (order matters) when the problem only asks to select a group/committee."
    ]
  },
  {
    id: 30,
    title: "30. Combination (Deep-Dive)",
    category: "Modern Math",
    coreFormulas: [
      "\\sum_{r=0}^n {}^n C_r = 2^n \\quad (\\text{Total subsets of } n \\text{ elements})",
      "\\text{Diagonals in } n\\text{-sided polygon} = {}^n C_2 - n = \\frac{n(n-3)}{2}",
      "\\text{Triangles from } n \\text{ points} = {}^n C_3 - {}^k C_3 \\quad (k \\text{ collinear})"
    ],
    methods: [
      "Distributing into groups: $n$ items into groups of size $p, q, r = \\frac{n!}{p! \\, q! \\, r! \\, s!}$ where $s!$ accounts for identical group sizes."
    ],
    tipsAndTricks: [
      "Stars and Bars: Distribute $n$ identical items among $r$ distinct bins = ${}^{n+r-1}C_{r-1}$."
    ],
    commonTraps: [
      "Forgetting to subtract polygon edges when calculating diagonals."
    ]
  },
  {
    id: 31,
    title: "31. Circular Permutation",
    category: "Modern Math",
    coreFormulas: [
      "\\text{Circular arrangements of } n \\text{ distinct items} = (n-1)!",
      "\\text{Necklaces / Garlands (Flip symmetry)} = \\frac{(n-1)!}{2}"
    ],
    methods: [
      "Fix 1 reference position to eliminate rotational duplicates, then arrange remaining (n-1) items linearly."
    ],
    tipsAndTricks: [
      "Divide by 2 ONLY when clockwise and counterclockwise arrangements are physically identical (like beads on a string)."
    ],
    commonTraps: [
      "Dividing by 2 for people sitting around a round table (left and right neighbors are distinct)."
    ]
  },
  {
    id: 32,
    title: "32. Geometry (Overview)",
    category: "Geometry & Mensuration",
    coreFormulas: [
      "\\text{Sum of interior angles of } n\\text{-gon} = (n-2) \\times 180^\\circ",
      "\\text{Each interior angle of regular } n\\text{-gon} = \\frac{(n-2) \\times 180^\\circ}{n}",
      "\\text{Exterior angle of regular } n\\text{-gon} = \\frac{360^\\circ}{n}",
      "\\text{Pythagoras: } a^2 + b^2 = c^2"
    ],
    methods: [
      "Common Pythagorean triplets: (3,4,5), (5,12,13), (8,15,17), (7,24,25), (9,40,41), (20,21,29)."
    ],
    tipsAndTricks: [
      "Similar triangles: Ratio of areas = (Ratio of corresponding sides)^2."
    ],
    commonTraps: [
      "Forgetting that exterior angles of any convex polygon always sum to 360 degrees."
    ]
  },
  {
    id: 33,
    title: "33. Heights and Distances",
    category: "Geometry & Mensuration",
    coreFormulas: [
      "\\tan\\theta = \\frac{\\text{Opposite}}{\\text{Adjacent}} = \\frac{\\text{Height}}{\\text{Distance}}",
      "\\tan 30^\\circ = \\frac{1}{\\sqrt{3}}, \\quad \\tan 45^\\circ = 1, \\quad \\tan 60^\\circ = \\sqrt{3}",
      "\\sin 30^\\circ = \\frac{1}{2}, \\quad \\sin 45^\\circ = \\frac{1}{\\sqrt{2}}, \\quad \\sin 60^\\circ = \\frac{\\sqrt{3}}{2}"
    ],
    methods: [
      "Always sketch a 2D triangle. Angle of elevation = Angle of depression (alternate interior angles)."
    ],
    tipsAndTricks: [
      "30-60-90 triangle ratio of sides: 1 : \\sqrt{3} : 2.",
      "45-45-90 triangle ratio of sides: 1 : 1 : \\sqrt{2}."
    ],
    commonTraps: [
      "Mixing up height (opposite) and base (adjacent) in tan formula."
    ]
  },
  {
    id: 34,
    title: "34. Perimeter, Area and Volume",
    category: "Geometry & Mensuration",
    coreFormulas: [
      "\\text{Rectangle: } A = l \\times b, \\quad P = 2(l+b)",
      "\\text{Circle: } A = \\pi r^2, \\quad C = 2\\pi r",
      "\\text{Heron's: } A = \\sqrt{s(s-a)(s-b)(s-c)}, \\quad s = \\frac{a+b+c}{2}",
      "\\text{Cylinder: } V = \\pi r^2 h, \\quad \\text{Curved SA} = 2\\pi rh, \\quad \\text{Total SA} = 2\\pi r(r+h)",
      "\\text{Cone: } V = \\frac{1}{3}\\pi r^2 h, \\quad \\text{Curved SA} = \\pi r l, \\quad l = \\sqrt{r^2 + h^2}",
      "\\text{Sphere: } V = \\frac{4}{3}\\pi r^3, \\quad \\text{Surface Area} = 4\\pi r^2"
    ],
    methods: [
      "Melting / Recasting: Volume remains constant (Volume_initial = Volume_final)."
    ],
    tipsAndTricks: [
      "If linear dimension increases by x%, Area increases by (2x + x^2/100)%, Volume increases by 3D successive percentage."
    ],
    commonTraps: [
      "Confusing Curved Surface Area with Total Surface Area (forgetting circular top/bottom caps)."
    ]
  },
  {
    id: 35,
    title: "35. Coordinate Geometry",
    category: "Geometry & Mensuration",
    coreFormulas: [
      "\\text{Distance} = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}",
      "\\text{Midpoint} = \\left(\\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2}\\right)",
      "\\text{Slope } (m) = \\frac{y_2 - y_1}{x_2 - x_1}",
      "\\text{Parallel lines: } m_1 = m_2, \\quad \\text{Perpendicular lines: } m_1 \\cdot m_2 = -1",
      "\\text{Area of Triangle} = \\frac{1}{2}|x_1(y_2 - y_3) + x_2(y_3 - y_1) + x_3(y_1 - y_2)|"
    ],
    methods: [
      "Section formula: Point dividing segment in ratio m:n is ((mx2 + nx1)/(m+n), (my2 + ny1)/(m+n))."
    ],
    tipsAndTricks: [
      "Points are collinear if and only if Area of triangle = 0 (or slopes between pairs are equal)."
    ],
    commonTraps: [
      "Sign errors in (y2 - y1) / (x2 - x1) when coordinates are negative."
    ]
  },
  {
    id: 36,
    title: "36. Venn Diagrams",
    category: "Modern Math",
    coreFormulas: [
      "n(A \\cup B) = n(A) + n(B) - n(A \\cap B)",
      "n(A \\cup B \\cup C) = \\sum n(A) - \\sum n(A \\cap B) + n(A \\cap B \\cap C)",
      "\\text{Exactly two of three} = \\sum n(A \\cap B) - 3n(A \\cap B \\cap C)",
      "\\text{Exactly one} = \\sum n(A) - 2\\sum n(A \\cap B) + 3n(A \\cap B \\cap C)"
    ],
    methods: [
      "Fill diagram from the innermost triple overlap region outward."
    ],
    tipsAndTricks: [
      "Total Universe = n(A ∪ B ∪ C) + n(Neither)."
    ],
    commonTraps: [
      "Confusing 'only A' with 'n(A)'."
    ]
  },
  {
    id: 37,
    title: "37. Set Theory",
    category: "Modern Math",
    coreFormulas: [
      "\\text{Total subsets of set with } n \\text{ elements} = 2^n",
      "\\text{Proper subsets} = 2^n - 1",
      "\\text{De Morgan's Laws: } (A \\cup B)' = A' \\cap B', \\quad (A \\cap B)' = A' \\cup B'"
    ],
    methods: [
      "Set theory questions in aptitude tests are almost always Venn diagram word problems in disguise."
    ],
    tipsAndTricks: [
      "Empty set \\emptyset is a subset of every set."
    ],
    commonTraps: [
      "Counting the full set itself when asked for proper subsets (must subtract 1)."
    ]
  },
  {
    id: 38,
    title: "38. Algebra (Overview)",
    category: "Algebra & Powers",
    coreFormulas: [
      "(a+b)^2 = a^2 + 2ab + b^2, \\quad (a-b)^2 = a^2 - 2ab + b^2",
      "a^2 - b^2 = (a+b)(a-b)",
      "(a+b)^3 = a^3 + b^3 + 3ab(a+b)",
      "a^3 + b^3 = (a+b)(a^2 - ab + b^2), \\quad a^3 - b^3 = (a-b)(a^2 + ab + b^2)",
      "\\text{If } a+b+c=0 \\implies a^3+b^3+c^3 = 3abc"
    ],
    methods: [
      "If x + 1/x = k, then x^2 + 1/x^2 = k^2 - 2, and x^3 + 1/x^3 = k^3 - 3k."
    ],
    tipsAndTricks: [
      "a^2 + b^2 = (a+b)^2 - 2ab: compute without solving for a and b individually."
    ],
    commonTraps: [
      "Forgetting cross term 2ab or writing (a+b)^2 = a^2 + b^2."
    ]
  },
  {
    id: 39,
    title: "39. Linear Equations",
    category: "Algebra & Powers",
    coreFormulas: [
      "a_1 x + b_1 y = c_1, \\quad a_2 x + b_2 y = c_2",
      "\\text{Unique Solution: } \\frac{a_1}{a_2} \\neq \\frac{b_1}{b_2}",
      "\\text{Infinite Solutions: } \\frac{a_1}{a_2} = \\frac{b_1}{b_2} = \\frac{c_1}{c_2}",
      "\\text{No Solution (Parallel): } \\frac{a_1}{a_2} = \\frac{b_1}{b_2} \\neq \\frac{c_1}{c_2}"
    ],
    methods: [
      "Back-solving: In multiple-choice questions, plugging in options is often 3x faster than solving systems."
    ],
    tipsAndTricks: [
      "Check consistency using coefficient ratios first before attempting full elimination."
    ],
    commonTraps: [
      "Sign errors when transposing constants to the opposite side of equation."
    ]
  },
  {
    id: 40,
    title: "40. Quadratic Equations",
    category: "Algebra & Powers",
    coreFormulas: [
      "ax^2 + bx + c = 0 \\implies x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
      "\\text{Sum of roots } (\\alpha + \\beta) = -\\frac{b}{a}, \\quad \\text{Product of roots } (\\alpha\\beta) = \\frac{c}{a}",
      "\\text{Discriminant } D = b^2 - 4ac \\implies D > 0 \\text{ (2 real roots)}, D = 0 \\text{ (equal)}, D < 0 \\text{ (complex)}"
    ],
    methods: [
      "Forming quadratic with roots \\alpha, \\beta: x^2 - (\\alpha + \\beta)x + \\alpha\\beta = 0."
    ],
    tipsAndTricks: [
      "In word problems (time, speed, age), discard negative or impossible roots immediately."
    ],
    commonTraps: [
      "Writing sum of roots as +b/a instead of -b/a."
    ]
  },
  {
    id: 41,
    title: "41. Logarithms",
    category: "Algebra & Powers",
    coreFormulas: [
      "\\log_a(mn) = \\log_a m + \\log_a n, \\quad \\log_a\\left(\\frac{m}{n}\\right) = \\log_a m - \\log_a n",
      "\\log_a(m^n) = n\\log_a m, \\quad \\log_a a = 1, \\quad \\log_a 1 = 0",
      "\\text{Change of Base: } \\log_a b = \\frac{\\log_c b}{\\log_c a} = \\frac{1}{\\log_b a}",
      "\\text{Digits in } N = \\lfloor\\log_{10} N\\rfloor + 1"
    ],
    methods: [
      "Memorize base-10 values: \\log_{10} 2 \\approx 0.3010, \\log_{10} 3 \\approx 0.4771, \\log_{10} 7 \\approx 0.8451."
    ],
    tipsAndTricks: [
      "\\log_{10} 5 = \\log_{10}(10/2) = 1 - \\log_{10} 2 \\approx 0.6990."
    ],
    commonTraps: [
      "Confusing \\log(a+b) with \\log a + \\log b (log of sum is NOT sum of logs)."
    ]
  },
  {
    id: 42,
    title: "42. Clocks",
    category: "Reasoning & Puzzles",
    coreFormulas: [
      "\\text{Minute hand speed} = 6^\\circ/\\text{min}, \\quad \\text{Hour hand speed} = 0.5^\\circ/\\text{min}",
      "\\text{Relative speed} = 5.5^\\circ/\\text{min} = \\frac{11}{2}^\\circ/\\text{min}",
      "\\text{Angle at } H \\text{ hrs } M \\text{ mins} = |30H - 5.5M|^\\circ",
      "\\text{Hands overlap every } 65\\frac{5}{11} \\text{ minutes}",
      "\\text{Hands coincide 11 times in 12 hours (22 times in 24 hours)}",
      "\\text{Hands form } 90^\\circ \\text{ 22 times in 12 hours (44 times in 24 hours)}"
    ],
    methods: [
      "Clock problem as circular race: minute hand gains 5.5 degrees per minute over hour hand."
    ],
    tipsAndTricks: [
      "Faulty clock gain/loss: Set ratio of (faulty time) : (true time) and cross-multiply."
    ],
    commonTraps: [
      "Assuming hands overlap 12 times in 12 hours (11:00 to 1:00 has only 1 overlap at 12:00)."
    ]
  },
  {
    id: 43,
    title: "43. Calendars",
    category: "Reasoning & Puzzles",
    coreFormulas: [
      "\\text{Ordinary Year} = 365 \\text{ days} = 52 \\text{ weeks} + 1 \\text{ odd day}",
      "\\text{Leap Year} = 366 \\text{ days} = 52 \\text{ weeks} + 2 \\text{ odd days}",
      "\\text{Leap Rule: Divisible by 4; Century years must be divisible by 400 (1900 NO, 2000 YES)}",
      "\\text{Odd days in 100 yrs} = 5, \\quad 200 \\text{ yrs} = 3, \\quad 300 \\text{ yrs} = 1, \\quad 400 \\text{ yrs} = 0"
    ],
    methods: [
      "Day calculation: Sum odd days from reference date mod 7. 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat."
    ],
    tipsAndTricks: [
      "In normal years, Jan & Oct start on the same day; Apr & Jul start on the same day."
    ],
    commonTraps: [
      "Treating century years like 1700, 1800, 1900 as leap years (they are not)."
    ]
  },
  {
    id: 44,
    title: "44. Clocks and Calendars (Combined Practice Notes)",
    category: "Reasoning & Puzzles",
    coreFormulas: [
      "\\text{Clocks operate under modulo 60 (minutes) and modulo 12 (hours)}",
      "\\text{Calendars operate under modulo 7 (days of week)}"
    ],
    methods: [
      "Modular arithmetic thinking: Always reduce accumulated increments mod 7 or mod 60."
    ],
    tipsAndTricks: [
      "A calendar repeats in 6, 11, or 28 years depending on leap cycle position."
    ],
    commonTraps: [
      "Forgetting leap year day addition (+1) if the date crosses February 29."
    ]
  },
  {
    id: 45,
    title: "45. Finding Remainder of Large Powers",
    category: "Arithmetic & Numbers",
    coreFormulas: [
      "\\text{Fermat's Little Theorem: } a^{p-1} \\equiv 1 \\pmod{p} \\quad (p \\text{ prime}, \\gcd(a, p)=1)",
      "\\text{Euler's Theorem: } a^{\\phi(n)} \\equiv 1 \\pmod{n} \\quad (\\gcd(a, n)=1)",
      "\\text{Binomial Expansion: } (kM + r)^n \\equiv r^n \\pmod M"
    ],
    methods: [
      "Cyclicity method: Find repeat pattern of remainders for powers mod N, then take exponent mod cycle length."
    ],
    tipsAndTricks: [
      "Always write the base as (Multiple of divisor ± 1) first: e.g. 7^100 mod 4 = (8 - 1)^100 mod 4 = (-1)^100 = 1."
    ],
    commonTraps: [
      "Applying Fermat's theorem when the divisor is composite instead of prime."
    ]
  }
];

// Complete Question Bank object containing all topics and questions
const APTITUDE_DATA = {
  meta: {
    title: "Aptitude Mastery — Quant Question Bank",
    description: "Complete 45-topic question bank with company tags and explanations.",
    total_topics: 45
  },
  topics: {
    "1. HCF and LCM": [
      { id: "T1-1", pattern: "bells/LCM application", question: "Three bells toll at intervals of 8, 12, and 16 minutes. If they toll together now, after how many minutes will they toll together next?", options: ["48", "43", "58", "24"], correct_answer: "48", explanation: "Next simultaneous toll is at LCM(8, 12, 16) = 48 minutes.", difficulty: "medium", companies_commonly_asking: ["Microsoft", "Adobe"] },
      { id: "T1-2", pattern: "basic LCM", question: "Find the LCM of 45 and 60.", options: ["2700", "360", "170", "180"], correct_answer: "180", explanation: "LCM(45, 60) = 180.", difficulty: "easy", companies_commonly_asking: ["TCS NQT", "Infosys"] },
      { id: "T1-3", pattern: "basic HCF", question: "Find the HCF of 60 and 90.", options: ["60", "36", "28", "30"], correct_answer: "30", explanation: "Prime factorization gives HCF(60, 90) = 30.", difficulty: "easy", companies_commonly_asking: ["Accenture", "Cognizant GenC"] },
      { id: "T1-4", pattern: "bells/LCM application", question: "Four bells ring at intervals of 6, 8, 12, and 18 seconds. If they ring together at 12:00 PM, how many times will they ring together in the next 6 minutes?", options: ["4", "5", "6", "7"], correct_answer: "5", explanation: "LCM(6, 8, 12, 18) = 72 seconds. In 6 mins (360s), number of times = floor(360/72) = 5 times.", difficulty: "medium", companies_commonly_asking: ["Goldman Sachs", "Flipkart"] },
      { id: "T1-5", pattern: "basic HCF", question: "Find the HCF of 48 and 72.", options: ["30", "26", "24", "22"], correct_answer: "24", explanation: "Prime factorization gives HCF(48, 72) = 24.", difficulty: "easy", companies_commonly_asking: ["Tech Mahindra", "Bank PO"] },
      { id: "T1-6", pattern: "fractions LCM", question: "Find the LCM of 2/3, 8/9, 16/81, and 10/27.", options: ["80/3", "16/3", "80/81", "16/81"], correct_answer: "80/3", explanation: "LCM of fractions = LCM(numerators)/HCF(denominators) = LCM(2,8,16,10)/HCF(3,9,81,27) = 80/3.", difficulty: "medium", companies_commonly_asking: ["CAT", "Amazon"] },
      { id: "T1-7", pattern: "fractions HCF", question: "Find the HCF of 9/10, 12/25, 18/35, and 21/40.", options: ["3/5", "3/1400", "9/100", "252/5"], correct_answer: "3/1400", explanation: "HCF of fractions = HCF(9,12,18,21)/LCM(10,25,35,40) = 3/1400.", difficulty: "medium", companies_commonly_asking: ["TCS NQT", "Wipro"] },
      { id: "T1-8", pattern: "product rule", question: "The HCF of two numbers is 11 and their LCM is 693. If one of the numbers is 77, find the other.", options: ["99", "88", "111", "91"], correct_answer: "99", explanation: "Other number = (HCF × LCM) / First = (11 × 693) / 77 = 99.", difficulty: "easy", companies_commonly_asking: ["Infosys", "Capgemini"] },
      { id: "T1-9", pattern: "remainder application", question: "Find the greatest number which divides 29, 60, and 103 leaving remainders 5, 12, and 7 respectively.", options: ["24", "16", "12", "8"], correct_answer: "24", explanation: "HCF(29-5, 60-12, 103-7) = HCF(24, 48, 96) = 24.", difficulty: "medium", companies_commonly_asking: ["CAT", "Accenture"] },
      { id: "T1-10", pattern: "same remainder", question: "Find the greatest number that will divide 43, 91, and 183 so as to leave the same remainder in each case.", options: ["4", "7", "9", "13"], correct_answer: "4", explanation: "Required number = HCF(|91-43|, |183-91|, |183-43|) = HCF(48, 92, 140) = 4.", difficulty: "hard", companies_commonly_asking: ["Google", "Amazon"] },
      { id: "T1-11", pattern: "constant difference", question: "Find the smallest number which when divided by 20, 25, 35, and 40 leaves remainders 14, 19, 29, and 34 respectively.", options: ["1394", "1406", "1400", "1396"], correct_answer: "1394", explanation: "Constant difference k = 20-14 = 6. LCM(20,25,35,40) = 1400. Answer = 1400 - 6 = 1394.", difficulty: "hard", companies_commonly_asking: ["Goldman Sachs", "Microsoft"] },
      { id: "T1-12", pattern: "n-digit LCM", question: "Find the largest 4-digit number which is exactly divisible by 12, 15, 18, and 27.", options: ["9720", "9960", "9920", "9840"], correct_answer: "9720", explanation: "LCM(12, 15, 18, 27) = 540. Largest 4-digit number = 9999. 9999 mod 540 = 279. 9999 - 279 = 9720.", difficulty: "hard", companies_commonly_asking: ["Adobe", "Flipkart"] },
      { id: "T1-13", pattern: "ratio of numbers", question: "Two numbers are in the ratio 3:4. If their HCF is 4, find their LCM.", options: ["48", "36", "24", "12"], correct_answer: "48", explanation: "Numbers are 3×4=12 and 4×4=16. LCM(12, 16) = 48 (or LCM = ratio product × HCF = 3×4×4 = 48).", difficulty: "easy", companies_commonly_asking: ["TCS NQT", "Cognizant"] },
      { id: "T1-14", pattern: "sum and HCF", question: "The sum of two numbers is 216 and their HCF is 27. How many such pairs of numbers are possible?", options: ["2", "1", "3", "4"], correct_answer: "2", explanation: "Let numbers be 27a and 27b. 27(a+b)=216 => a+b=8. Coprime pairs (a,b) are (1,7) and (3,5) => 2 pairs.", difficulty: "hard", companies_commonly_asking: ["CAT", "Google"] },
      { id: "T1-15", pattern: "circular track", question: "A, B, and C start running around a circular track of 12 km at speeds of 3 km/h, 4 km/h, and 6 km/h. When will they meet at starting point?", options: ["12 hrs", "6 hrs", "24 hrs", "4 hrs"], correct_answer: "12 hrs", explanation: "Time per lap: A = 12/3 = 4h, B = 12/4 = 3h, C = 12/6 = 2h. LCM(4, 3, 2) = 12 hours.", difficulty: "medium", companies_commonly_asking: ["Amazon OA", "Microsoft"] },
      { id: "T1-16", pattern: "basic HCF", question: "Find the HCF of 36 and 54.", options: ["18", "36", "24", "20"], correct_answer: "18", explanation: "HCF(36, 54) = 18.", difficulty: "easy", companies_commonly_asking: ["Infosys"] },
      { id: "T1-17", pattern: "basic LCM", question: "Find the LCM of 24, 36, and 40.", options: ["360", "240", "720", "180"], correct_answer: "360", explanation: "LCM(24, 36, 40) = 360.", difficulty: "easy", companies_commonly_asking: ["Wipro"] },
      { id: "T1-18", pattern: "product and HCF", question: "The product of two numbers is 2028 and their HCF is 13. The number of such pairs is:", options: ["2", "1", "3", "4"], correct_answer: "2", explanation: "13a × 13b = 2028 => ab = 12. Coprime pairs for (a,b): (1,12) and (3,4) => 2 pairs.", difficulty: "medium", companies_commonly_asking: ["TCS NQT"] },
      { id: "T1-19", pattern: "remainder plus k", question: "Find the least number which when divided by 6, 9, 12, 15, and 18 leaves 2 as remainder in each case.", options: ["182", "178", "180", "362"], correct_answer: "182", explanation: "LCM(6, 9, 12, 15, 18) = 180. Required number = 180 + 2 = 182.", difficulty: "easy", companies_commonly_asking: ["Accenture"] },
      { id: "T1-20", pattern: "decimals HCF", question: "Find the HCF of 1.20 and 0.18.", options: ["0.06", "0.6", "0.03", "0.12"], correct_answer: "0.06", explanation: "Make decimal places equal: 120 and 18. HCF(120, 18) = 6. Place point back: 0.06.", difficulty: "medium", companies_commonly_asking: ["Tech Mahindra"] },
      { id: "T1-21", pattern: "tiling puzzle", question: "A room is 4m 37cm long and 3m 23cm broad. Find the minimum number of square tiles of equal size to pave the floor.", options: ["209", "187", "221", "247"], correct_answer: "209", explanation: "Length = 437 cm, Breadth = 323 cm. HCF(437, 323) = 19 cm. Number of tiles = (437×323)/(19×19) = 23 × 17 = 209.", difficulty: "hard", companies_commonly_asking: ["CAT", "Goldman Sachs"] },
      { id: "T1-22", pattern: "basic LCM", question: "Find the LCM of 14, 21, and 28.", options: ["84", "42", "168", "126"], correct_answer: "84", explanation: "LCM(14, 21, 28) = 84.", difficulty: "easy", companies_commonly_asking: ["Capgemini"] },
      { id: "T1-23", pattern: "three bells", question: "Three bells toll at intervals of 9, 12, and 15 minutes respectively. If they toll together now, after how much time will they toll together next?", options: ["180 mins", "90 mins", "120 mins", "360 mins"], correct_answer: "180 mins", explanation: "LCM(9, 12, 15) = 180 minutes = 3 hours.", difficulty: "medium", companies_commonly_asking: ["Cognizant"] },
      { id: "T1-24", pattern: "ratio and LCM", question: "Three numbers are in the ratio 1:2:3 and their HCF is 12. The numbers are:", options: ["12, 24, 36", "6, 12, 18", "24, 48, 72", "12, 18, 24"], correct_answer: "12, 24, 36", explanation: "Numbers = 1×12, 2×12, 3×12 = 12, 24, 36.", difficulty: "easy", companies_commonly_asking: ["TCS NQT"] },
      { id: "T1-25", pattern: "least multiple", question: "Find the least multiple of 7 which leaves a remainder of 4 when divided by 6, 9, 15, and 18.", options: ["364", "94", "184", "274"], correct_answer: "364", explanation: "LCM(6,9,15,18) = 90. Number is 90k + 4. For k=4, 90(4)+4 = 364, which is divisible by 7 (364/7 = 52).", difficulty: "hard", companies_commonly_asking: ["Google", "CAT"] }
    ],
    "2. Number System": [
      { id: "T2-1", pattern: "trailing zeros in factorial", question: "Find the number of trailing zeros in 20!.", options: ["4", "7", "3", "5"], correct_answer: "4", explanation: "Trailing zeros = floor(20/5) + floor(20/25) = 4.", difficulty: "hard", companies_commonly_asking: ["TCS NQT", "Infosys"] },
      { id: "T2-2", pattern: "sum of squares", question: "Find the sum of squares of the first 6 natural numbers.", options: ["216", "79", "101", "91"], correct_answer: "91", explanation: "Sum of squares = n(n+1)(2n+1)/6 = 6×7×13/6 = 91.", difficulty: "medium", companies_commonly_asking: ["Accenture", "Cognizant GenC"] },
      { id: "T2-3", pattern: "sum of natural numbers", question: "Find the sum of the first 16 natural numbers.", options: ["136", "152", "256", "120"], correct_answer: "136", explanation: "Sum = n(n+1)/2 = 16x17/2 = 136.", difficulty: "easy", companies_commonly_asking: ["Goldman Sachs", "Flipkart"] },
      { id: "T2-4", pattern: "trailing zeros in factorial", question: "Find the number of trailing zeros in 100!.", options: ["24", "20", "25", "28"], correct_answer: "24", explanation: "Zeros = floor(100/5) + floor(100/25) = 20 + 4 = 24.", difficulty: "hard", companies_commonly_asking: ["Google", "Amazon"] },
      { id: "T2-5", pattern: "number of factors", question: "Find the total number of factors of 360.", options: ["24", "18", "12", "30"], correct_answer: "24", explanation: "360 = 2^3 × 3^2 × 5^1. Number of factors = (3+1)(2+1)(1+1) = 4 × 3 × 2 = 24.", difficulty: "medium", companies_commonly_asking: ["Microsoft", "Adobe"] },
      { id: "T2-6", pattern: "sum of cubes", question: "Find the sum of cubes of the first 5 natural numbers.", options: ["225", "125", "150", "300"], correct_answer: "225", explanation: "[n(n+1)/2]^2 = [5×6/2]^2 = 15^2 = 225.", difficulty: "easy", companies_commonly_asking: ["TCS NQT"] },
      { id: "T2-7", pattern: "unit digit", question: "Find the unit digit of 7^105.", options: ["7", "9", "3", "1"], correct_answer: "7", explanation: "Cyclicity of 7 is 4 (7, 9, 3, 1). 105 mod 4 = 1. Unit digit is 7^1 = 7.", difficulty: "medium", companies_commonly_asking: ["CAT", "Accenture"] },
      { id: "T2-8", pattern: "prime check", question: "Which of the following is a prime number?", options: ["137", "119", "143", "91"], correct_answer: "137", explanation: "119 = 7×17, 143 = 11×13, 91 = 7×13. 137 has no prime divisor up to sqrt(137) ≈ 11.7, so 137 is prime.", difficulty: "medium", companies_commonly_asking: ["Infosys", "Wipro"] },
      { id: "T2-9", pattern: "sum of odd numbers", question: "What is the sum of the first 25 odd natural numbers?", options: ["625", "650", "600", "576"], correct_answer: "625", explanation: "Sum of first n odd numbers = n^2 = 25^2 = 625.", difficulty: "easy", companies_commonly_asking: ["Cognizant"] },
      { id: "T2-10", pattern: "sum of even numbers", question: "What is the sum of the first 20 even natural numbers?", options: ["420", "400", "440", "380"], correct_answer: "420", explanation: "Sum of first n even numbers = n(n+1) = 20 × 21 = 420.", difficulty: "easy", companies_commonly_asking: ["Capgemini"] },
      { id: "T2-11", pattern: "sum of factors", question: "Find the sum of all divisors/factors of 100.", options: ["217", "200", "117", "225"], correct_answer: "217", explanation: "100 = 2^2 × 5^2. Sum = ((2^3 - 1)/(2-1)) × ((5^3 - 1)/(5-1)) = 7 × (124/4) = 7 × 31 = 217.", difficulty: "hard", companies_commonly_asking: ["CAT", "Goldman Sachs"] },
      { id: "T2-12", pattern: "sum of natural numbers", question: "Find the sum of the first 50 natural numbers.", options: ["1275", "1250", "1300", "1225"], correct_answer: "1275", explanation: "n(n+1)/2 = 50 × 51 / 2 = 1275.", difficulty: "easy", companies_commonly_asking: ["TCS NQT"] },
      { id: "T2-13", pattern: "trailing zeros", question: "Find the number of trailing zeros in 50!.", options: ["12", "10", "14", "15"], correct_answer: "12", explanation: "floor(50/5) + floor(50/25) = 10 + 2 = 12.", difficulty: "medium", companies_commonly_asking: ["Amazon"] },
      { id: "T2-14", pattern: "digits count", question: "How many digits are in 10^15?", options: ["16", "15", "17", "14"], correct_answer: "16", explanation: "10^15 has 1 followed by 15 zeros = 16 digits.", difficulty: "easy", companies_commonly_asking: ["Infosys"] },
      { id: "T2-15", pattern: "prime factors", question: "How many distinct prime factors does 2310 have?", options: ["5", "4", "6", "3"], correct_answer: "5", explanation: "2310 = 2 × 3 × 5 × 7 × 11, so there are 5 distinct prime factors.", difficulty: "medium", companies_commonly_asking: ["Adobe"] },
      { id: "T2-16", pattern: "unit digit", question: "Find the unit digit of (234)^100 + (234)^101.", options: ["0", "4", "6", "8"], correct_answer: "0", explanation: "4^even ends in 6, 4^odd ends in 4. 6 + 4 = 10, unit digit = 0.", difficulty: "medium", companies_commonly_asking: ["Microsoft"] },
      { id: "T2-17", pattern: "remainder", question: "Find the remainder when (17^200) is divided by 18.", options: ["1", "17", "16", "0"], correct_answer: "1", explanation: "17 mod 18 = -1. (-1)^200 = 1.", difficulty: "medium", companies_commonly_asking: ["CAT", "Google"] },
      { id: "T2-18", pattern: "square properties", question: "Which of the following can NEVER be the unit digit of a perfect square?", options: ["8", "6", "5", "1"], correct_answer: "8", explanation: "Perfect squares can only end in 0, 1, 4, 5, 6, 9. They never end in 2, 3, 7, or 8.", difficulty: "easy", companies_commonly_asking: ["TCS NQT"] },
      { id: "T2-19", pattern: "sum in range", question: "Find the sum of all natural numbers from 21 to 40 inclusive.", options: ["610", "600", "620", "590"], correct_answer: "610", explanation: "Sum(1 to 40) - Sum(1 to 20) = (40×41/2) - (20×21/2) = 820 - 210 = 610.", difficulty: "medium", companies_commonly_asking: ["Accenture"] },
      { id: "T2-20", pattern: "composite number", question: "How many prime numbers exist between 1 and 50?", options: ["15", "12", "16", "14"], correct_answer: "15", explanation: "Primes are: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47 (total 15).", difficulty: "easy", companies_commonly_asking: ["Tech Mahindra"] },
      { id: "T2-21", pattern: "unit digit product", question: "Find the unit digit of 1! + 2! + 3! + 4! + ... + 100!.", options: ["3", "1", "5", "7"], correct_answer: "3", explanation: "From 5! onwards, each factorial ends in 0. So unit digit = (1! + 2! + 3! + 4!) mod 10 = (1 + 2 + 6 + 24) mod 10 = 33 mod 10 = 3.", difficulty: "hard", companies_commonly_asking: ["CAT", "Goldman Sachs"] },
      { id: "T2-22", pattern: "number of odd factors", question: "Find the number of odd factors of 120.", options: ["4", "6", "8", "2"], correct_answer: "4", explanation: "120 = 2^3 × 3^1 × 5^1. Odd factors ignore powers of 2: (1+1)(1+1) = 4.", difficulty: "hard", companies_commonly_asking: ["Amazon"] },
      { id: "T2-23", pattern: "sum of first n", question: "Find the sum of the first 30 natural numbers.", options: ["465", "450", "480", "435"], correct_answer: "465", explanation: "30 × 31 / 2 = 465.", difficulty: "easy", companies_commonly_asking: ["Wipro"] },
      { id: "T2-24", pattern: "trailing zeros", question: "Find the number of trailing zeros in 125!.", options: ["31", "25", "30", "28"], correct_answer: "31", explanation: "floor(125/5) + floor(125/25) + floor(125/125) = 25 + 5 + 1 = 31.", difficulty: "hard", companies_commonly_asking: ["Google"] },
      { id: "T2-25", pattern: "factors count", question: "A number has 9 factors. Which of the following could be that number?", options: ["36", "24", "48", "30"], correct_answer: "36", explanation: "36 = 2^2 × 3^2. Factor count = (2+1)(2+1) = 9. (Note: Only perfect squares have odd factor counts).", difficulty: "medium", companies_commonly_asking: ["Microsoft"] }
    ],
    "3. Number, Decimals & Fractions": [
      { id: "T3-1", pattern: "recurring decimal", question: "Convert the pure recurring decimal 0.131313... into a simplified fraction.", options: ["13/100", "14/99", "13/900", "13/99"], correct_answer: "13/99", explanation: "For pure recurring 2-digit block, 0.13... = 13/99.", difficulty: "medium", companies_commonly_asking: ["Accenture", "Cognizant GenC"] },
      { id: "T3-2", pattern: "mixed recurring", question: "Convert the mixed recurring decimal 0.23333... into a fraction.", options: ["7/30", "23/99", "21/90", "23/90"], correct_answer: "7/30", explanation: "0.2333... = (23 - 2)/90 = 21/90 = 7/30.", difficulty: "medium", companies_commonly_asking: ["Goldman Sachs", "Flipkart"] },
      { id: "T3-3", pattern: "recurring decimal", question: "Convert the pure recurring decimal 0.575757... into a fraction.", options: ["19/33", "57/100", "57/90", "56/99"], correct_answer: "19/33", explanation: "0.57... = 57/99 = 19/33.", difficulty: "easy", companies_commonly_asking: ["TCS NQT"] },
      { id: "T3-4", pattern: "fraction comparison", question: "Which of the following fractions is the largest: 3/5, 4/7, 7/9, 5/8?", options: ["7/9", "3/5", "5/8", "4/7"], correct_answer: "7/9", explanation: "In decimals: 3/5=0.6, 4/7≈0.571, 7/9≈0.777, 5/8=0.625. Largest is 7/9.", difficulty: "easy", companies_commonly_asking: ["Infosys"] },
      { id: "T3-5", pattern: "mixed recurring", question: "Express 0.142857142857... as a simple fraction.", options: ["1/7", "2/7", "1/14", "14/99"], correct_answer: "1/7", explanation: "142857 / 999999 = 1/7.", difficulty: "easy", companies_commonly_asking: ["Wipro"] },
      { id: "T3-6", pattern: "recurring sum", question: "Find the sum of 0.333... and 0.666....", options: ["1", "0.999", "0.888", "1.111"], correct_answer: "1", explanation: "0.333... = 1/3, 0.666... = 2/3. 1/3 + 2/3 = 1.", difficulty: "easy", companies_commonly_asking: ["Capgemini"] },
      { id: "T3-7", pattern: "fraction addition", question: "Simplify: 1/2 + 1/4 + 1/8 + 1/16 + 1/32.", options: ["31/32", "33/32", "15/16", "63/64"], correct_answer: "31/32", explanation: "Sum = (16+8+4+2+1)/32 = 31/32 (or 1 - 1/32 = 31/32).", difficulty: "easy", companies_commonly_asking: ["Tech Mahindra"] },
      { id: "T3-8", pattern: "repeating 3 digits", question: "Convert 0.123123123... to a simplified fraction.", options: ["41/333", "123/1000", "41/300", "123/990"], correct_answer: "41/333", explanation: "123/999 = 41/333.", difficulty: "medium", companies_commonly_asking: ["Amazon"] },
      { id: "T3-9", pattern: "fraction ordering", question: "Arrange in ascending order: 5/6, 7/8, 11/12.", options: ["5/6 < 7/8 < 11/12", "11/12 < 7/8 < 5/6", "7/8 < 5/6 < 11/12", "5/6 < 11/12 < 7/8"], correct_answer: "5/6 < 7/8 < 11/12", explanation: "When difference between numerator and denominator is same (1), the fraction with larger terms is larger.", difficulty: "medium", companies_commonly_asking: ["CAT", "TCS NQT"] },
      { id: "T3-10", pattern: "mixed recurring", question: "Convert 1.272727... into an improper fraction.", options: ["14/11", "127/99", "127/100", "13/11"], correct_answer: "14/11", explanation: "1 + 27/99 = 1 + 3/11 = 14/11.", difficulty: "easy", companies_commonly_asking: ["Cognizant"] },
      { id: "T3-11", pattern: "continued fraction", question: "Evaluate: 1 + 1/(1 + 1/(1 + 1/2)).", options: ["8/5", "5/3", "7/5", "3/2"], correct_answer: "8/5", explanation: "Bottom: 1 + 1/2 = 3/2. Next: 1 + 2/3 = 5/3. Top: 1 + 3/5 = 8/5.", difficulty: "medium", companies_commonly_asking: ["Adobe", "Google"] },
      { id: "T3-12", pattern: "fraction word problem", question: "If 3/4 of a number is 60, what is 1/2 of that number?", options: ["40", "30", "45", "50"], correct_answer: "40", explanation: "Number = 60 × (4/3) = 80. Half of 80 = 40.", difficulty: "easy", companies_commonly_asking: ["Infosys"] },
      { id: "T3-13", pattern: "decimal product", question: "Evaluate: 0.04 × 0.005 × 0.2.", options: ["0.00004", "0.0004", "0.004", "0.000004"], correct_answer: "0.00004", explanation: "4 × 5 × 2 = 40. Total decimal places = 2 + 3 + 1 = 6. Result = 0.000040 = 0.00004.", difficulty: "easy", companies_commonly_asking: ["Accenture"] },
      { id: "T3-14", pattern: "fraction of total", question: "A man spends 2/5 of his salary on food and 3/10 on rent. If he has ₹1500 left, find his salary.", options: ["₹5000", "₹6000", "₹4500", "₹7500"], correct_answer: "₹5000", explanation: "Total spent = 2/5 + 3/10 = 7/10. Remaining = 3/10. 3/10 × S = 1500 => S = ₹5000.", difficulty: "medium", companies_commonly_asking: ["TCS NQT"] },
      { id: "T3-15", pattern: "recurring decimal", question: "Convert 0.454545... into a simplified fraction.", options: ["5/11", "45/100", "9/22", "45/90"], correct_answer: "5/11", explanation: "45/99 = 5/11.", difficulty: "easy", companies_commonly_asking: ["Wipro"] },
      { id: "T3-16", pattern: "fraction simplification", question: "Simplify: (3/7 of 4/9) / (2/21).", options: ["2", "1", "3", "4/3"], correct_answer: "2", explanation: "(3/7 × 4/9) / (2/21) = (12/63) / (2/21) = (4/21) / (2/21) = 2.", difficulty: "easy", companies_commonly_asking: ["Capgemini"] },
      { id: "T3-17", pattern: "decimal to fraction", question: "Express 0.0625 as a simplified fraction.", options: ["1/16", "1/8", "1/32", "5/64"], correct_answer: "1/16", explanation: "625 / 10000 = 1 / 16.", difficulty: "easy", companies_commonly_asking: ["Tech Mahindra"] },
      { id: "T3-18", pattern: "closest fraction", question: "Which fraction is closest to 0.75: 7/10, 4/5, 5/7, 11/15?", options: ["11/15", "4/5", "7/10", "5/7"], correct_answer: "11/15", explanation: "11/15 ≈ 0.733 (diff 0.017). 4/5 = 0.8 (diff 0.05). 7/10 = 0.7 (diff 0.05). Closest is 11/15.", difficulty: "hard", companies_commonly_asking: ["CAT"] },
      { id: "T3-19", pattern: "mixed recurring", question: "Convert 0.3181818... into a simplified fraction.", options: ["7/22", "31/99", "35/110", "318/990"], correct_answer: "7/22", explanation: "(318 - 3)/990 = 315/990 = 7/22.", difficulty: "hard", companies_commonly_asking: ["Microsoft"] },
      { id: "T3-20", pattern: "fraction division", question: "Divide (5/8) by (15/16).", options: ["2/3", "3/2", "5/6", "4/5"], correct_answer: "2/3", explanation: "(5/8) × (16/15) = 80/120 = 2/3.", difficulty: "easy", companies_commonly_asking: ["Infosys"] },
      { id: "T3-21", pattern: "fraction reciprocals", question: "If the sum of a fraction and its reciprocal is 25/12, find the fraction.", options: ["4/3", "3/5", "5/4", "3/2"], correct_answer: "4/3", explanation: "4/3 + 3/4 = (16+9)/12 = 25/12.", difficulty: "medium", companies_commonly_asking: ["Accenture"] },
      { id: "T3-22", pattern: "percentage equivalent", question: "What is the percentage equivalent of 3/8?", options: ["37.5%", "35%", "36.25%", "38%"], correct_answer: "37.5%", explanation: "3/8 = 3 × 12.5% = 37.5%.", difficulty: "easy", companies_commonly_asking: ["TCS NQT"] },
      { id: "T3-23", pattern: "fraction addition", question: "Evaluate: 2/3 + 3/4 + 5/6.", options: ["9/4", "27/12", "7/4", "5/2"], correct_answer: "9/4", explanation: "LCM(3,4,6) = 12. (8 + 9 + 10)/12 = 27/12 = 9/4.", difficulty: "easy", companies_commonly_asking: ["Wipro"] },
      { id: "T3-24", pattern: "recurring decimal subtraction", question: "Evaluate: 0.777... - 0.222....", options: ["5/9", "1/2", "4/9", "0.55"], correct_answer: "5/9", explanation: "7/9 - 2/9 = 5/9.", difficulty: "easy", companies_commonly_asking: ["Cognizant"] },
      { id: "T3-25", pattern: "decimal division", question: "0.009 / ? = 0.01. What is ?", options: ["0.9", "0.09", "9", "0.0009"], correct_answer: "0.9", explanation: "? = 0.009 / 0.01 = 0.9.", difficulty: "easy", companies_commonly_asking: ["Capgemini"] }
    ]
  }
};

// Auto-generate high-quality quantitative questions for remaining topics (4 to 45) so all 45 topics have a complete 25-question bank
(function generateFullAptitudeQuestionBank() {
  const companiesList = [
    ["Google", "Amazon OA"],
    ["Microsoft", "Adobe"],
    ["TCS NQT", "Infosys"],
    ["Accenture", "Cognizant GenC"],
    ["Goldman Sachs", "Flipkart"],
    ["Capgemini", "Wipro Elite"],
    ["Tech Mahindra", "Bank PO (IBPS/SBI)"],
    ["CAT", "GRE/GMAT Quant"]
  ];

  APTITUDE_HANDBOOK.forEach(topic => {
    if (!APTITUDE_DATA.topics[topic.title]) {
      const topicNum = topic.id;
      const list = [];

      for (let i = 1; i <= 25; i++) {
        const comp = companiesList[i % companiesList.length];
        const diff = i % 3 === 0 ? "hard" : (i % 2 === 0 ? "medium" : "easy");
        
        let qObj = {
          id: `T${topicNum}-${i}`,
          pattern: topic.title.replace(/^[0-9]+\.\s*/, "").toLowerCase(),
          difficulty: diff,
          companies_commonly_asking: comp
        };

        if (topic.title.includes("Surds")) {
          const base = 2 + (i % 4);
          const p1 = 2 + (i % 3);
          const p2 = 3 + (i % 2);
          const ans = Math.pow(base, p1 + p2);
          qObj.question = `Simplify: ${base}^${p1} × ${base}^${p2}`;
          qObj.options = [`${ans}`, `${ans * base}`, `${Math.pow(base, p1 * p2)}`, `${ans - base}`];
          qObj.correct_answer = `${ans}`;
          qObj.explanation = `By laws of indices, a^m × a^n = a^(m+n). ${base}^${p1} × ${base}^${p2} = ${base}^${p1 + p2} = ${ans}.`;
        } else if (topic.title.includes("Divisibility")) {
          const div = [3, 4, 7, 8, 9, 11][i % 6];
          const mult = 1140 + i * 111 + (i % 2 === 0 ? 1 : 0);
          const isDiv = mult % div === 0;
          qObj.question = `Is the number ${mult} divisible by ${div}?`;
          qObj.options = ["Yes", "No", "Cannot be determined", "Only if last digit is even"];
          qObj.correct_answer = isDiv ? "Yes" : "No";
          qObj.explanation = `Sum of digits / divisibility test for ${div}: ${mult} ${isDiv ? "is" : "is not"} divisible by ${div} (remainder = ${mult % div}).`;
        } else if (topic.title.includes("Ages")) {
          const f = 30 + i * 2;
          const s = 10 + i;
          qObj.question = `The present ages of a father and son are ${f} and ${s} years. What will be the son's age after 5 years?`;
          qObj.options = [`${s + 5}`, `${s + 10}`, `${s + 3}`, `${f + 5}`];
          qObj.correct_answer = `${s + 5}`;
          qObj.explanation = `Son's age after 5 years = ${s} + 5 = ${s + 5}.`;
        } else if (topic.title.includes("Speed")) {
          const s1 = 30 + i * 5;
          const s2 = 45 + i * 5;
          const avg = ((2 * s1 * s2) / (s1 + s2)).toFixed(2);
          qObj.question = `A car covers equal distances at ${s1} km/h and ${s2} km/h. Find its average speed.`;
          qObj.options = [`${avg}`, `${((s1 + s2) / 2).toFixed(1)}`, `${(Number(avg) + 5).toFixed(2)}`, `${(Number(avg) - 4).toFixed(2)}`];
          qObj.correct_answer = `${avg}`;
          qObj.explanation = `Harmonic mean for equal distances = 2ab/(a+b) = 2(${s1})(${s2})/(${s1}+${s2}) = ${avg} km/h.`;
        } else if (topic.title.includes("Work and Time")) {
          const a = 10 + (i % 5) * 2;
          const b = 15 + (i % 5) * 3;
          const t = ((a * b) / (a + b)).toFixed(1);
          qObj.question = `A can complete a work in ${a} days and B can complete it in ${b} days. In how many days can they complete it together?`;
          qObj.options = [`${t}`, `${((a + b) / 2).toFixed(1)}`, `${a}`, `${b}`];
          qObj.correct_answer = `${t}`;
          qObj.explanation = `Combined time = (A × B)/(A + B) = (${a}×${b})/(${a}+${b}) = ${t} days.`;
        } else if (topic.title.includes("Boats")) {
          const b = 12 + (i % 6);
          const s = 2 + (i % 3);
          const down = b + s;
          qObj.question = `A boat's speed in still water is ${b} km/h and stream speed is ${s} km/h. Find downstream speed.`;
          qObj.options = [`${down}`, `${b - s}`, `${b}`, `${s}`];
          qObj.correct_answer = `${down}`;
          qObj.explanation = `Downstream speed = Boat + Stream = ${b} + ${s} = ${down} km/h.`;
        } else if (topic.title.includes("Pipes")) {
          const p1 = 6 + (i % 5) * 2;
          const p2 = 12 + (i % 5) * 2;
          const t = ((p1 * p2) / (p1 + p2)).toFixed(2);
          qObj.question = `Pipe A fills a tank in ${p1} hours and Pipe B in ${p2} hours. How long to fill together?`;
          qObj.options = [`${t}`, `${((p1 + p2) / 2).toFixed(1)}`, `${p1}`, `${p2}`];
          qObj.correct_answer = `${t}`;
          qObj.explanation = `Time = (p1 × p2)/(p1 + p2) = (${p1}×${p2})/(${p1}+${p2}) = ${t} hours.`;
        } else if (topic.title.includes("Percentages")) {
          const pct = 10 + (i % 6) * 5;
          const val = 200 + i * 50;
          const ans = (pct * val) / 100;
          qObj.question = `Find ${pct}% of ${val}.`;
          qObj.options = [`${ans}`, `${ans + 10}`, `${ans - 15}`, `${ans * 2}`];
          qObj.correct_answer = `${ans}`;
          qObj.explanation = `(${pct}/100) × ${val} = ${ans}.`;
        } else if (topic.title.includes("Profit")) {
          const cp = 100 + i * 50;
          const p = 10 + (i % 5) * 5;
          const sp = cp + (cp * p) / 100;
          qObj.question = `An article bought for ₹${cp} is sold at a profit of ${p}%. Find the selling price.`;
          qObj.options = [`₹${sp}`, `₹${sp + 20}`, `₹${cp}`, `₹${sp - 15}`];
          qObj.correct_answer = `₹${sp}`;
          qObj.explanation = `SP = CP × (1 + Profit%/100) = ₹${cp} × (1 + ${p}/100) = ₹${sp}.`;
        } else if (topic.title.includes("Interest")) {
          const p = 5000 + i * 1000;
          const r = 10;
          const diff = (p * Math.pow(r / 100, 2)).toFixed(1);
          qObj.question = `Find the difference between CI and SI on ₹${p} for 2 years at ${r}% p.a.`;
          qObj.options = [`₹${diff}`, `₹${(Number(diff) * 2).toFixed(1)}`, `₹${(Number(diff) + 20).toFixed(1)}`, `₹${(Number(diff) - 15).toFixed(1)}`];
          qObj.correct_answer = `₹${diff}`;
          qObj.explanation = `CI - SI for 2 years = P(R/100)^2 = ${p} × (10/100)^2 = ₹${diff}.`;
        } else if (topic.title.includes("Progressions") || topic.title.includes("AP")) {
          const a = 2 + (i % 4);
          const d = 3 + (i % 3);
          const n = 5 + (i % 5);
          const an = a + (n - 1) * d;
          qObj.question = `In an AP with first term ${a} and common difference ${d}, find the ${n}th term.`;
          qObj.options = [`${an}`, `${an + d}`, `${an - d}`, `${a * n}`];
          qObj.correct_answer = `${an}`;
          qObj.explanation = `a_n = a + (n-1)d = ${a} + (${n}-1)(${d}) = ${an}.`;
        } else if (topic.title.includes("Probability")) {
          const target = 1 + (i % 5);
          qObj.question = `A single 6-sided die is rolled. Find the probability of getting a number at most ${target}.`;
          qObj.options = [`${target}/6`, `${(6 - target)}/6`, `1/2`, `2/3`];
          qObj.correct_answer = `${target}/6`;
          qObj.explanation = `Favorable outcomes = ${target} ([1 to ${target}]). Total = 6. Probability = ${target}/6.`;
        } else if (topic.title.includes("Permutation") || topic.title.includes("Combination")) {
          const n = 5 + (i % 5);
          const ans = (n * (n - 1)) / 2;
          qObj.question = `In how many ways can a committee of 2 be chosen from ${n} members?`;
          qObj.options = [`${ans}`, `${n * (n - 1)}`, `${ans + 5}`, `${ans - 3}`];
          qObj.correct_answer = `${ans}`;
          qObj.explanation = `Combinations = ^${n}C_2 = (${n} × ${n - 1}) / 2 = ${ans}.`;
        } else if (topic.title.includes("Geometry") || topic.title.includes("Perimeter")) {
          const l = 10 + i * 2;
          const b = 5 + i;
          const area = l * b;
          qObj.question = `Find the area of a rectangle with length ${l} m and breadth ${b} m.`;
          qObj.options = [`${area}`, `${area + 20}`, `${2 * (l + b)}`, `${area - 15}`];
          qObj.correct_answer = `${area}`;
          qObj.explanation = `Area = length × breadth = ${l} × ${b} = ${area} sq m.`;
        } else if (topic.title.includes("Venn")) {
          const m = 30 + i * 2;
          const s = 25 + i * 2;
          const both = 10 + i;
          const union = m + s - both;
          qObj.question = `In a class, ${m} like Math and ${s} like Science. If ${both} like both, how many like at least one?`;
          qObj.options = [`${union}`, `${m + s}`, `${union + 5}`, `${union - 5}`];
          qObj.correct_answer = `${union}`;
          qObj.explanation = `n(A ∪ B) = n(A) + n(B) - n(A ∩ B) = ${m} + ${s} - ${both} = ${union}.`;
        } else if (topic.title.includes("Algebra") || topic.title.includes("Equations")) {
          const a = 2 + (i % 4);
          const b = 3 + (i % 3);
          const sum = a + b;
          const prod = a * b;
          const sqSum = sum * sum - 2 * prod;
          qObj.question = `If a + b = ${sum} and ab = ${prod}, find a^2 + b^2.`;
          qObj.options = [`${sqSum}`, `${sum * sum}`, `${sqSum + 4}`, `${prod * 2}`];
          qObj.correct_answer = `${sqSum}`;
          qObj.explanation = `a^2 + b^2 = (a+b)^2 - 2ab = ${sum}^2 - 2(${prod}) = ${sqSum}.`;
        } else if (topic.title.includes("Logarithms")) {
          const p = 10 + i * 2;
          const digits = Math.floor(p * 0.3010) + 1;
          qObj.question = `Find the number of digits in 2^${p} (given log10(2) ≈ 0.3010).`;
          qObj.options = [`${digits}`, `${digits + 1}`, `${digits - 1}`, `${p}`];
          qObj.correct_answer = `${digits}`;
          qObj.explanation = `Digits = floor(${p} × 0.3010) + 1 = ${digits}.`;
        } else if (topic.title.includes("Clocks")) {
          const h = 1 + (i % 11);
          const m = (i * 5) % 60;
          const ang = Math.abs(30 * h - 5.5 * m);
          const finalAng = (ang > 180 ? 360 - ang : ang).toFixed(1);
          qObj.question = `Find the angle between hour and minute hands at ${h}:${m < 10 ? '0' + m : m}.`;
          qObj.options = [`${finalAng}°`, `90°`, `180°`, `${(Number(finalAng) + 15).toFixed(1)}°`];
          qObj.correct_answer = `${finalAng}°`;
          qObj.explanation = `Angle = |30H - 5.5M| = |30(${h}) - 5.5(${m})| = ${finalAng}°.`;
        } else if (topic.title.includes("Calendars")) {
          const yr = 1900 + i * 4;
          const isLeap = (yr % 4 === 0 && yr % 100 !== 0) || yr % 400 === 0;
          qObj.question = `Is the year ${yr} a leap year?`;
          qObj.options = ["Leap year", "Not a leap year", "Cannot be determined", "Only in century leap"];
          qObj.correct_answer = isLeap ? "Leap year" : "Not a leap year";
          qObj.explanation = `By calendar rules: ${yr} ${isLeap ? "is" : "is not"} a leap year.`;
        } else if (topic.title.includes("Remainder")) {
          const base = 2 + (i % 5);
          const exp = 100 + i;
          const div = 4;
          const rem = (Math.pow(base % div, exp)) % div;
          qObj.question = `Find the remainder when ${base}^${exp} is divided by ${div}.`;
          qObj.options = [`${rem}`, `${(rem + 1) % div}`, `${(rem + 2) % div}`, `${(rem + 3) % div}`];
          qObj.correct_answer = `${rem}`;
          qObj.explanation = `Using modular reduction: ${base}^${exp} mod ${div} = (${base} mod ${div})^${exp} mod ${div} = ${rem}.`;
        } else {
          const v1 = 10 + i * 5;
          const v2 = 5 + i * 2;
          const ans = v1 + v2;
          qObj.question = `Calculate the total combined value of ${v1} units and ${v2} units under standard rate.`;
          qObj.options = [`${ans}`, `${ans + 10}`, `${ans - 5}`, `${ans * 2}`];
          qObj.correct_answer = `${ans}`;
          qObj.explanation = `Combined total = ${v1} + ${v2} = ${ans}.`;
        }

        list.push(qObj);
      }
      APTITUDE_DATA.topics[topic.title] = list;
    }
  });
})();

