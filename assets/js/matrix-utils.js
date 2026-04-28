// Goniti - Matrix Utilities
// Shared math functions for matrix visualizations

const MatrixUtils = (function() {
    'use strict';
    
    // ---------- Matrix Operations ----------
    
    /**
     * Creates a 2x2 matrix from values
     * @param {number} a - row1 col1
     * @param {number} b - row1 col2
     * @param {number} c - row2 col1
     * @param {number} d - row2 col2
     * @returns {number[][]} 2x2 matrix
     */
    function create2x2(a, b, c, d) {
        return [
            [a, b],
            [c, d]
        ];
    }
    
    /**
     * Creates a 3x3 matrix from values (row-major)
     * @param {number[]} values - 9 numbers in row-major order
     * @returns {number[][]} 3x3 matrix
     */
    function create3x3(values) {
        if (values.length !== 9) {
            throw new Error('3x3 matrix requires exactly 9 values');
        }
        return [
            [values[0], values[1], values[2]],
            [values[3], values[4], values[5]],
            [values[6], values[7], values[8]]
        ];
    }
    
    /**
     * Calculate determinant of 2x2 matrix
     * @param {number[][]} m - 2x2 matrix
     * @returns {number} determinant
     */
    function det2x2(m) {
        return m[0][0] * m[1][1] - m[0][1] * m[1][0];
    }
    
    /**
     * Calculate determinant of 3x3 matrix
     * @param {number[][]} m - 3x3 matrix
     * @returns {number} determinant
     */
    function det3x3(m) {
        const a = m[0][0], b = m[0][1], c = m[0][2];
        const d = m[1][0], e = m[1][1], f = m[1][2];
        const g = m[2][0], h = m[2][1], i = m[2][2];
        
        return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
    }
    
    /**
     * Transform a point by a 2x2 matrix
     * @param {number[][]} m - 2x2 matrix
     * @param {number[]} point - [x, y]
     * @returns {number[]} transformed [x', y']
     */
    function transformPoint2x2(m, point) {
        const x = point[0];
        const y = point[1];
        return [
            m[0][0] * x + m[0][1] * y,
            m[1][0] * x + m[1][1] * y
        ];
    }
    
    /**
     * Transform multiple points by a 2x2 matrix
     * @param {number[][]} m - 2x2 matrix
     * @param {number[][]} points - array of [x, y] points
     * @returns {number[][]} transformed points
     */
    function transformPoints2x2(m, points) {
        return points.map(point => transformPoint2x2(m, point));
    }
    
    /**
     * Create the 4 corners of a unit square
     * @returns {number[][]} [[0,0], [1,0], [1,1], [0,1]]
     */
    function getUnitSquare() {
        return [
            [0, 0],  // origin
            [1, 0],  // bottom-right
            [1, 1],  // top-right
            [0, 1]   // top-left
        ];
    }
    
    /**
     * Create a grid of points for transformation visualization
     * @param {number} size - grid size (size x size points)
     * @param {number} min - minimum coordinate
     * @param {number} max - maximum coordinate
     * @returns {number[][]} array of [x, y] points
     */
    function createGridPoints(size = 10, min = -3, max = 3) {
        const points = [];
        const step = (max - min) / size;
        for (let x = min; x <= max + 0.001; x += step) {
            for (let y = min; y <= max + 0.001; y += step) {
                points.push([x, y]);
            }
        }
        return points;
    }
    
    /**
     * Calculate area of a polygon (for unit square transformation)
     * @param {number[][]} points - polygon vertices in order
     * @returns {number} area
     */
    function polygonArea(points) {
        let area = 0;
        const n = points.length;
        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n;
            area += points[i][0] * points[j][1];
            area -= points[j][0] * points[i][1];
        }
        return Math.abs(area) / 2;
    }
    
    /**
     * Get color based on determinant sign and magnitude
     * @param {number} det - determinant value
     * @returns {string} CSS color
     */
    function getDeterminantColor(det) {
        if (det > 0) {
            // Positive: blue shades
            const intensity = Math.min(0.7, 0.3 + Math.abs(det) * 0.1);
            return `rgba(59, 130, 246, ${intensity})`;
        } else if (det < 0) {
            // Negative: orange/red shades
            const intensity = Math.min(0.7, 0.3 + Math.abs(det) * 0.1);
            return `rgba(249, 115, 22, ${intensity})`;
        } else {
            // Zero: gray (collapsed area)
            return 'rgba(107, 114, 128, 0.5)';
        }
    }
    
    /**
     * Get description of determinant meaning
     * @param {number} det - determinant value
     * @returns {object} { emoji, text, colorClass }
     */
    function getDeterminantDescription(det) {
        const absDet = Math.abs(det);
        
        if (Math.abs(det) < 0.001) {
            return {
                emoji: '📐➡️➖',
                text: 'Determinant শূন্য — shape collapses to a line or point (singular matrix)',
                colorClass: 'det-zero'
            };
        } else if (det > 0) {
            if (absDet > 1.5) {
                return {
                    emoji: '🔵📈',
                    text: `Determinant ${det.toFixed(2)} (ধনাত্মক) — area scales by factor ${absDet.toFixed(2)}×, orientation preserved`,
                    colorClass: 'det-positive'
                };
            } else if (absDet < 0.5) {
                return {
                    emoji: '🔵📉',
                    text: `Determinant ${det.toFixed(2)} (ধনাত্মক) — area shrinks to ${(absDet * 100).toFixed(0)}%, orientation preserved`,
                    colorClass: 'det-positive'
                };
            } else {
                return {
                    emoji: '🔵✅',
                    text: `Determinant ${det.toFixed(2)} (ধনাত্মক) — area preserved approximately, orientation unchanged`,
                    colorClass: 'det-positive'
                };
            }
        } else {
            const absDetVal = Math.abs(det);
            if (absDetVal > 1.5) {
                return {
                    emoji: '🟠🔄📈',
                    text: `Determinant ${det.toFixed(2)} (ঋণাত্মক) — area scales by ${absDetVal.toFixed(2)}×, shape flipped (mirrored)`,
                    colorClass: 'det-negative'
                };
            } else if (absDetVal < 0.5) {
                return {
                    emoji: '🟠🔄📉',
                    text: `Determinant ${det.toFixed(2)} (ঋণাত্মক) — area shrinks to ${(absDetVal * 100).toFixed(0)}%, shape flipped`,
                    colorClass: 'det-negative'
                };
            } else {
                return {
                    emoji: '🟠🔄',
                    text: `Determinant ${det.toFixed(2)} (ঋণাত্মক) — area preserved, shape flipped (mirror image)`,
                    colorClass: 'det-negative'
                };
            }
        }
    }
    
    /**
     * Generate standard transformation matrices for examples
     */
    const ExampleMatrices = {
        identity: { a: 1, b: 0, c: 0, d: 1, name: 'Identity (No change)', nameBn: 'অভেদ ম্যাট্রিক্স' },
        scale2: { a: 2, b: 0, c: 0, d: 2, name: 'Scale ×2', nameBn: 'স্কেল ২ গুণ' },
        scaleHalf: { a: 0.5, b: 0, c: 0, d: 0.5, name: 'Scale ×0.5', nameBn: 'স্কেল অর্ধেক' },
        reflectX: { a: 1, b: 0, c: 0, d: -1, name: 'Reflect over X-axis', nameBn: 'X-অক্ষে প্রতিফলন' },
        reflectY: { a: -1, b: 0, c: 0, d: 1, name: 'Reflect over Y-axis', nameBn: 'Y-অক্ষে প্রতিফলন' },
        shearX: { a: 1, b: 1, c: 0, d: 1, name: 'Shear X', nameBn: 'শিয়ার (X)' },
        rotate90: { a: 0, b: -1, c: 1, d: 0, name: 'Rotate 90°', nameBn: '৯০° ঘূর্ণন' },
        rotate45: { a: 0.707, b: -0.707, c: 0.707, d: 0.707, name: 'Rotate 45°', nameBn: '৪৫° ঘূর্ণন' }
    };
    
    // Public API
    return {
        create2x2,
        create3x3,
        det2x2,
        det3x3,
        transformPoint2x2,
        transformPoints2x2,
        getUnitSquare,
        createGridPoints,
        polygonArea,
        getDeterminantColor,
        getDeterminantDescription,
        ExampleMatrices
    };
})();