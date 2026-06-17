"use client";

import React from "react";

type ShaderBackgroundProps = {
    className?: string;
    backColor?: [number, number, number, number];
    frontColor?: [number, number, number, number];
};

const VERTEX_SHADER_SOURCE = `#version 300 es
precision mediump float;
layout(location = 0) in vec4 a_position;
void main() { gl_Position = a_position; }
`;

const FRAGMENT_SHADER_SOURCE = `#version 300 es
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_pixelRatio;
uniform vec4 u_colorBack;
uniform vec4 u_colorFront;

out vec4 fragColor;

#define PI 3.14159265358979323846

vec3 permute(vec3 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float getSimplexNoise(vec2 uv, float t) {
  float noise = 0.5 * snoise(uv - vec2(0.0, 0.3 * t));
  noise += 0.5 * snoise(2.0 * uv + vec2(0.0, 0.32 * t));
  return noise;
}

const int bayer8x8[64] = int[64](
   0, 32,  8, 40,  2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44,  4, 36, 14, 46,  6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
   3, 35, 11, 43,  1, 33,  9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47,  7, 39, 13, 45,  5, 37,
  63, 31, 55, 23, 61, 29, 53, 21
);

float getBayerValue(vec2 uv) {
  ivec2 pos = ivec2(mod(uv, 8.0));
  int index = pos.y * 8 + pos.x;
  return float(bayer8x8[index]) / 64.0;
}

void main() {
  float t = 0.5 * u_time;
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  float pxSize = 1.70 * u_pixelRatio;
  vec2 pxSizeUv = gl_FragCoord.xy;
  pxSizeUv -= 0.5 * u_resolution;
  pxSizeUv /= pxSize;
  uv = floor(pxSizeUv) * pxSize / u_resolution.xy + 0.5 - 0.5;

  float r = 0.00 * PI / 180.0;
  mat2 rot = mat2(cos(r), sin(r), -sin(r), cos(r));
  vec2 shape_uv = uv + vec2(0.00, 0.00);
  shape_uv *= u_resolution.xy / u_pixelRatio / 0.95;
  shape_uv = rot * shape_uv + 0.5;

  shape_uv *= 0.001;
  float shape = 0.5 + 0.5 * getSimplexNoise(shape_uv, t);
  shape = smoothstep(0.3, 0.9, shape);

  float dithering = getBayerValue(pxSizeUv) - 0.5;
  float res = step(0.5, shape + dithering);

  vec3 fgColor = u_colorFront.rgb * u_colorFront.a;
  vec3 bgColor = u_colorBack.rgb * u_colorBack.a;
  vec3 color = fgColor * res + bgColor * (1.0 - u_colorFront.a * res);
  float opacity = u_colorFront.a * res + u_colorBack.a * (1.0 - u_colorFront.a * res);

  fragColor = vec4(color, opacity);
}
`;

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);
    if (!shader) return null;

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function createProgram(gl: WebGL2RenderingContext, vertexSource: string, fragmentSource: string) {
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) return null;

    const program = gl.createProgram();
    if (!program) return null;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
    }

    return program;
}

export function ShaderBackground({
    className,
    backColor = [1, 1, 1, 0],
    frontColor = [0.11, 0.12, 0.2, 0.18],
}: ShaderBackgroundProps) {
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext("webgl2", {
            alpha: true,
            antialias: false,
            premultipliedAlpha: true,
        });

        if (!gl) return;

        const program = createProgram(gl, VERTEX_SHADER_SOURCE, FRAGMENT_SHADER_SOURCE);
        if (!program) return;

        const uTime = gl.getUniformLocation(program, "u_time");
        const uResolution = gl.getUniformLocation(program, "u_resolution");
        const uPixelRatio = gl.getUniformLocation(program, "u_pixelRatio");
        const uColorBack = gl.getUniformLocation(program, "u_colorBack");
        const uColorFront = gl.getUniformLocation(program, "u_colorFront");

        const buffer = gl.createBuffer();
        if (!buffer) return;

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
            gl.STATIC_DRAW,
        );

        gl.useProgram(program);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        let frameId = 0;
        let start = performance.now();

        const render = (now: number) => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const rect = canvas.getBoundingClientRect();
            const width = Math.max(1, Math.floor(rect.width * dpr));
            const height = Math.max(1, Math.floor(rect.height * dpr));

            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }

            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.uniform1f(uTime, (now - start) * 0.001);
            gl.uniform2f(uResolution, canvas.width, canvas.height);
            gl.uniform1f(uPixelRatio, dpr);
            gl.uniform4f(uColorBack, backColor[0], backColor[1], backColor[2], backColor[3]);
            gl.uniform4f(uColorFront, frontColor[0], frontColor[1], frontColor[2], frontColor[3]);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            frameId = window.requestAnimationFrame(render);
        };

        frameId = window.requestAnimationFrame(render);

        return () => {
            window.cancelAnimationFrame(frameId);
            gl.deleteBuffer(buffer);
            gl.deleteProgram(program);
        };
    }, [backColor, frontColor]);

    return (
        <canvas
            ref={canvasRef}
            className={className ?? "absolute inset-0 h-full w-full"}
            aria-hidden="true"
        />
    );
}
