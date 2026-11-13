// exporter.js — export karakter (atau scene) ke GLB.
// GLB adalah jembatan ke Blender / render GPU: file .glb hasil export bisa
// dibuka langsung di Blender (File > Import > glTF 2.0), lalu di-render
// pakai Cycles + GPU. Tekstur wajah (canvas) ikut ter-embed.
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';

export function exportGLB(object3D, filename = 'remo.glb') {
  const exporter = new GLTFExporter();
  exporter.parse(
    object3D,
    (result) => {
      const blob = new Blob([result], { type: 'model/gltf-binary' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    },
    (err) => console.error('GLB export gagal:', err),
    { binary: true }
  );
}
