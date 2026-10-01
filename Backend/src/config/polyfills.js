/**
 * Polyfills for browser APIs required by pdfjs / pdf-parse when running in
 * Node.js and serverless environments (such as Vercel / AWS Lambda) where
 * native canvas packages like @napi-rs/canvas are not installed or supported.
 */

if (!globalThis.DOMMatrix) {
    globalThis.DOMMatrix = class DOMMatrix {
        constructor(init) {
            this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
            this.m11 = 1; this.m12 = 0; this.m13 = 0; this.m14 = 0;
            this.m21 = 0; this.m22 = 1; this.m23 = 0; this.m24 = 0;
            this.m31 = 0; this.m32 = 0; this.m33 = 1; this.m34 = 0;
            this.m41 = 0; this.m42 = 0; this.m43 = 0; this.m44 = 1;
            this.is2D = true;
            this.isIdentity = true;
        }

        multiply() { return this; }
        translate() { return this; }
        scale() { return this; }
        rotate() { return this; }
        transformPoint(p) { return p; }
        inverse() { return this; }
        toFloat32Array() { return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]); }
        toFloat64Array() { return new Float64Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]); }
    };
}

if (!globalThis.DOMPoint) {
    globalThis.DOMPoint = class DOMPoint {
        constructor(x = 0, y = 0, z = 0, w = 1) {
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }
    };
}

if (!globalThis.DOMRect) {
    globalThis.DOMRect = class DOMRect {
        constructor(x = 0, y = 0, width = 0, height = 0) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.top = y;
            this.left = x;
            this.right = x + width;
            this.bottom = y + height;
        }
    };
}

if (!globalThis.ImageData) {
    globalThis.ImageData = class ImageData {
        constructor(width, height) {
            this.width = width || 0;
            this.height = height || 0;
            this.data = new Uint8ClampedArray((this.width * this.height) * 4);
        }
    };
}

if (!globalThis.Path2D) {
    globalThis.Path2D = class Path2D {
        constructor() {}
        addPath() {}
        closePath() {}
        moveTo() {}
        lineTo() {}
        bezierCurveTo() {}
        quadraticCurveTo() {}
        arc() {}
        arcTo() {}
        ellipse() {}
        rect() {}
    };
}

if (!globalThis.navigator) {
    globalThis.navigator = {
        language: "en-US",
        platform: "Node.js",
        userAgent: "Node.js"
    };
} else if (!globalThis.navigator.language) {
    globalThis.navigator.language = "en-US";
}

module.exports = {};
