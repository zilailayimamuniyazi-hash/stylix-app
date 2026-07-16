"""Generate a production-ready, independently materialised solitaire ring GLB."""

import math
import os
import bpy
from mathutils import Vector

OUTPUT = os.path.join(os.path.dirname(__file__), "..", "public", "models", "solitaire_ring_studio.glb")


def material(name, color, metallic, roughness):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    return mat


def smooth(obj):
    for polygon in obj.data.polygons:
        polygon.use_smooth = True


def cylinder_between(name, start, end, radius, mat):
    direction = Vector(end) - Vector(start)
    midpoint = (Vector(start) + Vector(end)) / 2
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=radius, depth=direction.length, location=midpoint)
    obj = bpy.context.object
    obj.name = name
    obj.rotation_mode = "QUATERNION"
    obj.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(direction)
    obj.data.materials.append(mat)
    smooth(obj)


bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)

metal = material("Metal", (0.83, 0.62, 0.15), 0.95, 0.18)
diamond = material("Diamond", (0.82, 0.94, 1.0), 0.05, 0.06)

# A vertical ring reads naturally in model-viewer with the default camera orbit.
bpy.ops.mesh.primitive_torus_add(major_radius=1.45, minor_radius=0.16, major_segments=96, minor_segments=24,
                                 location=(0, 0, 0), rotation=(math.pi / 2, 0, 0))
band = bpy.context.object
band.name = "Ring band"
band.data.materials.append(metal)
smooth(band)

# Tapered gallery lifting the stone from the crown of the band.
bpy.ops.mesh.primitive_cone_add(vertices=48, radius1=0.30, radius2=0.20, depth=0.30, location=(0, 0, 1.48))
gallery = bpy.context.object
gallery.name = "Metal gallery"
gallery.data.materials.append(metal)
smooth(gallery)

# Faceted stone; broad enough to stay legible at shopping-card scale.
bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.27, radius2=0.17, depth=0.20, location=(0, 0, 1.72), rotation=(0, 0, math.pi / 8))
stone = bpy.context.object
stone.name = "Diamond stone"
stone.data.materials.append(diamond)
smooth(stone)

# Four prongs meet just beneath the girdle and make the setting unmistakable.
for index, angle in enumerate((0, math.pi / 2, math.pi, 3 * math.pi / 2)):
    base = (0.23 * math.cos(angle), 0.23 * math.sin(angle), 1.50)
    tip = (0.18 * math.cos(angle), 0.18 * math.sin(angle), 1.79)
    cylinder_between(f"Metal prong {index + 1}", base, tip, 0.035, metal)

bpy.ops.object.select_all(action="SELECT")
os.makedirs(os.path.dirname(OUTPUT), exist_ok=True)
bpy.ops.export_scene.gltf(filepath=OUTPUT, export_format="GLB", export_materials="EXPORT")
print(f"Wrote {OUTPUT}")
