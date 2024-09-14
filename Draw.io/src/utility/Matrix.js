class Matrix {
    constructor(matrix) {
      this.matrix = matrix || [1, 0, 0, 1, 0, 0]; // Identity matrix by default
    }
  
    // Method to create a translation matrix
    static getTranslation(vector) {
      const [tx, ty] = vector; // translation vector [tx, ty]
      return new Matrix([1, 0, 0, 1, tx, ty]);
    }
  
    // Method to create a scaling matrix
    static getScaling(scalingFactors) {
      const [sx, sy] = scalingFactors; // scaling factors [sx, sy]
      return new Matrix([sx, 0, 0, sy, 0, 0]);
    }
  
    // Method to create a rotation matrix (angle in radians)
    static getRotation(angle) {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return new Matrix([cos, -sin, sin, cos, 0, 0]);
    }
  
    multiply(matrixB) {
      const a = this.matrix;
      const b = matrixB.matrix;
  
      return new Matrix([
        a[0] * b[0] + a[2] * b[1], // a11
        a[1] * b[0] + a[3] * b[1], // a21
        a[0] * b[2] + a[2] * b[3], // a12
        a[1] * b[2] + a[3] * b[3], // a22
        a[0] * b[4] + a[2] * b[5] + a[4], // a13
        a[1] * b[4] + a[3] * b[5] + a[5], // a23
      ]);
    }
  
    // Apply the matrix to a point [x, y]
    applyToPoint(point) {
      const [x, y] = point;
      const [a, b, c, d, e, f] = this.matrix;
      return {
        x: x * a + y * c + e,
        y: x * b + y * d + f,
      };
    }
  
    applyToPoints(points) {
      return points.map(point => this.applyToPoint(point));
    }

    static applyMatrix(point, matrix) {
        const { x, y } = point;
        return {
          x: x * matrix[0] + y * matrix[2] + matrix[4],
          y: x * matrix[1] + y * matrix[3] + matrix[5],
        };
      }
  }
  

  export default Matrix;